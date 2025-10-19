import { getAuth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import Chat from "@/models/Chat";
import connectDB from "@/config/db";
import OpenAI from "openai";

export const maxDuration = 60;

export const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

export const ALLOWED_MODELS: Record<string, string> = {
  "gpt-5": "openai/gpt-5", // ChatGPT (fast/cheap)
  "claude-sonnet-4": "anthropic/claude-sonnet-4", // Claude
  "gemini-2.5-pro": "google/gemini-2.5-pro", // Gemini
  "grok-4": "x-ai/grok-4", // Grok
};

export async function POST(req: NextRequest) {
  const { chatId, content, model } = await req.json();
  const { userId } = getAuth(req);

  if (!userId) {
    return NextResponse.json(
      { success: false, error: "User Unauthorized" },
      { status: 401 }
    );
  }

  const providerModel = ALLOWED_MODELS[model];
  if (!providerModel) {
    return NextResponse.json(
      { success: false, error: "Invalid Model" },
      { status: 400 }
    );
  }

  await connectDB();
  const chat = await Chat.findOne({ userId, _id: chatId });

  if (!chat) {
    return NextResponse.json(
      { success: false, error: "Chat Not Found" },
      { status: 404 }
    );
  }

  const userPrompt = {
    role: "user",
    content,
    model,
    timestamp: new Date(),
  };

  // Save user prompt
  chat.messages.push(userPrompt);

  await chat.save();

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let finalAnswer = "";
      let finalReasoning = "";
      let reasoningStartMs: number | null = null;
      let reasoningEndMs: number | null = null;
      let reasoningDurationMs: number | undefined;

      try {
        const completion = await openai.chat.completions.create({
          model: providerModel,
          stream: true,
          messages: [
            {
              role: "system",
              content: `IMPORTANT FORMATTING RULES:
                        - Don't provide plain text, always use Markdown syntax for structure: # ## ### for headings, **bold**, *italic*, (-, 1) for lists
                        - Use icons only when they add clear value and user experience to the content
                        - Keep it clear and well organized`,
            },
            { role: "user", content },
          ],
          reasoning_effort: "medium",
        });

        for await (const chunk of completion) {
          const delta = chunk.choices?.[0]?.delta;
          if (!delta) continue;

          // 🔍 DEBUG: Log the full delta to see what's available
          console.log("📦 Full delta:", JSON.stringify(delta, null, 2));

          // 1) Reasoning stream (if present)
          const rds = (
            delta as {
              reasoning_details?: (
                | { type: "reasoning.text"; text?: string }
                | { type: "reasoning.summary"; summary?: string }
              )[];
            }
          ).reasoning_details;

          const priorReasoningLength = finalReasoning.length;

          if (Array.isArray(rds)) {
            console.log("🧠 REASONING DETECTED:", rds);
            for (const d of rds) {
              let text = "";
              if (d.type === "reasoning.text" && d.text) {
                text = d.text;
              } else if (d.type === "reasoning.summary" && d.summary) {
                text = d.summary;
              }

              if (text) {
                console.log("🧠 Streaming reasoning:", text);
                finalReasoning += text;
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({
                      type: "reasoning",
                      delta: text,
                    })}\n\n`
                  )
                );
              }
            }
          }

          if (finalReasoning.length > priorReasoningLength) {
            if (reasoningStartMs === null) {
              reasoningStartMs = Date.now();
            }
            reasoningEndMs = Date.now();

            // Send live duration update to frontend
            const currentDuration = reasoningEndMs - reasoningStartMs;
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "reasoning_duration",
                  durationMs: currentDuration,
                })}\n\n`
              )
            );
          }

          // 2) Visible answer tokens
          if (typeof delta.content === "string" && delta.content.length) {
            console.log("💬 Streaming answer:", delta.content);
            finalAnswer += delta.content;
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "answer",
                  delta: delta.content,
                })}\n\n`
              )
            );
          }

          // 3) Mid-stream provider error (rare)
          if ((chunk as unknown as { error?: string }).error) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "error",
                  error: (chunk as unknown as { error: string }).error,
                })}\n\n`
              )
            );
            break;
          }
        }

        if (reasoningStartMs !== null && reasoningEndMs !== null) {
          reasoningDurationMs = Math.max(reasoningEndMs - reasoningStartMs, 1);
        } else {
          reasoningDurationMs = undefined;
        }

        console.log(
          "[stream] final reasoning duration (ms):",
          reasoningDurationMs ?? "N/A"
        );

        // DEBUG: Log final accumulated values
        // console.log("✅ FINAL REASONING LENGTH:", finalReasoning.length);
        // console.log("✅ FINAL ANSWER LENGTH:", finalAnswer.length);
        // console.log(
        //   "✅ FINAL REASONING PREVIEW:",
        //   finalReasoning.slice(0, 200)
        // );
        // console.log("✅ FINAL ANSWER PREVIEW:", finalAnswer.slice(0, 200));

        // Save final assistant message
        const assistantMessage = {
          role: "assistant",
          content: finalAnswer,
          reasoning: finalReasoning || undefined,
          ...(typeof reasoningDurationMs === "number"
            ? { reasoningDurationMs }
            : {}),
          model,
          timestamp: new Date(),
        };

        // console.log(
        //   "DEBUG BEFORE PUSH - assistantMessage:",
        //   JSON.stringify(assistantMessage, null, 2)
        // );

        chat.messages.push(assistantMessage);

        // console.log(
        //   "DEBUG AFTER PUSH - last message:",
        //   JSON.stringify(chat.messages[chat.messages.length - 1], null, 2)
        // );

        await chat.save();

        // console.log(
        //   "DEBUG AFTER SAVE - last message:",
        //   JSON.stringify(chat.messages[chat.messages.length - 1], null, 2)
        // );

        controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
      } catch (err) {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "error",
              error: String(
                err instanceof Error ? err.message : "Failed to stream response"
              ),
            })}\n\n`
          )
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

import OpenAI from "openai";
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import Chat from "@/models/Chat";
import connectDB from "@/config/db";
export const maxDuration = 60;

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

const ALLOWED_MODELS: Record<string, string> = {
  "gpt-5": "openai/gpt-5", // ChatGPT (fast/cheap)
  "claude-sonnet-4": "anthropic/claude-sonnet-4", // Claude
  "gemini-2.5-pro": "google/gemini-2.5-pro", // Gemini
  "grok-4": "x-ai/grok-4", // Grok
};

export async function POST(req: NextRequest) {
  try {
    const { chatId, content, model } = await req.json();
    const { userId } = getAuth(req);

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User Unauthorized" },
        { status: 401 }
      );
    }

    if (!ALLOWED_MODELS[model]) {
      return NextResponse.json(
        { success: false, error: "Invalid Model" },
        { status: 400 }
      );
    }

    await connectDB();

    // Find the chat document in the database based on userId and chatId
    const data = await Chat.findOne({ userId, _id: chatId });

    if (!data) {
      return NextResponse.json(
        { success: false, error: "Chat Not Found" },
        { status: 404 }
      );
    }

    type MessageProps = {
      role: "user" | "assistant";
      content: string;
      model: string;
      timestamp: Date;
    };

    // Create a user prompt
    const userPrompt: MessageProps = {
      role: "user",
      content,
      model,
      timestamp: new Date(),
    };

    // Add the user prompt to the chat messages
    data.messages.push(userPrompt);

    // Get the AI message
    const completion = await openai.chat.completions.create({
      model: ALLOWED_MODELS[model],
      messages: [
        {
          role: "user",
          content,
        },
      ],
    });

    const message = completion.choices[0].message;

    const aiMessage = {
      role: "assistant",
      content: message.content,
      model,
      timestamp: new Date(),
    };

    // Add the AI message to the chat messages
    data.messages.push(aiMessage);

    await data.save();

    // Return the saved assistant message in a shape the frontend expects
    return NextResponse.json(
      { success: true, message: aiMessage },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}


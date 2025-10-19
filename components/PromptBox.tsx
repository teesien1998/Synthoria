"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, Mic, ArrowUp, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";
import ModelSelector from "./ModelSelector";
import { aiModels, AIModel } from "./ModelSelector";
import { useAppContext } from "@/context/AppContext";
import { toast } from "sonner";

type PromptBoxProps = {
  placeholder?: string;
  disabled?: boolean;
};

type MessageProps = {
  role: "user" | "assistant";
  content: string;
  model: string | undefined;
  timestamp: Date;
  isError?: boolean;
  reasoning?: string;
  reasoningDurationMs?: number;
};

type Chat = {
  _id: string;
  userId: string;
  name: string;
  messages: MessageProps[];
  updatedAt: Date;
  createdAt: Date;
};

const PromptBox = ({
  placeholder = "Message Synthoria…",
  disabled = false,
}: PromptBoxProps) => {
  const [selectedModel, setSelectedModel] = useState<AIModel>(aiModels[1]);
  const [prompt, setPrompt] = useState<string>("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const {
    user,
    chats,
    setChats,
    selectedChat,
    setSelectedChat,
    isLoading,
    setIsLoading,
  } = useAppContext();

  // Auto-resize the textarea to fit content
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "0px";
    const next = Math.min(el.scrollHeight, 200); // cap at ~6-7 lines
    el.style.height = `${next}px`;
    console.log(el.style.height);
  }, [prompt]);

  const handleSubmit = async () => {
    const trimmed = prompt.trim();
    if (!trimmed || isLoading || disabled) return;

    const currentPrompt = prompt; // Save prompt before clearing
    setPrompt(""); // Clear prompt immediately after submission

    try {
      if (!user) return toast.error("Login to send message");

      setIsLoading(true);

      const userPrompt: MessageProps = {
        role: "user",
        content: currentPrompt,
        model: selectedModel.id,
        timestamp: new Date(),
      };

      // Update the chats with the new user prompt
      setChats((prevChats) => {
        const updatedChats = prevChats.map((chat) =>
          chat._id === selectedChat?._id
            ? { ...chat, messages: [...chat.messages, userPrompt] }
            : chat
        );

        return updatedChats.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      });

      // Update the selected chat with the new user prompt
      setSelectedChat((prevChat) =>
        prevChat
          ? {
              ...prevChat,
              messages: [...prevChat.messages, userPrompt],
            }
          : null
      );

      // Start streaming
      const res = await fetch("/api/chat/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatId: selectedChat?._id,
          content: currentPrompt,
          model: selectedModel.id,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || res.statusText);
      }

      // Add a blank assistant message we'll update live
      const aiMessage: MessageProps = {
        role: "assistant",
        content: "",
        model: selectedModel.id,
        timestamp: new Date(),
        reasoning: "",
        reasoningDurationMs: undefined,
      };

      setSelectedChat((prev) =>
        prev ? { ...prev, messages: [...prev.messages, aiMessage] } : null
      );

      setIsLoading(false); // Stop loading to show streaming content

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();

      let answerAccum = "";
      let reasoningAccum = "";

      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });

        for (const line of chunk.split("\n")) {
          const sseline = line.trim();
          if (!sseline) continue;
          if (sseline.startsWith(":")) continue; // ignore SSE comments
          if (!sseline.startsWith("data:")) continue;

          const payload = sseline.slice(5).trim();
          if (payload === "[DONE]") break;

          try {
            const evt = JSON.parse(payload) as
              | { type: "reasoning"; delta: string }
              | { type: "answer"; delta: string }
              | { type: "reasoning_duration"; durationMs: number }
              | { type: "error"; error: unknown };

            if (evt.type === "error") {
              toast.error(String(evt.error));

              // Update the message to show as error
              setSelectedChat((prev) => {
                if (!prev) return null;
                const msgs = [...prev.messages];
                for (let i = msgs.length - 1; i >= 0; i--) {
                  if (msgs[i].role === "assistant") {
                    msgs[i] = {
                      ...msgs[i],
                      content: String(evt.error),
                      isError: true,
                    };
                    break;
                  }
                }
                return { ...prev, messages: msgs };
              });
              break; // Stop processing the stream on error
            }

            if (evt.type === "reasoning_duration") {
              setSelectedChat((prev) => {
                if (!prev) return null;
                const msgs = [...prev.messages];
                for (let i = msgs.length - 1; i >= 0; i--) {
                  if (msgs[i].role === "assistant") {
                    msgs[i] = {
                      ...msgs[i],
                      reasoningDurationMs: evt.durationMs,
                    };
                    break;
                  }
                }
                return { ...prev, messages: msgs };
              });
              continue;
            }

            if (evt.type === "reasoning") {
              reasoningAccum += evt.delta;

              setSelectedChat((prev) => {
                if (!prev) return null;
                const msgs = [...prev.messages];
                for (let i = msgs.length - 1; i >= 0; i--) {
                  if (msgs[i].role === "assistant") {
                    msgs[i] = {
                      ...msgs[i],
                      reasoning: reasoningAccum,
                    };
                    break;
                  }
                }
                return { ...prev, messages: msgs };
              });
              continue;
            }

            if (evt.type === "answer") {
              answerAccum += evt.delta;
              setSelectedChat((prev) => {
                if (!prev) return null;
                const msgs = [...prev.messages];
                for (let i = msgs.length - 1; i >= 0; i--) {
                  if (msgs[i].role === "assistant") {
                    msgs[i] = { ...msgs[i], content: answerAccum };
                    break;
                  }
                }
                return { ...prev, messages: msgs };
              });
            }
          } catch {
            // ignore non-JSON payloads
          }
        }
      }

      // Note: No need to update chats here - the message is already saved to DB and
      // the streaming updates have already updated the UI in real-time
    } catch (error) {
      const errorReturnMessage =
        error instanceof Error
          ? error.message
          : "Error fetching AI response. Please try again.";

      const errorMessage: MessageProps = {
        role: "assistant",
        content: errorReturnMessage,
        model: selectedModel.id,
        timestamp: new Date(),
        isError: true,
      };

      setSelectedChat((prevChat) =>
        prevChat
          ? { ...prevChat, messages: [...prevChat.messages, errorMessage] }
          : null
      );
      toast.error(errorReturnMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (
    e
  ) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const isSendDisabled = !prompt.trim() || isLoading || disabled;

  return (
    <div className="w-full bg-gradient-to-t from-white dark:from-[#212121] from-60% to-transparent to-90%">
      <div className="w-full max-w-5xl mx-auto flex flex-col px-4 gap-4">
        <div className="flex justify-start">
          <ModelSelector
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
          />
        </div>

        <div className="flex flex-col w-full">
          <div
            className={cn(
              "flex items-center gap-2 rounded-3xl border bg-background dark:bg-[#303030] z-10",
              "pr-2 pl-4 py-2 shadow-sm"
            )}
          >
            <button
              type="button"
              aria-label="Add"
              className="inline-flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground transition-colors"
              disabled={disabled}
            >
              <Plus className="h-5 w-5" />
            </button>

            <textarea
              id="prompt-input"
              ref={textareaRef}
              rows={1}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className={cn(
                "flex-1 resize-none bg-transparent outline-none placeholder:text-muted-foreground/70",
                "text-lg leading-7"
              )}
              disabled={disabled}
            />

            <div className="flex items-center gap-2 md:gap-3">
              <button
                type="button"
                aria-label="Attach"
                className="hidden sm:inline-flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground transition-colors"
                disabled={disabled}
              >
                <Paperclip className="h-5 w-5" />
              </button>

              <button
                type="button"
                aria-label="Voice"
                className="hidden sm:inline-flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground transition-colors"
                disabled={disabled}
              >
                <Mic className="h-5 w-5" />
              </button>

              <button
                type="button"
                aria-label="Send"
                onClick={() => handleSubmit()}
                disabled={isSendDisabled}
                className={cn(
                  "inline-flex h-8 w-8 items-center justify-center rounded-full",
                  isSendDisabled
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : "bg-foreground text-background hover:opacity-85 cursor-pointer"
                )}
              >
                <ArrowUp className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>

          {/* <p className="mt-2 text-[11px] text-muted-foreground text-center">
          Press Enter to send • Shift + Enter for new line
        </p> */}
          <p className="text-xs text-gray-500 w-full text-center py-2.5">
            AI-generated responses may make mistakes, for reference only
          </p>
        </div>
      </div>
    </div>
  );
};

export default PromptBox;

"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, Mic, ArrowUp, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";
import ModelSelector from "./ModelSelector";
import { aiModels, AIModel } from "./ModelSelector";
import { useAppContext } from "@/context/AppContext";
import { toast } from "sonner";
import axios from "axios";
import { ConnectorOutSerializer } from "svix/dist/models/connectorOut";

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
  const [selectedModel, setSelectedModel] = useState<AIModel>(aiModels[0]);
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
  } = useAppContext() || {};

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

    try {
      if (!user) return toast.error("Login to send message");

      setIsLoading(true);
      setPrompt(""); // Clear prompt immediately after submission

      const userPrompt: MessageProps = {
        role: "user",
        content: prompt,
        model: selectedModel.id,
        timestamp: new Date(),
      };

      // Update the chats with the new user prompt
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat._id === selectedChat?._id
            ? { ...chat, messages: [...chat.messages, userPrompt] }
            : chat
        )
      );

      // Update the selected chat with the new user prompt
      setSelectedChat((prevChat) =>
        prevChat
          ? {
              ...prevChat,
              messages: [...prevChat.messages, userPrompt],
            }
          : null
      );

      const { data } = await axios.post("/api/chat/ai", {
        chatId: selectedChat?._id,
        content: prompt,
        model: selectedModel.id,
      });

      if (data.success) {
        // 1) Stop loader so typing is visible
        setIsLoading(false);

        // 2) Update the chats with the new ai message
        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat._id === selectedChat?._id
              ? { ...chat, messages: [...chat.messages, data.message] }
              : chat
          )
        );

        // 3) Update the selected chat with the new ai message
        const aiMessage: MessageProps = {
          role: "assistant",
          content: "",
          model: selectedModel.id,
          timestamp: new Date(),
        };

        setSelectedChat((prevChat) =>
          prevChat
            ? { ...prevChat, messages: [...prevChat.messages, aiMessage] }
            : null
        );

        // 4) Typing animation (no direct push of data.message)
        const messageArray = data.message.content.split(" ");

        for (let i = 0; i < messageArray.length; i++) {
          setTimeout(() => {
            aiMessage.content = messageArray.slice(0, i + 1).join(" ");

            setSelectedChat((prevChat) => {
              if (!prevChat) return null;

              const updateMessage = [
                ...prevChat?.messages?.slice(0, -1),
                aiMessage,
              ];

              return { ...prevChat, messages: updateMessage };
            });
          }, 500);
        }
      } else {
        const errorMessage: MessageProps = {
          role: "assistant",
          content: data.error,
          model: selectedModel.id,
          timestamp: new Date(),
          isError: true,
        };

        setSelectedChat((prevChat) =>
          prevChat
            ? { ...prevChat, messages: [...prevChat.messages, errorMessage] }
            : null
        );

        toast.error(data.error);
      }
    } catch (error) {
      const errorReturnMessage = axios.isAxiosError(error)
        ? error.response?.data?.error ||
          "Error fetching AI response. Please try again."
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
                "text-base leading-7"
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

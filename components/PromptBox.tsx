"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, Mic, ArrowUp, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";
import ModelSelector from "./ModelSelector";
import { aiModels, AIModel } from "./ModelSelector";

export type PromptBoxProps = {
  // onSubmit: (message: string) => void | Promise<void>;
  placeholder?: string;
  isLoading?: boolean;
  setIsLoading?: (isLoading: boolean) => void;
  disabled?: boolean;
  onSubmit: (message: string, model: AIModel) => void | Promise<void>;
};

const PromptBox = ({
  placeholder = "Message Synthoria…",
  isLoading = false,
  setIsLoading,
  disabled = false,
  onSubmit,
}: PromptBoxProps) => {
  const [selectedModel, setSelectedModel] = useState<AIModel>(aiModels[0]);
  const [prompt, setPrompt] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize the textarea to fit content
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "0px";
    const next = Math.min(el.scrollHeight, 200); // cap at ~6-7 lines
    el.style.height = `${next}px`;
    console.log(el.style.height);
  }, [prompt]);

  const handleSubmit = async (prompt: string, model: AIModel) => {
    const trimmed = prompt.trim();
    if (!trimmed || isLoading || disabled || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit(trimmed, model);
      setPrompt("");
    } finally {
      setSubmitting(false);
    }
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(prompt, selectedModel);
    }
  };

  const isSendDisabled =
    disabled || isLoading || submitting || prompt.trim().length === 0;

  return (
    <div className="w-full max-w-4xl flex flex-col items-start px-4 mb-6 gap-4">
      <div className="flex justify-start">
        <ModelSelector
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
        />
      </div>

      <div className="flex flex-col w-full">
        <div
          className={cn(
            "flex items-center gap-2 rounded-3xl border bg-background/80 backdrop-blur",
            "pr-2 pl-4 py-2 shadow-sm"
          )}
        >
          <button
            type="button"
            aria-label="Add"
            className="inline-flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => textareaRef.current?.focus()}
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
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            className={cn(
              "flex-1 resize-none bg-transparent outline-none placeholder:text-muted-foreground/70",
              "text-sm md:text-base leading-6 md:leading-7 "
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
              onClick={() => handleSubmit(prompt, selectedModel)}
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

        <p className="mt-2 text-[11px] text-muted-foreground text-center">
          Press Enter to send • Shift + Enter for new line
        </p>
      </div>
    </div>
  );
};

export default PromptBox;

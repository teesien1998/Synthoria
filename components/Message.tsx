"use client";

import Image from "next/image";
import { assets } from "@/public/assets/assets";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CodeBlock from "./CodeBlock";
import { useState } from "react";
import { CircleAlert, Check } from "lucide-react";

type MessageProps = {
  role: "user" | "assistant";
  content: string;
  model: string | undefined;
  timestamp: Date;
  isError?: boolean;
};

export const aiModels: Record<string, React.ReactElement> = {
  "gpt-5": (
    <Image src={assets.openai_icon} alt="OpenAI" width={17} height={17} />
  ),
  "claude-sonnet-4": (
    <Image src={assets.anthropic_icon} alt="Anthropic" width={16} height={16} />
  ),
  "gemini-2.5-pro": (
    <Image src={assets.gemini_icon} alt="Gemini" width={16} height={16} />
  ),
  "grok-4": <Image src={assets.grok_icon} alt="Grok" width={16} height={16} />,
};

const LoadingDots = () => (
  <div className="loader-dots" role="status" aria-live="polite">
    <span />
    <span />
    <span />
  </div>
);

const Message = ({
  message,
  isLoading,
}: {
  message: MessageProps;
  isLoading: boolean;
}) => {
  const { role, content, model, timestamp, isError } = message;
  const [copied, setCopied] = useState(false);

  const copyMessage = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 3000);
  };

  return role === "user" ? (
    // ---- USER PROMPT ----
    <div className="w-full mb-6 flex justify-end">
      <div className="max-w-[75%] flex flex-col gap-2 items-end">
        <div className="rounded-lg bg-muted-foreground/10 px-3.5 py-2 whitespace-pre-wrap text-lg">
          {content}
        </div>
        <div className="mt-2 flex items-center gap-3 text-muted-foreground">
          {copied ? (
            <Check className="w-5 h-5 text-green-500" />
          ) : (
            <Image
              src={assets.copy_icon}
              alt="Copy"
              className="w-4.5 cursor-pointer"
              onClick={copyMessage}
            />
          )}
          <Image
            src={assets.pencil_icon}
            alt="Edit"
            className="w-4.5 cursor-pointer"
          />
        </div>
      </div>
    </div>
  ) : (
    // ---- ASSISTANT RESPONSE ----
    <div className="w-full mb-6 flex justify-start gap-3">
      <Image src={assets.synthora_icon} alt="" className="w-8 h-8" />
      <div className="flex flex-col gap-2">
        {isLoading ? (
          // Loading indicator
          <div className="px-3.5 py-2 text-lg text-muted-foreground">
            <LoadingDots />
          </div>
        ) : isError ? (
          // Error message
          <div className="px-3.5 py-2 flex items-center gap-3 text-destructive bg-destructive/5 rounded-lg text-lg">
            <CircleAlert className="w-5 h-5 text-destructive" />
            {content}
          </div>
        ) : (
          // Markdown content
          <>
            <div className="px-3.5 py-2 text-lg prose-lg dark:prose-invert max-w-none">
              <Markdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code: CodeBlock as any,
                  h1: (p) => (
                    <h1 className="text-2xl font-semibold my-4" {...p} />
                  ),
                  h2: (p) => (
                    <h2 className="text-xl font-semibold my-4" {...p} />
                  ),
                  h3: (p) => (
                    <h3 className="text-lg font-semibold my-4" {...p} />
                  ),
                  strong: (p) => <strong className="font-medium" {...p} />,
                  p: (p) => <p className="my-3 leading-7" {...p} />,
                  ul: (p) => (
                    <ul className="list-disc pl-6 my-3 space-y-1" {...p} />
                  ),
                  ol: (p) => (
                    <ol className="list-decimal pl-6 my-3 space-y-1" {...p} />
                  ),
                  li: (p) => <li className="leading-7" {...p} />,
                  hr: () => <hr className="my-6 border-border" />,
                }}
              >
                {content}
              </Markdown>
            </div>
            <div className="mt-2 flex items-center gap-3 text-foreground/70">
              {copied ? (
                <Check className="w-5 h-5 text-green-500" />
              ) : (
                <Image
                  src={assets.copy_icon}
                  alt="Copy"
                  className="w-4.5 cursor-pointer"
                  onClick={copyMessage}
                />
              )}
              <Image
                src={assets.regenerate_icon}
                alt="Regenerate"
                className="w-4.5 cursor-pointer"
              />
              <Image
                src={assets.like_icon}
                alt="Like"
                className="w-4.5 cursor-pointer"
              />
              <Image
                src={assets.dislike_icon}
                alt="Dislike"
                className="w-4.5 cursor-pointer"
              />
              <div className="flex items-center gap-2 border border-border rounded-md px-2 py-1">
                {model && aiModels[model] ? (
                  <>
                    {aiModels[model]}
                    <span className="text-sm">{model}</span>
                  </>
                ) : (
                  <span>Unknown model</span>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Message;

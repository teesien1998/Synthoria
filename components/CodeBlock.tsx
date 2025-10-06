"use client";

import { useRef, useEffect, useState } from "react";
import Prism from "prismjs";
import "@/app/prism-vs.css"; // your theme file (light/dark)
import { Copy, Check } from "lucide-react"; // Import the copy icon from lucide-react

// ?o. Load some Prism languages (you can autoload if preferred)
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-python";
import "prismjs/components/prism-json";
import "prismjs/components/prism-css";
import "prismjs/components/prism-bash";

const CodeBlock = ({
  inline,
  className,
  children,
}: {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}) => {
  const codeRef = useRef<HTMLElement | null>(null);
  const lang = /language-(\w+)/.exec(className || "")?.[1] || "";

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!inline && codeRef.current) {
      Prism.highlightElement(codeRef.current);
    }
  }, [children, inline]);

  if (inline) {
    return (
      <code className="px-1 py-0.5 rounded bg-muted text-foreground">
        {children}
      </code>
    );
  }

  const text = String(children ?? "");

  return (
    <div className="relative group">
      {/* <div className="text-sm text-foreground/50 absolute top-2 left-2 px-2">
        {lang}
      </div> */}
      <pre className={`language-${lang} rounded-lg overflow-auto`}>
        <div
          className={`flex pb-4 ${lang ? "justify-between" : "justify-end"}`}
        >
          {lang ? (
            <>
              <div className="text-sm text-foreground/50 dark:text-foreground">
                {lang}
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(text);
                  setCopied(true);
                  setTimeout(() => {
                    setCopied(false);
                  }, 3000);
                }}
                className="cursor-pointer flex items-center gap-2 text-xs opacity-0 group-hover:opacity-100 transition-all duration-200 bg-transparent"
                aria-label="Copy code"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-foreground/50 dark:text-foreground">
                      Copied
                    </span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-foreground/50 dark:text-white" />
                    <span className="text-sm text-foreground/50 dark:text-white">
                      Copy code
                    </span>
                  </>
                )}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(text);
                setCopied(true);
                setTimeout(() => {
                  setCopied(false);
                }, 3000);
              }}
              className="cursor-pointer flex items-center gap-2 text-xs opacity-0 group-hover:opacity-100 transition-all duration-200 bg-transparent"
              aria-label="Copy code"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-foreground/50 dark:text-foreground">
                    Copied
                  </span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-foreground/50 dark:text-foreground" />
                  <span className="text-sm text-foreground/50 dark:text-foreground">
                    Copy code
                  </span>
                </>
              )}
            </button>
          )}
        </div>

        <code ref={codeRef} className={`language-${lang}`}>
          {text}
        </code>
      </pre>
    </div>
  );
};

export default CodeBlock;

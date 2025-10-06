"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { assets } from "@/public/assets/assets";
import PromptBox from "@/components/PromptBox";
import Sidebar from "@/components/Sidebar";
import { PanelRightClose } from "lucide-react";
import { PanelRightOpen } from "lucide-react";
import NavDrawer from "@/components/NavDrawer";
import NewChatDialog from "@/components/NewChatDialog";
import Message from "@/components/Message";
import { useAppContext } from "@/context/AppContext";
import { ModeToggle } from "@/components/ModeToggle";
import { useTheme } from "next-themes";

export default function Home() {
  const [expand, setExpand] = useState<boolean>(false);
  const [isMdScreen, setIsMdScreen] = useState<boolean>(true);
  const { selectedChat, setSelectedChat, isLoading } = useAppContext();
  const bottomRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();

  const logoSrc =
    resolvedTheme === "dark" ? assets.synthora_white : assets.synthora_black;

  // Track screen size for responsive sidebar margin
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMdScreen(window.innerWidth >= 768);
    };

    // Initial check
    checkScreenSize();

    // Listen for resize events
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Smooth scroll to bottom whenever a new message arrives
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedChat?.messages.length]);

  return (
    <div className="flex min-h-screen">
      {/* Fixed Sidebar */}
      <div className="fixed left-0 top-0 z-30 h-screen">
        <Sidebar expand={expand} setExpand={setExpand} />
      </div>

      {/* Main content area with left margin for sidebar */}
      <div
        className="flex-1 flex flex-col relative "
        style={{
          marginLeft: isMdScreen ? (expand ? "280px" : "60px") : "0px",
        }}
      >
        {/* Fixed Header */}
        <div
          className="fixed top-0 z-20 flex items-center justify-between px-4 h-14 md:py-2 border-b-1 md:border-none shadow-xs md:shadow-none bg-white/40 backdrop-blur-lg dark:bg-[#212121]/40"
          style={{
            left: isMdScreen ? (expand ? "280px" : "60px") : "0px",
            right: 0,
          }}
        >
          <button
            onClick={() => setExpand(!expand)}
            className="group p-3 hidden md:flex items-center justify-center rounded-lg hover:bg-muted-foreground/5 text-foreground cursor-pointer transition-all duration-200"
          >
            {expand ? (
              <PanelRightOpen className="w-5.5 h-5.5 text-muted-foreground group-hover:text-foreground cursor-pointer" />
            ) : (
              <PanelRightClose className="w-5.5 h-5.5 text-muted-foreground group-hover:text-foreground cursor-pointer" />
            )}
          </button>
          <ModeToggle />

          <div className="flex items-center justify-between md:hidden w-full">
            <NavDrawer />
            <Image src={logoSrc} width={170} height={170} alt="Synthoria" />
            <NewChatDialog sidebar={false} />
          </div>
        </div>

        {/* Scrollable content area */}
        <div className="pt-14 pb-32 flex-1 flex justify-center dark:bg-[#212121]">
          {!selectedChat?.messages || selectedChat.messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 text-center max-w-5xl px-4 ">
              <div className="flex items-center gap-3">
                <Image
                  src={assets.synthora_icon}
                  alt="logoIcon"
                  width={60}
                  height={60}
                />
                <h1 className="font-semibold text-5xl">
                  {"Hi, I'm Synthoria."}
                </h1>
              </div>
              <p className="text-lg text-muted-foreground">
                Meet Synthoria, your AI assistant. Get support with writing,
                planning, brainstorming, and more. Discover the power of
                generative AI.
              </p>
            </div>
          ) : (
            <div className="w-full max-w-5xl px-4">
              {selectedChat?.messages.map((message, idx) => (
                <Message isLoading={false} key={idx} message={message} />
              ))}
              <div ref={bottomRef} />
              {isLoading && (
                <Message
                  isLoading={true}
                  key="loading"
                  message={{
                    role: "assistant",
                    content: "",
                    model:
                      selectedChat?.messages[selectedChat?.messages.length - 1]
                        ?.model,
                    timestamp: new Date(),
                  }}
                />
              )}
            </div>
          )}
        </div>

        {/* Fixed PromptBox */}
        <div
          className="fixed bottom-0 left-0 right-0 z-20"
          style={{
            left: isMdScreen ? (expand ? "280px" : "60px") : "0px",
          }}
        >
          <PromptBox />
        </div>
      </div>
    </div>
  );
}

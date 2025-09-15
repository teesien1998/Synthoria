"use client";

import { useState } from "react";
import Image from "next/image";
import { assets } from "@/public/assets/assets";
import { LuSquarePen } from "react-icons/lu";
import PromptBox from "@/components/PromptBox";
import Sidebar from "@/components/Sidebar";
import { PanelRightClose } from "lucide-react";
import { PanelRightOpen } from "lucide-react";
import NavDrawer from "@/components/NavDrawer";
import { AIModel } from "@/components/ModelSelector";
import Message from "@/components/Message";
import axios from "axios";

export default function Home() {
  type Message = {
    role: "user" | "assistant";
    prompt: string;
    model: AIModel;
    timestamp: Date;
    isError?: boolean;
  };

  const [expand, setExpand] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (prompt: string, model: AIModel) => {
    const message: Message = {
      role: "user",
      prompt,
      model,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, message]);

    setIsLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 1000));
    try {
      // 👇 axios call to Next.js API route
      const res = await axios.post("/api/chat", {
        prompt,
        model: model.id,
      });

      const aiMessage: Message = {
        role: "assistant",
        prompt: res.data.reply, // axios automatically parses JSON
        model,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error(err);
      const errorMessage: Message = {
        role: "assistant",
        prompt: "Error fetching AI response. Please try again.",
        model,
        timestamp: new Date(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }

    setIsLoading(false);
  };

  console.log(messages);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar expand={expand} setExpand={setExpand} />
      <div className="flex-1 flex flex-col items-center justify-center relative">
        <div className="flex items-center w-full px-4 h-14 md:py-2 border-b-1 md:border-none shadow-xs md:shadow-none">
          <button
            onClick={() => setExpand(!expand)}
            className="group p-3 bg-transparent hidden md:flex items-center justify-center shadow-none rounded-lg hover:bg-muted-foreground/5 text-foreground cursor-pointer transition-all duration-200"
          >
            {expand ? (
              <PanelRightOpen className="w-5.5 h-5.5 text-muted-foreground group-hover:text-foreground cursor-pointer" />
            ) : (
              <PanelRightClose className="w-5.5 h-5.5 text-muted-foreground group-hover:text-foreground cursor-pointer" />
            )}
          </button>
          <div className="flex items-center justify-between md:hidden w-full">
            <NavDrawer />
            <Image
              className=""
              src={assets.synthora_black}
              width={170}
              height={170}
              alt="Synthoria"
            />
            <LuSquarePen className="w-5 h-5 text-muted-foreground hover:text-foreground cursor-pointer" />
          </div>
        </div>

        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center max-w-4xl px-4">
            <div className="flex items-center gap-3">
              <Image
                src={assets.synthora_icon}
                alt="logoIcon"
                width={60}
                height={60}
              />
              <h1 className="font-semibold text-4xl">{"Hi, I'm Synthoria."}</h1>
            </div>
            <p className="text-lg text-muted-foreground">
              Meet Synthoria, your AI assistant. Get support with writing,
              planning, brainstorming, and more. Discover the power of
              generative AI.
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-4 pt-4">
            {messages.map((message, idx) => (
              <Message isLoading={false} key={idx} message={message} />
            ))}
            {isLoading && (
              <Message
                isLoading={true}
                key="loading"
                message={{
                  role: "assistant",
                  prompt: "",
                  model: messages[messages.length - 1]?.model,
                  timestamp: new Date(),
                }}
              />
            )}
          </div>
        )}

        {/* Prompt Box */}
        <PromptBox
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          onSubmit={handleSubmit}
        />
        <p className="text-xs absolute bottom-1 text-gray-500">
          AI-generated responses may make mistakes, for reference only
        </p>
      </div>
    </div>
  );
}

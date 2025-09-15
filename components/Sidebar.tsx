"use client";
import React, { useRef } from "react";
import Image from "next/image";
import { assets } from "@/public/assets/assets";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, SquarePen, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { SignedIn, SignedOut, UserButton, useClerk } from "@clerk/nextjs";
import { useAppContext } from "@/context/AppContext";
import ChatLabel from "./ChatLabel";

type SidebarProps = {
  expand: boolean;
  setExpand: (expand: boolean) => void;
};

const Sidebar = ({ expand, setExpand }: SidebarProps) => {
  const { user } = useAppContext();
  const { openSignIn } = useClerk();
  const userButtonRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className={cn(
        "bg-muted h-screen hidden md:flex flex-col transition-all duration-300 ease-in-out border-r border-border",
        expand ? "w-70" : "w-15"
      )}
    >
      {/* Header Section */}
      <div
        className={cn(
          "h-14 border-b-[1.5px] border-border flex items-center justify-center",
          expand ? "px-4" : "px-0"
        )}
      >
        {expand ? (
          <div className="flex items-center space-x-3">
            <Image
              src={assets.synthora_icon}
              alt="Synthora icon"
              width={40}
              height={40}
            />
            <Image
              src={assets.synthora_black}
              alt="Synthora icon"
              width={155}
              height={155}
            />
          </div>
        ) : (
          <button
            onClick={() => setExpand(!expand)}
            className="bg-transparent items-center justify-center shadow-none rounded-lg cursor-pointer transition-all duration-200"
          >
            <Image
              src={assets.synthora_icon}
              alt="Synthora icon"
              width={40}
              height={40}
              className="rounded"
            />
          </button>
        )}
      </div>

      <div className={expand ? "flex-1" : "flex-1 flex flex-col items-center"}>
        {/* New Chat Button */}
        <div className={expand ? "px-4 my-4" : "px-0 my-4"}>
          <button
            className={cn(
              "flex space-x-3 items-center bg-transparent shadow-none rounded-lg hover:bg-muted-foreground/5 text-foreground cursor-pointer transition-all duration-200",
              expand ? "w-full justify-start px-4 py-2" : "p-2.5 justify-center"
            )}
            onClick={() => {
              setExpand(true);
            }}
          >
            <SquarePen className="w-5 h-5" />
            {expand && <span>New Chat</span>}
          </button>
        </div>

        {/* Search Section */}
        <div className={expand ? "px-4 mb-8" : "px-0 mb-8"}>
          {expand ? (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <input
                type="text"
                placeholder={expand ? "Search chats..." : ""}
                className={cn(
                  "w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-foreground focus:ring-1 focus:ring-foreground/20 transition-all duration-200",
                  "opacity-100"
                )}
              />
            </div>
          ) : (
            <button
              className="p-2.5 bg-transparent flex items-center justify-center shadow-none rounded-lg hover:bg-muted-foreground/5 text-foreground cursor-pointer transition-all duration-200"
              onClick={() => {
                setExpand(true);
              }}
            >
              <Search className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Chat History */}
        <div className="overflow-y-auto px-4 space-y-3">
          {expand && (
            <>
              <div className="text-sm text-muted-foreground uppercase tracking-wider mb-3 font-medium">
                Recent Chats
              </div>
              <ChatLabel />
            </>
          )}
        </div>
      </div>

      {/* Bottom Section */}
      <div
        className={cn(
          "flex items-center justify-center py-2 border-t-[1.4px] border-border space-y-3",
          expand ? "px-4 py-3" : "px-0 py-3"
        )}
      >
        {/* Auth-aware footer */}
        <SignedOut>
          <div
            className={cn(
              "flex items-center space-x-3 rounded-lg transition-all duration-200 hover:bg-muted-foreground/5",
              expand ? "w-full px-4 py-2 cursor-pointer" : "cursor-pointer"
            )}
            onClick={() => {
              setExpand(true);
              if (expand) {
                openSignIn();
              }
            }}
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src="/assets/profile_icon.svg" alt="Profile" />
              <AvatarFallback className="bg-foreground text-background text-sm font-semibold">
                TS
              </AvatarFallback>
            </Avatar>
            {expand && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-foreground transition-colors">
                  Sign in
                </p>
                <p className="text-xs text-muted-foreground transition-colors">
                  Access your account
                </p>
              </div>
            )}
          </div>
        </SignedOut>
        <SignedIn>
          <div
            className={cn(
              "flex items-center space-x-3 rounded-lg transition-all duration-200 hover:bg-muted-foreground/5 cursor-pointer",
              expand ? "w-full px-4 py-2" : ""
            )}
            onClick={(e) => {
              if (!expand) {
                setExpand(true);
              } else {
                // When sidebar is expanded, trigger UserButton click to show popup menu
                const userButton =
                  userButtonRef.current?.querySelector("button");
                if (userButton) {
                  userButton.click();
                }
              }
            }}
          >
            <div
              ref={userButtonRef}
              onClick={(e) => {
                // Only stop propagation when sidebar is expanded, allowing UserButton to work normally
                // When collapsed, let the click bubble up to expand the sidebar

                e.stopPropagation();
              }}
            >
              <UserButton />
            </div>
            {expand && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-foreground transition-colors">
                  {user?.fullName ||
                    user?.username ||
                    user?.primaryEmailAddress?.emailAddress}
                </p>
                <p className="text-xs text-muted-foreground transition-colors">
                  {user?.primaryEmailAddress?.emailAddress || user?.username}
                </p>
              </div>
            )}
          </div>
        </SignedIn>
      </div>
    </div>
  );
};

export default Sidebar;

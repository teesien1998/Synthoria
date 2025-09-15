"use client";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Image from "next/image";
import { assets } from "@/public/assets/assets";
import { HiOutlineMenuAlt1 } from "react-icons/hi";
import { Search, SquarePen, MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  SignedIn,
  SignedOut,
  UserButton,
  useClerk,
  useUser,
} from "@clerk/nextjs";
import { useAppContext } from "@/context/AppContext";
import ChatLabel from "./ChatLabel";

const NavDrawer = () => {
  const { user } = useAppContext();
  const { openSignIn, openUserProfile } = useClerk();

  return (
    <Sheet>
      <SheetTrigger>
        <HiOutlineMenuAlt1 className="w-5 h-5 text-muted-foreground hover:text-foreground cursor-pointer" />
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] p-0 bg-muted border-r">
        {/* Header Section */}
        <div className="h-14 border-b-[1.5px] border-border flex items-center justify-center px-4">
          <div className="flex items-center space-x-3">
            <Image
              src={assets.synthora_icon}
              alt="Synthora icon"
              width={40}
              height={40}
              className="rounded-lg"
            />
            <Image
              src={assets.synthora_black}
              alt="Synthora"
              width={155}
              height={155}
            />
          </div>
        </div>

        {/* Body */}
        <div className="flex-1">
          {/* New Chat Button */}
          <div className="px-4 my-4">
            <button className="flex w-full space-x-3 items-center bg-transparent shadow-none rounded-lg hover:bg-muted-foreground/5 text-foreground cursor-pointer transition-all duration-200 justify-start px-4 py-2">
              <SquarePen className="w-5 h-5" />
              <span>New Chat</span>
            </button>
          </div>

          {/* Search */}
          <div className="px-4 mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <input
                type="text"
                placeholder="Search chats..."
                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-foreground focus:ring-1 focus:ring-foreground/20 transition-all duration-200"
              />
            </div>
          </div>

          {/* Chat History */}
          <div className="overflow-y-auto px-4 space-y-3">
            <div className="text-sm text-muted-foreground uppercase tracking-wider mb-3 font-medium">
              Recent Chats
            </div>
            <ChatLabel />
          </div>
        </div>

        {/* Bottom Section */}
        <div className="px-4 py-3 border-t-[1.4px] border-border space-y-3 flex items-center justify-center">
          <SignedOut>
            <div
              className="w-full flex items-center space-x-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-muted-foreground/5 px-4 py-2"
              onClick={() => openSignIn()}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src="/assets/profile_icon.svg" alt="Profile" />
                <AvatarFallback className="bg-foreground text-background text-sm font-semibold">
                  TS
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-foreground transition-colors">
                  Sign in
                </p>
                <p className="text-xs text-muted-foreground transition-colors">
                  Access your account
                </p>
              </div>
            </div>
          </SignedOut>
          <SignedIn>
            <div
              className="w-full flex items-center space-x-3 rounded-lg px-4 py-2 hover:bg-muted-foreground/5 transition-all duration-200 cursor-pointer"
              onClick={() => openUserProfile()}
            >
              <UserButton />
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
            </div>
          </SignedIn>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default NavDrawer;

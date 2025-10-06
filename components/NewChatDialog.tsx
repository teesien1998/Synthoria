"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LuSquarePen } from "react-icons/lu";
import { useAppContext } from "@/context/AppContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { LoaderCircle, SquarePen } from "lucide-react";

const NewChatDialog = ({
  expand,
  setExpand,
  sidebar,
}: {
  expand?: boolean;
  setExpand?: (expand: boolean) => void;
  sidebar: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const [chatName, setChatName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const { createNewChat, setSelectedChat, setChats } = useAppContext();

  const handleCreateChat: React.FormEventHandler<HTMLFormElement> = async (
    e
  ) => {
    e.preventDefault();

    console.log("Creating chat", chatName);
    if (!chatName.trim()) {
      toast.error("Please enter a chat name");
      return;
    }

    setIsCreating(true);
    try {
      const newChat = await createNewChat(chatName.trim());
      if (newChat) {
        setSelectedChat(newChat);
        setOpen(false);
        setChatName("");
        toast.success("New chat created!");
        setChats((prevChats) => [newChat, ...prevChats]);
      }
    } catch (error) {
      toast.error("Failed to create chat");
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setChatName("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {sidebar ? (
          <div className={expand ? "px-4 my-4" : "px-0 my-4"}>
            <button
              type="button"
              className={cn(
                "flex space-x-3 items-center bg-transparent shadow-none rounded-lg hover:bg-muted-foreground/7 text-foreground cursor-pointer transition-all duration-200",
                expand
                  ? "w-full justify-start px-4 py-2"
                  : "p-2.5 justify-center"
              )}
              onClick={() => {
                setExpand?.(true);
              }}
            >
              <SquarePen className="w-5 h-5" />
              {expand && <span>New Chat</span>}
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="group p-3 rounded-lg hover:bg-muted-foreground/7 text-foreground cursor-pointer transition-all duration-200"
          >
            <LuSquarePen className="w-5 h-5 text-muted-foreground group-hover:text-foreground cursor-pointer" />
          </button>
        )}
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[425px]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Create New Chat</DialogTitle>
          <DialogDescription>
            Name your new chat and click create to continue.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreateChat} className="grid gap-4">
          <div className="grid gap-2">
            <label htmlFor="chat-name">Name</label>
            <input
              id="chat-name"
              value={chatName}
              onChange={(e) => setChatName(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              disabled={isCreating}
              placeholder="Enter chat name..."
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              onClick={() => {
                setOpen(false);
                setChatName("");
              }}
              disabled={isCreating}
              className="bg-destructive/80 hover:bg-destructive/90 cursor-pointer transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isCreating || !chatName.trim()}
              className="bg-custom/90 hover:bg-custom cursor-pointer transition-all duration-200"
            >
              {isCreating ? (
                // Show a spinning loader icon when renaming
                <span className="flex items-center gap-2">
                  <LoaderCircle className="!w-5 !h-5 animate-spin" />
                  Creating...
                </span>
              ) : (
                "Create Chat"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewChatDialog;

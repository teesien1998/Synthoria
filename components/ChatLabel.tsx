"use client";

import { useState } from "react";
import type React from "react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, LoaderCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import { useAppContext } from "@/context/AppContext";
import { toast } from "sonner";

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

const ChatLabel = ({ onChatSelect }: { onChatSelect?: () => void }) => {
  const {
    chats,
    setChats,
    selectedChat,
    setSelectedChat,
    renameChat,
    deleteChat,
    fetchUserChats,
  } = useAppContext();

  //  rename dialog state (outside the dropdown!)
  const [renameOpen, setRenameOpen] = useState(false);
  const [targetChat, setTargetChat] = useState<Chat | null>(null);
  const [chatName, setChatName] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);

  // delete dialog state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<Chat | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const openRename = (chat: Chat) => {
    setTargetChat(chat);
    setChatName(chat.name);
    setRenameOpen(true); // menu will close; dialog stays (it's outside)
  };

  // Use React.FormEventHandler<HTMLFormElement> for better type safety and clarity.
  const handleRename: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    if (!targetChat) return;

    const newName = chatName.trim();

    if (!chatName.trim()) {
      toast.error("Please enter a chat name");
      return;
    }

    setIsRenaming(true);
    try {
      const renamed = await renameChat(targetChat._id, newName);

      if (renamed) {
        setChats((prevChats) => {
          const updatedChats = prevChats.map((c) =>
            c._id === renamed._id ? renamed : c
          );
          // Sort by updatedAt descending (most recent first)
          return updatedChats.sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
        });
        setRenameOpen(false);
      }
    } catch (error) {
      toast.error("Failed to rename chat");
    } finally {
      setIsRenaming(false);
    }
  };

  const openDelete = (chat: Chat) => {
    setChatToDelete(chat);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!chatToDelete) return;
    setIsDeleting(true);
    try {
      const deleted = await deleteChat(chatToDelete._id);

      if (deleted) {
        setChats((prevChats) =>
          prevChats.filter((c) => c._id !== chatToDelete._id)
        );
        setDeleteOpen(false);
        toast.success("Chat deleted successfully");
      }
    } catch (error) {
      toast.error("Failed to delete chat");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      {chats.map((chat, index) => (
        <div
          key={index}
          className={`group flex space-x-3 items-center justify-between rounded-lg hover:bg-muted-foreground/5 dark:hover:bg-[#303030] cursor-pointer px-4 py-2 ${
            selectedChat?._id === chat._id &&
            "bg-muted-foreground/10 dark:bg-[#252525]"
          }`}
          onClick={() => {
            setSelectedChat(chat);
            onChatSelect?.();
          }}
        >
          <span className="truncate">{chat.name}</span>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 hover:bg-muted-foreground/7 cursor-pointer"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              side="right"
              className="w-40 py-2"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Let menu auto-close: NO preventDefault here */}
              <DropdownMenuItem
                className="cursor-pointer text-base px-3"
                onSelect={(e) => {
                  e.stopPropagation();
                  openRename(chat);
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                Rename
              </DropdownMenuItem>

              <DropdownMenuItem
                className="cursor-pointer text-base px-3 text-destructive focus:bg-destructive/5 focus:text-destructive"
                onSelect={(e) => {
                  e.stopPropagation();
                  openDelete(chat);
                }}
              >
                <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ))}

      {/* Central dialog lives outside the menu, so it won't unmount when the menu closes */}
      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent
          className="sm:max-w-[425px]"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Rename Chat</DialogTitle>
            <DialogDescription>
              Update the chat name and save.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRename} className="grid gap-4">
            <div className="grid gap-2">
              <label htmlFor="chat-name">Name</label>
              <input
                id="chat-name"
                value={chatName}
                onChange={(e) => setChatName(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                disabled={isRenaming}
                placeholder="Enter chat name..."
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                onClick={() => setRenameOpen(false)}
                disabled={isRenaming}
                className="bg-destructive/90 hover:bg-destructive cursor-pointer transition-all duration-200"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isRenaming || !chatName.trim()}
                className="bg-custom/90 hover:bg-custom cursor-pointer transition-all duration-200"
              >
                {isRenaming ? (
                  // Show a spinning loader icon when renaming
                  <span className="flex items-center gap-2">
                    <LoaderCircle className="!w-5 !h-5 animate-spin" />
                    Saving...
                  </span>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the
              chat "{chatToDelete?.name}" and remove all its messages.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              disabled={isDeleting}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive/90 text-white hover:bg-destructive cursor-pointer transition-all duration-200"
            >
              {isDeleting ? (
                <span className="flex items-center gap-2">
                  <LoaderCircle className="!w-4 !h-4 animate-spin" />
                  Deleting...
                </span>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ChatLabel;

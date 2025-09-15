import { MessageSquare } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { Edit, Trash2 } from "lucide-react";

const ChatLabel = () => {
  return (
    <>
      {["New Chats", "New Chats", "New Chats"].map((chat, index) => (
        <button
          key={index}
          className={
            "group flex space-x-3 items-center justify-between bg-transparent shadow-none rounded-lg hover:bg-muted-foreground/5 text-foreground cursor-pointer transition-all duration-200 w-full px-4 py-2"
          }
        >
          {/* <MessageSquare className="w-5 h-5" /> */}
          <span className="truncate text-foreground transition-colors">
            {chat}
          </span>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 hover:bg-muted-foreground/5 transition-all duration-200 cursor-pointer"
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              side="right"
              className="w-40 py-2 flex flex-col gap-1"
            >
              <DropdownMenuItem
                // onClick={handleRename}
                className="cursor-pointer text-base px-3"
              >
                <Edit className="mr-2 h-4 w-4" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem
                // onClick={handleDelete}
                className="cursor-pointer text-base px-3 text-destructive focus:bg-destructive/5 focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </button>
      ))}
    </>
  );
};

export default ChatLabel;

"use client";
import { createContext, useContext } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import type { UserResource } from "@clerk/types";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { AxiosError } from "axios";

type AppContextValue = {
  user: null | UserResource | undefined;
  chats: Chat[];
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
  selectedChat: Chat | null;
  setSelectedChat: React.Dispatch<React.SetStateAction<Chat | null>>;
  createNewChat: (name?: string) => Promise<Chat | null>;
  fetchUserChats: () => Promise<void>;
  renameChat: (chatId: string, name: string) => Promise<Chat | null>;
  deleteChat: (chatId: string) => Promise<Chat | null>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

type MessageProps = {
  role: "user" | "assistant";
  content: string;
  model: string | undefined;
  timestamp: Date;
  isError?: boolean;
  reasoning?: string;
  reasoningDurationMs?: number;
};

type Chat = {
  _id: string;
  userId: string;
  name: string;
  messages: MessageProps[];
  updatedAt: Date;
  createdAt: Date;
};

const AppContext = createContext<AppContextValue>({
  user: null,
  chats: [],
  setChats: () => {},
  selectedChat: null,
  setSelectedChat: () => {},
  createNewChat: async () => null,
  fetchUserChats: async () => {},
  renameChat: async () => null,
  deleteChat: async () => null,
  isLoading: false,
  setIsLoading: () => {},
});

export const useAppContext = () => {
  return useContext(AppContext);
};

export const AppContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user } = useUser();
  const { getToken } = useAuth();

  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const createNewChat = async (name?: string) => {
    try {
      if (!user) {
        return null;
      }

      const token = await getToken();
      name = name ?? "New Chat";

      // Create a new chat
      const { data } = await axios.post(
        "/api/chat/create",
        { name },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        return data.chat; // ✅ return created chat
      } else {
        toast.error(data.error || "Could not create new chat");
        return null; // ❌ don't retry endlessly
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.error || "Unexpected error");
      } else {
        toast.error("Unexpected error");
      }
      return null;
    }
  };

  const fetchUserChats = async () => {
    try {
      const token = await getToken();

      // Get all chats for the user
      const { data } = await axios.get("/api/chat/get", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // sort chats by updatedAt in descending order
      data.chats.sort(
        (a: Chat, b: Chat) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );

      if (data.success) {
        if (data.chats.length > 0) {
          // Set all chats for the sidebar to be displayed
          setChats(data.chats);

          // Set recently updated chat as selected chat
          setSelectedChat(data.chats[0]);
        } else {
          // If no chats are found, create a new chat automatically
          const created = await createNewChat();
          if (created) await fetchUserChats();
        }
      } else {
        toast.error(data.error || "Failed to fetch chats");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.error);
      } else {
        toast.error("Unexpected error");
      }
    }
  };

  const renameChat = async (chatId: string, name: string) => {
    try {
      const token = await getToken();

      const { data } = await axios.put(
        "/api/chat/rename",
        {
          chatId: chatId,
          name: name,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (data.success) {
        return data.chat;
      } else {
        toast.error(data.error || "Failed to rename chat");
        return null;
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.error);
      } else {
        toast.error("Unexpected error");
      }
      return null;
    }
  };

  const deleteChat = async (chatId: string) => {
    try {
      const token = await getToken();
      const { data } = await axios.delete("/api/chat/delete", {
        data: { chatId },
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        console.log("Chat deleted", data);
        return data;
      } else {
        toast.error(data.error || "Failed to delete chat");
        return null;
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.error);
      } else {
        toast.error("Unexpected error");
      }
      return null;
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserChats();
    } else {
      setChats([]);
      setSelectedChat(null);
    }
  }, [user]);

  const value = {
    user,
    chats,
    setChats,
    selectedChat,
    setSelectedChat,
    createNewChat,
    fetchUserChats,
    renameChat,
    deleteChat,
    isLoading,
    setIsLoading,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

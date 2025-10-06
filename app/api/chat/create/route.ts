import connectDB from "@/config/db";
import Chat from "@/models/Chat";
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { name } = await req.json();
    const { userId } = getAuth(req);

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User Unauthorized" },
        { status: 401 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Chat name is required" },
        { status: 400 }
      );
    }

    // Prepare the chat data to be saved in the database
    const chatData = {
      name,
      userId,
      messages: [],
    };

    // Connect to the database and create a new chat
    await connectDB();
    const newChat = await Chat.create(chatData);

    return NextResponse.json(
      {
        success: true,
        message: "Chat created successfully",
        chat: newChat,
      },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to create chat",
      },
      { status: 500 }
    );
  }
}

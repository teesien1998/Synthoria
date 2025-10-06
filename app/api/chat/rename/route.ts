import connectDB from "@/config/db";
import Chat from "@/models/Chat";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse, NextRequest } from "next/server";

export async function PUT(req: NextRequest) {
  try {
    const { chatId, name } = await req.json();
    const { userId } = getAuth(req);

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User Unauthorized" },
        { status: 401 }
      );
    }

    if (!name || !chatId) {
      return NextResponse.json(
        { success: false, error: "Name and chatId are required" },
        { status: 400 }
      );
    }

    // Connect to the database and rename the chat
    await connectDB();
    const newchat = await Chat.findOneAndUpdate(
      { _id: chatId },
      { name },
      { new: true }
    );

    return NextResponse.json(
      { success: true, message: "Chat renamed successfully", chat: newchat },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to rename chat",
      },
      { status: 500 }
    );
  }
}

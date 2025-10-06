import connectDB from "@/config/db";
import Chat from "@/models/Chat";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse, NextRequest } from "next/server";

export async function DELETE(req: NextRequest) {
  try {
    const { chatId } = await req.json();
    const { userId } = getAuth(req);

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User Unauthorized" },
        { status: 401 }
      );
    }

    if (!chatId) {
      return NextResponse.json(
        { success: false, error: "ChatId is required" },
        { status: 400 }
      );
    }

    // Connect to the database and delete the chat
    await connectDB();
    await Chat.findOneAndDelete({ _id: chatId });

    return NextResponse.json(
      { success: true, message: "Chat deleted successfully" },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to delete chat",
      },
      { status: 500 }
    );
  }
}

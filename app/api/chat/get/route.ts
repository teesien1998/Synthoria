import connectDB from "@/config/db";
import Chat from "@/models/Chat";
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User Unauthorized" },
        { status: 401 }
      );
    }

    // Connect to the database and fetch all chats for the user
    await connectDB();
    const chats = await Chat.find({ userId });

    return NextResponse.json(
      { success: true, message: "All chats fetched successfully", chats },
      { status: 200 }
    );
  } catch (err) {
    // If an error occurs, return a 500 error with a message
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to get all chats",
      },
      { status: 500 }
    );
  }
}

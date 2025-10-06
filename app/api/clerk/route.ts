import { Webhook } from "svix";
import connectDB from "@/config/db";
import User from "@/models/User";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

export async function POST(req: Request) {
  const secret = process.env.CLERK_WEBHOOK_SECRET || "";
  // Check if the secret is missing
  if (!secret) {
    return NextResponse.json(
      { error: "Missing CLERK_WEBHOOK_SECRET" },
      { status: 500 }
    );
  }

  // Create a new Webhook instance
  const wh = new Webhook(secret);

  // Get the headers
  const header = await headers();
  const svixHeaders = {
    "svix-id": header.get("svix-id") ?? "",
    "svix-timestamp": header.get("svix-timestamp") ?? "",
    "svix-signature": header.get("svix-signature") ?? "",
  };

  // Get the payload
  const payload = await req.text();

  type ClerkUser = {
    id: string;
    email_addresses?: { email_address: string | null }[];
    first_name?: string | null;
    last_name?: string | null;
    image_url?: string | null;
  };

  type WebhookPayload = {
    data: ClerkUser;
    type: "user.created" | "user.updated" | "user.deleted" | string;
  };

  // Verify the payload and
  const { data, type } = wh.verify(payload, svixHeaders) as WebhookPayload;

  const userData = {
    _id: data.id,
    email: data.email_addresses?.[0]?.email_address,
    name: data.first_name + " " + data.last_name,
    image: data.image_url,
  };

  // Connect to the database
  await connectDB();

  // Handle the event based on the type
  switch (type) {
    case "user.created":
      await User.create(userData);
      break;

    case "user.updated":
      await User.findByIdAndUpdate(userData._id, userData);
      break;

    case "user.deleted":
      await User.findByIdAndDelete(userData._id);
      break;

    default:
      break;
  }

  return NextResponse.json(
    { success: true, message: "Webhook Event Recieved" },
    { status: 200 }
  );
}

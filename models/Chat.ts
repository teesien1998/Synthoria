import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    messages: {
      type: [
        {
          role: { type: String, required: true },
          content: { type: String, required: true },
          model: { type: String, required: true },
          timestamp: { type: Date, required: true },
        },
      ],
      default: [],
    },
    userId: { type: String, required: true },
  },
  { timestamps: true }
);

const Chat = mongoose.models.Chat || mongoose.model("Chat", ChatSchema);

export default Chat;

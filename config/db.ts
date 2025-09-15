import mongoose from "mongoose";

// --- Global cache type (so TS won't complain)
declare global {
  // eslint-disable-next-line no-var
  var _mongoose:
    | { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null }
    | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error("❌ Missing MONGODB_URI in .env.local");
}

// --- Use cached connection if available (important for Next.js hot reload)
let cached = globalThis._mongoose || { conn: null, promise: null };

const connectDB = async () => {
  // Already connected → reuse it
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // No connection promise yet → create one
  if (!cached.promise) {
    mongoose.set("strictQuery", true);
    cached.promise = mongoose.connect(MONGODB_URI);
  }

  try {
    cached.conn = await cached.promise;
    globalThis._mongoose = cached; // save back to global
    return cached.conn;
  } catch (err) {
    cached.promise = null; // reset so future retries work
    throw err;
  }
};

export default connectDB;

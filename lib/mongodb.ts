import dns from "node:dns";
import mongoose from "mongoose";

// Node's c-ares resolver can end up pointed at 127.0.0.1 on some Windows/VPN
// setups, which refuses the SRV lookup `mongodb+srv://` needs even though the
// OS resolver works fine. Force a public resolver so the lookup succeeds.
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const uri = process.env.MONGODB_URI;
const useSeedOnly = process.env.USE_SEED_EVENTS === "true";

type MongooseCache = {
  connection: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  unavailableUntil: number;
  warned: boolean;
};

const globalForMongoose = globalThis as typeof globalThis & {
  mongooseCache?: MongooseCache;
};

const cache = globalForMongoose.mongooseCache ?? {
  connection: null,
  promise: null,
  unavailableUntil: 0,
  warned: false,
};

globalForMongoose.mongooseCache = cache;

function warnSeedFallback() {
  if (cache.warned) {
    return;
  }
  cache.warned = true;
  console.warn(
    "MongoDB unavailable — using local seed events. Add your IP in Atlas Network Access (or set USE_SEED_EVENTS=true) to silence this.",
  );
}

function formatConnectionError(error: unknown): Error {
  const message = error instanceof Error ? error.message : String(error);

  if (
    message.includes("IP that isn't whitelisted") ||
    message.includes("Could not connect to any servers in your MongoDB Atlas cluster") ||
    message.includes("MongoDB temporarily unavailable") ||
    message.includes("USE_SEED_EVENTS")
  ) {
    return new Error(
      [
        "MongoDB Atlas blocked this connection (IP not whitelisted).",
        "In Atlas → Network Access → Add IP Address, allow your current IP",
        "(or use 0.0.0.0/0 for local development), then restart `npm run dev`.",
        "Docs: https://www.mongodb.com/docs/atlas/security-whitelist/",
      ].join(" "),
    );
  }

  return error instanceof Error ? error : new Error(message);
}

/** Soft connect for read paths — never throws; falls back to seed data. */
export async function tryConnectDB(): Promise<typeof mongoose | null> {
  if (useSeedOnly) {
    return null;
  }

  try {
    return await connectDB();
  } catch {
    warnSeedFallback();
    return null;
  }
}

/** Hard connect for writes — throws if Atlas is unreachable. */
export async function connectDB(): Promise<typeof mongoose> {
  if (useSeedOnly) {
    throw formatConnectionError(new Error("USE_SEED_EVENTS=true"));
  }

  if (!uri) {
    throw new Error("Missing MONGODB_URI in environment variables.");
  }

  if (cache.connection) {
    return cache.connection;
  }

  if (Date.now() < cache.unavailableUntil) {
    throw formatConnectionError(new Error("MongoDB temporarily unavailable"));
  }

  cache.promise ??= mongoose.connect(uri, {
    bufferCommands: false,
    dbName: process.env.MONGODB_DB ?? "dev-events",
    serverSelectionTimeoutMS: 3_000,
    family: 4,
  });

  try {
    cache.connection = await cache.promise;
    cache.unavailableUntil = 0;
    return cache.connection;
  } catch (error) {
    cache.promise = null;
    cache.connection = null;
    cache.unavailableUntil = Date.now() + 60_000;
    throw formatConnectionError(error);
  }
}

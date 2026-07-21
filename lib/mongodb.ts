import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("Missing MONGODB_URI in environment variables.");
}

const mongoUri = uri;

type MongooseCache = {
  connection: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalForMongoose = globalThis as typeof globalThis & {
  mongooseCache?: MongooseCache;
};

const cache = globalForMongoose.mongooseCache ?? {
  connection: null,
  promise: null,
};

globalForMongoose.mongooseCache = cache;

export async function connectDB(): Promise<typeof mongoose> {
  if (cache.connection) {
    return cache.connection;
  }

  cache.promise ??= mongoose.connect(mongoUri, {
    bufferCommands: false,
    dbName: process.env.MONGODB_DB ?? "dev-events",
  });

  try {
    cache.connection = await cache.promise;
    return cache.connection;
  } catch (error) {
    cache.promise = null;
    throw error;
  }
}

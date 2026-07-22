import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import nextEnv from "@next/env";
import { MongoClient } from "mongodb";

const { loadEnvConfig } = nextEnv;

loadEnvConfig(process.cwd());

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("Missing MONGODB_URI in environment variables.");
}

const eventsPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "data", "events.json");
const events = JSON.parse(readFileSync(eventsPath, "utf8"));

const client = new MongoClient(uri, {
  serverSelectionTimeoutMS: 10_000,
  family: 4,
});

try {
  await client.connect();
  const collection = client
    .db(process.env.MONGODB_DB ?? "dev-events")
    .collection("events");

  await collection.createIndex({ slug: 1 }, { unique: true });
  const operations = events.map((event) => ({
    updateOne: {
      filter: { slug: event.slug },
      update: { $set: event, $setOnInsert: { createdAt: new Date() } },
      upsert: true,
    },
  }));

  const result = await collection.bulkWrite(operations);
  console.log(`Seeded ${events.length} events (${result.upsertedCount} new).`);
} finally {
  await client.close();
}

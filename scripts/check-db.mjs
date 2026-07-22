import dns from "node:dns";
import { readFileSync } from "node:fs";
import { MongoClient } from "mongodb";

// Some Windows/VPN setups leave Node's c-ares resolver pointed at 127.0.0.1,
// which refuses the SRV lookup `mongodb+srv://` needs even though the OS
// resolver works fine. Force a public resolver so the lookup succeeds.
dns.setServers(["8.8.8.8", "1.1.1.1"]);

function loadMongoUri() {
  if (process.env.MONGODB_URI) {
    return process.env.MONGODB_URI;
  }

  const env = readFileSync(new URL("../.env", import.meta.url), "utf8");
  const line = env.split(/\r?\n/).find((entry) => entry.startsWith("MONGODB_URI="));
  if (!line) {
    throw new Error("MONGODB_URI not found in .env");
  }
  return line.slice("MONGODB_URI=".length).trim();
}

const uri = loadMongoUri();
const client = new MongoClient(uri, {
  serverSelectionTimeoutMS: 10_000,
  family: 4,
});

try {
  await client.connect();
  await client.db("admin").command({ ping: 1 });
  console.log("MongoDB connection OK");
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error("MongoDB connection FAILED");
  console.error(message);
  if (message.includes("whitelist") || message.includes("Could not connect to any servers")) {
    console.error("\nFix: MongoDB Atlas → Network Access → Add IP Address");
    console.error("Use your current public IP, or 0.0.0.0/0 for local development.");
  }
  process.exitCode = 1;
} finally {
  await client.close().catch(() => {});
}

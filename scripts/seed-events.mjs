import nextEnv from "@next/env";
import { MongoClient } from "mongodb";

const { loadEnvConfig } = nextEnv;

loadEnvConfig(process.cwd());

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("Missing MONGODB_URI in environment variables.");
}

const events = [
  {
    title: "PyCon US 2026",
    image: "/images/event1.png",
    slug: "pycon-us-2026",
    location: "Long Beach Convention Center, Long Beach, CA",
    date: "May 15-17, 2026",
    time: "9:00 AM PDT",
  },
  {
    title: "React Conf",
    image: "/images/event2.png",
    slug: "react-conf",
    location: "Henderson, NV",
    date: "October 7-8, 2025",
    time: "9:00 AM PDT",
  },
  {
    title: "KubeCon + CloudNativeCon North America",
    image: "/images/event3.png",
    slug: "kubecon-cloudnativecon-north-america",
    location: "Atlanta, GA",
    date: "November 10-13, 2025",
    time: "9:00 AM EST",
  },
  {
    title: "GitHub Universe",
    image: "/images/event4.png",
    slug: "github-universe",
    location: "San Francisco, CA",
    date: "October 28-29, 2025",
    time: "9:00 AM PDT",
  },
  {
    title: "FOSDEM 2026",
    image: "/images/event5.png",
    slug: "fosdem-2026",
    location: "ULB Campus Solbosch, Brussels, Belgium",
    date: "January 31-February 1, 2026",
    time: "9:00 AM CET",
  },
  {
    title: "DeveloperWeek 2026",
    image: "/images/event6.png",
    slug: "developerweek-2026",
    location: "San Jose Convention Center, San Jose, CA",
    date: "February 18-20, 2026",
    time: "9:00 AM PST",
  },
];

const client = new MongoClient(uri);

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

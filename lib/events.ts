import type { WithId } from "mongodb";
import { getDatabase } from "@/lib/mongodb";

export interface Event {
  title: string;
  image: string;
  slug: string;
  location: string;
  date: string;
  time: string;
}

interface EventDocument extends Event {
  createdAt: Date;
}

const collectionName = "events";

function toEvent({ _id: _ignored, createdAt: _createdAt, ...event }: WithId<EventDocument>): Event {
  return event;
}

export async function getEvents(): Promise<Event[]> {
  const database = await getDatabase();
  const documents = await database
    .collection<EventDocument>(collectionName)
    .find({})
    .sort({ createdAt: -1 })
    .toArray();

  return documents.map(toEvent);
}

export async function createEvent(event: Event): Promise<Event> {
  const database = await getDatabase();
  const collection = database.collection<EventDocument>(collectionName);

  await collection.createIndex({ slug: 1 }, { unique: true });
  await collection.insertOne({ ...event, createdAt: new Date() });

  return event;
}

import { Event as EventModel, type IEvent } from "@/database";
import { connectDB } from "@/lib/mongodb";

export type Event = Pick<IEvent, "title" | "image" | "slug" | "location" | "date" | "time">;

function toEvent(document: IEvent): Event {
  const { title, image, slug, location, date, time } = document;
  return { title, image, slug, location, date, time };
}

export async function getEvents(): Promise<Event[]> {
  await connectDB();
  const documents = await EventModel.find({}).sort({ createdAt: -1 }).lean<IEvent[]>();

  return documents.map(toEvent);
}

export async function createEvent(event: Event): Promise<Event> {
  await connectDB();
  const document = await EventModel.create(event);

  return toEvent(document.toObject());
}

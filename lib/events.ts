import { Event as EventModel, type IEvent } from "@/database";
import { connectDB, tryConnectDB } from "@/lib/mongodb";
import { seedEvents } from "@/lib/seed-events";

export type Event = Pick<
  IEvent,
  | "title"
  | "image"
  | "slug"
  | "location"
  | "date"
  | "time"
  | "description"
  | "agenda"
  | "about"
  | "tags"
  | "mode"
  | "audience"
>;

function toEvent(document: IEvent): Event {
  const { title, image, slug, location, date, time, description, agenda, about, tags, mode, audience } = document;
  return { title, image, slug, location, date, time, description, agenda, about, tags, mode, audience };
}

export async function getEvents(): Promise<Event[]> {
  const db = await tryConnectDB();
  if (!db) {
    return seedEvents as Event[];
  }

  const documents = await EventModel.find({}).sort({ createdAt: -1 }).lean<IEvent[]>();
  if (documents.length > 0) {
    return documents.map(toEvent);
  }

  return seedEvents as Event[];
}

export async function getEventBySlug(slug: string): Promise<Event | null> {
  const db = await tryConnectDB();
  if (!db) {
    return (seedEvents as Event[]).find((event) => event.slug === slug) ?? null;
  }

  const document = await EventModel.findOne({ slug }).lean<IEvent | null>();
  if (document) {
    return toEvent(document);
  }

  return (seedEvents as Event[]).find((event) => event.slug === slug) ?? null;
}

export async function createEvent(event: Event): Promise<Event> {
  await connectDB();
  const document = await EventModel.create(event);

  return toEvent(document.toObject());
}

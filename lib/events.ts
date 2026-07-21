import { Event as EventModel, type IEvent } from "@/database";
import { connectDB } from "@/lib/mongodb";

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
  await connectDB();
  const documents = await EventModel.find({}).sort({ createdAt: -1 }).lean<IEvent[]>();

  return documents.map(toEvent);
}

export async function getEventBySlug(slug: string): Promise<Event | null> {
  await connectDB();
  const document = await EventModel.findOne({ slug }).lean<IEvent | null>();

  return document ? toEvent(document) : null;
}

export async function createEvent(event: Event): Promise<Event> {
  await connectDB();
  const document = await EventModel.create(event);

  return toEvent(document.toObject());
}

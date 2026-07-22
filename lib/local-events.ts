import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Event } from "@/lib/events";

const eventsPath = path.join(process.cwd(), "data", "events.json");

async function readEvents(): Promise<Event[]> {
  try {
    const raw = await readFile(eventsPath, "utf8");
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Event[]) : [];
  } catch {
    return [];
  }
}

async function writeEvents(events: Event[]) {
  await mkdir(path.dirname(eventsPath), { recursive: true });
  await writeFile(eventsPath, `${JSON.stringify(events, null, 2)}\n`, "utf8");
}

export async function createLocalEvent(event: Event) {
  const events = await readEvents();

  if (events.some((existing) => existing.slug === event.slug)) {
    return { ok: false as const, status: 409, error: "An event with this title already exists." };
  }

  events.unshift(event);
  await writeEvents(events);

  return { ok: true as const, event };
}

export async function deleteLocalEvent(slug: string) {
  const events = await readEvents();
  const index = events.findIndex((event) => event.slug === slug);

  if (index === -1) {
    return { ok: false as const, status: 404, error: "Event not found." };
  }

  events.splice(index, 1);
  await writeEvents(events);

  return { ok: true as const };
}

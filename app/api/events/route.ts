import { createEvent, getEvents, type Event } from "@/lib/events";

export const runtime = "nodejs";

const eventFields = ["title", "image", "slug", "location", "date", "time", "description"] as const;

function isEvent(value: unknown): value is Event {
  if (!value || typeof value !== "object") {
    return false;
  }

  return eventFields.every((field) => {
    const fieldValue = (value as Record<string, unknown>)[field];
    return typeof fieldValue === "string" && fieldValue.trim().length > 0;
  });
}

export async function GET() {
  try {
    const events = await getEvents();
    return Response.json(events);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load events.";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();

    if (!isEvent(body)) {
      return Response.json(
        { error: "title, image, slug, location, date, time, and description are required." },
        { status: 400 },
      );
    }

    return Response.json(await createEvent(body), { status: 201 });
  } catch (error) {
    if (typeof error === "object" && error && "code" in error && error.code === 11000) {
      return Response.json({ error: "An event with this slug already exists." }, { status: 409 });
    }

    return Response.json({ error: "Unable to create event." }, { status: 500 });
  }
}

 import { auth } from "@/auth";
import { Event } from "@/database";
import { createLocalEvent } from "@/lib/local-events";
import { tryConnectDB } from "@/lib/mongodb";

export const runtime = "nodejs";

function toSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function stringList(value: unknown) {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
  }

  if (typeof value === "string") {
    return value.split(/[,\n]/).map((item) => item.trim()).filter(Boolean);
  }

  return [];
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session) {
    return Response.json({ error: "Unauthorised." }, { status: 401 });
  }

  try {
    const body: unknown = await request.json();

    if (!body || typeof body !== "object") {
      return Response.json({ error: "Invalid event data." }, { status: 400 });
    }

    const data = body as Record<string, unknown>;
    const requiredFields = ["title", "location", "date", "time", "image", "description"] as const;

    if (requiredFields.some((field) => typeof data[field] !== "string" || !data[field].trim())) {
      return Response.json({ error: "Please complete all required event fields." }, { status: 400 });
    }

    const title = data.title as string;
    const image = (data.image as string).trim();

    if (!image.startsWith("/") && !image.startsWith("https://")) {
      return Response.json(
        { error: "Upload an event image before saving." },
        { status: 400 },
      );
    }

    const eventData = {
      title: title.trim(),
      slug: toSlug(title),
      location: (data.location as string).trim(),
      date: (data.date as string).trim(),
      time: (data.time as string).trim(),
      image,
      description: (data.description as string).trim(),
      agenda: stringList(data.agenda),
      about: typeof data.about === "string" ? data.about.trim() : "",
      tags: stringList(data.tags),
      mode: typeof data.mode === "string" ? data.mode.trim() : "In-person",
      audience:
        typeof data.audience === "string" && data.audience.trim()
          ? data.audience.trim()
          : "Developers and technology professionals",
    };

    const db = await tryConnectDB();

    if (!db) {
      const local = await createLocalEvent(eventData);
      if (!local.ok) {
        return Response.json({ error: local.error }, { status: local.status });
      }
      return Response.json(
        { event: { slug: local.event.slug, title: local.event.title } },
        { status: 201 },
      );
    }

    const event = await Event.create(eventData);

    return Response.json({ event: { slug: event.slug, title: event.title } }, { status: 201 });
  } catch (error) {
    if (typeof error === "object" && error && "code" in error && error.code === 11000) {
      return Response.json({ error: "An event with this title already exists." }, { status: 409 });
    }

    return Response.json({ error: "Unable to create event." }, { status: 500 });
  }
}

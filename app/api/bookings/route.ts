import { Booking, Event } from "@/database";
import { createLocalBooking } from "@/lib/local-bookings";
import { tryConnectDB } from "@/lib/mongodb";

export const runtime = "nodejs";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();

    if (!body || typeof body !== "object") {
      return Response.json({ error: "Invalid booking request." }, { status: 400 });
    }

    const { eventSlug, email } = body as Record<string, unknown>;

    if (
      typeof eventSlug !== "string" ||
      typeof email !== "string" ||
      !emailPattern.test(email.trim())
    ) {
      return Response.json({ error: "Enter a valid email address." }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const db = await tryConnectDB();

    if (!db) {
      const local = await createLocalBooking(eventSlug, normalizedEmail);
      if (!local.ok) {
        return Response.json({ error: local.error }, { status: local.status });
      }
      return Response.json({ message: local.message }, { status: 201 });
    }

    const event = await Event.findOne({ slug: eventSlug }).select("_id");

    if (!event) {
      return Response.json({ error: "Event not found." }, { status: 404 });
    }

    await Booking.create({
      eventId: event._id,
      name: normalizedEmail.split("@")[0] || "guest",
      email: normalizedEmail,
    });

    return Response.json({ message: "Thank you for signing up." }, { status: 201 });
  } catch (error) {
    if (typeof error === "object" && error && "code" in error && error.code === 11000) {
      return Response.json({ error: "This email is already registered for this event." }, { status: 409 });
    }

    const message = error instanceof Error ? error.message : "Unable to create booking.";
    return Response.json({ error: message }, { status: 500 });
  }
}

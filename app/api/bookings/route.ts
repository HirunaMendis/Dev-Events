import { Booking, Event } from "@/database";
import { connectDB } from "@/lib/mongodb";

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

    await connectDB();
    const event = await Event.findOne({ slug: eventSlug }).select("_id");

    if (!event) {
      return Response.json({ error: "Event not found." }, { status: 404 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    await Booking.create({
      eventId: event._id,
      name: normalizedEmail.split("@")[0],
      email: normalizedEmail,
    });

    return Response.json({ message: "Thank you for signing up." }, { status: 201 });
  } catch (error) {
    if (typeof error === "object" && error && "code" in error && error.code === 11000) {
      return Response.json({ error: "This email is already registered for this event." }, { status: 409 });
    }

    return Response.json({ error: "Unable to create booking." }, { status: 500 });
  }
}

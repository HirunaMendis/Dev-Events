import { auth } from "@/auth";
import { Booking, Event } from "@/database";
import { countLocalBookings } from "@/lib/local-bookings";
import { deleteLocalEvent } from "@/lib/local-events";
import { tryConnectDB } from "@/lib/mongodb";

export const runtime = "nodejs";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const session = await auth();
  if (!session) {
    return Response.json({ error: "Unauthorised." }, { status: 401 });
  }

  const { slug } = await params;

  try {
    const db = await tryConnectDB();

    if (!db) {
      const bookingCount = await countLocalBookings(slug);
      if (bookingCount > 0) {
        return Response.json(
          { error: "This event has bookings and cannot be deleted." },
          { status: 409 },
        );
      }

      const local = await deleteLocalEvent(slug);
      if (!local.ok) {
        return Response.json({ error: local.error }, { status: local.status });
      }

      return Response.json({ message: "Event deleted." });
    }

    const event = await Event.findOne({ slug }).select("_id");

    if (!event) {
      return Response.json({ error: "Event not found." }, { status: 404 });
    }

    const bookingCount = await Booking.countDocuments({ eventId: event._id });

    if (bookingCount > 0) {
      return Response.json(
        { error: "This event has bookings and cannot be deleted." },
        { status: 409 },
      );
    }

    await Event.deleteOne({ _id: event._id });
    return Response.json({ message: "Event deleted." });
  } catch {
    return Response.json({ error: "Unable to delete event." }, { status: 500 });
  }
}

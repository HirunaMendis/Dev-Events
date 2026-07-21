import { Booking, Event } from "@/database";
import { connectDB } from "@/lib/mongodb";

export const runtime = "nodejs";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  await connectDB();

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
}

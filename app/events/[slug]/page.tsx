import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import EventCard from "@/components/EventCard";
import BookingForm from "@/components/BookingForm";
import { getEventBySlug } from "@/lib/events";
import { getSimilarEventsBySlug } from "@/lib/actions/event.actions";

export const runtime = "nodejs";

export default async function EventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await connection();
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  const similarEvents = await getSimilarEventsBySlug(event.slug);

  return (
    <section id="event">
      <div className="header">
        <h1>{event.title}</h1>
        <p>{event.description}</p>
      </div>

      <div className="details">
        <div className="content">
          <Image
            src={event.image}
            alt={event.title}
            width={810}
            height={457}
            className="banner"
            priority
          />

          <div className="flex-col-gap-2">
            <h2>Overview</h2>
            <p>{event.description}</p>
          </div>

          <div className="flex-col-gap-2">
            <h2>Event Details</h2>
            <p>📅 Date: {event.date}</p>
            <p>🕒 Time: {event.time}</p>
            <p>📍 Location: {event.location}</p>
            <p>💻 Mode: {event.mode}</p>
            <p>👥 Audience: {event.audience}</p>
          </div>

          <div className="agenda">
            <h2>Agenda</h2>
            <ul>
              {event.agenda.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>

          <div className="flex-col-gap-2">
            <h2>About the Organizer</h2>
            <p>{event.about}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {event.tags.map((tag) => <span className="pill" key={tag}>{tag}</span>)}
          </div>
        </div>

        <aside className="booking">
          <div className="signup-card">
            <BookingForm eventSlug={event.slug} />
          </div>
        </aside>
      </div>

      <div className="mt-20 space-y-7">
        <h3>Similar events</h3>
        <ul className="events">
          {similarEvents.map((similarEvent) => (
            <li key={similarEvent.slug}>
              <EventCard {...similarEvent} />
            </li>
          ))}
        </ul>
      </div>

      <Link href="/" className="text-light-100 mt-12 inline-block text-sm hover:text-primary">
        &larr; Back to all events
      </Link>
    </section>
  );
}

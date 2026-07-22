import ExploreBtn from "@/components/ExploreBtn";
import EventCard from "@/components/EventCard";
import { getEvents } from "@/lib/events";
import { connection } from "next/server";

const Page = async () => {
  await connection();
  const events = await getEvents();

  return (
    <section>
      <h1 className="text-center">
        The Hub for Every Dev
        <br /> Event You Can&apos;t Miss.
      </h1>
      <p className="text-center mt-5">Hackathons, Meetups and Conferences, All in one Place</p>

      <ExploreBtn />

      <div id="events" className="mt-20 scroll-mt-24 space-y-7">
        <h3>Featured Events</h3>

        <ul className="events">
          {events.map((event, index) => (
            <li key={event.slug}>
              <EventCard {...event} priority={index === 0} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default Page;

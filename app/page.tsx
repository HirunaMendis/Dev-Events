import React from 'react'
import ExploreBtn from "@/components/ExploreBtn";
import EventCard from "@/components/EventCard";
import { events as fallbackEvents } from "@/lib/constants";
import { getEvents } from "@/lib/events";
import { connection } from "next/server";


const Page = async () => {
    await connection();
    let events = fallbackEvents;

    try {
        const databaseEvents = await getEvents();
        if (databaseEvents.length > 0) {
            events = databaseEvents;
        }
    } catch {
        // The initial UI remains available before MongoDB has been seeded.
    }

    return (
        <section>
            <h1 className="text-center">The Hub for Every Dev<br/> Event You Can't Miss.</h1>
            <p className="text-center mt-5"> Hackathons, Meetups and Conferences, All in one Place </p>

            <ExploreBtn/>

            <div id="events" className="mt-20 scroll-mt-24 space-y-7">
                <h3>Featured Events</h3>

                <ul className="events">
                    {events.map((event) => (
                        <li key={event.title}>
                            <EventCard {...event} />

                        </li>
                    ))}
                </ul>


            </div>
        </section>
    )
}
export default Page

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Event } from "@/lib/events";

interface AdminEventTableProps {
  events: Event[];
}

export default function AdminEventTable({ events: initialEvents }: AdminEventTableProps) {
  const [events, setEvents] = useState(initialEvents);
  const [message, setMessage] = useState("");
  const router = useRouter();

  async function deleteEvent(slug: string) {
    if (!window.confirm("Delete this event? This cannot be undone.")) {
      return;
    }

    const response = await fetch(`/api/admin/events/${slug}`, { method: "DELETE" });
    const result = (await response.json()) as { error?: string };

    if (!response.ok) {
      setMessage(result.error ?? "Unable to delete event.");
      return;
    }

    setEvents((currentEvents) => currentEvents.filter((event) => event.slug !== slug));
    setMessage("Event deleted.");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {message && <p className="text-sm text-primary" role="status">{message}</p>}
      <div className="overflow-x-auto rounded-lg border border-dark-200 bg-dark-100/80">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-dark-200 text-light-100">
            <tr>
              <th className="px-4 py-3 font-medium">Event</th>
              <th className="px-4 py-3 font-medium">Location</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Time</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr className="border-t border-dark-200" key={event.slug}>
                <td className="px-4 py-3 font-medium">{event.title}</td>
                <td className="px-4 py-3 text-light-200">{event.location}</td>
                <td className="px-4 py-3 text-light-200">{event.date}</td>
                <td className="px-4 py-3 text-light-200">{event.time}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-3">
                    <Link href={`/events/${event.slug}`} className="text-primary hover:underline">View</Link>
                    <button className="text-red-300 hover:underline" onClick={() => deleteEvent(event.slug)} type="button">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

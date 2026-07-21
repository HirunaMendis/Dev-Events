import Link from "next/link";
import { connection } from "next/server";
import AdminEventTable from "@/components/AdminEventTable";
import { getEvents } from "@/lib/events";

export const runtime = "nodejs";

export default async function AdminPage() {
  await connection();
  const events = await getEvents();

  return (
    <section className="w-full">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-4xl">Event Management</h1>
        <Link className="bg-primary hover:bg-primary/90 rounded-[6px] px-5 py-2.5 font-semibold text-black" href="/admin/events/new">
          Add New Event
        </Link>
      </div>
      <AdminEventTable events={events} />
    </section>
  );
}

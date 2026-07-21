import Link from "next/link";
import AdminEventForm from "@/components/AdminEventForm";

export default function NewEventPage() {
  return (
    <section className="w-full">
      <Link className="text-light-100 mb-8 inline-block text-sm hover:text-primary" href="/admin">
        &larr; Back to event management
      </Link>
      <h1 className="mb-8 text-center text-4xl">Create an Event</h1>
      <AdminEventForm />
    </section>
  );
}

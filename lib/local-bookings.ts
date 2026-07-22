import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { seedEvents } from "@/lib/seed-events";

export type LocalBooking = {
  eventSlug: string;
  name: string;
  email: string;
  createdAt: string;
};

const bookingsPath = path.join(process.cwd(), "data", "bookings.json");

async function readBookings(): Promise<LocalBooking[]> {
  try {
    const raw = await readFile(bookingsPath, "utf8");
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as LocalBooking[]) : [];
  } catch {
    return [];
  }
}

async function writeBookings(bookings: LocalBooking[]) {
  await mkdir(path.dirname(bookingsPath), { recursive: true });
  await writeFile(bookingsPath, `${JSON.stringify(bookings, null, 2)}\n`, "utf8");
}

export function localEventExists(eventSlug: string) {
  return seedEvents.some((event) => event.slug === eventSlug);
}

export async function countLocalBookings(eventSlug: string) {
  const bookings = await readBookings();
  return bookings.filter((booking) => booking.eventSlug === eventSlug).length;
}

export async function createLocalBooking(eventSlug: string, email: string) {
  if (!localEventExists(eventSlug)) {
    return { ok: false as const, status: 404, error: "Event not found." };
  }

  const normalizedEmail = email.trim().toLowerCase();
  const bookings = await readBookings();
  const alreadyBooked = bookings.some(
    (booking) => booking.eventSlug === eventSlug && booking.email === normalizedEmail,
  );

  if (alreadyBooked) {
    return {
      ok: false as const,
      status: 409,
      error: "This email is already registered for this event.",
    };
  }

  bookings.push({
    eventSlug,
    name: normalizedEmail.split("@")[0] || "guest",
    email: normalizedEmail,
    createdAt: new Date().toISOString(),
  });

  await writeBookings(bookings);

  return { ok: true as const, message: "Thank you for signing up." };
}

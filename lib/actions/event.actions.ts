"use server";

import { getEventBySlug, getEvents, type Event } from "@/lib/events";

function sharedTagCount(event: Event, tags: string[]) {
  return event.tags.filter((tag) => tags.includes(tag)).length;
}

export async function getSimilarEventsBySlug(slug: string, limit = 3): Promise<Event[]> {
  const event = await getEventBySlug(slug);

  if (!event) {
    return [];
  }

  const candidates = (await getEvents()).filter((candidate) => candidate.slug !== event.slug);
  const similarEvents = candidates
    .filter((candidate) => sharedTagCount(candidate, event.tags) > 0)
    .sort((first, second) => sharedTagCount(second, event.tags) - sharedTagCount(first, event.tags));

  const remainingEvents = candidates.filter(
    (candidate) => !similarEvents.some((similarEvent) => similarEvent.slug === candidate.slug),
  );

  return [...similarEvents, ...remainingEvents].slice(0, limit);
}

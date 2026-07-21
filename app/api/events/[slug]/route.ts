import { getEventBySlug } from "@/lib/events";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) {
    return Response.json({ error: "Event not found." }, { status: 404 });
  }

  return Response.json(event);
}

import { FunctionCallingConfigMode, GoogleGenAI, type Content, type FunctionDeclaration } from "@google/genai";
import { getEventBySlug, getEvents } from "@/lib/events";

export const runtime = "nodejs";

let ai: GoogleGenAI | null = null;

function getClient() {
  ai ??= new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  return ai;
}

const listEventsDeclaration: FunctionDeclaration = {
  name: "list_events",
  description:
    "List all upcoming DevEvent events with their slug, title, date, time, location, mode, and tags. Use this to answer questions about what events exist, are happening soon, or match a topic/tag.",
  parametersJsonSchema: { type: "object", properties: {} },
};

const getEventDetailsDeclaration: FunctionDeclaration = {
  name: "get_event_details",
  description:
    "Get full details for one event by its slug, including description, agenda, audience, and organizer info. Use this after list_events when the user asks about a specific event.",
  parametersJsonSchema: {
    type: "object",
    properties: {
      slug: { type: "string", description: "The event's slug, from list_events." },
    },
    required: ["slug"],
  },
};

async function callTool(name: string, args: Record<string, unknown>) {
  if (name === "list_events") {
    const events = await getEvents();
    return events.map(({ title, slug, date, time, location, mode, tags }) => ({
      title,
      slug,
      date,
      time,
      location,
      mode,
      tags,
    }));
  }

  if (name === "get_event_details") {
    const slug = typeof args.slug === "string" ? args.slug : "";
    const event = await getEventBySlug(slug);
    return event ?? { error: "Event not found." };
  }

  return { error: "Unknown tool." };
}

const systemInstruction =
  "You are the DevEvent site assistant. Answer questions about the tech events listed on this site — dates, locations, topics, and details. Use the list_events and get_event_details tools to look up real data; never invent event details. " +
  "Answer only the user's current question — do not restate, summarize, or reference events from earlier turns unless the user asks about them again. " +
  "If a filter (a month, topic, location, etc.) matches no events, say plainly that there are none — do not substitute or list events that don't match. " +
  "Keep answers concise and friendly. If asked about anything unrelated to the site's events, politely redirect.";

export async function POST(request: Request) {
  if (!process.env.GEMINI_API_KEY) {
    return Response.json({ error: "Chat is not configured." }, { status: 503 });
  }

  try {
    const body: unknown = await request.json();
    const { message, history } = (body ?? {}) as { message?: string; history?: Content[] };

    if (typeof message !== "string" || !message.trim()) {
      return Response.json({ error: "Message is required." }, { status: 400 });
    }

    // Only clean text turns persist across requests — tool calls/results below are
    // resolved fresh each turn and never carried forward, so stale event dumps from
    // earlier questions can't bleed into unrelated later answers.
    const priorTurns: Content[] = Array.isArray(history) ? history : [];
    const workingContents: Content[] = [...priorTurns, { role: "user", parts: [{ text: message }] }];

    const tools = [{ functionDeclarations: [listEventsDeclaration, getEventDetailsDeclaration] }];

    for (let turn = 0; turn < 5; turn++) {
      const response = await getClient().models.generateContent({
        model: "gemini-flash-latest",
        contents: workingContents,
        config: {
          systemInstruction,
          tools,
          toolConfig: { functionCallingConfig: { mode: FunctionCallingConfigMode.AUTO } },
        },
      });

      const calls = response.functionCalls ?? [];

      if (calls.length === 0) {
        const replyText = response.text ?? "";
        const updatedHistory: Content[] = [
          ...priorTurns,
          { role: "user", parts: [{ text: message }] },
          { role: "model", parts: [{ text: replyText }] },
        ];
        return Response.json({ reply: replyText, history: updatedHistory });
      }

      const modelContent = response.candidates?.[0]?.content;
      workingContents.push(
        modelContent ?? {
          role: "model",
          parts: calls.map((call) => ({ functionCall: { name: call.name, args: call.args } })),
        },
      );

      const results = await Promise.all(
        calls.map(async (call) => ({
          functionResponse: {
            name: call.name ?? "",
            response: { result: await callTool(call.name ?? "", call.args ?? {}) },
          },
        })),
      );

      workingContents.push({ role: "user", parts: results });
    }

    return Response.json({ error: "Unable to complete the request." }, { status: 500 });
  } catch (error) {
    console.error("Chat request failed:", error);
    return Response.json({ error: "Unable to reach the chat assistant." }, { status: 500 });
  }
}

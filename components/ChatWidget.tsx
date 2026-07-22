"use client";

import { MessageCircle, X } from "lucide-react";
import { FormEvent, useRef, useState } from "react";

type ChatMessage = { role: "user" | "model"; text: string };

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const historyRef = useRef<unknown[]>([]);

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = input.trim();
    if (!text || isSending) return;

    setMessages((current) => [...current, { role: "user", text }]);
    setInput("");
    setIsSending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history: historyRef.current }),
      });
      const result = (await response.json()) as { reply?: string; history?: unknown[]; error?: string };

      if (!response.ok || !result.reply) {
        setMessages((current) => [
          ...current,
          { role: "model", text: result.error ?? "Sorry, I couldn't answer that." },
        ]);
        return;
      }

      historyRef.current = result.history ?? historyRef.current;
      setMessages((current) => [...current, { role: "model", text: result.reply as string }]);
    } catch {
      setMessages((current) => [...current, { role: "model", text: "Sorry, something went wrong." }]);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="bg-dark-100 border-dark-200 card-shadow flex h-[28rem] w-80 flex-col overflow-hidden rounded-[10px] border">
          <div className="border-dark-200 border-b px-4 py-3">
            <p className="font-semibold text-light-100">DevEvent Assistant</p>
            <p className="text-xs text-light-200">Ask about events, dates, or locations</p>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {messages.length === 0 && (
              <p className="text-sm text-light-200">
                Try: &ldquo;What events are happening in October?&rdquo;
              </p>
            )}
            {messages.map((entry, index) => (
              <div
                key={index}
                className={
                  entry.role === "user"
                    ? "ml-auto max-w-[85%] rounded-[8px] bg-primary px-3 py-2 text-sm text-black"
                    : "mr-auto max-w-[85%] rounded-[8px] bg-dark-200 px-3 py-2 text-sm text-light-100"
                }
              >
                {entry.text}
              </div>
            ))}
            {isSending && <div className="mr-auto max-w-[85%] rounded-[8px] bg-dark-200 px-3 py-2 text-sm text-light-200">Thinking…</div>}
          </div>

          <form className="border-dark-200 flex gap-2 border-t p-3" onSubmit={sendMessage}>
            <input
              className="bg-dark-200 flex-1 rounded-[6px] px-3 py-2 text-sm text-light-100 outline-none"
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask a question..."
              value={input}
            />
            <button
              className="bg-primary hover:bg-primary/90 cursor-pointer rounded-[6px] px-3 py-2 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSending || !input.trim()}
              type="submit"
            >
              Send
            </button>
          </form>
        </div>
      )}

      <button
        className="bg-primary hover:bg-primary/90 card-shadow flex h-14 w-14 cursor-pointer items-center justify-center rounded-full text-black"
        onClick={() => setOpen((current) => !current)}
        type="button"
        aria-label={open ? "Close chat" : "Open chat"}
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </div>
  );
}

"use client";

import { FormEvent, useState } from "react";

interface BookingFormProps {
  eventSlug: string;
}

export default function BookingForm({ eventSlug }: BookingFormProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  async function submitBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventSlug, email }),
      });
      const result = (await response.json()) as { message?: string; error?: string };

      if (!response.ok) {
        setMessage(result.error ?? "Unable to complete your booking.");
        return;
      }

      setIsComplete(true);
      setMessage(result.message ?? "Thank you for signing up.");
    } catch {
      setMessage("Unable to complete your booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isComplete) {
    return (
      <div id="book-event" role="status">
        <h2>Thank you for signing up</h2>
        <p>{message}</p>
      </div>
    );
  }

  return (
    <div id="book-event">
      <h2>Book Your Spot</h2>
      <form onSubmit={submitBooking}>
        <div>
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter your email"
            required
          />
        </div>
        {message && <p role="alert">{message}</p>}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Signing up..." : "Submit"}
        </button>
      </form>
    </div>
  );
}

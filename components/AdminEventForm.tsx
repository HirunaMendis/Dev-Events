"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminEventForm() {
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  async function createEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setIsSaving(true);
    setMessage("");

    const imageFile = form.get("imageFile");

    if (!(imageFile instanceof File) || imageFile.size === 0) {
      setIsSaving(false);
      setMessage("Choose an event image before saving.");
      return;
    }

    const uploadData = new FormData();
    uploadData.set("image", imageFile);
    const uploadResponse = await fetch("/api/admin/uploads", {
      method: "POST",
      body: uploadData,
    });
    const uploadResult = (await uploadResponse.json()) as { error?: string; path?: string };

    if (!uploadResponse.ok || !uploadResult.path) {
      setIsSaving(false);
      setMessage(uploadResult.error ?? "Unable to upload event image.");
      return;
    }

    const payload = Object.fromEntries(form.entries()) as Record<string, FormDataEntryValue>;
    delete payload.imageFile;
    payload.image = uploadResult.path;
    const response = await fetch("/api/admin/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = (await response.json()) as { error?: string; event?: { slug: string } };

    setIsSaving(false);

    if (!response.ok) {
      setMessage(result.error ?? "Unable to save event.");
      return;
    }

    router.push(`/events/${result.event?.slug}`);
    router.refresh();
  }

  return (
    <form className="bg-dark-100 border-dark-200 card-shadow mx-auto flex w-full max-w-xl flex-col gap-5 rounded-[10px] border p-6" onSubmit={createEvent}>
      <Field label="Event Title" name="title" placeholder="Enter event title" required />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Event Date" name="date" type="date" required />
        <Field label="Event Time" name="time" type="time" required />
      </div>
      <Field label="Event Location" name="location" placeholder="Venue or online link" required />
      <label className="flex flex-col gap-2 text-sm text-light-100">
        Event Type
        <select className="bg-dark-200 rounded-[6px] px-5 py-2.5" defaultValue="In-person" name="mode">
          <option>In-person</option>
          <option>Hybrid</option>
          <option>Online</option>
        </select>
      </label>
      <label className="flex flex-col gap-2 text-sm text-light-100">
        Event Image / Banner
        <input className="bg-dark-200 rounded-[6px] px-5 py-2.5 file:mr-4 file:rounded file:border-0 file:bg-primary file:px-3 file:py-1.5 file:font-semibold file:text-black" name="imageFile" accept="image/jpeg,image/png,image/webp" required type="file" />
        <span className="text-xs text-light-200">JPG, PNG, or WebP up to 5 MB.</span>
      </label>
      <Field label="Tags" name="tags" placeholder="AI, React, Open Source" />
      <Field label="Audience" name="audience" placeholder="Developers, designers, and technology leaders" />
      <TextArea label="Event Description" name="description" placeholder="Briefly describe the event" required />
      <TextArea label="Agenda" name="agenda" placeholder="One agenda item per line" />
      <TextArea label="About the Organizer" name="about" placeholder="Tell attendees who organizes this event" />
      {message && <p className="text-sm text-red-300" role="alert">{message}</p>}
      <button className="bg-primary hover:bg-primary/90 cursor-pointer rounded-[6px] px-4 py-2.5 text-lg font-semibold text-black disabled:cursor-not-allowed disabled:opacity-60" disabled={isSaving} type="submit">
        {isSaving ? "Saving..." : "Save Event"}
      </button>
    </form>
  );
}

function Field({ label, name, placeholder, required, type = "text" }: { label: string; name: string; placeholder?: string; required?: boolean; type?: string }) {
  return (
    <label className="flex flex-col gap-2 text-sm text-light-100">
      {label}
      <input className="bg-dark-200 rounded-[6px] px-5 py-2.5" name={name} placeholder={placeholder} required={required} type={type} />
    </label>
  );
}

function TextArea({ label, name, placeholder, required }: { label: string; name: string; placeholder?: string; required?: boolean }) {
  return (
    <label className="flex flex-col gap-2 text-sm text-light-100">
      {label}
      <textarea className="bg-dark-200 min-h-28 rounded-[6px] px-5 py-2.5" name={name} placeholder={placeholder} required={required} />
    </label>
  );
}

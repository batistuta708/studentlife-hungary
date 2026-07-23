"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { contactApi } from "@/lib/api/contact";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus("idle");
    try {
      await contactApi.submit({ name, email, message });
      setStatus("success");
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      setStatus("error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-4">
        {status === "success" && (
          <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
            Message sent — we'll get back to you soon.
          </p>
        )}
        {status === "error" && (
          <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600 dark:bg-rose-900/30 dark:text-rose-300">
            Something went wrong. Please try again.
          </p>
        )}
        <div>
          <label htmlFor="contact-name" className="text-sm font-medium">
            Name
          </label>
          <input id="contact-name" className="input mt-1" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="contact-email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="contact-email"
            type="email"
            className="input mt-1"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="contact-message" className="text-sm font-medium">
            Message
          </label>
          <textarea
            id="contact-message"
            className="input mt-1 min-h-[140px]"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
        </div>
        <Button type="submit" isLoading={submitting}>
          Send message
        </Button>
      </form>
    </Card>
  );
}

import type { Metadata } from "next";
import { ContactForm } from "@/components/shared/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with the StudentLife Hungary team.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold">Contact Us</h1>
      <p className="mt-2 text-slate-500 dark:text-slate-400">
        Questions, feedback, or a partnership idea — we'd like to hear from you.
      </p>
      <div className="mt-8">
        <ContactForm />
      </div>
    </div>
  );
}

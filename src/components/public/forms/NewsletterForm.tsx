"use client";

import { useState } from "react";
import { ArrowRight } from "@phosphor-icons/react";
import { subscribeNewsletter } from "@/lib/newsletter/actions";

type NewsletterFormProps = {
  placeholder: string;
};

export default function NewsletterForm({ placeholder }: NewsletterFormProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    const formData = new FormData(e.currentTarget);
    const result = await subscribeNewsletter(formData);

    if (result.success) {
      setStatus("success");
      setMessage(result.message);
      (e.target as HTMLFormElement).reset();
    } else {
      setStatus("error");
      setMessage(result.message);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <form onSubmit={handleSubmit} className="p-1 rounded-full bg-gray-50 border border-gray-200 flex items-center max-w-sm">
        <input 
          type="email" 
          name="email"
          placeholder={placeholder}
          required
          className="bg-transparent border-none focus:ring-0 text-sm px-4 w-full text-gray-800 placeholder:text-gray-400 outline-none"
        />
        <button 
          type="submit"
          disabled={status === "loading"}
          aria-label="Subscribe newsletter"
          className="bg-[#083b8a] hover:bg-[#072d69] text-white rounded-full p-2.5 transition-colors disabled:opacity-50"
        >
          <ArrowRight weight="bold" />
        </button>
      </form>
      {message && (
        <p className={`text-xs px-2 ${status === "success" ? "text-green-600" : "text-red-500"}`}>
          {message}
        </p>
      )}
    </div>
  );
}

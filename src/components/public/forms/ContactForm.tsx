"use client";
import type { Dictionary } from "@/types/dictionary";

import { useState, useTransition } from "react";
import { submitInquiry } from "@/app/[locale]/contact/actions";
import { PaperPlaneRight, CheckCircle, WarningCircle } from "@phosphor-icons/react";

type ContactFormProps = {
  dict: Dictionary;
};

export default function ContactForm({ dict }: ContactFormProps) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    startTransition(async () => {
      const result = await submitInquiry(formData);
      if (result.success) {
        setStatus("success");
        setErrorMessage("");
        form.reset();
      } else {
        setStatus("error");
        if (result.errorCode === "rate_limit") {
          setErrorMessage(dict.contact.rateLimitError);
        } else if (result.errorCode === "validation") {
          setErrorMessage(result.error || dict.contact.validationError);
        } else {
          setErrorMessage(dict.contact.errorMessage);
        }
      }
    });
  };

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-white p-12 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
          <CheckCircle className="size-8" weight="fill" />
        </div>
        <h3 className="mb-3 text-2xl font-semibold text-[#0A2463]" style={{ fontFamily: "'Outfit', system-ui, sans-serif" }}>Pesan Terkirim!</h3>
        <p className="mb-8 text-[15px] leading-relaxed text-slate-500">{dict.contact.successMessage}</p>
        <button 
          onClick={() => setStatus("idle")}
          className="rounded-md border border-slate-200 bg-white px-6 py-2.5 text-[13px] font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-[#0A2463]"
        >
          Kirim Pesan Lain
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] md:p-10">
      <h3 className="mb-8 text-2xl font-semibold text-[#0A2463]" style={{ fontFamily: "'Outfit', system-ui, sans-serif" }}>{dict.contact.formTitle}</h3>
      
      {status === "error" && (
        <div className="mb-6 flex items-center gap-3 rounded-lg bg-red-50 p-4 text-[13px] font-medium text-red-700" role="alert">
          <WarningCircle className="size-5 shrink-0" weight="fill" />
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0"
        />

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="fullName" className="text-[13px] font-medium text-slate-700">{dict.contact.fullName} <span className="text-red-500">*</span></label>
            <input type="text" id="fullName" name="fullName" required className="w-full rounded-md border border-slate-200 bg-slate-50/50 px-4 py-3 text-[14px] text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-[#0A2463] focus:bg-white focus:ring-4 focus:ring-[#0A2463]/10" placeholder="John Doe" />
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-[13px] font-medium text-slate-700">{dict.contact.email} <span className="text-red-500">*</span></label>
            <input type="email" id="email" name="email" required className="w-full rounded-md border border-slate-200 bg-slate-50/50 px-4 py-3 text-[14px] text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-[#0A2463] focus:bg-white focus:ring-4 focus:ring-[#0A2463]/10" placeholder="john@example.com" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="phone" className="text-[13px] font-medium text-slate-700">{dict.contact.phone}</label>
            <input type="tel" id="phone" name="phone" className="w-full rounded-md border border-slate-200 bg-slate-50/50 px-4 py-3 text-[14px] text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-[#0A2463] focus:bg-white focus:ring-4 focus:ring-[#0A2463]/10" placeholder="+62 812 3456 7890" />
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label htmlFor="companyName" className="text-[13px] font-medium text-slate-700">{dict.contact.companyName}</label>
            <input type="text" id="companyName" name="companyName" className="w-full rounded-md border border-slate-200 bg-slate-50/50 px-4 py-3 text-[14px] text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-[#0A2463] focus:bg-white focus:ring-4 focus:ring-[#0A2463]/10" placeholder="PT Global Maritime" />
          </div>
        </div>
        
        <div className="flex flex-col gap-1.5">
          <label htmlFor="subject" className="text-[13px] font-medium text-slate-700">{dict.contact.subject} <span className="text-red-500">*</span></label>
          <input type="text" id="subject" name="subject" required className="w-full rounded-md border border-slate-200 bg-slate-50/50 px-4 py-3 text-[14px] text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-[#0A2463] focus:bg-white focus:ring-4 focus:ring-[#0A2463]/10" placeholder="Inquiry: Ship Repair Services" />
        </div>
        
        <div className="flex flex-col gap-1.5">
          <label htmlFor="message" className="text-[13px] font-medium text-slate-700">{dict.contact.message} <span className="text-red-500">*</span></label>
          <textarea id="message" name="message" required rows={5} className="w-full resize-y rounded-md border border-slate-200 bg-slate-50/50 px-4 py-3 text-[14px] text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-[#0A2463] focus:bg-white focus:ring-4 focus:ring-[#0A2463]/10" placeholder="Tell us about your requirements..."></textarea>
        </div>
        
        <button type="submit" disabled={isPending} className="group mt-2 inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#0A2463] px-6 py-3.5 text-[12px] font-semibold uppercase tracking-[0.1em] text-white transition-all duration-300 hover:bg-[#0D2F7A] hover:shadow-[0_8px_20px_rgba(10,36,99,0.16)] active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none">
          <span>{isPending ? "Mengirim..." : dict.common.sendMessage}</span>
          <PaperPlaneRight className="size-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" weight="fill" />
        </button>
      </form>
    </div>
  );
}

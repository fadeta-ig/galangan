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
      <div className="premium-shell">
        <div className="premium-core p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center text-green-500 mb-6">
            <CheckCircle className="w-8 h-8" weight="fill" />
          </div>
          <h3 className="text-2xl font-semibold text-navy mb-4">Pesan Terkirim!</h3>
          <p className="text-gray-500 mb-8">{dict.contact.successMessage}</p>
          <button 
            onClick={() => setStatus("idle")}
            className="btn-secondary"
          >
            Kirim Pesan Lain
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="premium-shell">
      <div className="premium-core p-7 md:p-10">
        <h3 className="mb-8 text-2xl font-semibold text-navy">{dict.contact.formTitle}</h3>
        
        {status === "error" && (
          <div className="mb-6 flex items-center gap-3 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-700" role="alert">
            <WarningCircle className="w-5 h-5 shrink-0" weight="fill" />
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Honeypot — hidden from users, bots may fill */}
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="absolute opacity-0 pointer-events-none h-0 w-0 overflow-hidden"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group">
              <label htmlFor="fullName" className="form-label">{dict.contact.fullName} <span className="text-red-500">*</span></label>
              <input type="text" id="fullName" name="fullName" required className="form-input" placeholder="John Doe" />
            </div>
            
            <div className="form-group">
              <label htmlFor="email" className="form-label">{dict.contact.email} <span className="text-red-500">*</span></label>
              <input type="email" id="email" name="email" required className="form-input" placeholder="john@example.com" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group">
              <label htmlFor="phone" className="form-label">{dict.contact.phone}</label>
              <input type="tel" id="phone" name="phone" className="form-input" placeholder="+62 812 3456 7890" />
            </div>
            
            <div className="form-group">
              <label htmlFor="companyName" className="form-label">{dict.contact.companyName}</label>
              <input type="text" id="companyName" name="companyName" className="form-input" placeholder="PT Global Maritime" />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="subject" className="form-label">{dict.contact.subject} <span className="text-red-500">*</span></label>
            <input type="text" id="subject" name="subject" required className="form-input" placeholder="Inquiry: Ship Repair Services" />
          </div>
          
          <div className="form-group">
            <label htmlFor="message" className="form-label">{dict.contact.message} <span className="text-red-500">*</span></label>
            <textarea id="message" name="message" required className="form-textarea" placeholder="Tell us about your requirements..."></textarea>
          </div>
          
          <button type="submit" disabled={isPending} className="btn-premium group w-full justify-center mt-2">
            <span>{isPending ? "Mengirim..." : dict.common.sendMessage}</span>
            <span className="btn-premium-icon">
              <PaperPlaneRight className="w-4 h-4 text-navy group-hover:text-cyan-dark transition-colors" weight="fill" />
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}

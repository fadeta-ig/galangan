"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CircleNotch, EnvelopeSimple, LockKey, WarningCircle } from "@phosphor-icons/react";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
        remember: rememberMe ? "true" : "false",
      });

      if (res?.error) {
        setError("Email atau password tidak valid.");
      } else {
        // Force a hard navigation to wipe the Next.js client router cache.
        // This prevents the browser "Back" button from showing the login page.
        window.location.replace("/admin");
      }
    } catch {
      setError("Terjadi kesalahan yang tidak terduga.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="grid gap-5" onSubmit={handleSubmit}>
      <div className="grid gap-2">
        <Label
          htmlFor="login-email"
          className="text-[12px] font-medium leading-4 text-[#374151]"
        >
          Email
        </Label>
        <div className="relative">
          <EnvelopeSimple className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#9ca3af]" />
          <Input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="admin@galangan.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-10 rounded-lg border-[#e5e7eb] bg-white pl-9 text-[13px] leading-5 text-[#111827] placeholder:text-[#d1d5db] focus-visible:border-[#2563eb] focus-visible:ring-[#2563eb]/15"
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label
          htmlFor="login-password"
          className="text-[12px] font-medium leading-4 text-[#374151]"
        >
          Password
        </Label>
        <div className="relative">
          <LockKey className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#9ca3af]" />
          <Input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="Masukkan password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-10 rounded-lg border-[#e5e7eb] bg-white pl-9 text-[13px] leading-5 text-[#111827] placeholder:text-[#d1d5db] focus-visible:border-[#2563eb] focus-visible:ring-[#2563eb]/15"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="remember-me"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          className="size-4 rounded border-[#d1d5db] text-[#0f172a] focus:ring-[#0f172a]"
        />
        <Label
          htmlFor="remember-me"
          className="text-[12px] font-medium leading-4 text-[#374151] cursor-pointer"
        >
          Tetap masuk (Ingat saya)
        </Label>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-[12px] leading-4 text-rose-700">
          <WarningCircle className="size-4 shrink-0" weight="fill" />
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={isLoading}
        className="h-10 w-full rounded-lg bg-[#0f172a] text-[13px] font-semibold text-white shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] hover:bg-[#1e293b] disabled:opacity-60"
      >
        {isLoading ? (
          <>
            <CircleNotch className="size-4 animate-spin" />
            Memproses...
          </>
        ) : (
          "Masuk"
        )}
      </Button>
    </form>
  );
}

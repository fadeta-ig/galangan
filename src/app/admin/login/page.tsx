import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import LoginForm from "@/components/admin/forms/LoginForm";
import { Anchor, ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import BFCacheBuster from "@/components/admin/BFCacheBuster";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/admin");
  }

  return (
    <div className="admin-surface min-h-[100dvh] font-sans text-foreground">
      <BFCacheBuster />
      <div className="grid min-h-[100dvh] lg:grid-cols-[1fr_1fr]">
        {/* Left panel - Brand / messaging */}
        <aside className="relative hidden min-h-[100dvh] flex-col justify-between bg-[#0f172a] lg:flex">
          {/* Subtle grid texture */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.4) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />

          <div className="relative z-10 flex flex-1 flex-col justify-between px-12 py-10">
            {/* Top: Logo */}
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-white/10 text-white ring-1 ring-white/[0.06]">
                <Anchor className="size-5" weight="fill" />
              </div>
              <div>
                <p className="text-[15px] font-semibold leading-5 tracking-[-0.01em] text-white">
                  Galangan Kapal
                </p>
                <p className="text-[11px] leading-4 text-white/40">
                  Content Management System
                </p>
              </div>
            </div>

            {/* Center: Headline */}
            <div className="max-w-[400px]">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#38bdf8]">
                Admin Workspace
              </p>
              <h1 className="mt-3 text-[32px] font-semibold leading-[1.15] tracking-[-0.02em] text-white">
                Kelola seluruh konten website dari satu panel terpadu.
              </h1>
              <p className="mt-4 text-[14px] leading-6 text-white/50">
                Halaman, layanan, proyek, berita, media, dan konfigurasi website
                tersedia untuk diatur di sini.
              </p>
            </div>

            {/* Bottom: Footer note */}
            <p className="text-[11px] leading-4 text-white/25">
              Protected area for authorized administrators.
            </p>
          </div>
        </aside>

        {/* Right panel - Login form */}
        <main className="flex min-h-[100dvh] items-center justify-center bg-white px-6 py-8">
          <div className="w-full max-w-[380px]">
            {/* Mobile logo */}
            <div className="mb-10 flex items-center gap-3 lg:hidden">
              <div className="flex size-10 items-center justify-center rounded-xl bg-[#0f172a] text-white">
                <Anchor className="size-5" weight="fill" />
              </div>
              <div>
                <p className="text-[14px] font-semibold leading-4 text-[#111827]">
                  Galangan Kapal
                </p>
                <p className="mt-1 text-[12px] leading-4 text-[#6b7280]">
                  CMS Workspace
                </p>
              </div>
            </div>

            {/* Form header */}
            <div className="mb-6">
              <h2 className="text-[22px] font-semibold leading-7 tracking-[-0.01em] text-[#111827]">
                Masuk ke CMS
              </h2>
              <p className="mt-1.5 text-[13px] leading-5 text-[#6b7280]">
                Gunakan akun administrator Anda untuk melanjutkan.
              </p>
            </div>

            {/* Form card */}
            <div className="rounded-xl border border-[#e5e7eb] bg-white p-6 shadow-[0_1px_3px_rgb(0_0_0_/_0.04),0_6px_24px_rgb(0_0_0_/_0.06)]">
              <div className="mb-5 flex items-center justify-between border-b border-[#f0f0f0] pb-4">
                <div>
                  <p className="text-[13px] font-semibold leading-5 text-[#111827]">
                    Credentials
                  </p>
                  <p className="mt-0.5 text-[12px] leading-4 text-[#9ca3af]">
                    Email dan password admin CMS.
                  </p>
                </div>
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#eff6ff] text-[#2563eb]">
                  <ShieldCheck className="size-5" weight="fill" />
                </div>
              </div>

              <LoginForm />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

import { isValidLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ContactForm from "@/components/public/forms/ContactForm";
import PageHero from "@/components/public/sections/PageHero";
import { MapPin, Phone, EnvelopeSimple, WhatsappLogo, Clock } from "@phosphor-icons/react/dist/ssr";
import MapWrapper from "@/components/public/contact/MapWrapper";

type ContactPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  return {
    title: `${dict.contact.pageTitle} | ${dict.meta.siteTitle}`,
    description: dict.contact.pageSubtitle,
  };
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();

  const dict = await getDictionary(locale as Locale);

  // Fetch site settings
  const rawSettings = await prisma.siteSetting.findMany();
  const settings = rawSettings.reduce((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {} as Record<string, string>);

  const whatsappNumber = settings.company_whatsapp || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const whatsappMessage = process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE || "";
  const waUrl = whatsappNumber 
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`
    : "#";

  return (
    <div className="flex min-h-screen flex-col bg-white pb-0">
      <PageHero
        eyebrow={dict.meta.siteTitle}
        title={dict.contact.pageTitle}
        subtitle={dict.contact.pageSubtitle}
        imageSrc="/images/hero_contact.png"
      />

      <section className="relative bg-slate-50 py-20 md:py-28">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr] lg:gap-20">
            {/* Left: Contact Info */}
            <div className="flex flex-col gap-10 animate-reveal" style={{ animationDelay: "100ms" }}>
              <div>
                <span className="mb-4 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#007C91]">
                  {dict.common.contactUs}
                </span>
                <h2 className="max-w-xl text-3xl font-semibold leading-tight tracking-[-0.01em] text-[#0A2463] md:text-4xl" style={{ fontFamily: "'Outfit', system-ui, sans-serif" }}>
                  {locale === "id" ? "Bicarakan kebutuhan kapal Anda dengan tim kami." : "Discuss your vessel needs with our team."}
                </h2>
                <p className="mt-4 text-[15px] leading-relaxed text-slate-600">
                  {locale === "id"
                    ? "Kami siap membantu estimasi, konsultasi teknis, dan kebutuhan docking dengan respons yang jelas dan cepat."
                    : "We can help with estimates, technical consultation, and docking requirements with a clear and fast response."}
                </p>

                {whatsappNumber && (
                  <div className="mt-8">
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-4 rounded-xl bg-[#25D366] px-6 py-3.5 text-white shadow-[0_8px_20px_rgba(37,211,102,0.25)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#20bd5a] hover:shadow-[0_12px_25px_rgba(37,211,102,0.35)]"
                    >
                      <WhatsappLogo className="size-6 transition-transform group-hover:scale-110" weight="fill" />
                      <div className="flex flex-col">
                        <span className="text-[14px] font-semibold tracking-wide">
                          {locale === "id" ? "Chat via WhatsApp" : "Chat on WhatsApp"}
                        </span>
                        <span className="text-[11px] font-medium text-white/90">
                          {locale === "id" ? "Tim kami membalas dalam hitungan menit" : "Our team replies in minutes"}
                        </span>
                      </div>
                    </a>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-8">
                {settings.company_address && (
                  <div className="flex items-start gap-5">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#0A2463]/5 text-[#0A2463] transition-colors hover:bg-[#0A2463] hover:text-white">
                      <MapPin className="size-5" weight="fill" />
                    </div>
                    <div className="flex flex-col pt-1">
                      <h4 className="mb-1 text-[12px] font-semibold uppercase tracking-wider text-slate-500">
                        {dict.contact.address}
                      </h4>
                      <p className="text-[15px] font-medium leading-relaxed text-[#0A2463]">{settings.company_address}</p>
                    </div>
                  </div>
                )}

                {settings.company_phone && (
                  <div className="flex items-start gap-5">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#0A2463]/5 text-[#0A2463] transition-colors hover:bg-[#0A2463] hover:text-white">
                      <Phone className="size-5" weight="fill" />
                    </div>
                    <div className="flex flex-col pt-1">
                      <h4 className="mb-1 text-[12px] font-semibold uppercase tracking-wider text-slate-500">
                        {dict.contact.phone}
                      </h4>
                      <p className="text-[15px] font-medium tracking-wide text-[#0A2463]">{settings.company_phone}</p>
                    </div>
                  </div>
                )}

                {settings.company_email && (
                  <div className="flex items-start gap-5">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#0A2463]/5 text-[#0A2463] transition-colors hover:bg-[#0A2463] hover:text-white">
                      <EnvelopeSimple className="size-5" weight="fill" />
                    </div>
                    <div className="flex flex-col pt-1">
                      <h4 className="mb-1 text-[12px] font-semibold uppercase tracking-wider text-slate-500">
                        {dict.contact.email}
                      </h4>
                      <a href={`mailto:${settings.company_email}`} className="text-[15px] font-medium text-[#0A2463] transition-colors hover:text-[#007C91]">
                        {settings.company_email}
                      </a>
                    </div>
                  </div>
                )}
                
                <div className="flex items-start gap-5">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#0A2463]/5 text-[#0A2463] transition-colors hover:bg-[#0A2463] hover:text-white">
                    <Clock className="size-5" weight="fill" />
                  </div>
                  <div className="flex flex-col pt-1">
                    <h4 className="mb-1 text-[12px] font-semibold uppercase tracking-wider text-slate-500">
                      {dict.contact.businessHours}
                    </h4>
                    <p className="text-[14px] leading-relaxed text-[#0A2463]">
                      <span className="block font-medium">{locale === "id" ? "Senin - Jumat: 08:00 - 17:00" : "Monday - Friday: 08:00 AM - 05:00 PM"}</span>
                      <span className="block text-slate-600">{locale === "id" ? "Sabtu: 08:00 - 12:00" : "Saturday: 08:00 AM - 12:00 PM"}</span>
                      <span className="block text-red-500/80">{locale === "id" ? "Minggu: Tutup" : "Sunday: Closed"}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right: Contact Form */}
            <div className="animate-reveal" style={{ animationDelay: "300ms" }}>
              <ContactForm dict={dict} />
            </div>

          </div>
        </div>
      </section>

      {/* Real Map Section (Leaflet) */}
      <section className="relative h-[450px] w-full bg-slate-200 animate-reveal" style={{ animationDelay: "400ms" }}>
        <MapWrapper address={settings.company_address || "Jakarta, Indonesia"} />
      </section>
    </div>
  );
}

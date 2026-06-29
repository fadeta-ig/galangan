import { isValidLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ContactForm from "@/components/public/forms/ContactForm";
import PageHero from "@/components/public/sections/PageHero";
import { MapPin, Phone, EnvelopeSimple, WhatsappLogo, Clock } from "@phosphor-icons/react/dist/ssr";

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
    <div className="flex flex-col min-h-screen bg-white pb-0">
      <PageHero
        eyebrow={dict.meta.siteTitle}
        title={dict.contact.pageTitle}
        subtitle={dict.contact.pageSubtitle}
        imageSrc="/images/hero_contact.png"
      />

      <section className="relative bg-slate-50 py-20 md:py-28">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.35fr] lg:gap-14">
            <div className="flex flex-col gap-6 animate-reveal" style={{ animationDelay: "100ms" }}>
              <div>
                <span className="mb-4 block text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan">
                  {dict.common.contactUs}
                </span>
                <h2 className="max-w-xl text-3xl font-semibold leading-tight tracking-[-0.01em] text-navy md:text-4xl">
                  {locale === "id" ? "Bicarakan kebutuhan kapal Anda dengan tim kami." : "Discuss your vessel needs with our team."}
                </h2>
                <p className="mt-4 text-[15px] leading-relaxed text-slate-600">
                  {locale === "id"
                    ? "Kami siap membantu estimasi, konsultasi teknis, dan kebutuhan docking dengan respons yang jelas."
                    : "We can help with estimates, technical consultation, and docking requirements with a clear response."}
                </p>
              </div>

              <div className="premium-shell">
                <div className="premium-core flex flex-col gap-7 p-7 md:p-8">
                  
                  {settings.company_address && (
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-lg bg-[#EBF5FB] flex items-center justify-center shrink-0">
                        <MapPin className="w-6 h-6 text-[#0A2463]" weight="fill" />
                      </div>
                      <div>
                        <h4 className="text-[13px] font-semibold text-[#0A2463] mb-1 uppercase tracking-wider" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
                          {dict.contact.address}
                        </h4>
                        <p className="text-slate-600 text-[14px] leading-relaxed">{settings.company_address}</p>
                      </div>
                    </div>
                  )}

                  {settings.company_phone && (
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-lg bg-[#EBF5FB] flex items-center justify-center shrink-0">
                        <Phone className="w-6 h-6 text-[#0A2463]" weight="fill" />
                      </div>
                      <div>
                        <h4 className="text-[13px] font-semibold text-[#0A2463] mb-1 uppercase tracking-wider" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
                          {dict.contact.phone}
                        </h4>
                        <p className="text-slate-700 text-[14px] font-medium">{settings.company_phone}</p>
                      </div>
                    </div>
                  )}

                  {settings.company_email && (
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-lg bg-[#EBF5FB] flex items-center justify-center shrink-0">
                        <EnvelopeSimple className="w-6 h-6 text-[#0A2463]" weight="fill" />
                      </div>
                      <div>
                        <h4 className="text-[13px] font-semibold text-[#0A2463] mb-1 uppercase tracking-wider" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
                          {dict.contact.email}
                        </h4>
                        <a href={`mailto:${settings.company_email}`} className="text-cyan text-[14px] font-medium hover:text-[#0A2463] transition-colors">
                          {settings.company_email}
                        </a>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-lg bg-[#EBF5FB] flex items-center justify-center shrink-0">
                      <Clock className="w-6 h-6 text-[#0A2463]" weight="fill" />
                    </div>
                    <div>
                      <h4 className="text-[13px] font-semibold text-[#0A2463] mb-1 uppercase tracking-wider" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
                        {dict.contact.businessHours}
                      </h4>
                      <p className="text-slate-600 text-[14px] leading-relaxed">
                        {locale === "id" ? "Senin - Jumat: 08:00 - 17:00" : "Monday - Friday: 08:00 AM - 05:00 PM"}<br/>
                        {locale === "id" ? "Sabtu: 08:00 - 12:00" : "Saturday: 08:00 AM - 12:00 PM"}<br/>
                        {locale === "id" ? "Minggu: Tutup" : "Sunday: Closed"}
                      </p>
                    </div>
                  </div>

                </div>
              </div>

              {whatsappNumber && (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between rounded-xl bg-[#0F7A3A] p-6 text-white transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:bg-[#0B6730] hover:shadow-[0_16px_34px_rgba(15,122,58,0.22)]"
                  style={{ animationDelay: "200ms" }}
                >
                  <div>
                    <h4 className="mb-1 text-[20px] font-semibold" style={{ fontFamily: "'Outfit', system-ui, sans-serif" }}>WhatsApp</h4>
                    <p className="text-[13px] font-medium text-white/90">Fast Response</p>
                  </div>
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 transition-transform group-hover:scale-105">
                    <WhatsappLogo className="size-6 text-white" weight="fill" />
                  </span>
                </a>
              )}
            </div>
            
            <div className="animate-reveal" style={{ animationDelay: "300ms" }}>
              <ContactForm dict={dict} />
            </div>

          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="h-[400px] w-full bg-slate-100 relative animate-reveal" style={{ animationDelay: "400ms" }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center p-8 bg-white border border-slate-200 rounded-xl shadow-sm max-w-sm">
            <MapPin className="size-10 text-cyan mx-auto mb-4" weight="fill" />
            <h4 className="font-semibold text-[#0A2463] mb-2 text-[18px]" style={{ fontFamily: "'Outfit', system-ui, sans-serif" }}>Galangan Kapal HQ</h4>
            <p className="text-[14px] text-slate-600 leading-relaxed">{settings.company_address || "Jakarta, Indonesia"}</p>
          </div>
        </div>
      </section>
    </div>
  );
}

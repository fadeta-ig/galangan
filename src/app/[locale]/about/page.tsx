import { isValidLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { Target, Trophy, ShieldCheck, Factory } from "@phosphor-icons/react/dist/ssr";
import CTASection from "@/components/public/sections/CTASection";
import PageHero from "@/components/public/sections/PageHero";

type AboutPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  return {
    title: `${dict.about.pageTitle} | ${dict.meta.siteTitle}`,
    description: dict.about.pageSubtitle,
  };
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();

  const dict = await getDictionary(locale as Locale);

  // Try to fetch custom page data if exists
  const pageData = await prisma.page.findFirst({
    where: {
      translations: { some: { slug: { in: ["about", "tentang-kami"] } } },
      status: "PUBLISHED"
    },
    include: {
      translations: { where: { locale: locale as Locale } },
      sections: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } }
    }
  });

  const translation = pageData?.translations[0];
  const title = translation?.title || dict.about.pageTitle;
  const subtitle = translation?.content || dict.about.pageSubtitle;

  const coreValues = [
    { title: locale === "id" ? "Keunggulan Rekayasa" : "Engineering Excellence", desc: locale === "id" ? "Kami memastikan presisi tinggi di setiap pengelasan dan perakitan." : "We ensure high precision in every welding and assembly.", icon: <Trophy weight="fill" /> },
    { title: locale === "id" ? "Keselamatan Pertama" : "Safety First", desc: locale === "id" ? "Standar HSE ketat tanpa kompromi." : "Strict HSE standards with zero compromises.", icon: <ShieldCheck weight="fill" /> },
    { title: locale === "id" ? "Fokus pada Klien" : "Client-Centric", desc: locale === "id" ? "Kami bekerja sesuai jadwal dan standar Anda." : "We deliver on your schedule and standards.", icon: <Target weight="fill" /> },
    { title: locale === "id" ? "Kapasitas Besar" : "Large Capacity", desc: locale === "id" ? "Fasilitas docking luas untuk berbagai kelas kapal." : "Expansive docking facilities for various vessel classes.", icon: <Factory weight="fill" /> },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white pb-0">
      <PageHero
        title={title}
        subtitle={subtitle}
        imageSrc="/images/hero_about.png"
      />

      {/* Company Overview - Sharp Corporate Layout */}
      <section className="py-24 md:py-32 bg-white">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">
            <div className="w-full lg:w-1/2 animate-reveal">
              <span className="mb-4 block text-[11px] font-semibold uppercase tracking-[0.2em] text-[#007C91]">
                {dict.about.whoWeAre}
              </span>
              <h2 className="text-3xl md:text-4xl font-semibold text-[#0A2463] mb-6 leading-tight" style={{ fontFamily: "'Outfit', system-ui, sans-serif" }}>
                {locale === "id" ? "Membangun Ketangguhan, Mengarungi Samudera." : "Building Resilience, Navigating Oceans."}
              </h2>
              <div className="prose prose-lg text-slate-600" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
                <p>
                  {locale === "id" 
                    ? "Berakar dari keahlian teknik maritim yang presisi, kami adalah fasilitas galangan kapal kelas dunia yang berdedikasi tinggi terhadap kualitas, keselamatan, dan efisiensi waktu. Setiap struktur yang kami bangun dan reparasi dirancang untuk bertahan dalam kondisi laut yang paling keras."
                    : "Rooted in precise maritime engineering expertise, we are a world-class shipyard facility highly dedicated to quality, safety, and time efficiency. Every structure we build and repair is designed to withstand the harshest sea conditions."}
                </p>
                <p className="mt-4">
                  {locale === "id"
                    ? "Dengan fasilitas dok modern, workshop fabrikasi terintegrasi, dan ratusan teknisi tersertifikasi, kami melayani mulai dari tugboat komersial hingga kapal kargo skala besar."
                    : "With modern docking facilities, integrated fabrication workshops, and hundreds of certified technicians, we service everything from commercial tugboats to large-scale cargo vessels."}
                </p>
              </div>
            </div>
            
            <div className="w-full lg:w-1/2 animate-reveal" style={{ animationDelay: "200ms" }}>
              <div className="relative">
                <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-white p-2">
                  <div className="rounded-[calc(0.75rem-0.5rem)] overflow-hidden relative aspect-[4/3]">
                    <Image 
                      src="/images/hero_about.png" 
                      alt="Shipyard Facilities" 
                      fill
                      className="object-cover img-zoom"
                    />
                  </div>
                </div>
                
                {/* Floating Stats Badge - Flat */}
                <div className="absolute -bottom-8 -left-8 bg-[#0A2463] text-white p-6 rounded-xl border border-white/10 hidden md:block">
                  <div className="text-4xl font-semibold mb-1" style={{ fontFamily: "'Outfit', system-ui, sans-serif" }}>ISO</div>
                  <div className="text-sm text-blue-100 font-medium">9001:2015 Certified</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values - Flat Borders */}
      <section className="py-24 bg-slate-50 relative border-t border-slate-100">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-16 animate-reveal">
            <span className="mb-4 block text-[11px] font-semibold uppercase tracking-[0.2em] text-[#007C91]">
              {dict.about.valuesTitle}
            </span>
            <h2 className="text-3xl md:text-4xl font-semibold text-[#0A2463]" style={{ fontFamily: "'Outfit', system-ui, sans-serif" }}>
              {locale === "id" ? "Prinsip Utama Kami" : "Our Guiding Principles"}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {coreValues.map((val, i) => (
              <div 
                key={i}
                className="group animate-reveal bg-white border border-slate-200 rounded-xl transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:border-[#0A2463]/30 hover:shadow-[0_18px_36px_rgba(10,36,99,0.08)]"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="p-8 h-full flex flex-col">
                  <div className="w-12 h-12 rounded-lg bg-[#EBF5FB] text-[#0A2463] flex items-center justify-center text-xl mb-6">
                    {val.icon}
                  </div>
                  <h3 className="text-[17px] font-semibold text-[#0A2463] mb-3" style={{ fontFamily: "'Outfit', system-ui, sans-serif" }}>
                    {val.title}
                  </h3>
                  <p className="text-slate-600 text-[14px] leading-relaxed" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
                    {val.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <CTASection locale={locale} dict={dict} />
    </div>
  );
}

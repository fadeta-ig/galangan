import "dotenv/config";
import { ContentStatus, Locale, PrismaClient, UserRole } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { hashPassword } from "../src/lib/password";

const adapter = new PrismaMariaDb({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "galangan_kapal",
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // ============================================================
  // 1. Default Admin User
  // ============================================================
  const adminEmail = process.env.ADMIN_EMAIL || "admin@galangan-kapal.co.id";
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin && !process.env.ADMIN_PASSWORD) {
    throw new Error("ADMIN_PASSWORD must be set to create the initial admin user.");
  }

  const adminUser = existingAdmin || await prisma.user.create({
    data: {
      name: "Super Admin",
      email: adminEmail,
      password: hashPassword(process.env.ADMIN_PASSWORD as string),
      role: UserRole.SUPER_ADMIN,
      isActive: true,
    },
  });
  console.log(`✅ Admin user created: ${adminUser.email}`);

  // ============================================================
  // 2. Site Settings
  // ============================================================
  const settings = [
    { key: "site_name", value: "Galangan Kapal", group: "general" },
    { key: "site_tagline_id", value: "Keunggulan Rekayasa Maritim", group: "general" },
    { key: "site_tagline_en", value: "Engineering Maritime Excellence", group: "general" },
    { key: "company_address", value: "Jl. Pelabuhan No. 123, Surabaya, Indonesia", group: "contact" },
    { key: "company_phone", value: "+62 31 1234567", group: "contact" },
    { key: "company_email", value: "info@galangan-kapal.co.id", group: "contact" },
    { key: "company_whatsapp", value: "6281234567890", group: "contact" },
    { key: "business_hours_id", value: "Senin - Jumat: 08:00 - 17:00, Sabtu: 08:00 - 12:00", group: "contact" },
    { key: "business_hours_en", value: "Monday - Friday: 08:00 AM - 05:00 PM, Saturday: 08:00 AM - 12:00 PM", group: "contact" },
    { key: "social_linkedin", value: "https://linkedin.com/company/galangan-kapal", group: "social" },
    { key: "social_instagram", value: "https://instagram.com/galangankapal", group: "social" },
    { key: "social_facebook", value: "https://facebook.com/galangankapal", group: "social" },
    { key: "social_youtube", value: "https://youtube.com/@galangankapal", group: "social" },
    { key: "google_maps_embed", value: "", group: "contact" },
    { key: "default_meta_title_id", value: "Galangan Kapal - Solusi Maritim Terpercaya", group: "seo" },
    { key: "default_meta_title_en", value: "Galangan Kapal - Trusted Maritime Solutions", group: "seo" },
    { key: "default_meta_description_id", value: "Galangan kapal terpercaya untuk perbaikan, pembuatan, dan layanan docking kapal.", group: "seo" },
    { key: "default_meta_description_en", value: "Trusted shipyard for ship repair, shipbuilding, and docking solutions.", group: "seo" },
  ];

  for (const s of settings) {
    await prisma.siteSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: { key: s.key, value: s.value, group: s.group },
    });
  }
  console.log(`✅ ${settings.length} site settings seeded`);

  // ============================================================
  // 3. Homepage Sections
  // ============================================================
  const homeSections = [
    { sectionType: "hero", titleId: "Keunggulan Rekayasa Maritim", titleEn: "Engineering Maritime Excellence", sortOrder: 1 },
    { sectionType: "statistics", titleId: "Pencapaian Kami", titleEn: "Our Achievements", sortOrder: 2 },
    { sectionType: "services", titleId: "Layanan Kami", titleEn: "Our Services", sortOrder: 3 },
    { sectionType: "news", titleId: "Sorotan Galangan", titleEn: "Shipyard Spotlight", sortOrder: 4 },
    { sectionType: "experience", titleId: "Pengalaman Kami", titleEn: "Our Experience", sortOrder: 5 },
    { sectionType: "project_banner", titleId: "Dibangun untuk Laut Lepas", titleEn: "Built for the Open Sea", sortOrder: 6 },
  ];

  for (const hs of homeSections) {
    const existing = await prisma.homepageSection.findFirst({
      where: { sectionType: hs.sectionType },
    });
    if (!existing) {
      await prisma.homepageSection.create({ data: hs });
    }
  }
  console.log(`✅ ${homeSections.length} homepage sections seeded`);

  // ============================================================
  // 4. Statistics
  // ============================================================
  const stats = [
    { number: 20, suffix: "+", labelId: "Tahun Berdiri", labelEn: "Years Established", sortOrder: 1 },
    { number: 75, suffix: "+", labelId: "Ahli Teknik", labelEn: "Expert Engineers", sortOrder: 2 },
    { number: 100, suffix: "+", labelId: "Proyek Selesai", labelEn: "Projects Completed", sortOrder: 3 },
    { number: 150, suffix: "+", labelId: "Klien Dilayani", labelEn: "Clients Served", sortOrder: 4 },
  ];

  for (const st of stats) {
    const existing = await prisma.statistic.findFirst({
      where: { labelEn: st.labelEn },
    });
    if (!existing) {
      await prisma.statistic.create({ data: st });
    }
  }
  console.log(`✅ ${stats.length} statistics seeded`);

  // ============================================================
  // 5. Service Categories
  // ============================================================
  const serviceCategories = [
    { nameId: "Perbaikan Kapal", nameEn: "Ship Repair", slug: "ship-repair" },
    { nameId: "Pembuatan Kapal", nameEn: "Shipbuilding", slug: "shipbuilding" },
    { nameId: "Docking", nameEn: "Docking", slug: "docking" },
    { nameId: "Perawatan", nameEn: "Maintenance", slug: "maintenance" },
  ];

  for (const cat of serviceCategories) {
    const existing = await prisma.serviceCategory.findFirst({
      where: { translations: { some: { slug: cat.slug } } },
    });
    if (!existing) {
      await prisma.serviceCategory.create({
        data: {
          translations: {
            create: [
              { locale: Locale.id, name: cat.nameId, slug: cat.slug },
              { locale: Locale.en, name: cat.nameEn, slug: cat.slug + "-en" },
            ],
          },
        },
      });
    }
  }
  console.log(`✅ ${serviceCategories.length} service categories seeded`);

  // ============================================================
  // 6. Media Categories
  // ============================================================
  const mediaCategories = [
    { nameId: "Perbaikan Kapal", nameEn: "Ship Repair", slug: "ship-repair" },
    { nameId: "Pembuatan Kapal", nameEn: "Shipbuilding", slug: "shipbuilding" },
    { nameId: "Docking", nameEn: "Docking", slug: "docking" },
    { nameId: "Fasilitas", nameEn: "Facilities", slug: "facilities" },
    { nameId: "Acara", nameEn: "Events", slug: "events" },
  ];

  for (const mc of mediaCategories) {
    await prisma.mediaCategory.upsert({
      where: { slug: mc.slug },
      update: {},
      create: { nameId: mc.nameId, nameEn: mc.nameEn, slug: mc.slug },
    });
  }
  console.log(`✅ ${mediaCategories.length} media categories seeded`);

  // ============================================================
  // 7. Services Data
  // ============================================================
  const services = [
    {
      slug: 'ship-repair',
      coverImage: '/images/homepage_stats_services_1782540187891.png',
      status: ContentStatus.PUBLISHED,
      isFeatured: true,
      sortOrder: 1,
      translations: {
        create: [
          { locale: Locale.id, slug: 'perbaikan-kapal', title: 'Perbaikan Kapal', shortDescription: 'Layanan perbaikan kapal profesional dengan standar keselamatan internasional.', fullDescription: 'Detail perbaikan kapal...' },
          { locale: Locale.en, slug: 'ship-repair', title: 'Ship Repair', shortDescription: 'Professional ship repair services with international safety standards.', fullDescription: 'Ship repair details...' }
        ]
      }
    },
    {
      slug: 'shipbuilding',
      coverImage: '/images/page_services_1782540256572.png',
      status: ContentStatus.PUBLISHED,
      isFeatured: true,
      sortOrder: 2,
      translations: {
        create: [
          { locale: Locale.id, slug: 'pembuatan-kapal', title: 'Pembuatan Kapal', shortDescription: 'Desain dan perakitan struktur presisi untuk berbagai kelas kapal.', fullDescription: 'Detail pembuatan kapal...' },
          { locale: Locale.en, slug: 'shipbuilding', title: 'Shipbuilding', shortDescription: 'Precision design and assembly for various ship classes.', fullDescription: 'Shipbuilding details...' }
        ]
      }
    },
    {
      slug: 'docking',
      coverImage: '/images/page_about_us_1782540246426.png',
      status: ContentStatus.PUBLISHED,
      isFeatured: true,
      sortOrder: 3,
      translations: {
        create: [
          { locale: Locale.id, slug: 'docking-kapal', title: 'Fasilitas Docking', shortDescription: 'Fasilitas docking luas dengan peralatan mutakhir untuk pemeliharaan rutin.', fullDescription: 'Detail fasilitas docking...' },
          { locale: Locale.en, slug: 'ship-docking', title: 'Docking Facilities', shortDescription: 'Expansive docking facilities with state-of-the-art equipment for routine maintenance.', fullDescription: 'Docking facilities details...' }
        ]
      }
    }
  ];

  for (const s of services) {
    const existing = await prisma.service.findFirst({ where: { translations: { some: { title: s.translations.create[0].title } } } });
    if (!existing) {
      await prisma.service.create({
        data: {
          coverImage: s.coverImage,
          status: 'PUBLISHED',
          isFeatured: s.isFeatured,
          sortOrder: s.sortOrder,
          translations: s.translations
        }
      });
    }
  }
  console.log(`✅ ${services.length} services seeded`);

  // ============================================================
  // 8. Projects Data
  // ============================================================
  const projects = [
    {
      vesselType: 'Tugboat',
      projectYear: 2025,
      coverImage: '/images/project_tugboat_1.png',
      status: ContentStatus.PUBLISHED,
      isFeatured: true,
      sortOrder: 1,
      translations: {
        create: [
          { locale: Locale.id, slug: 'tb-marina-jaya', title: 'TB. Marina Jaya', shortDescription: 'Perbaikan umum dan pengecatan ulang lambung kapal.', fullDescription: 'Detail proyek...' },
          { locale: Locale.en, slug: 'tb-marina-jaya-en', title: 'TB. Marina Jaya', shortDescription: 'General repair and repainting of ship hull.', fullDescription: 'Project details...' }
        ]
      }
    },
    {
      vesselType: 'Cargo Ship',
      projectYear: 2024,
      coverImage: '/images/project_cargo_1.png',
      status: ContentStatus.PUBLISHED,
      isFeatured: true,
      sortOrder: 2,
      translations: {
        create: [
          { locale: Locale.id, slug: 'mv-ocean-explorer', title: 'MV. Ocean Explorer', shortDescription: 'Inspeksi lambung dan perawatan rutin mesin utama.', fullDescription: 'Detail proyek...' },
          { locale: Locale.en, slug: 'mv-ocean-explorer-en', title: 'MV. Ocean Explorer', shortDescription: 'Hull inspection and routine main engine maintenance.', fullDescription: 'Project details...' }
        ]
      }
    },
    {
      vesselType: 'Barge',
      projectYear: 2024,
      coverImage: '/images/project_barge_1.png',
      status: ContentStatus.PUBLISHED,
      isFeatured: true,
      sortOrder: 3,
      translations: {
        create: [
          { locale: Locale.id, slug: 'bg-sumber-rejeki', title: 'BG. Sumber Rejeki', shortDescription: 'Penggantian pelat baja pada area lambung yang korosi.', fullDescription: 'Detail proyek...' },
          { locale: Locale.en, slug: 'bg-sumber-rejeki-en', title: 'BG. Sumber Rejeki', shortDescription: 'Steel plate replacement on corroded hull areas.', fullDescription: 'Project details...' }
        ]
      }
    },
    {
      vesselType: 'Tanker',
      projectYear: 2023,
      coverImage: '/images/project_tanker_1.png',
      status: ContentStatus.PUBLISHED,
      isFeatured: false,
      sortOrder: 4,
      translations: {
        create: [
          { locale: Locale.id, slug: 'mt-energi-nusantara', title: 'MT. Energi Nusantara', shortDescription: 'Overhaul sistem perpipaan dan pompa kargo.', fullDescription: 'Detail proyek...' },
          { locale: Locale.en, slug: 'mt-energi-nusantara-en', title: 'MT. Energi Nusantara', shortDescription: 'Overhaul of piping system and cargo pumps.', fullDescription: 'Project details...' }
        ]
      }
    }
  ];

  for (const p of projects) {
    const existing = await prisma.project.findFirst({ where: { translations: { some: { title: p.translations.create[0].title } } } });
    if (!existing) {
      await prisma.project.create({
        data: {
          vesselType: p.vesselType,
          projectYear: p.projectYear,
          coverImage: p.coverImage,
          status: 'PUBLISHED',
          isFeatured: p.isFeatured,
          sortOrder: p.sortOrder,
          translations: p.translations
        }
      });
    }
  }
  console.log(`✅ ${projects.length} projects seeded`);

  // ============================================================
  // 9. News Data
  // ============================================================
  const news = [
    {
      publishDate: new Date(),
      featuredImage: '/images/homepage_banner_footer_1782540209299.png',
      status: ContentStatus.PUBLISHED,
      translations: {
        create: [
          { locale: Locale.id, slug: 'standar-keselamatan-baru', title: 'Penerapan Standar Keselamatan Baru', excerpt: 'Penerapan K3 di seluruh fasilitas galangan kapal kami...', content: 'Konten lengkap...' },
          { locale: Locale.en, slug: 'new-safety-standards', title: 'New Safety Standards Implementation', excerpt: 'OHS implementation across all our shipyard facilities...', content: 'Full content...' }
        ]
      }
    },
    {
      publishDate: new Date(Date.now() - 86400000 * 5),
      featuredImage: '/images/page_about_us_1782540246426.png',
      status: ContentStatus.PUBLISHED,
      translations: {
        create: [
          { locale: Locale.id, slug: 'peresmian-fasilitas-dock-baru', title: 'Peresmian Fasilitas Dock Baru', excerpt: 'Fasilitas baru menampung kapal hingga 5000 DWT...', content: 'Konten lengkap...' },
          { locale: Locale.en, slug: 'new-docking-facility', title: 'New Docking Facility Inauguration', excerpt: 'New facility accommodating ships up to 5000 DWT...', content: 'Full content...' }
        ]
      }
    },
    {
      publishDate: new Date(Date.now() - 86400000 * 15),
      featuredImage: '/images/homepage_news_experience_1782540198282.png',
      status: ContentStatus.PUBLISHED,
      translations: {
        create: [
          { locale: Locale.id, slug: 'penghargaan-industri-maritim', title: 'Penghargaan Industri Maritim 2025', excerpt: 'Kami memenangkan best safety shipyard tahun ini...', content: 'Konten lengkap...' },
          { locale: Locale.en, slug: 'maritime-industry-award', title: 'Maritime Industry Award 2025', excerpt: 'We won the best safety shipyard this year...', content: 'Full content...' }
        ]
      }
    }
  ];

  for (const n of news) {
    const existing = await prisma.newsPost.findFirst({ where: { translations: { some: { title: n.translations.create[0].title } } } });
    if (!existing) {
      await prisma.newsPost.create({
        data: {
          publishDate: n.publishDate,
          featuredImage: n.featuredImage,
          status: 'PUBLISHED',
          translations: n.translations
        }
      });
    }
  }
  console.log(`✅ ${news.length} news seeded`);

  // ============================================================
  // 10. Legal Pages
  // ============================================================
  const legalPages = [
    {
      status: ContentStatus.PUBLISHED,
      sortOrder: 1,
      translations: {
        create: [
          {
            locale: Locale.id,
            slug: "kebijakan-privasi",
            title: "Kebijakan Privasi",
            content: "<p>Kebijakan privasi Galangan Kapal menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi data pribadi pengunjung website.</p>",
          },
          {
            locale: Locale.en,
            slug: "privacy-policy",
            title: "Privacy Policy",
            content: "<p>Galangan Kapal privacy policy explains how we collect, use, and protect personal data from website visitors.</p>",
          },
        ],
      },
    },
    {
      status: ContentStatus.PUBLISHED,
      sortOrder: 2,
      translations: {
        create: [
          {
            locale: Locale.id,
            slug: "syarat-ketentuan",
            title: "Syarat & Ketentuan",
            content: "<p>Syarat dan ketentuan penggunaan website Galangan Kapal. Dengan mengakses website ini, Anda menyetujui ketentuan yang berlaku.</p>",
          },
          {
            locale: Locale.en,
            slug: "terms-of-service",
            title: "Terms of Service",
            content: "<p>Terms of service for using the Galangan Kapal website. By accessing this site, you agree to these terms.</p>",
          },
        ],
      },
    },
  ];

  for (const lp of legalPages) {
    const existing = await prisma.page.findFirst({
      where: { translations: { some: { slug: lp.translations.create[0].slug } } },
    });
    if (!existing) {
      await prisma.page.create({ data: lp });
    }
  }
  console.log(`✅ ${legalPages.length} legal pages seeded`);

  console.log("\n🎉 Database seeding completed!");
  console.log("Admin login email is configured by ADMIN_EMAIL.");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

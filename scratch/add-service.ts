import { prisma } from '../src/lib/prisma';

async function main() {
  const services = await prisma.service.findMany({
    include: {
      translations: true
    }
  });

  for (const service of services) {
    let newCoverImage = '/images/service_shipbuilding_1782704101786.png'; // default fallback
    const slug = service.translations.find((t) => t.locale === 'en')?.slug || '';
    const enTitle = service.translations.find((t) => t.locale === 'en')?.title || '';

    if (slug.includes('repair')) {
      newCoverImage = '/images/service_ship_repair_1782704090002.png';
    } else if (slug.includes('build')) {
      newCoverImage = '/images/service_shipbuilding_1782704101786.png';
    } else if (slug.includes('dock')) {
      newCoverImage = '/images/service_docking_1782704114266.png';
    } else if (slug.includes('inspect')) {
      newCoverImage = '/images/service_inspection_1782704126874.png';
    }

    await prisma.service.update({
      where: { id: service.id },
      data: { coverImage: newCoverImage }
    });
    console.log(`Updated coverImage for ${enTitle || service.id} to ${newCoverImage}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // await prisma.$disconnect();
  });

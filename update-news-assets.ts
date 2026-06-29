import { prisma } from './src/lib/prisma';
import fs from 'fs';
import path from 'path';

async function main() {
  console.log("Starting asset update...");
  const publicImagesDir = path.join(process.cwd(), 'public', 'images');

  const assets = [
    {
      source: 'C:\\Users\\IT WIG\\.gemini\\antigravity\\brain\\a90bbf0b-f6c5-403f-a2cc-798f84df1d8f\\news_safety_1782638883187.png',
      destName: 'news_safety.png',
      newsId: 'cmqw2jkhr000cxcuhb30l89pk'
    },
    {
      source: 'C:\\Users\\IT WIG\\.gemini\\antigravity\\brain\\a90bbf0b-f6c5-403f-a2cc-798f84df1d8f\\news_dock_1782638898602.png',
      destName: 'news_dock.png',
      newsId: 'cmqw2jki8000fxcuh5jyr09ju'
    },
    {
      source: 'C:\\Users\\IT WIG\\.gemini\\antigravity\\brain\\a90bbf0b-f6c5-403f-a2cc-798f84df1d8f\\news_award_1782638909716.png',
      destName: 'news_award.png',
      newsId: 'cmqw2jkio000ixcuhz57v11vk'
    }
  ];

  for (const asset of assets) {
    if (fs.existsSync(asset.source)) {
      const destPath = path.join(publicImagesDir, asset.destName);
      fs.copyFileSync(asset.source, destPath);
      console.log(`Copied ${asset.destName}`);

      await prisma.newsPost.update({
        where: { id: asset.newsId },
        data: { featuredImage: `/images/${asset.destName}` }
      });
      console.log(`Updated DB for ${asset.newsId} to /images/${asset.destName}`);
    } else {
      console.error(`Missing source file: ${asset.source}`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());

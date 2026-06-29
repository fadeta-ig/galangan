import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import sharp from "sharp";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const categoryId = formData.get("categoryId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const originalName = file.name;
    const extension = originalName.split(".").pop()?.toLowerCase() || "";
    
    // Validate file type
    const isImage = ["jpg", "jpeg", "png", "webp", "gif"].includes(extension);
    const isDocument = ["pdf", "doc", "docx", "xls", "xlsx"].includes(extension);
    
    if (!isImage && !isDocument) {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
    }

    const uniqueId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(7);
    const filename = `${uniqueId}.${extension}`;
    const uploadDir = join(process.cwd(), "public", "uploads");

    // Ensure upload directory exists
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch {
      // Ignore if exists
    }

    const filePath = join(uploadDir, filename);
    let width = null;
    let height = null;
    let thumbnailUrl = null;

    if (isImage) {
      // Process image with sharp
      const image = sharp(buffer);
      const metadata = await image.metadata();
      width = metadata.width || null;
      height = metadata.height || null;

      // Save original optimized
      await image
        .resize(1920, 1080, { fit: "inside", withoutEnlargement: true })
        .toFile(filePath);

      // Create thumbnail
      const thumbFilename = `thumb_${filename}`;
      const thumbPath = join(uploadDir, thumbFilename);
      await sharp(buffer)
        .resize(400, 300, { fit: "cover" })
        .toFile(thumbPath);
        
      thumbnailUrl = `/uploads/${thumbFilename}`;
    } else {
      // Save document as is
      await writeFile(filePath, buffer);
    }

    let finalCategoryId = null;
    if (categoryId) {
      try {
        let category = await prisma.mediaCategory.findUnique({ where: { slug: categoryId } });
        if (!category) {
          category = await prisma.mediaCategory.findUnique({ where: { id: categoryId } });
        }
        if (category) finalCategoryId = category.id;
      } catch (e) {
        console.error("Failed to resolve categoryId", e);
      }
    }

    // Save to database
    const media = await prisma.media.create({
      data: {
        filename,
        originalName,
        mimeType: file.type,
        size: file.size,
        url: `/uploads/${filename}`,
        thumbnailUrl,
        width,
        height,
        mediaType: isImage ? "image" : "document",
        categoryId: finalCategoryId,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "create",
        module: "media",
        targetId: media.id,
        targetTitle: originalName,
      }
    });

    return NextResponse.json(media);
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

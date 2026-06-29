import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { unlink } from "fs/promises";
import { join } from "path";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const media = await prisma.media.findUnique({ where: { id } });

    if (!media) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    const uploadDir = join(process.cwd(), "public");
    
    // Delete original file
    if (media.url.startsWith("/uploads/")) {
      try {
        await unlink(join(uploadDir, media.url));
      } catch (e) {
        console.error("Failed to delete original file:", e);
      }
    }

    // Delete thumbnail if exists
    if (media.thumbnailUrl && media.thumbnailUrl.startsWith("/uploads/")) {
      try {
        await unlink(join(uploadDir, media.thumbnailUrl));
      } catch (e) {
        console.error("Failed to delete thumbnail file:", e);
      }
    }

    // Delete from DB
    await prisma.media.delete({ where: { id } });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "delete",
        module: "media",
        targetId: id,
        targetTitle: media.originalName,
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

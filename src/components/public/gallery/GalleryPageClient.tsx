"use client";

import { useState } from "react";
import Link from "next/link";
import GalleryLightbox, { GalleryGrid, VideoModal, type GalleryItem } from "./GalleryGrid";

type Category = {
  id: string;
  slug: string;
  name: string;
};

type GalleryPageClientProps = {
  locale: string;
  items: GalleryItem[];
  categories: Category[];
  currentCategoryId: string | null;
  currentPage: number;
  totalPages: number;
  allLabel: string;
};

export default function GalleryPageClient({
  locale,
  items,
  categories,
  currentCategoryId,
  currentPage,
  totalPages,
  allLabel,
}: GalleryPageClientProps) {
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null);
  const [videoItem, setVideoItem] = useState<GalleryItem | null>(null);

  const buildUrl = (categoryId?: string | null, page?: number) => {
    const params = new URLSearchParams();
    if (categoryId) params.set("category", categoryId);
    if (page && page > 1) params.set("page", String(page));
    const qs = params.toString();
    return `/${locale}/gallery${qs ? `?${qs}` : ""}`;
  };

  return (
    <>
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-10 justify-center">
          <Link
            href={buildUrl()}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              !currentCategoryId
                ? "bg-navy text-white"
                : "bg-white text-navy border border-gray-200 hover:border-cyan"
            }`}
          >
            {allLabel}
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={buildUrl(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                currentCategoryId === cat.id
                  ? "bg-navy text-white"
                  : "bg-white text-navy border border-gray-200 hover:border-cyan"
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      )}

      <GalleryGrid
        items={items}
        onImageClick={setLightboxItem}
        onVideoClick={setVideoItem}
      />

      {totalPages > 1 && (
        <div className="flex justify-center gap-4 mt-12">
          {currentPage > 1 && (
            <Link href={buildUrl(currentCategoryId, currentPage - 1)} className="btn-secondary">
              Previous
            </Link>
          )}
          <span className="flex items-center text-sm text-gray-500">
            Page {currentPage} of {totalPages}
          </span>
          {currentPage < totalPages && (
            <Link href={buildUrl(currentCategoryId, currentPage + 1)} className="btn-secondary">
              Next
            </Link>
          )}
        </div>
      )}

      <GalleryLightbox item={lightboxItem} onClose={() => setLightboxItem(null)} />
      <VideoModal
        embedUrl={videoItem?.embedUrl ?? null}
        title={videoItem?.title ?? "Video"}
        onClose={() => setVideoItem(null)}
      />
    </>
  );
}

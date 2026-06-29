"use client";
import Image from "next/image";
import { PlayCircle, X } from "@phosphor-icons/react";

export type GalleryItem = {
  id: string;
  mediaType: string;
  url: string;
  thumbnailUrl: string | null;
  embedUrl: string | null;
  title: string;
  caption: string;
  altText: string;
};

type GalleryLightboxProps = {
  item: GalleryItem | null;
  onClose: () => void;
};

export default function GalleryLightbox({ item, onClose }: GalleryLightboxProps) {
  if (!item) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy/90 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-white/80 hover:text-white transition-colors"
        aria-label="Close"
      >
        <X className="w-8 h-8" weight="bold" />
      </button>

      <div
        className="relative max-w-5xl w-full max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-full aspect-video max-h-[70vh] rounded-2xl overflow-hidden bg-black">
          <Image
            src={item.thumbnailUrl || item.url}
            alt={item.altText || item.title}
            fill
            className="object-contain"
            sizes="(max-width: 1280px) 100vw, 1280px"
          />
        </div>
        {(item.title || item.caption) && (
          <div className="mt-4 text-center text-white">
            {item.title && <h3 className="text-lg font-semibold">{item.title}</h3>}
            {item.caption && <p className="text-gray-300 text-sm mt-1">{item.caption}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

type VideoModalProps = {
  embedUrl: string | null;
  title: string;
  onClose: () => void;
};

export function VideoModal({ embedUrl, title, onClose }: VideoModalProps) {
  if (!embedUrl) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy/90 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-white/80 hover:text-white transition-colors"
        aria-label="Close"
      >
        <X className="w-8 h-8" weight="bold" />
      </button>

      <div
        className="relative w-full max-w-4xl aspect-video rounded-2xl overflow-hidden bg-black"
        onClick={(e) => e.stopPropagation()}
      >
        <iframe
          src={embedUrl}
          title={title}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}

type GalleryGridProps = {
  items: GalleryItem[];
  onImageClick: (item: GalleryItem) => void;
  onVideoClick: (item: GalleryItem) => void;
};

export function GalleryGrid({ items, onImageClick, onVideoClick }: GalleryGridProps) {
  if (items.length === 0) {
    return (
      <p className="text-center text-gray-500 py-16">No gallery items found.</p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((item, i) => (
        <button
          key={item.id}
          type="button"
          onClick={() => (item.mediaType === "video" ? onVideoClick(item) : onImageClick(item))}
          className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 animate-reveal text-left transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(10,36,99,0.1)]"
          style={{ animationDelay: `${i * 50}ms` }}
        >
          {item.mediaType === "video" ? (
            <>
              <div className="absolute inset-0 bg-navy/60 z-10 flex items-center justify-center">
                <PlayCircle className="w-16 h-16 text-white group-hover:scale-110 transition-transform" weight="fill" />
              </div>
              {item.thumbnailUrl && (
                <Image
                  src={item.thumbnailUrl}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 25vw"
                />
              )}
            </>
          ) : (
            <Image
              src={item.thumbnailUrl || item.url}
              alt={item.altText || item.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, 25vw"
            />
          )}
          <div className="absolute inset-x-0 bottom-0 bg-[#0A2463]/90 p-4 z-20 transition-colors duration-300 group-hover:bg-[#0A2463]">
            {item.title && (
              <p className="text-white text-sm font-semibold line-clamp-1" style={{ fontFamily: "'Outfit', system-ui, sans-serif" }}>{item.title}</p>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}

import Link from "next/link";
import { CaretLeft, CaretRight } from "@phosphor-icons/react/dist/ssr";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
};

export default function Pagination({ currentPage, totalPages, baseUrl }: PaginationProps) {
  if (totalPages <= 1) return null;

  const createUrl = (page: number) => {
    // Strip existing page param if any
    const cleanUrl = baseUrl.replace(/([?&])page=\d+/, "$1").replace(/[?&]$/, "");
    const finalSeparator = cleanUrl.includes("?") ? "&" : "?";
    return `${cleanUrl}${finalSeparator}page=${page}`;
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-12">
      <Link
        href={createUrl(currentPage - 1)}
        aria-label="Previous page"
        className={`w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 transition-colors ${
          currentPage <= 1
            ? "pointer-events-none opacity-50 bg-gray-50 text-gray-400"
            : "bg-white text-navy hover:bg-cyan hover:text-white hover:border-cyan"
        }`}
      >
        <CaretLeft weight="bold" />
      </Link>

      <span className="text-sm font-medium text-gray-500 px-4">
        Page {currentPage} of {totalPages}
      </span>

      <Link
        href={createUrl(currentPage + 1)}
        aria-label="Next page"
        className={`w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 transition-colors ${
          currentPage >= totalPages
            ? "pointer-events-none opacity-50 bg-gray-50 text-gray-400"
            : "bg-white text-navy hover:bg-cyan hover:text-white hover:border-cyan"
        }`}
      >
        <CaretRight weight="bold" />
      </Link>
    </div>
  );
}

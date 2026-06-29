"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { useState } from "react";

type SearchFilterProps = {
  placeholder: string;
  categories?: { id: string; name: string }[];
  allLabel?: string;
};

export default function SearchFilter({ placeholder, categories, allLabel = "All Categories" }: SearchFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentQuery = searchParams.get("q") || "";
  const currentCategory = searchParams.get("category") || "";

  const [search, setSearch] = useState(currentQuery);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (search.trim()) {
      params.set("q", search.trim());
    } else {
      params.delete("q");
    }
    params.delete("page"); // reset to page 1 on new search
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams);
    if (e.target.value) {
      params.set("category", e.target.value);
    } else {
      params.delete("category");
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-12">
      <form onSubmit={handleSearch} className="flex-1 relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-full focus:outline-none focus:border-cyan focus:ring-1 focus:ring-cyan transition-colors"
        />
        <button type="submit" aria-label={placeholder} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-cyan transition-colors">
          <MagnifyingGlass className="w-5 h-5" weight="bold" />
        </button>
      </form>
      
      {categories && categories.length > 0 && (
        <div className="w-full md:w-64">
          <select
            value={currentCategory}
            onChange={handleCategoryChange}
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-full focus:outline-none focus:border-cyan focus:ring-1 focus:ring-cyan transition-colors appearance-none"
          >
            <option value="">{allLabel}</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}

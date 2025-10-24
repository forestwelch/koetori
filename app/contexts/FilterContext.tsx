"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Category } from "../types/memo";

interface FilterContextType {
  filter: "all" | "review" | "archive" | "starred";
  categoryFilter: Category | "all";
  sizeFilter: "S" | "M" | "L" | "all";
  setFilter: (filter: "all" | "review" | "archive" | "starred") => void;
  setCategoryFilter: (category: Category | "all") => void;
  setSizeFilter: (size: "S" | "M" | "L" | "all") => void;
  resetFilters: () => void;
  isSpotlightMode: boolean;
  setIsSpotlightMode: (mode: boolean) => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize filters from URL params
  const [filter, setFilterState] = useState<
    "all" | "review" | "archive" | "starred"
  >(
    (searchParams.get("view") as "all" | "review" | "archive" | "starred") ||
      "all"
  );
  const [categoryFilter, setCategoryFilterState] = useState<Category | "all">(
    (searchParams.get("type") as Category | "all") || "all"
  );
  const [sizeFilter, setSizeFilterState] = useState<"S" | "M" | "L" | "all">(
    (searchParams.get("size") as "S" | "M" | "L" | "all") || "all"
  );
  const [isSpotlightMode, setIsSpotlightMode] = useState(false);

  // Update URL when filters change
  const updateURL = useCallback(
    (view: string, type: string, size: string) => {
      const params = new URLSearchParams();
      if (view !== "all") params.set("view", view);
      if (type !== "all") params.set("type", type);
      if (size !== "all") params.set("size", size);

      const query = params.toString();
      router.push(query ? `?${query}` : "/", { scroll: false });
    },
    [router]
  );

  // Wrapper functions that update both state and URL
  const setFilter = useCallback(
    (newFilter: "all" | "review" | "archive" | "starred") => {
      setFilterState(newFilter);
      updateURL(newFilter, categoryFilter, sizeFilter);
    },
    [categoryFilter, sizeFilter, updateURL]
  );

  const setCategoryFilter = useCallback(
    (newCategory: Category | "all") => {
      setCategoryFilterState(newCategory);
      updateURL(filter, newCategory, sizeFilter);
    },
    [filter, sizeFilter, updateURL]
  );

  const setSizeFilter = useCallback(
    (newSize: "S" | "M" | "L" | "all") => {
      setSizeFilterState(newSize);
      updateURL(filter, categoryFilter, newSize);
    },
    [filter, categoryFilter, updateURL]
  );

  const resetFilters = useCallback(() => {
    setFilterState("all");
    setCategoryFilterState("all");
    setSizeFilterState("all");
    updateURL("all", "all", "all");
  }, [updateURL]);

  // Sync with URL changes (e.g., browser back/forward)
  useEffect(() => {
    const view = searchParams.get("view") || "all";
    const type = searchParams.get("type") || "all";
    const size = searchParams.get("size") || "all";

    setFilterState(view as "all" | "review" | "archive" | "starred");
    setCategoryFilterState(type as Category | "all");
    setSizeFilterState(size as "S" | "M" | "L" | "all");
  }, [searchParams]);

  return (
    <FilterContext.Provider
      value={{
        filter,
        categoryFilter,
        sizeFilter,
        setFilter,
        setCategoryFilter,
        setSizeFilter,
        resetFilters,
        isSpotlightMode,
        setIsSpotlightMode,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error("useFilters must be used within a FilterProvider");
  }
  return context;
}

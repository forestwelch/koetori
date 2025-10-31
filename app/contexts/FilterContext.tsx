"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
  Suspense,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Category } from "../types/memo";

interface FilterContextType {
  categoryFilter: Category | "all";
  sizeFilter: "all" | "S" | "M" | "L";
  starredOnly: boolean;
  setCategoryFilter: (category: Category | "all") => void;
  setSizeFilter: (size: "all" | "S" | "M" | "L") => void;
  setStarredOnly: (starred: boolean) => void;
  resetFilters: () => void;
  isSpotlightMode: boolean;
  setIsSpotlightMode: (mode: boolean) => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

function FilterProviderInner({ children }: { children: ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize filters from URL params
  const [categoryFilter, setCategoryFilterState] = useState<Category | "all">(
    (searchParams.get("category") as Category | "all") || "all"
  );
  const [sizeFilter, setSizeFilterState] = useState<"all" | "S" | "M" | "L">(
    (searchParams.get("size") as "all" | "S" | "M" | "L") || "all"
  );
  const [starredOnly, setStarredOnlyState] = useState<boolean>(
    searchParams.get("starred") === "true"
  );
  const [isSpotlightMode, setIsSpotlightMode] = useState(false);

  // Update URL when filters change
  const updateURL = useCallback(
    (category: string, size: string, starred: boolean) => {
      const params = new URLSearchParams();
      if (category !== "all") params.set("category", category);
      if (size !== "all") params.set("size", size);
      if (starred) params.set("starred", "true");

      const query = params.toString();
      router.push(query ? `?${query}` : "/", { scroll: false });
    },
    [router]
  );

  // Wrapper functions that update both state and URL
  const setCategoryFilter = useCallback(
    (newCategory: Category | "all") => {
      setCategoryFilterState(newCategory);
      updateURL(newCategory, sizeFilter, starredOnly);
    },
    [sizeFilter, starredOnly, updateURL]
  );

  const setSizeFilter = useCallback(
    (size: "all" | "S" | "M" | "L") => {
      setSizeFilterState(size);
      updateURL(categoryFilter, size, starredOnly);
    },
    [categoryFilter, starredOnly, updateURL]
  );

  const setStarredOnly = useCallback(
    (starred: boolean) => {
      setStarredOnlyState(starred);
      updateURL(categoryFilter, sizeFilter, starred);
    },
    [categoryFilter, sizeFilter, updateURL]
  );

  const resetFilters = useCallback(() => {
    setCategoryFilterState("all");
    setSizeFilterState("all");
    setStarredOnlyState(false);
    updateURL("all", "all", false);
  }, [updateURL]);

  // Sync with URL changes (e.g., browser back/forward)
  useEffect(() => {
    const category = searchParams.get("category") || "all";
    const size = searchParams.get("size") || "all";
    const starred = searchParams.get("starred") === "true";

    setCategoryFilterState(category as Category | "all");
    setSizeFilterState(size as "all" | "S" | "M" | "L");
    setStarredOnlyState(starred);
  }, [searchParams]);

  return (
    <FilterContext.Provider
      value={{
        categoryFilter,
        sizeFilter,
        starredOnly,
        setCategoryFilter,
        setSizeFilter,
        setStarredOnly,
        resetFilters,
        isSpotlightMode,
        setIsSpotlightMode,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
}

export function FilterProvider({ children }: { children: ReactNode }) {
  return (
    // NextJS 15 requirement: useSearchParams must be wrapped in a Suspency boundary
    <Suspense fallback={null}>
      <FilterProviderInner>{children}</FilterProviderInner>
    </Suspense>
  );
}

export function useFilters() {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error("useFilters must be used within a FilterProvider");
  }
  return context;
}

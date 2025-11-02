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
  starredOnly: boolean;
  setCategoryFilter: (category: Category | "all") => void;
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
  const [starredOnly, setStarredOnlyState] = useState<boolean>(
    searchParams.get("starred") === "true"
  );
  const [isSpotlightMode, setIsSpotlightMode] = useState(false);

  // Update URL when filters change - preserve current path
  const updateURL = useCallback(
    (category: string, starred: boolean) => {
      const params = new URLSearchParams();
      if (category !== "all") params.set("category", category);
      if (starred) params.set("starred", "true");

      const query = params.toString();
      const pathname = window.location.pathname;
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [router]
  );

  // Wrapper functions that update both state and URL
  const setCategoryFilter = useCallback(
    (newCategory: Category | "all") => {
      setCategoryFilterState(newCategory);
      updateURL(newCategory, starredOnly);
    },
    [starredOnly, updateURL]
  );

  const setStarredOnly = useCallback(
    (starred: boolean) => {
      setStarredOnlyState(starred);
      updateURL(categoryFilter, starred);
    },
    [categoryFilter, updateURL]
  );

  const resetFilters = useCallback(() => {
    setCategoryFilterState("all");
    setStarredOnlyState(false);
    updateURL("all", false);
  }, [updateURL]);

  // Sync with URL changes (e.g., browser back/forward)
  useEffect(() => {
    const category = searchParams.get("category") || "all";
    const starred = searchParams.get("starred") === "true";

    setCategoryFilterState(category as Category | "all");
    setStarredOnlyState(starred);
  }, [searchParams]);

  return (
    <FilterContext.Provider
      value={{
        categoryFilter,
        starredOnly,
        setCategoryFilter,
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

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { MediaItem } from "../../types/enrichment";
import { Film, Tv, Gamepad2, BookOpen, Music4, Loader2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Image from "next/image";

const MEDIA_TYPES: Array<{
  value: MediaItem["mediaType"];
  label: string;
  icon: LucideIcon;
}> = [
  { value: "movie", label: "Movie", icon: Film },
  { value: "tv", label: "TV Show", icon: Tv },
  { value: "game", label: "Game", icon: Gamepad2 },
  { value: "book", label: "Book", icon: BookOpen },
  { value: "music", label: "Music", icon: Music4 },
];

interface FixMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: MediaItem;
  onSubmit: (data: {
    title: string;
    year: number | null;
    mediaType: MediaItem["mediaType"] | undefined;
  }) => Promise<void>;
  isProcessing: boolean;
}

interface TmdbSearchResult {
  id: number;
  title: string;
  releaseYear: number | null;
  mediaType: "movie" | "tv";
  posterUrl: string | null;
  popularity: number;
}

export function FixMatchModal({
  isOpen,
  onClose,
  item,
  onSubmit,
  isProcessing,
}: FixMatchModalProps) {
  const [title, setTitle] = useState("");
  const [year, setYear] = useState<string>("");
  const [mediaType, setMediaType] = useState<
    MediaItem["mediaType"] | undefined
  >(item.mediaType ?? undefined);
  const [searchResults, setSearchResults] = useState<TmdbSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      const defaultTitle = item.customTitle ?? item.autoTitle ?? item.title;
      const defaultYear =
        item.customReleaseYear ?? item.autoReleaseYear ?? item.releaseYear;
      setTitle(defaultTitle);
      setYear(defaultYear ? String(defaultYear) : "");
      setMediaType(item.mediaType ?? undefined);
      setSearchResults([]);
      setShowDropdown(false);
      setSelectedIndex(-1);
    }
  }, [isOpen, item]);

  // Search TMDb when title changes
  const searchTmdb = useCallback(
    async (query: string, searchYear?: string) => {
      if (!query.trim() || query.length < 2) {
        setSearchResults([]);
        setShowDropdown(false);
        return;
      }

      setIsSearching(true);
      try {
        const params = new URLSearchParams({
          q: query.trim(),
        });
        if (searchYear) {
          params.set("year", searchYear);
        }
        if (mediaType === "movie" || mediaType === "tv") {
          params.set("type", mediaType);
        }

        const response = await fetch(`/api/enrichment/search-tmdb?${params}`);
        if (!response.ok) {
          throw new Error("Search failed");
        }

        const data = await response.json();
        setSearchResults(data.results || []);
        setShowDropdown(data.results && data.results.length > 0);
        setSelectedIndex(-1);
      } catch (error) {
        console.error("Error searching TMDb:", error);
        setSearchResults([]);
        setShowDropdown(false);
      } finally {
        setIsSearching(false);
      }
    },
    [mediaType]
  );

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (title.trim().length >= 2) {
        searchTmdb(title, year || undefined);
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [title, year, searchTmdb]);

  const handleSelectResult = (result: TmdbSearchResult) => {
    setTitle(result.title);
    setYear(result.releaseYear ? String(result.releaseYear) : "");
    setMediaType(result.mediaType);
    setShowDropdown(false);
    setSearchResults([]);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || searchResults.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < searchResults.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      handleSelectResult(searchResults[selectedIndex]);
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  const handleSubmit = async () => {
    const yearNum = year.trim() ? Number.parseInt(year.trim(), 10) : null;
    if (Number.isNaN(yearNum)) {
      return;
    }
    await onSubmit({
      title: title.trim(),
      year: yearNum,
      mediaType,
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Fix Match" size="sm">
      <div className="space-y-4">
        <div className="relative">
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Title
          </label>
          <div className="relative">
            <Input
              ref={inputRef}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => {
                if (searchResults.length > 0) {
                  setShowDropdown(true);
                }
              }}
              onBlur={() => {
                // Delay to allow click on dropdown item
                setTimeout(() => setShowDropdown(false), 200);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Game/Movie/Show title"
              className="w-full"
              autoFocus
              type="text"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
              </div>
            )}
          </div>

          {/* Search Results Dropdown */}
          {showDropdown && searchResults.length > 0 && (
            <div
              ref={dropdownRef}
              className="absolute z-50 mt-1 w-full rounded-lg border border-slate-700/50 bg-slate-900/95 backdrop-blur-xl shadow-xl max-h-64 overflow-y-auto"
            >
              {searchResults.map((result, index) => (
                <button
                  key={result.id}
                  type="button"
                  onClick={() => handleSelectResult(result)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-800/50 transition
                    ${index === selectedIndex ? "bg-slate-800/50" : ""}
                    ${index === 0 ? "rounded-t-lg" : ""}
                    ${index === searchResults.length - 1 ? "rounded-b-lg" : ""}
                  `}
                >
                  {result.posterUrl ? (
                    <Image
                      src={result.posterUrl}
                      alt=""
                      width={40}
                      height={60}
                      className="rounded object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-[60px] bg-slate-700/50 rounded flex items-center justify-center flex-shrink-0">
                      <Film className="h-5 w-5 text-slate-500" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-200 truncate">
                      {result.title}
                    </div>
                    <div className="text-xs text-slate-400">
                      {result.mediaType === "movie" ? "Movie" : "TV Show"}
                      {result.releaseYear && ` • ${result.releaseYear}`}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Release Year (optional)
          </label>
          <Input
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="2024"
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Media Type
          </label>
          <div className="grid grid-cols-5 gap-2">
            {MEDIA_TYPES.map((type) => {
              const Icon = type.icon;
              const isSelected = mediaType === type.value;
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setMediaType(type.value)}
                  className={`
                    flex flex-col items-center gap-1.5 p-3 rounded-lg border transition
                    ${
                      isSelected
                        ? "border-indigo-500/60 bg-indigo-500/20 text-white"
                        : "border-slate-700/40 bg-slate-900/40 text-slate-300 hover:border-slate-600/50 hover:text-white"
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[10px] font-medium">{type.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            onClick={handleSubmit}
            disabled={!title.trim() || isProcessing}
            variant="primary"
            className="flex-1"
            isLoading={isProcessing}
          >
            Update
          </Button>
          <Button onClick={onClose} variant="secondary">
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}

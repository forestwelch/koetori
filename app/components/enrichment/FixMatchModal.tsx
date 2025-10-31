"use client";

import { useState, useEffect } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { MediaItem } from "../../types/enrichment";
import { Film, Tv, Gamepad2, BookOpen, Music4 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

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

  useEffect(() => {
    if (isOpen) {
      const defaultTitle = item.customTitle ?? item.autoTitle ?? item.title;
      const defaultYear =
        item.customReleaseYear ?? item.autoReleaseYear ?? item.releaseYear;
      setTitle(defaultTitle);
      setYear(defaultYear ? String(defaultYear) : "");
      setMediaType(item.mediaType ?? undefined);
    }
  }, [isOpen, item]);

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
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Title
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Game/Movie/Show title"
            className="w-full"
            autoFocus
            type="text"
          />
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

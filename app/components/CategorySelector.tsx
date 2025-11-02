"use client";

import { Category } from "../types/memo";
import { getCategoryIcon, getCategoryIconColor } from "../lib/ui-utils";
import { CategoryBadge } from "./CategoryBadge";
import {
  Button,
  ListBox,
  ListBoxItem,
  Popover,
  Select,
} from "react-aria-components";

interface CategorySelectorProps {
  currentCategory: Category;
  memoId: string;
  onCategoryChange: (
    memoId: string,
    newCategory: Category,
    oldCategory: Category
  ) => void;
}

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "media", label: "Media" },
  { value: "event", label: "Event" },
  { value: "journal", label: "Journal" },
  { value: "tarot", label: "Tarot" },
  { value: "todo", label: "To Do" },
  { value: "idea", label: "Idea" },
  { value: "to buy", label: "To Buy" },
  { value: "other", label: "Other" },
];

export function CategorySelector({
  currentCategory,
  memoId,
  onCategoryChange,
}: CategorySelectorProps) {
  const handleSelectionChange = (key: React.Key | null) => {
    if (!key) return;
    const newCategory = key as Category;
    if (newCategory !== currentCategory) {
      onCategoryChange(memoId, newCategory, currentCategory);
    }
  };

  return (
    <Select
      selectedKey={currentCategory}
      onSelectionChange={handleSelectionChange}
      aria-label="Category"
    >
      <Button className="outline-none focus:ring-2 focus:ring-indigo-500/50">
        <CategoryBadge
          category={currentCategory}
          className="hover:opacity-80 transition-opacity cursor-pointer"
        />
      </Button>

      <Popover
        className="bg-[#0d0e14]/98 backdrop-blur-xl border border-slate-700/40 rounded-xl shadow-2xl overflow-hidden entering:animate-in entering:fade-in entering:zoom-in-95 exiting:animate-out exiting:fade-out exiting:zoom-out-95"
        offset={8}
      >
        <ListBox className="outline-none py-1 max-h-[60vh] overflow-y-auto">
          {CATEGORIES.map((cat) => (
            <ListBoxItem
              key={cat.value}
              id={cat.value}
              textValue={cat.label}
              className="px-3 py-2 flex items-center gap-2.5 outline-none cursor-pointer text-slate-300 hover:bg-slate-700/30 focus:bg-slate-700/40 selected:bg-slate-700/40 selected:text-white transition-colors"
            >
              {(() => {
                const IconComponent = getCategoryIcon(cat.value);
                return (
                  <IconComponent
                    className={`h-4 w-4 ${getCategoryIconColor(cat.value)}`}
                    aria-hidden="true"
                  />
                );
              })()}
              <span className="text-sm font-medium">{cat.label}</span>
            </ListBoxItem>
          ))}
        </ListBox>
      </Popover>
    </Select>
  );
}

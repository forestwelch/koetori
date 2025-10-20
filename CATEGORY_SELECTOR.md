# 🏷️ Interactive Category Selector with AI Feedback

## Overview

The category selector allows users to correct AI categorization mistakes, which helps improve the model over time through feedback tracking.

## Features

### ✅ What's Included

1. **Interactive Dropdown Menu**
   - Click category badge to open selector
   - Animated slide-in with smooth transitions
   - Visual feedback with checkmark on current category
   - Click outside to close

2. **9 Categories**
   - 🎬 Media (movies, books, shows, podcasts)
   - 📅 Event (meetings, plans, calendar)
   - 📔 Journal (personal reflections)
   - 💭 Therapy (mental health insights)
   - 🔮 Tarot (card readings)
   - ✓ To Do (tasks, action items)
   - 💡 Idea (creative concepts)
   - 🛒 To Buy (shopping, purchases) **NEW!**
   - 📝 Other (uncategorized)

3. **Feedback Mechanism**
   - Logs category corrections (from/to)
   - Tracks which predictions were wrong
   - Console logs for debugging (see browser console)
   - Optional database table for analytics

## User Flow

```
1. User records memo: "Buy milk and eggs"
2. AI categorizes as "todo" (generic task)
3. User clicks category badge → dropdown opens
4. User selects "to buy" instead
5. Category updates in database
6. Feedback logged: todo → to buy
7. (Future) AI learns from this correction
```

## Technical Implementation

### Components

**`CategorySelector.tsx`**

- Dropdown menu component
- Handles click-outside-to-close
- Animates chevron icon
- Shows descriptions for each category

**`MemoHeader.tsx`**

- Conditionally renders CategorySelector vs static badge
- Passes onCategoryChange callback

**`MemoItem.tsx`**

- Receives onCategoryChange prop
- Forwards to MemoHeader

**`page.tsx`**

- Implements handleCategoryChange handler
- Updates database
- Logs feedback data

### Database

**Memos Table**

```sql
category TEXT -- updated when user changes
```

**Category Feedback Table** (optional)

```sql
CREATE TABLE category_feedback (
  id UUID PRIMARY KEY,
  memo_id UUID REFERENCES memos(id),
  transcript TEXT,
  original_category TEXT,
  corrected_category TEXT,
  confidence NUMERIC,
  created_at TIMESTAMPTZ
);
```

Run migration:

```bash
supabase db push
# or manually run:
# supabase/migrations/20241019000001_add_category_feedback.sql
```

## AI Improvement Loop

### Current: Logging Only

```javascript
console.log("Category feedback:", {
  memoId,
  from: oldCategory,
  to: newCategory,
  timestamp: new Date().toISOString(),
});
```

### Future: Database Tracking

Uncomment in `page.tsx`:

```typescript
// Store in database for analysis
await supabase.from("category_feedback").insert({
  memo_id: memoId,
  transcript: memo.transcript,
  original_category: oldCategory,
  corrected_category: newCategory,
  confidence: memo.confidence,
});
```

### Long-term: Model Fine-tuning

1. **Collect Corrections** (3-6 months)
   - Gather 100+ category corrections
   - Identify patterns (e.g., "buy X" often mis-categorized)

2. **Analyze Patterns**

   ```sql
   SELECT
     original_category,
     corrected_category,
     COUNT(*) as correction_count
   FROM category_feedback
   GROUP BY original_category, corrected_category
   ORDER BY correction_count DESC;
   ```

3. **Update Prompt**
   - Add specific examples from corrections
   - Adjust category descriptions
   - Add keywords that trigger corrections

4. **Fine-tune Model** (advanced)
   - Export feedback as training data
   - Fine-tune Groq/OpenAI model
   - Deploy improved version

## Customization

### Add New Category

1. **Update Type**

   ```typescript
   // app/types/memo.ts
   export type Category =
     | "media" | "event" | ...
     | "your-new-category";
   ```

2. **Add Colors/Icons**

   ```typescript
   // app/lib/ui-utils.ts
   const colors = {
     "your-new-category": "bg-color-500/10 text-color-300 ...",
   };
   const icons = {
     "your-new-category": "🎨",
   };
   ```

3. **Update Prompt**

   ```typescript
   // app/lib/categorization.ts
   CATEGORIES:
   - your-new-category: Description here
   ```

4. **Add to Selector**
   ```typescript
   // app/components/CategorySelector.tsx
   const CATEGORIES = [
     { value: "your-new-category", label: "Your Category", description: "..." },
   ];
   ```

### Change Colors

Each category has 3 color definitions in `ui-utils.ts`:

- `getCategoryColor`: badge background/text/border
- `getCategoryGradient`: glow effect
- `getCategoryIcon`: emoji icon

Example:

```typescript
"to buy": "bg-emerald-500/10 text-emerald-300 border-emerald-500/40"
"to buy": "from-emerald-500/50 to-teal-500/50"
"to buy": "🛒"
```

## Accessibility

- ✅ Keyboard navigation (tab to badge, enter to open)
- ✅ Click outside to close
- ✅ Visual feedback (hover states, checkmarks)
- ✅ Descriptive labels for each category
- ✅ Smooth animations (fade-in, slide-in)

## Mobile Experience

- Touch-friendly dropdown
- Large touch targets (44px+ buttons)
- Smooth animations
- Auto-closes after selection
- Works alongside swipe gestures (doesn't conflict)

## Future Enhancements

1. **Smart Suggestions**
   - "Did you mean 'to buy'?" when user says "shopping"
   - Auto-correct common mistakes

2. **Confidence Indicator**
   - Show AI confidence when offering corrections
   - "AI is 45% confident - please review"

3. **Bulk Recategorize**
   - Select multiple memos
   - Change category for all at once

4. **Category Analytics**
   - Dashboard showing category distribution
   - Most-corrected categories
   - AI accuracy over time

5. **Custom Categories**
   - Let users create their own categories
   - Personal tags/labels

## Testing

```bash
# Run type check
npm run build

# Check for errors
# (Should compile without TypeScript errors)
```

### Manual Test Checklist

- [ ] Click category badge → dropdown opens
- [ ] Select different category → updates immediately
- [ ] Click outside → dropdown closes
- [ ] Check browser console → see feedback log
- [ ] Category persists after page reload
- [ ] All 9 categories display correctly
- [ ] Icons and colors match category
- [ ] Animations are smooth
- [ ] Works on mobile (touch)
- [ ] Doesn't interfere with swipe gestures

## Troubleshooting

**Dropdown doesn't open**

- Check z-index (should be z-50)
- Verify click handler attached
- Check console for errors

**Category doesn't update**

- Check database connection
- Verify Supabase permissions
- Check network tab for failed requests

**Feedback not logging**

- Check browser console
- Verify handleCategoryChange is called
- Check console.log output

## API Reference

### Props

**CategorySelector**

```typescript
interface CategorySelectorProps {
  currentCategory: Category;
  memoId: string;
  onCategoryChange: (
    memoId: string,
    newCategory: Category,
    oldCategory: Category
  ) => void;
}
```

**MemoHeader**

```typescript
interface MemoHeaderProps {
  memo: Memo;
  onCategoryChange?: (
    memoId: string,
    newCategory: Category,
    oldCategory: Category
  ) => void;
}
```

### Functions

**handleCategoryChange**

```typescript
const handleCategoryChange = async (
  memoId: string,
  newCategory: Category,
  oldCategory: Category
) => {
  // Updates memo.category in database
  // Logs feedback data
  // Reloads memos
};
```

---

## Summary

✨ **New "to buy" category** for shopping lists
🎯 **Interactive dropdown** for correcting categories
📊 **Feedback tracking** to improve AI over time
🎨 **9 total categories** with distinct colors/icons
🚀 **Fully implemented** and ready to use!

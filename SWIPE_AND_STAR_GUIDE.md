# Swipe & Star Feature Guide

## Overview

This guide covers the new swipe gestures, starred memos, and archive features added to Koetori.

## New Features

### 1. **Starred Memos** ⭐

- **Purpose**: Mark important/urgent memos for quick access
- **How to Star**:
  - 📱 **Swipe right** on a memo (mobile/touch)
  - 🖱️ **Hover and click star button** (desktop)
- **Auto-Star**: AI automatically stars memos when you say:
  - "This is important"
  - "Top priority"
  - "Urgent"
  - "Don't forget"
  - "Remember this"
  - "ASAP"
  - Or express high urgency/stress

### 2. **Swipe Gestures** 📱

- **Swipe Left** (← 100px): Archive memo (moves to archive)
- **Swipe Right** (→ 100px): Toggle star on/off
- **Visual Feedback**: See ⭐ or 📦 icons while swiping
- **Works on**: Touch devices (mobile, tablets)

### 3. **Archive** (formerly "Trash") 📦

- **What Changed**: "Trash" → "Archive" with grey theme
- **Why**: Less aggressive, more like "set aside for later"
- **Actions in Archive**:
  - ↻ **Restore**: Bring memo back to active list
  - ✕ **Delete Forever**: Permanent deletion (with confirmation)

### 4. **Filter System**

- **All Memos**: See everything active
- **⭐ Starred**: Only starred/priority items
- **Needs Review**: Low-confidence categorizations
- **Archive**: Archived memos

### 5. **Accessibility Improvements**

- **Spacebar Recording**: Now works even when focused on elements
- **Text Selection**: Can select/copy text from memos (adds `select-text` class)
- **User-Select None**: Applied globally for sleeker feel, but overridden for text content

## Database Migration

Run this to add the `starred` column:

```bash
supabase db push --file supabase/add_starred.sql
```

Or manually:

```sql
ALTER TABLE memos ADD COLUMN IF NOT EXISTS starred BOOLEAN DEFAULT FALSE;
CREATE INDEX IF NOT EXISTS idx_memos_starred ON memos(starred) WHERE starred = TRUE AND deleted_at IS NULL;
```

## AI Categorization Updates

The AI now detects:

- **Urgency keywords**: important, urgent, priority, critical, star, top priority, asap, remember, don't forget
- **Stress indicators**: Expressions of high urgency or time pressure
- **Time-sensitive tasks**: Deadlines and urgent action items
- **Explicit requests**: "Star this for me"

## UI/UX Changes

1. **Badge Opacity**: Reduced for darker, sleeker look (active: /30, inactive: /20)
2. **Archive Button**: Grey instead of red
3. **Star Indicator**: Shows ⭐ in top-left corner of starred memos
4. **Swipe Indicators**: Shows emoji while swiping
5. **Select None**: Global `select-none` with `select-text` on content

## Component Architecture

- **MemoItem**: New standalone component with swipe logic
- **Touch Handlers**: `handleTouchStart`, `handleTouchMove`, `handleTouchEnd`
- **Transform Animation**: Smooth CSS transitions for swipe feedback

## Future Enhancements

- [ ] Desktop keyboard shortcuts for starring (e.g., `S` key)
- [ ] Bulk star/unstar operations
- [ ] Sort by starred + timestamp
- [ ] Star notification/badge count

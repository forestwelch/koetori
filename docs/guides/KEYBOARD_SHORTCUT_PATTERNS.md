# Keyboard Shortcut Design Patterns

## Common Patterns Used by Major Apps

### 1. **Right-Aligned Inline** (What we're using)

**Used by:** GitHub, Linear, VSCode, Notion, Raycast

```
[Button Label         ⌘S]
```

**Pros:**

- Always visible
- Clean alignment
- Educates users constantly
- Works on mobile/desktop

**Cons:**

- Takes up space
- Can feel cluttered with many shortcuts

**Implementation:**

```tsx
<Button>
  <span>Starred</span>
  <kbd className="ml-auto text-[10px] opacity-50">⌘S</kbd>
</Button>
```

---

### 2. **Tooltip on Hover**

**Used by:** Gmail, Slack, Discord

```
[Button Label]  → (hover) → [Tooltip: ⌘S]
```

**Pros:**

- Cleaner UI
- No visual clutter
- Shortcuts only when needed

**Cons:**

- Not discoverable (requires hover)
- Doesn't work on mobile touch
- Hidden until interaction

---

### 3. **Floating Badge (Bottom Right)**

**Used by:** Superhuman, Hey

```
[Button Label]
           ⌘S  ← small badge, bottom-right corner
```

**Pros:**

- Subtle but visible
- Doesn't affect layout
- Looks modern

**Cons:**

- Can overlap with other elements
- Harder to implement
- May not work well on small buttons

---

### 4. **Separate Legend/Cheatsheet**

**Used by:** Vim, Emacs, older apps

```
[Buttons without shortcuts]

Footer:
⌘S - Starred | ⌘R - Review | ⌘P - Command Palette
```

**Pros:**

- Clean button UI
- All shortcuts in one place
- Easy to reference

**Cons:**

- Not contextual
- User has to look elsewhere
- Takes up screen space

---

### 5. **Hybrid: Inline + Command Palette**

**Used by:** VSCode, Raycast (and what we're doing!)

```
Direct usage: [Button Label  ⌘S]
Quick access: ⌘P opens palette with all shortcuts
```

**Pros:**

- Best of both worlds
- Inline for main actions
- Palette for discovery
- Progressive disclosure

**Cons:**

- Most complex to implement
- Need to maintain both

---

## Recommendations

### Current Implementation (Right-Aligned Inline)

**What we did:**

```tsx
// Very subtle, small, low opacity
<kbd className="ml-auto text-[10px] opacity-50 font-mono">⌘S</kbd>
```

**Why it works:**

1. **Opacity 50%** - Doesn't dominate visually
2. **10px font** - Tiny, doesn't take space
3. **ml-auto** - Pushes to right, organized
4. **font-mono** - Looks like keyboard key

### Alternative Approaches You Could Try:

#### A. **Even More Subtle** (Hover Only on Desktop)

```tsx
<kbd className="ml-auto text-[10px] opacity-30 sm:opacity-0 sm:group-hover:opacity-50 font-mono">
  ⌘S
</kbd>
```

- Always visible on mobile (opacity-30)
- Hidden on desktop until hover

#### B. **Icon Instead of Text**

```tsx
<kbd className="ml-auto text-[9px] opacity-40">⌘</kbd>
```

- Just show ⌘ symbol
- Even less space

#### C. **Remove from Some Buttons**

- Keep shortcuts on important actions (Starred, Review)
- Remove from less-used (Archive)
- Keep "⌘P" hint on one button only

---

## What the Pros Do

**Linear** - Right-aligned, always visible, 11px, opacity 60%
**Notion** - Right-aligned, always visible, 12px, opacity 70%  
**VSCode** - Right-aligned in menus, tooltips in toolbar
**Raycast** - Right-aligned in palette only, not on buttons
**GitHub** - Tooltips on hover only

## Our Current Choice: **Linear/Notion Style**

We're following **Linear** and **Notion**'s pattern because:

1. Your app is keyboard-first (like theirs)
2. Users need to learn shortcuts quickly
3. Works on mobile (touch) and desktop
4. Industry-proven pattern

The key is making them **subtle enough** that they don't hurt aesthetics but **visible enough** to educate users.

---

## My Recommendation

**Current implementation is good!** But if it feels too busy:

1. **Option A**: Only show on hover (desktop), always show (mobile)
2. **Option B**: Only show ⌘P once as a hint, remove from other buttons
3. **Option C**: Reduce opacity even more (30% instead of 50%)

Try it out and see what feels right! The beauty of web is you can iterate quickly.

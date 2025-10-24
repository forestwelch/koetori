# Mobile Optimization Guide

## Design Philosophy

### What We Did

**Hide Keyboard Shortcuts on Mobile**

- All `<kbd>` elements have `hidden sm:inline` classes
- Only visible on screens ≥640px (tablets/desktops)
- Keeps mobile UI clean and focused

**Why:** Touch users don't have keyboards - showing shortcuts wastes precious screen space and adds visual clutter.

---

## Mobile Best Practices We Followed

### 1. **Progressive Disclosure**

```tsx
// Desktop: Show keyboard shortcuts
<kbd className="hidden sm:inline">⌘S</kbd>

// Mobile: Hide them completely
```

**Principle:** Show only what's relevant to the input method.

### 2. **Touch-First Design**

- Filter pills are large enough (py-1.5 = 6px + text height)
- Horizontal scroll for categories (thumb-friendly)
- No hover states needed (uses active states instead)

### 3. **Responsive Spacing**

```tsx
// Different padding for mobile vs desktop
className = "p-3 sm:p-4 md:p-8";

// Negative margins for edge-to-edge scroll on mobile
className = "-mx-3 px-3 sm:mx-0 sm:px-0";
```

### 4. **Content Footer (Not Floating)**

```tsx
// At bottom of content, not fixed to viewport
<div className="mt-8 pt-6 border-t border-slate-700/30">
```

**Why:**

- Doesn't block content
- Accessible when needed
- Follows natural scroll flow
- Works with any content length

---

## Mobile UI Patterns We Use

### ✅ **Horizontal Scrolling Lists**

```tsx
<div className="flex gap-2 overflow-x-auto scrollbar-hide">
  {/* Pills that scroll horizontally */}
</div>
```

**Benefits:**

- One row = more vertical space for content
- Natural swipe gesture
- Preserves context (see adjacent options)

### ✅ **Stack on Mobile, Row on Desktop**

```tsx
<div className="flex flex-col sm:flex-row gap-3">
  {/* Full width buttons on mobile, side-by-side on desktop */}
</div>
```

### ✅ **Hidden/Visible Toggles**

```tsx
// Hide on mobile
className = "hidden lg:flex";

// Show only on mobile
className = "sm:hidden";

// Show only on desktop
className = "hidden sm:inline";
```

---

## What Makes Good Mobile UX

### Screen Real Estate

- **Mobile:** ~375px × 667px (iPhone SE)
- **Tablet:** ~768px × 1024px (iPad)
- **Desktop:** 1920px+ × 1080px+

### Touch Target Sizes (Apple HIG & Material Design)

- **Minimum:** 44×44px (iOS) or 48×48px (Material)
- **Our pills:** ~40px height (close enough with padding)
- **Horizontal scroll:** Entire pill is tappable

### Information Hierarchy

```
Mobile Priority:
1. Content (memos)
2. Primary actions (filters)
3. Secondary actions (bug report/logout)

Desktop adds:
- Keyboard shortcuts
- More spacing
- Multiple columns possible
```

---

## Common Mobile Patterns

### 1. **Bottom Sheet** (We don't use)

- Slides up from bottom
- Good for: Actions, filters, forms
- Con: Blocks content

### 2. **Floating Action Button (FAB)** (We don't use)

- Fixed button, usually bottom-right
- Good for: Primary action only
- Con: Can block content

### 3. **Sticky Headers** (We use)

- Header stays at top while scrolling
- Good for: Navigation, filters
- Pro: Always accessible

### 4. **Inline Footer** (We use) ✅

- Part of content flow
- Good for: Secondary actions
- Pro: Doesn't block anything

---

## Testing Mobile UI

### Viewport Sizes to Test

```bash
# Mobile
375×667   # iPhone SE
390×844   # iPhone 13
414×896   # iPhone 11 Pro Max

# Tablet
768×1024  # iPad
810×1080  # iPad Air

# Desktop
1920×1080 # Full HD
2560×1440 # 2K
```

### Tailwind Breakpoints

```css
sm:  640px  /* Small tablets, landscape phones */
md:  768px  /* Tablets */
lg:  1024px /* Laptops */
xl:  1280px /* Desktops */
2xl: 1536px /* Large desktops */
```

### Our Approach

- Default styles = Mobile first
- Add `sm:`, `md:`, `lg:` for larger screens
- Use `hidden sm:block` to show on desktop only
- Use `sm:hidden` to show on mobile only

---

## Performance Considerations

### CSS Optimizations

```tsx
// Smooth scrolling with momentum
className = "overflow-x-auto";

// Hide scrollbar for cleaner look
className = "scrollbar-hide";

// Hardware-accelerated transforms
className = "transition-transform";
```

### Minimize Reflows

- Fixed heights where possible
- Flex/grid for layouts (not floats)
- CSS transitions (not JS animations)

### Touch Optimization

```css
/* Prevent text selection on double-tap */
select-none

/* Better tap highlight */
-webkit-tap-highlight-color: transparent

/* Smooth scroll behavior */
scroll-behavior: smooth
```

---

## Accessibility on Mobile

### Screen Readers

```tsx
aria-label="Report a bug"
aria-hidden="true" // For decorative icons
role="button"
```

### Focus Management

- Tab order still matters (keyboard on tablets)
- Large touch targets = easier to tap
- Visible focus states for keyboard users

### Reduced Motion

```tsx
// Respect user's motion preferences
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Our Mobile Strategy Summary

1. ✅ **Hide keyboard shortcuts** on mobile (no value)
2. ✅ **Horizontal scrolling** for categories (saves vertical space)
3. ✅ **Stack buttons vertically** on small screens
4. ✅ **Inline footer** at end of content (not floating)
5. ✅ **Touch-friendly sizes** (44px+ tap targets)
6. ✅ **Mobile-first CSS** (default = mobile, then enhance)
7. ✅ **Smooth animations** for polish
8. ✅ **Safe area support** for notches/home indicators

**Result:** Clean, fast, thumb-friendly mobile experience that doesn't compromise desktop power-user features!

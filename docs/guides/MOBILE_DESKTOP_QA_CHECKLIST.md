# Mobile/Desktop QA Checklist

**Date:** December 2024  
**Status:** In Progress

---

## ✅ Completed Fixes

1. **Toast Positioning** ✅
   - **Issue:** Fixed bottom-right might be cramped on mobile
   - **Fix:** Changed to `left-4 sm:left-auto` so toasts span full width with margins on mobile
   - **Status:** FIXED ✅\*\*

---

## 📱 Mobile Viewport Testing (375px)

### Recording Flow

- [ ] **Record Button** - Tap target is large enough (44px+)
- [ ] **Recording Overlay** - Full screen, accessible close button
- [ ] **Recording Timer** - Visible and readable
- [ ] **Stop Button** - Easy to tap, clear visual state
- [ ] **Error Messages** - Toast notifications appear and are readable

### Modals

- [ ] **Search Modal** (`⌥K` or search button)
  - [ ] Opens full screen on mobile
  - [ ] Can be closed via X button
  - [ ] Can be closed via backdrop tap
  - [ ] ESC key works (on tablets with keyboards)
  - [ ] Content scrolls if long
  - [ ] Search input is focused on open

- [ ] **Text Input Modal** (`⌥T` or type button)
  - [ ] Opens full screen on mobile
  - [ ] Textarea is accessible
  - [ ] Submit button works
  - [ ] Can be closed via X or backdrop

- [ ] **Memo Modal** (clicking a memo)
  - [ ] Opens full screen on mobile
  - [ ] All actions visible (edit, star, delete, etc.)
  - [ ] Category selector works on touch
  - [ ] Size selector works on touch

- [ ] **Settings Modal**
  - [ ] Opens full screen
  - [ ] All options tappable

- [ ] **Feedback Modal**
  - [ ] Opens full screen
  - [ ] Form fields accessible
  - [ ] Image upload works on mobile

### Filters & Navigation

- [ ] **Filter Drawer** (mobile/tablet only)
  - [ ] Opens from bottom slide-up
  - [ ] Backdrop tap closes it
  - [ ] Close button (X) works
  - [ ] Category buttons are tappable (44px+)
  - [ ] Size buttons work
  - [ ] Smooth animation

- [ ] **Quick Filters** (desktop only, hidden on mobile)
  - [ ] Hidden on mobile (`lg:flex`)
  - [ ] Horizontal scroll works if many categories

- [ ] **Star Toggle Button**
  - [ ] Tappable on mobile
  - [ ] Clear active state

- [ ] **Dashboard Link**
  - [ ] Tappable
  - [ ] Navigates correctly

### Action Buttons (Top Right)

- [ ] **Search Button** - Icon visible, label hidden on mobile (`md:inline`)
- [ ] **Type Button** - Icon visible, label hidden on mobile
- [ ] **Random Button** - Icon visible, label hidden on mobile
- [ ] **Record Button** - Always visible, clear state
- [ ] **Settings Button** - Icon only, tappable
- [ ] **Keyboard Shortcuts** - Hidden on mobile (`lg:inline`)

### Toast Notifications

- [ ] **Position** - Bottom, full width on mobile (with margins)
- [ ] **Stacking** - Multiple toasts stack vertically
- [ ] **Close Button** - X button is tappable (44px+)
- [ ] **Auto-dismiss** - Works correctly
- [ ] **Readability** - Text is readable on small screens
- [ ] **Icons** - Visible and clear

### Content Display

- [ ] **Memos List** - Scrollable, no horizontal scroll
- [ ] **Memo Items** - All actions visible
- [ ] **Category Badges** - Readable
- [ ] **Text Wrapping** - No overflow

### Dashboard Page (`/dashboard`)

- [ ] **Media Library** - Cards stack on mobile
- [ ] **Filter Buttons** - Icons only, tappable
- [ ] **Media Cards** - All actions accessible
- [ ] **Reminders Board** - Scrollable, buttons tappable
- [ ] **Shopping List** - Scrollable, readable

---

## 📊 Tablet Viewport Testing (768px)

### Layout

- [ ] **Two-column layouts** - Work correctly where applicable
- [ ] **Filter drawer** - Still available (not desktop yet)
- [ ] **Action buttons** - Show labels (`md:inline`)
- [ ] **Modals** - Still full screen or start to center?

### Touch Interactions

- [ ] **All buttons** - Still tappable (not mouse-optimized yet)
- [ ] **Hover states** - May not work (need active states)

---

## 🖥️ Desktop Viewport Testing (1920px)

### Layout

- [ ] **Max width containers** - Content doesn't stretch too wide
- [ ] **Centered content** - Looks good
- [ ] **Spacing** - Adequate margins/padding

### Modals

- [ ] **Centered** - Modals appear in center (`sm:items-center`)
- [ ] **Max height** - `sm:max-h-[90vh]` prevents overflow
- [ ] **Rounded corners** - `sm:rounded-2xl` applied
- [ ] **Border** - `sm:border` applied

### Keyboard Shortcuts

- [ ] **Visible** - `<kbd>` elements show (`lg:inline`)
- [ ] **All shortcuts work** - Space, ⌥K, ⌥T, ⌥J, etc.
- [ ] **Disabled in inputs** - Space doesn't trigger recording when typing

### Filters

- [ ] **Desktop filters** - Visible (`lg:flex`)
- [ ] **Filter drawer** - Hidden on desktop (`lg:hidden`)
- [ ] **Quick filters** - Show labels and shortcuts

### Hover States

- [ ] **Buttons** - Hover effects work
- [ ] **Action buttons** - Hover states visible

---

## 🎯 Accessibility Checks

### Touch Targets

- [ ] **All interactive elements** - Minimum 44×44px
- [ ] **Close buttons** - Large enough
- [ ] **Action buttons** - Easy to tap

### Focus Management

- [ ] **Modal focus trap** - Focus stays in modal when open
- [ ] **Focus visible** - Keyboard navigation shows focus rings
- [ ] **Tab order** - Logical sequence

### Screen Readers

- [ ] **ARIA labels** - Present on icon-only buttons
- [ ] **Roles** - Correct roles on interactive elements
- [ ] **Live regions** - Toast notifications announce

### Keyboard Navigation

- [ ] **Tab navigation** - Works on all screen sizes
- [ ] **Enter/Space** - Activate buttons
- [ ] **ESC** - Closes modals
- [ ] **Shortcuts** - Work or are gracefully disabled on mobile

---

## 🐛 Known Issues to Fix

### High Priority

1. **Toast close button size** - Check if X button is 44px+ ✅ (Already fixed - button has padding)
2. **Modal close on mobile** - Verify backdrop tap works ✅ (Already implemented)
3. **Keyboard shortcuts on mobile** - Verify hidden ✅ (Already hidden with `lg:inline`)

### Medium Priority

4. **Tablet layout** - May need specific tweaks
5. **Safe area insets** - iOS notches/home indicators
6. **Landscape orientation** - Test rotated views

### Low Priority

7. **Very small screens** - iPhone SE (320px width)
8. **Very large screens** - 4K displays

---

## 📝 Testing Notes

### How to Test

1. **Chrome DevTools** → Toggle device toolbar
2. **Set viewport** to 375×667 (iPhone), 768×1024 (iPad), 1920×1080 (Desktop)
3. **Test each flow** listed above
4. **Check console** for errors

### Test Accounts Needed

- Account with 0 memos (for "No memos" warning)
- Account with memos (for normal flows)
- Account with media enrichments (for dashboard)

---

## ✅ Verification Checklist

Before marking as complete:

- [ ] All mobile flows tested (375px)
- [ ] All tablet flows tested (768px)
- [ ] All desktop flows tested (1920px)
- [ ] No horizontal scrolling on mobile
- [ ] All buttons are tappable (44px+)
- [ ] Modals work on all sizes
- [ ] Toast notifications appear correctly
- [ ] Keyboard shortcuts work on desktop, disabled/hidden on mobile
- [ ] No console errors
- [ ] Accessibility basics covered

---

## 🎉 Ready to Ship?

Once all items are checked ✅, the mobile/desktop QA pass is complete!

**Estimated Time:** 1-2 hours of focused testing

---

_Last Updated: December 2024_

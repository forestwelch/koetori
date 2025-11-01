# Quick QA Testing Guide

**Goal:** Verify the app works smoothly on mobile, tablet, and desktop.

---

## 🚀 Fast Test (5 minutes)

### Mobile (375px viewport)

1. Open Chrome DevTools → Toggle device toolbar → iPhone SE
2. **Record button** - Tap it, should work
3. **Filter drawer** - Tap filter icon (bottom), drawer slides up
4. **Modal** - Tap search button, modal opens full screen
5. **Toast** - Trigger an error (block mic or random memo with 0 memos)
   - Should appear bottom, full width with margins

### Desktop (1920px viewport)

1. Close DevTools or set viewport to 1920px
2. **Keyboard shortcuts** - See `<kbd>` tags in action buttons
3. **Modals** - Open search, should center on screen (not full width)
4. **Filters** - Desktop filters visible (not drawer)
5. **Toast** - Trigger error, appears bottom-right

---

## ✅ What to Look For

### ✅ Good Signs

- No horizontal scrolling on mobile
- Buttons are easy to tap (big enough)
- Modals are full screen on mobile, centered on desktop
- Toast notifications appear and are readable
- Keyboard shortcuts hidden on mobile
- Filter drawer works smoothly on mobile

### ❌ Red Flags

- Horizontal scrolling on mobile
- Tiny buttons (< 44px)
- Modals cut off or inaccessible
- Toasts off-screen or unreadable
- Keyboard shortcuts visible on mobile
- Layout breaks at breakpoints

---

## 🐛 Quick Fixes Applied

1. **Toast positioning** ✅ - Now responsive (full width on mobile)
2. **Keyboard shortcuts** ✅ - Already hidden on mobile (`lg:inline`)
3. **Modals** ✅ - Already responsive (full screen mobile, centered desktop)
4. **Filter drawer** ✅ - Already mobile-only (`lg:hidden`)

---

## 📋 Full Checklist

See `MOBILE_DESKTOP_QA_CHECKLIST.md` for complete testing checklist.

**Time Investment:**

- Quick test: 5 minutes
- Full QA pass: 1-2 hours

---

_Ready to test! Open DevTools and start checking! 🎯_

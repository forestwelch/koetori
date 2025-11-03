# Toast Notification Usage Guide

## Quick Reference

There are **4 main ways** to trigger toasts in your app:

1. **Convenience methods** (easiest - most common)
2. **Generic `showToast()`** (custom types/durations)
3. **Error handler hook** (automatic error handling)
4. **Manual toast management** (advanced)

---

## Method 1: Convenience Methods ⭐ **RECOMMENDED**

The easiest way - just call the method you need:

```tsx
"use client";

import { useToast } from "../contexts/ToastContext";

function MyComponent() {
  const { showError, showSuccess, showWarning, showInfo } = useToast();

  const handleSave = async () => {
    try {
      await saveData();
      showSuccess("Memo saved successfully!");
    } catch (error) {
      showError("Failed to save memo");
    }
  };

  const handleWarning = () => {
    showWarning("You're about to delete this item");
  };

  const handleInfo = () => {
    showInfo("New memo created");
  };
}
```

### Available Methods:

| Method                 | Color     | Duration  | Use Case           |
| ---------------------- | --------- | --------- | ------------------ |
| `showError(message)`   | 🔴 Red    | 7 seconds | Errors, failures   |
| `showSuccess(message)` | 🟢 Green  | 4 seconds | Success actions    |
| `showWarning(message)` | 🟡 Amber  | 5 seconds | Warnings, cautions |
| `showInfo(message)`    | 🔵 Indigo | 4 seconds | General info       |

---

## Method 2: Generic `showToast()` (Custom Duration)

For custom durations or if you want to programmatically choose the type:

```tsx
"use client";

import { useToast } from "../contexts/ToastContext";
import type { ToastType } from "../contexts/ToastContext";

function MyComponent() {
  const { showToast } = useToast();

  const showCustomToast = () => {
    // Custom duration (10 seconds)
    showToast("This message stays longer", "success", 10000);

    // Or with different types
    const type: ToastType = "info";
    showToast("Custom info message", type, 3000);

    // Permanent toast (won't auto-dismiss)
    showToast("Stays until manually closed", "warning", 0);
  };
}
```

**Signature:**

```tsx
showToast(message: string, type?: ToastType, duration?: number): string
// Returns the toast ID (for manual removal)
```

---

## Method 3: Error Handler Hook (Automatic)

For catching errors automatically:

```tsx
"use client";

import { useErrorHandler } from "../components/ErrorBoundary";

function MyComponent() {
  const handleError = useErrorHandler();

  const doSomething = async () => {
    try {
      await riskyOperation();
    } catch (error) {
      // Automatically shows error toast AND logs to console
      handleError(error, "Operation failed");
      // Optional context string appears in toast
    }
  };
}
```

**What it does:**

- Shows an error toast automatically
- Logs to console in development
- Handles Error objects, strings, and unknown types gracefully

**Signature:**

```tsx
handleError(error: unknown, context?: string): void
```

---

## Method 4: Manual Toast Management (Advanced)

For programmatic control (showing, tracking, removing toasts):

```tsx
"use client";

import { useToast } from "../contexts/ToastContext";

function MyComponent() {
  const { showToast, removeToast, toasts } = useToast();

  const showPersistentToast = () => {
    // Show a toast and keep its ID
    const toastId = showToast("Processing...", "info", 0); // 0 = never auto-dismiss

    // Do some async work
    setTimeout(async () => {
      await doWork();

      // Remove the "Processing..." toast
      removeToast(toastId);

      // Show success
      showToast("Done!", "success");
    }, 5000);
  };

  // Check if any toasts are currently showing
  const hasActiveToasts = toasts.length > 0;
}
```

**Available properties:**

- `toasts: Toast[]` - Array of all active toasts
- `showToast()` - Create a new toast
- `removeToast(id: string)` - Remove a specific toast by ID

---

## Real-World Examples

### Example 1: Form Submission

```tsx
const handleSubmit = async (formData: FormData) => {
  const { showError, showSuccess } = useToast();

  try {
    const response = await fetch("/api/submit", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Submission failed");
    }

    showSuccess("Form submitted successfully!");
  } catch (error) {
    showError(
      error instanceof Error
        ? `Failed to submit: ${error.message}`
        : "Failed to submit form"
    );
  }
};
```

### Example 2: Optimistic Updates

```tsx
const handleLike = async (memoId: string) => {
  const { showToast, removeToast } = useToast();

  // Show loading toast
  const loadingId = showToast("Updating...", "info", 0);

  try {
    await likeMemo(memoId);

    // Remove loading toast
    removeToast(loadingId);

    // Show success
    showToast("Memo liked!", "success");
  } catch (error) {
    removeToast(loadingId);
    showToast("Failed to like memo", "error");
  }
};
```

### Example 3: Validation Errors

```tsx
const validateAndSave = () => {
  const { showWarning, showError } = useToast();

  if (!email) {
    showWarning("Email is required");
    return;
  }

  if (!isValidEmail(email)) {
    showError("Please enter a valid email address");
    return;
  }

  // Save...
};
```

### Example 4: Network Error Handling

```tsx
const fetchData = async () => {
  const { showError, showInfo } = useToast();

  try {
    showInfo("Loading data...");
    const data = await api.fetchData();
    return data;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("fetch")) {
      showError("Network error. Check your connection.");
    } else {
      showError("Failed to load data. Please try again.");
    }
    throw error;
  }
};
```

---

## Best Practices

### ✅ DO:

- Use `showError()` for actual errors that need user attention
- Use `showSuccess()` to confirm user actions worked
- Use `showWarning()` for things the user should be aware of
- Use `showInfo()` for non-critical informational messages
- Provide clear, actionable messages
- Include error details when helpful: `showError(\`Failed: ${error.message}\`)`

### ❌ DON'T:

- Show toasts for every single action (spam)
- Use `alert()` or `confirm()` - use toasts instead
- Show multiple toasts for the same error
- Show toasts for actions the user didn't initiate (unless critical)

---

## Current Usage in Your Codebase

You're already using toasts in:

- ✅ `app/page.tsx` - Random memo, text processing, feedback
- ✅ `app/components/enrichment/MediaLibrary.tsx` - Media refresh/remove errors
- ✅ `app/components/enrichment/RemindersBoard.tsx` - Date parsing errors
- ✅ `app/components/UsernameInput.tsx` - User validation errors
- ✅ `app/hooks/useVoiceRecorder.ts` - Recording errors

---

## Toast Appearance

Toasts appear in the **bottom-right corner** and:

- Slide in from the right
- Auto-dismiss after their duration
- Can be manually closed with the X button
- Stack vertically if multiple toasts are shown
- Have color-coded icons and borders

---

## Need Help?

All toast methods are available in any component that:

1. Has `"use client"` directive
2. Is inside the `ToastProvider` (already in `app/layout.tsx`)

Just import and use:

```tsx
import { useToast } from "../contexts/ToastContext";
const { showError, showSuccess, showWarning, showInfo } = useToast();
```

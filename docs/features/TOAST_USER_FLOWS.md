# Toast Notification - User Flows Guide

Where to click and what flows trigger toasts in your app!

---

## 🎯 Quick Test Flows

### **Error Toasts (Red)** 🔴

#### 1. **Voice Recording Errors**

**Flow:**

- Go to main page (`/`)
- Click the **microphone/record button** (top right)
- **Block microphone permissions** when browser asks
- OR try to record with **no microphone connected**

**Expected Toast:**

```
🔴 "Microphone permission denied. Please allow access to use this feature."
OR
🔴 "No microphone found. Please connect a microphone and try again."
```

#### 2. **Random Memo Error**

**Flow:**

- Go to main page (`/`)
- Click the **"Pick Random Memo" button** (dice/random icon in top right)
- If you have **no memos**, you'll see:
  ```
  🟡 "No memos available"
  ```
- If there's a **database error**:
  ```
  🔴 "Failed to fetch random memo: [error message]"
  ```

#### 3. **Text Input Error**

**Flow:**

- Go to main page (`/`)
- Open **text input modal** (keyboard icon or `Ctrl/Cmd + T`)
- Type some text
- **Disconnect your internet** or **break the API** somehow
- Click submit

**Expected Toast:**

```
🔴 "Failed to process text: [error message]"
```

#### 4. **Feedback Submission Error**

**Flow:**

- Go to main page (`/`)
- Click **feedback button** (bug icon, usually in settings or footer)
- Fill out feedback form
- **Break network connection** or API error
- Click submit

**Expected Toast:**

```
🔴 "Failed to submit feedback: [error message]"
```

#### 5. **Username/Login Errors**

**Flow:**

- **Clear your localStorage** or **log out**
- Go to main page
- You'll see username input
- Try to **login with wrong credentials** or cause a database error

**Expected Toasts:**

```
🔴 "Failed to check username: [error]"
🔴 "Failed to create account: [error]"
🔴 "Failed to validate login: [error]"
```

#### 6. **Media Library Errors** (Dashboard)

**Flow:**

- Go to `/dashboard` page
- Find a **media card** (movie/show/book)
- Click **"Fix Match"** or **"Remove"** button
- Cause an error (network issue, API error)

**Expected Toasts:**

```
🔴 "Failed to refresh media item: [error]"
🔴 "Failed to remove media item: [error]"
```

#### 7. **Reminder Date Parsing Error**

**Flow:**

- Go to `/dashboard` page
- Find a **reminder** in the Reminders Board
- Click **"Set custom..."** button
- Enter **invalid date format** like "not a date" or "12345"
- Click OK/submit

**Expected Toast:**

```
🔴 "Could not parse that date/time. Please use format: YYYY-MM-DD HH:MM"
```

---

## 🟢 Success Toasts (Currently None)

**Note:** Success toasts aren't implemented yet! You could add them for:

- Successful memo saves
- Successful media refreshes
- Successful reminder updates
- etc.

---

## 🟡 Warning Toasts (Amber)

### **No Memos Warning**

**Flow:**

- Ensure you have **zero memos** in your account
- Go to main page
- Click **"Pick Random Memo"** button

**Expected Toast:**

```
🟡 "No memos available"
```

---

## 🔵 Info Toasts (Currently None)

**Note:** Info toasts aren't used yet, but you could add them for:

- "Processing..."
- "Loading data..."
- etc.

---

## 📍 Where Toasts Appear

Toasts appear in the **bottom-right corner** of your screen:

- Slide in from the right
- Stack vertically if multiple appear
- Auto-dismiss after duration
- Can be manually closed with X button

---

## 🧪 Testing Checklist

### ✅ Easy Tests (No Setup Required)

1. **Random Memo with No Memos**
   - [ ] Click "Pick Random Memo" when you have 0 memos
   - [ ] Should see: 🟡 "No memos available"

2. **Block Microphone Permission**
   - [ ] Click record button
   - [ ] Block/deny microphone access
   - [ ] Should see: 🔴 "Microphone permission denied..."

### ✅ Medium Tests (Need Some Setup)

3. **Break Network Connection**
   - [ ] Disconnect WiFi/ethernet
   - [ ] Try to submit text input
   - [ ] Should see: 🔴 "Failed to process text..."

4. **Invalid Date in Reminders**
   - [ ] Go to `/dashboard`
   - [ ] Click "Set custom..." on a reminder
   - [ ] Enter invalid date like "abc"
   - [ ] Should see: 🔴 "Could not parse that date/time..."

### ✅ Advanced Tests (Need Database/API Errors)

5. **Database Connection Error**
   - [ ] Break Supabase connection (hard to do, but possible)
   - [ ] Try to create account
   - [ ] Should see: 🔴 "Failed to create account: [error]"

6. **Media Refresh Error**
   - [ ] Go to `/dashboard`
   - [ ] Find a media card
   - [ ] Click "Fix Match" or "Refresh"
   - [ ] If API fails: 🔴 "Failed to refresh media item: [error]"

---

## 🎬 Complete User Journey Examples

### Journey 1: First-Time User Experience

1. **Land on homepage** → Username input appears
2. **Enter username** → If database error occurs
   - 🔴 Toast: "Failed to check username: [error]"
3. **Create account** → If creation fails
   - 🔴 Toast: "Failed to create account: [error]"
4. **Try to record** → Block microphone
   - 🔴 Toast: "Microphone permission denied..."

### Journey 2: Media Dashboard Errors

1. **Go to `/dashboard`**
2. **View media library** → See media cards
3. **Click "Fix Match"** on a movie card
4. **Enter new title and submit** → If API fails
   - 🔴 Toast: "Failed to refresh media item: [error]"
5. **Click "Remove"** on a media card
6. **Confirm removal** → If deletion fails
   - 🔴 Toast: "Failed to remove media item: [error]"

### Journey 3: Text Input Flow

1. **Press `Ctrl/Cmd + T`** → Text input modal opens
2. **Type some text**: "Remember to buy milk"
3. **Click Submit** → If network is down
   - 🔴 Toast: "Failed to process text: [error message]"

### Journey 4: Reminder Management

1. **Go to `/dashboard`**
2. **View Reminders Board**
3. **Click "Set custom..."** on a reminder
4. **Enter invalid date**: "tomorrow maybe?"
5. **Submit** →
   - 🔴 Toast: "Could not parse that date/time. Please use format: YYYY-MM-DD HH:MM"

---

## 🔍 Where Buttons Are Located

### Main Page (`/`)

- **Record Button**: Top right, microphone icon
- **Random Memo Button**: Top right, dice/random icon
- **Text Input**: Keyboard shortcut `Ctrl/Cmd + T` or search for it in UI
- **Feedback**: Usually in settings or footer (bug icon)

### Dashboard Page (`/dashboard`)

- **Media Cards**: Each has "Fix Match" and "Remove" buttons
- **Reminders**: Each has "Set custom..." button
- **Shopping List**: View-only for now

---

## 💡 Pro Tips for Testing

1. **Open Browser DevTools** → Network tab → Check "Offline" to simulate network errors
2. **Block permissions** in browser settings for microphone access
3. **Empty database** → Delete all memos to test "No memos available"
4. **Break API** → Temporarily change API endpoint URLs to non-existent paths

---

## 📝 Notes

- **Server-side errors** (in API routes) won't show toasts - they show in the response/console
- **React errors** (component crashes) are caught by ErrorBoundary, not toasts
- **Some errors** are still shown as inline messages (e.g., voice recording errors show in error state, not just toasts)

---

## 🚀 Adding More Toasts

Want to add success/info toasts? Check `TOAST_USAGE_EXAMPLES.md` for code examples!

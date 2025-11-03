# React Query Debugging Guide: Summary Save Issue

## The Problem

When you saved a memo summary, it would save to the database (you could see it after refresh), but the UI wouldn't update immediately. The old summary text would still show until you refreshed the page.

## The Debugging Process

### Step 1: Understand What React Query Does

React Query stores data in a **cache** organized by **query keys**. When you call `useQuery`, React Query:

1. Checks if data exists in cache for that query key
2. If yes, shows cached data immediately
3. Then optionally fetches fresh data in the background

**Key Concept:** The UI shows whatever is in the cache for that query key.

### Step 2: Find the Query Keys

When something doesn't update, ask:

- **What query hook is displaying this data?** (e.g., `useInboxQuery`, `useMemosQuery`)
- **What is its query key?**

Let's check:

```typescript
// useInboxQuery.ts
export function useInboxQuery(username: string | null) {
  return useQuery({
    queryKey: ["inbox", username], // ← This is the key!
    queryFn: () => fetchInboxMemos(username || ""),
  });
}

// useMemosQuery.ts
export function useMemosQuery(filters: MemoFilters) {
  return useQuery({
    queryKey: ["memos", filters], // ← This is the key!
    queryFn: () => fetchMemos(filters),
  });
}
```

### Step 3: Check What Cache Updates You're Making

Look at the `saveSummary` function. What query keys are you updating?

**The Bug:** We were updating the wrong query keys!

```typescript
// ❌ WRONG - These query keys don't exist!
queryClient.setQueriesData<Memo[]>({ queryKey: ["memos"] }, updateMemoInCache);
queryClient.setQueriesData<Memo[]>(
  { queryKey: ["inbox-memos"] },
  updateMemoInCache
);
```

**Why it failed:**

- The inbox query key is `["inbox", username]`, NOT `["inbox-memos"]`
- React Query couldn't find any queries with key `["inbox-memos"]`, so nothing updated
- The memos queries have keys like `["memos", {categoryFilter: "all", ...}]`, so `["memos"]` alone might partially work, but it's inconsistent

### Step 4: The Fix

Update the cache using the **correct query key prefixes**:

```typescript
// ✅ CORRECT - Match the actual query keys
// This updates ALL queries that start with ["memos"]
queryClient.setQueriesData<Memo[]>({ queryKey: ["memos"] }, (oldData) =>
  oldData ? oldData.map(updateMemo) : oldData
);

// This updates ALL queries that start with ["inbox"]
queryClient.setQueriesData<Memo[]>({ queryKey: ["inbox"] }, (oldData) =>
  oldData ? oldData.map(updateMemo) : oldData
);
```

**Why this works:**

- `setQueriesData` with a partial key (like `["memos"]`) will match ALL queries that START with that key
- So `["memos"]` matches `["memos", {filters}]` ✅
- And `["inbox"]` matches `["inbox", username]` ✅

## Key Concepts to Remember

### 1. Query Keys Must Match Exactly (or use prefixes)

```typescript
// If your query key is:
queryKey: ["inbox", username];

// You can update it with:
setQueriesData({ queryKey: ["inbox"] }, updater); // ✅ Prefix match
setQueriesData({ queryKey: ["inbox", username] }, updater); // ✅ Exact match
setQueriesData({ queryKey: ["inbox-memos"] }, updater); // ❌ Wrong key
```

### 2. Always Return New Object References

React (and React Query) uses **reference equality** to detect changes. If you mutate the object directly, React won't know it changed:

```typescript
// ❌ BAD - Mutating existing object
const memo = memos[0];
memo.extracted.what = "new text"; // React won't detect this!
return memos;

// ✅ GOOD - Creating new objects
return memos.map((m) => {
  if (m.id === id) {
    return {
      ...m, // New memo object
      extracted: {
        ...m.extracted, // New extracted object
        what: "new text",
      },
    };
  }
  return m;
});
```

### 3. Debugging Checklist

When cache updates don't work:

1. ✅ **Check the query key** - What key is the `useQuery` hook using?
2. ✅ **Check what you're updating** - Are you using the same key (or prefix)?
3. ✅ **Check object references** - Are you creating new objects, not mutating?
4. ✅ **Use React Query DevTools** - Open it and inspect the cache to see what's actually stored
5. ✅ **Check the network tab** - Is the database update actually succeeding?

### 4. Use React Query DevTools

Install it (already in your project):

```typescript
// providers/QueryProvider.tsx
{process.env.NODE_ENV === "development" && (
  <ReactQueryDevtools />
)}
```

**How to use:**

1. Open the app in dev mode
2. Click the React Query logo (bottom-left)
3. See all your queries and their keys
4. Inspect what data is cached
5. Watch cache updates happen in real-time

## Summary

**What was wrong:**

- We tried to update query keys that didn't exist (`["inbox-memos"]`)
- The actual query keys were `["inbox", username]` and `["memos", filters]`

**The fix:**

- Use prefix matching: `["inbox"]` matches all `["inbox", ...]` queries
- Use prefix matching: `["memos"]` matches all `["memos", ...]` queries
- Always create new object references when updating

**The lesson:**

- Always verify query keys match between where data is fetched and where it's updated
- Use React Query DevTools to inspect the cache
- Remember: React Query shows what's in the cache - if the cache doesn't update, the UI won't update!

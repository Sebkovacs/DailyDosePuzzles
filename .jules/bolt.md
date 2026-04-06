## 2025-01-28 - Removed Redundant Firestore Connection
**Learning:** Calling the `useAuth()` hook inside child components when the parent already calls it results in creating redundant `onAuthStateChanged` and Firestore `onSnapshot` listeners, duplicating active connections.
**Action:** Pass `user.uid` or relevant auth state as props from parent components to modals/child components instead of invoking `useAuth()` again to reduce redundant network operations.
## 2025-10-24 - Eliminated redundant O(N) array iteration in timer-dependent useEffect
**Learning:** Having an O(N) array iteration like `Array.some()` inside a `useEffect` that depends on a high-frequency changing state (like `timeLeft`) causes redundant computations every second, even when the array hasn't changed.
**Action:** Move win-condition checks into the specific user event handlers using direct value comparison (`resVal === target`) instead of re-evaluating the entire array on every timer tick.

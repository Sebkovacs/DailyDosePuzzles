## 2025-01-28 - Removed Redundant Firestore Connection
**Learning:** Calling the `useAuth()` hook inside child components when the parent already calls it results in creating redundant `onAuthStateChanged` and Firestore `onSnapshot` listeners, duplicating active connections.
**Action:** Pass `user.uid` or relevant auth state as props from parent components to modals/child components instead of invoking `useAuth()` again to reduce redundant network operations.

## 2025-01-29 - O(N) Checks in Timer-driven useEffects
**Learning:** Computing O(N) logic inside a `useEffect` bound to a high-frequency timer causes redundant calculations every second.
**Action:** Move win condition checks to direct event handlers to replace the O(N) scan with O(1) checks when data actually updates.

## 2025-01-28 - Removed Redundant Firestore Connection
**Learning:** Calling the `useAuth()` hook inside child components when the parent already calls it results in creating redundant `onAuthStateChanged` and Firestore `onSnapshot` listeners, duplicating active connections.
**Action:** Pass `user.uid` or relevant auth state as props from parent components to modals/child components instead of invoking `useAuth()` again to reduce redundant network operations.

## 2025-01-29 - Replaced Timer-Triggered Array Scan with Event-Driven Check
**Learning:** Placing O(N) array scans like `Array.prototype.some()` inside `useEffect` hooks that depend on high-frequency state updates (such as a timer tracking `timeLeft`) causes redundant computations every tick.
**Action:** Move win-condition or completion checks that rely on direct array value checks into the event handlers (e.g., `handleNumberClick`) where the array state is actually modified, bypassing the need to rescan the array every second.

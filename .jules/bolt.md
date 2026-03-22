## 2025-01-28 - Removed Redundant Firestore Connection
**Learning:** Calling the `useAuth()` hook inside child components when the parent already calls it results in creating redundant `onAuthStateChanged` and Firestore `onSnapshot` listeners, duplicating active connections.
**Action:** Pass `user.uid` or relevant auth state as props from parent components to modals/child components instead of invoking `useAuth()` again to reduce redundant network operations.

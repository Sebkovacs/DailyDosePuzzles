## 2025-01-28 - Removed Redundant Firestore Connection
**Learning:** Calling the `useAuth()` hook inside child components when the parent already calls it results in creating redundant `onAuthStateChanged` and Firestore `onSnapshot` listeners, duplicating active connections.
**Action:** Pass `user.uid` or relevant auth state as props from parent components to modals/child components instead of invoking `useAuth()` again to reduce redundant network operations.

## 2025-03-01 - Global Auth Provider to Prevent Duplicate Connections
**Learning:** Calling the `useAuth()` hook in multiple routed pages or components causes multiple `onAuthStateChanged` and `onSnapshot` connections to Firebase, which is highly inefficient.
**Action:** Use a global `AuthProvider` React Context in `app/layout.tsx` to cache Firebase authentication and profile states globally, preventing redundant network connections.

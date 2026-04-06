## 2026-03-22 - Missing Security Headers
**Vulnerability:** Missing strict HTTP security headers.
**Learning:** Next.js requires manual configuration for security headers; they aren't added by default.
**Prevention:** Always add standard security headers in next.config.ts.

## 2026-03-23 - Missing Firestore Rules for New Collections
**Vulnerability:** Denial of Service on testing variants feature due to completely missing rules for arenaPuzzles collection.
**Learning:** Firestore is closed-by-default. When new collections are added to client code, failing to add them to firestore.rules results in silent failures or generic permission denied errors.
**Prevention:** Always update firestore.rules in the same PR when adding a new top-level collection to Firebase.

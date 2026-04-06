## 2026-03-22 - Missing Security Headers
**Vulnerability:** Missing strict HTTP security headers.
**Learning:** Next.js requires manual configuration for security headers; they aren't added by default.
**Prevention:** Always add standard security headers in next.config.ts.

## 2026-03-23 - Client-Side API Key Exposure Risk
**Vulnerability:** The Gemini API key was being optionally read from NEXT_PUBLIC_GEMINI_API_KEY in a server route.
**Learning:** Prefixing environment variables with NEXT_PUBLIC_ exposes them to the client build in Next.js. Server-side secrets must never use this prefix or fallbacks.
**Prevention:** Strictly enforce the use of standard environment variables (e.g., GEMINI_API_KEY) for server-side logic and avoid fallback patterns that might encourage client-side exposure.

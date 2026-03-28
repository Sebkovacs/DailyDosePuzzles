## 2026-03-22 - Missing Security Headers
**Vulnerability:** Missing strict HTTP security headers.
**Learning:** Next.js requires manual configuration for security headers; they aren't added by default.
**Prevention:** Always add standard security headers in next.config.ts.

## 2026-03-28 - Prevent Client-Side API Key Exposure
**Vulnerability:** Checking `process.env.NEXT_PUBLIC_GEMINI_API_KEY` exposes the Gemini API key to the client bundle.
**Learning:** Next.js embeds any environment variable starting with `NEXT_PUBLIC_` into the client-side JavaScript. Server-side only secrets must never use this prefix.
**Prevention:** Strictly use `process.env.GEMINI_API_KEY` without the public prefix in server-side routes.

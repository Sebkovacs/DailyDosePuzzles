## 2026-03-22 - Missing Security Headers
**Vulnerability:** Missing strict HTTP security headers.
**Learning:** Next.js requires manual configuration for security headers; they aren't added by default.
**Prevention:** Always add standard security headers in next.config.ts.

## 2026-03-26 - Client-Exposed API Keys
**Vulnerability:** API Keys prefixed with NEXT_PUBLIC_ in Next.js.
**Learning:** In Next.js, environment variables prefixed with NEXT_PUBLIC_ are exposed to the browser.
**Prevention:** Never prefix server-side secrets, such as GEMINI_API_KEY, with NEXT_PUBLIC_. Keep them as GEMINI_API_KEY.

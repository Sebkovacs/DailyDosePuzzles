## 2026-03-22 - Missing Security Headers
**Vulnerability:** Missing strict HTTP security headers.
**Learning:** Next.js requires manual configuration for security headers; they aren't added by default.
**Prevention:** Always add standard security headers in next.config.ts.

## 2026-03-25 - Exposed Gemini API Key
**Vulnerability:** Gemini API key accessible on the client side via NEXT_PUBLIC_ prefix.
**Learning:** Next.js exposes any environment variable prefixed with NEXT_PUBLIC_ to the browser bundle, meaning secrets can be extracted by users.
**Prevention:** Never prefix sensitive API keys or secrets with NEXT_PUBLIC_ in Next.js applications.

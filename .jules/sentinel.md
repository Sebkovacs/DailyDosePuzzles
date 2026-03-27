## 2026-03-22 - Missing Security Headers
**Vulnerability:** Missing strict HTTP security headers.
**Learning:** Next.js requires manual configuration for security headers; they aren't added by default.
**Prevention:** Always add standard security headers in next.config.ts.

## 2026-03-27 - Gemini API Key Exposure
**Vulnerability:** Gemini API Key exposed via NEXT_PUBLIC_ prefix in environment variables.
**Learning:** Next.js exposes any environment variable prefixed with NEXT_PUBLIC_ to the client bundle. A server-side API key must not have this prefix to prevent it from leaking to clients.
**Prevention:** Never prefix sensitive server-side secrets with NEXT_PUBLIC_.

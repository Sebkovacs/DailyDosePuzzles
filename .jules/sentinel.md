## 2026-03-22 - Missing Security Headers
**Vulnerability:** Missing strict HTTP security headers.
**Learning:** Next.js requires manual configuration for security headers; they aren't added by default.
**Prevention:** Always add standard security headers in next.config.ts.

## 2024-05-20 - Server-side Secrets Leak
**Vulnerability:** Fallbacks to `NEXT_PUBLIC_` prefixed variables for server-side API keys in Next.js routes.
**Learning:** Next.js exposes any variable starting with `NEXT_PUBLIC_` to the client-side browser. If a sensitive key (like an LLM API key) has this prefix as a fallback mechanism, it can be trivially extracted by malicious users inspecting the client bundle.
**Prevention:** Never use or check `NEXT_PUBLIC_` variables as fallbacks for server-side secrets. Always use strict private variables (e.g., `process.env.GEMINI_API_KEY`).

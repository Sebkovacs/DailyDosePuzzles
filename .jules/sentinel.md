## 2026-03-22 - Missing Security Headers
**Vulnerability:** Missing strict HTTP security headers.
**Learning:** Next.js requires manual configuration for security headers; they aren't added by default.
**Prevention:** Always add standard security headers in next.config.ts.

## 2026-03-31 - Potential Client-Side Exposure of Server-Side API Key
**Vulnerability:** Checking `NEXT_PUBLIC_GEMINI_API_KEY` as a fallback for `GEMINI_API_KEY` encourages developers to define it with `NEXT_PUBLIC_`, which inlines the secret into the client-side bundle.
**Learning:** Never use `NEXT_PUBLIC_` prefixes for server-side secrets, even as fallbacks, as it defeats the purpose of keeping them secret.
**Prevention:** Strictly use server-side environment variables (without `NEXT_PUBLIC_`) for backend API keys and avoid fallback checks that suggest otherwise.

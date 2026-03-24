## 2026-03-22 - Missing Security Headers
**Vulnerability:** Missing strict HTTP security headers.
**Learning:** Next.js requires manual configuration for security headers; they aren't added by default.
**Prevention:** Always add standard security headers in next.config.ts.
## 2026-03-24 - API Key Exposure via NEXT_PUBLIC_
**Vulnerability:** The Gemini API key was exposed to the client by using the NEXT_PUBLIC_ prefix in an environment variable read (`process.env.NEXT_PUBLIC_GEMINI_API_KEY`).
**Learning:** Next.js exposes any environment variable prefixed with `NEXT_PUBLIC_` to the browser.
**Prevention:** Never use `NEXT_PUBLIC_` for sensitive API keys or credentials; use standard environment variables (e.g., `process.env.GEMINI_API_KEY`) and ensure they are only accessed in server-side code.

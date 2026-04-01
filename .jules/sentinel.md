## 2026-03-22 - Missing Security Headers
**Vulnerability:** Missing strict HTTP security headers.
**Learning:** Next.js requires manual configuration for security headers; they aren't added by default.
**Prevention:** Always add standard security headers in next.config.ts.

## 2026-04-10 - Server-Side Secrets Exposed to Client
**Vulnerability:** The Gemini API key is exposed to the client by checking for `process.env.NEXT_PUBLIC_GEMINI_API_KEY`.
**Learning:** `NEXT_PUBLIC_` variables are statically replaced during build time and sent to the browser.
**Prevention:** Never check or fallback to `NEXT_PUBLIC_` for server-side secrets like `GEMINI_API_KEY` in Next.js backend routes.

## 2026-04-10 - AI Prompt Numeric Validation Bypass
**Vulnerability:** The `count` parameter for AI generation was not strictly validated for integers or exact boundaries.
**Learning:** `NaN` and non-integers can bypass standard bounds checks, leading to potential DoS or unpredictable AI prompts.
**Prevention:** Always use explicit `typeof === 'number'`, `Number.isInteger()`, and exact boundaries for AI inputs.

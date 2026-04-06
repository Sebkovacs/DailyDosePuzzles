## 2026-03-22 - Missing Security Headers
**Vulnerability:** Missing strict HTTP security headers.
**Learning:** Next.js requires manual configuration for security headers; they aren't added by default.
**Prevention:** Always add standard security headers in next.config.ts.

## 2026-03-23 - Exposed Next.js Environment Variables
**Vulnerability:** Fallback to `NEXT_PUBLIC_` prefixed API keys on server-side Next.js routes.
**Learning:** Any variable prefixed with `NEXT_PUBLIC_` in a Next.js environment is bundled into the client build. Referencing this inside a server route allows malicious exposure if developers accidentally use the public name in `.env`.
**Prevention:** Never use or check for `NEXT_PUBLIC_` prefixes on secrets, even as a fallback in server-only code.

## 2026-03-23 - Bypass via Non-Integer Prompt Injection
**Vulnerability:** Unbounded or non-integer input count passed directly to AI prompt generation.
**Learning:** Checking only for numbers or using implicit types allows float values or large bounds that exhaust tokens or cause generation loops.
**Prevention:** Use `Number.isInteger(value)` and strict `min`/`max` bounds on numeric parameters before injecting into prompts.

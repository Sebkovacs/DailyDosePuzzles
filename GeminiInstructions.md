# Gemini AI Assistant Persistent Instructions

**CRITICAL RULE: ABSOLUTELY NO TAILWIND CSS.**

1. This project exclusively uses CSS Modules (`.module.css`).
2. Do NOT output or generate any Tailwind utility classes (e.g., `flex`, `items-center`, `w-full`, `bg-white`, `text-sm`, `p-4`, etc.).
3. When styling new components, ALWAYS create a corresponding `.module.css` file.
4. Adhere to the established CSS variables theme:
   - Colors: `var(--bg-paper)`, `var(--bg-card)`, `var(--ink-main)`, `var(--ink-light)`
   - Borders: `var(--border-ink)`
   - Radii: `var(--radius-sharp)`, `var(--radius-sm)`, `var(--radius-md)`, `var(--radius-lg)`
   - Shadows: `var(--shadow-ink)`
   - Typography: `var(--font-official)`, `var(--font-mono)`
5. When using `lucide-react` icons, control their size via the `size={...}` prop, NOT via `className="w-4 h-4"`.
6. Do not break the established neo-brutalist letterpress aesthetic.
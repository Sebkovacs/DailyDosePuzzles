## 2026-03-26 - Consistent Missing ARIA Labels on Modals
**Learning:** The application's game modal components consistently lack ARIA labels on their 'close' buttons across all game routes, indicating a gap in the base modal pattern or copy-paste propagation.
**Action:** Add `aria-label` to all icon-only modal close buttons, and consider abstracting the modal into a shared UI component to ensure accessibility by default.

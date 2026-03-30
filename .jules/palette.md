## 2024-03-30 - [Missing ARIA Labels on Core UI Buttons]
**Learning:** Across the game components (Vault, Shift, Split, etc), standard UI action buttons like 'Give Feedback', 'Random Puzzle', and 'Help' use a shared `iconBtn` style but omit `aria-label` attributes despite only containing icons.
**Action:** Always verify that `aria-label` attributes are added whenever an icon-only `<button>` or `<Link>` is created or discovered in game navigation bars.

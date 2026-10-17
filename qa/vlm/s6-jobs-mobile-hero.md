# s6-jobs-mobile-hero

**1. Visual DEFECTS (Concrete & Visible)**

*   **Search Row Overflow / Sizing:** The `Role, sl` input and `All Kenya` select are fighting for space on 375px. The input is truncated awkwardly ("sl" instead of "search"), and the `SEARCH` button feels squeezed. The row lacks proper gutter padding.
*   **Cookie Banner Dominance:** The modal is obscuring the primary navigation chips (`PYTHON`, `FINTECH`, etc.). This is a critical UX failure for a directory—users cannot filter before being forced to interact with a legal wall.
*   **Honesty Block Hierarchy:** The left amber border is good, but the body text is too light (`#888` or similar) against the dark hero background. It reads like a footnote rather than a core trust signal. The "LIVE" label in the paragraph above it lacks the monospace weight to feel like a real-time data badge.
*   **Kicker Legibility:** The top status bar (`WIRE · SAT · 20:29...`) uses a font size that is borderline unreadable on mobile. It looks like decorative noise instead of actionable market intelligence.

**2. TOP 3 Highest-Impact Fixes**

*   **Fix 1: Anchor the Search Grid (The "Pay/Slot" Logic applied to Search)**
    *   **Guidance:** Force a strict CSS Grid or Flex wrap. Do not let inputs shrink below `160px`.
    *   *CSS:* `.search-row { display: flex; flex-wrap: wrap; gap: 8px; } .search-input { flex: 1 1 140px; min-width: 0; } .search-btn { flex: 0 0 100%; width: 100%; margin-top: 4px; }`
    *   *Result:* Inputs remain tappable. The CTA becomes a full-width block anchor at the bottom of the stack.

*   **Fix 2: Elevate the Trust Signal (Honesty Block)**
    *   **Guidance:** Increase contrast and tighten leading. Make this look like an editorial "Editor's Note."
    *   *CSS:* `.honesty-block { border-left: 3px solid #B87503; padding-left: 16px; color: #E5E5E5; font-size: 15px; line-height: 1.45; } .honesty-label { font-family: 'IBM Plex Mono'; text-transform: uppercase; letter-spacing: 0.05em; color: #B87503; margin-bottom: 6px; display: block; }`

*   **Fix 3: Fix the Cookie Obstruction (Z-Index/Scroll)**
    *   **Guidance:** The cookie banner must not cover the filter chips.
    *   *Layout:* Move the cookie banner to the bottom of the viewport (fixed) OR ensure the page content (chips) has a higher z-index/padding-bottom so the user can scroll past the obstruction without clicking. Ideally, make the "Accept" button a solid `#0E4630` (Brand Green) to match the logo, reserving Amber for primary CTAs.

**3. Score: 7.5 / 10**

*   **Reasoning:** The typographic hierarchy (Fraunces + Mono) is excellent and establishes immediate "terminal" credibility. The honesty about salary transparency is a high-trust differentiator that is well-written. However, the execution drops the ball on mobile utility—the search form is cramped, and the cookie banner creates a walled garden that blocks the very navigation tools (chips) needed to use the site. It looks like a premium publication, but functions slightly like a trapped popup.

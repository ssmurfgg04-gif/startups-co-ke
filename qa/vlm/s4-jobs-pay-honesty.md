# VLM review — s4-jobs-pay-honesty

File: qa/shots/jobs-desktop.png
Date: 2026-10-16

**1. CONCRETE VISUAL DEFECTS**

*   **Hero Section (Honesty Block):** The "Only 8 of 29..." honesty block is visually weak. It uses a standard left-border accent (`border-left: 4px solid amber`) which is a generic UI trope. It lacks the "editorial pull-quote" weight required to establish trust immediately.
*   **Filter Bar:** The pill-shaped tags (`PYTHON`, `FINTECH`, `REMOTE`) look like standard SaaS boilerplate. They lack the monospaced, terminal-like aesthetic defined in the brand protocol.
*   **Job List Rows (The "Pay n/d" issue):** The rows for roles without disclosed pay (e.g., "Finance Manager") display "Pay n/d" in the same visual hierarchy as actual salary data ("Ksh 350-500K"). This creates cognitive friction; it looks like a data error rather than an editorial stance on transparency.
*   **Right Rail (Post-a-Job):** The pricing tier list is too dense and "salesy." The notes under each price point ("Pinned top of board...", "Hiring more than one?...") use a verbose, conversational tone that clashes with the minimalist data-terminal aesthetic. It reads like a SaaS landing page, not a classifieds section in a newspaper.
*   **Right Rail (Salary Benchmark):** The horizontal bar charts are generic. They lack the "ruler" or "histogram" precision expected of a data-intelligence product.
*   **Cookie Banner:** The banner overlaps the content awkwardly on the left. The buttons ("Accept All", "Essential Only") are styled with too much padding/rounded corners for this specific brutalist/minimalist theme.

**2. TOP 3 HIGHEST-IMPACT FIXES**

*   **Fix 1: Redesign the Honesty Block as Editorial Marginalia**
    *   *Goal:* Make the transparency disclaimer look like a handwritten editor's note or a critical data footnote, not a warning alert.
    *   *Guidance:* Remove the background fill and left border. Use `font-family: 'IBM Plex Mono', monospace;` for the text. Set `color: #B87503` (Amber). Indent the block significantly or offset it with a negative margin to break the grid. Add a small "§" symbol or a specific icon marker (e.g., a small eye icon) before the text to denote "visibility/transparency" metadata.

*   **Fix 2: Implement "Null State" Styling for Undisclosed Pay**
    *   *Goal:* Distinguish between "Data Present" and "Data Withheld" without breaking the row layout.
    *   *Guidance:* For rows where pay is `n/d`, change the salary container style. Instead of bold text, use `font-style: italic; color: #666; font-family: 'IBM Plex Mono'; font-size: 0.85em;`. Replace "Pay n/d" with a cleaner, more technical label like `[DISCLOSED: NO]` or simply `—`. This reinforces the "data terminal" vibe—the terminal returns null, it doesn't apologize.

*   **Fix 3: Brutalist Simplification of the Right Rail**
    *   *Goal:* Kill the "marketing page" feel of the job posting tiers.
    *   *Guidance:* Remove the descriptive sub-text under the prices. Convert the pricing list into a strict data table or a simple stacked list using `border-bottom: 1px solid #181712`. Use `text-transform: uppercase; letter-spacing: 0.05em;` for labels. The "Post a Role" CTA should be a raw button with square corners (`border-radius: 0`) and a solid ink background (`#181712`) with paper text (`#F6F3EA`), or vice-versa, rather than the current amber gradient/fill which feels too "call-center."

**3. SCORE: 6.5 / 10**

*   **Reasoning:** The foundation is strong—the typography (Fraunces/Mono) and color palette are correctly applied, giving it a distinct identity above 90% of startup sites. The "honesty" concept is a brilliant differentiator. However, the execution still leans too heavily on standard web component libraries (pills, soft shadows, verbose marketing copy in the rail). To hit a 9/10, it needs to shed the "helpful SaaS assistant" skin and fully commit to the "cold, precise data terminal" persona. The "Pay n/d" clutter is the biggest drag on credibility right now—it looks messy, not honest.

# s5-nav-dropdown

### 1. Visual DEFECTS

*   **Dropdown Alignment & Origin:** The "Discover" dropdown is misaligned. It is pinned to the left edge of the *entire* nav container rather than the left edge of the "DISCOVER" text trigger. This creates an awkward, disconnected gap between the parent item and the child menu.
*   **Z-Index & Shadow Collision:** The dropdown's offset shadow (bottom-right) overlaps the main headline ("Kenya's startup..."). This breaks the layering logic; the dropdown should sit *above* the content but currently looks like it is physically resting on top of the text.
*   **Nav Item Spacing:** The horizontal spacing between `DISCOVER`, `CAPITAL`, and `CAREERS` appears inconsistent or too tight for the `IBM Plex Mono` uppercase rendering, making the navigation feel cramped rather than "terminal" precise.
*   **Search Bar Contrast:** The search input field lacks a defined border or background distinction from the page body (`#F6F3EA`). It relies solely on a hairline rule which gets lost against the background, reducing its affordance as a primary interactive element.

### 2. Top 3 Highest-Impact Fixes

**1. Anchor Dropdown to Trigger (CSS)**
The dropdown must originate exactly from the "DISCOVER" text block to maintain visual hierarchy.
*   *Guidance:* Change positioning from `left: 0` (relative to nav container) to `left: 0` relative to the `DISCOVER` list-item. Ensure the width of the dropdown matches the width of the text or follows a strict grid (e.g., `width: 240px`).

**2. Fix Z-Index Layering (Layout)**
The navigation and its dropdowns must exist in the highest spatial plane.
*   *Guidance:* Apply `z-index: 50` (or similar high value) to the `<nav>` container. Ensure the dropdown has `position: absolute` and a solid background color (`#F6F3EA`) so it properly occludes the headline text beneath it without transparency issues.

**3. Refine Search Input Affordance (UI)**
To meet the "enterprise-grade" brief, the search needs more presence without adding noise.
*   *Guidance:* Add a subtle 1px solid border `#181712` with `border-radius: 0`. Increase internal padding to `12px 16px`. Ensure the placeholder text "Search — press /" uses the italic style of `IBM Plex Mono` to distinguish it as a system hint.

### 3. Score: 6/10

**Reasoning:** The aesthetic direction is strong—the color palette, typography pairing (Fraunces/Mono), and "paper" metaphor are distinct and professional. However, the execution fails the "ruthless detail" standard. The misaligned dropdown and the shadow overlapping the hero copy are sloppy layout errors that undermine the "data terminal" credibility. It feels like a high-fidelity mockup that hasn't been QA'd for pixel-perfect spacing.

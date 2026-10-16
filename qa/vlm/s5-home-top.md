# s5-home-top

**Review: s5-home-top (Homepage Hero & Snapshot)**

**(1) Concrete Visual Defects**

*   **The Wire (Top Ticker):** The monospace font weight is too light against the deep green, reducing legibility. The amber diamond `◆` separator feels decorative rather than structural; it adds noise to a data-dense line.
*   **Hero Typography:** The word "mapped" in the headline uses an italic serif that clashes with the upright Fraunces weight. It looks like a lazy emphasis rather than a deliberate stylistic choice.
*   **Search Input:** The primary search bar lacks the "custom dropzone" feel requested. It looks like a default browser input. The placeholder text is functional but lacks the "human" sentence-case warmth (e.g., "Look up a founder or startup...").
*   **Ecosystem Snapshot Widget:** 
    *   **The Shadow:** The drop shadow is soft and blurry (`box-shadow: 0 4px 12px rgba(0,0,0,0.05)`). It violates the "offset shadows" brief. It should be a hard, directional shadow (e.g., 4px down-right) to match the paper aesthetic.
    *   **Bar Chart:** The bars have zero spacing between them (margin-right: 0). This creates a solid block of color rather than distinct data points. It looks cheap.
    *   **Grid Lines:** The horizontal rules inside the widget are the same weight as the outer border. Internal dividers should be hairline rules (0.5px or 1px lighter opacity) to establish hierarchy.
*   **Founder Strip / Cookie Banner:** The cookie banner is aggressively large and opaque, covering critical "trust" copy at the bottom. The "Claim your profile" CTA button has rounded corners (approx 4px-8px radius), violating the strict "square corners" protocol.

**(2) Top 3 Highest-Impact Fixes**

1.  **Enforce the "Offset Paper" Aesthetic on the Snapshot Widget**
    *   **Why:** Currently, it floats like a standard SaaS card. It needs to look like a physical index card sitting on the desk.
    *   **Fix:** 
        *   Remove blur. Apply hard shadow: `box-shadow: 6px 6px 0px #181712;` (Ink color).
        *   Ensure border-radius is exactly `0px`.
        *   Change internal grid lines to `border-bottom: 1px solid rgba(24, 23, 18, 0.1);`.

2.  **Fix Search Dominance & Interaction**
    *   **Why:** The hero search is the primary conversion point but visually it competes with the text. It needs to feel like a terminal input.
    *   **Fix:** 
        *   Increase height to `56px` or `64px`.
        *   Change font family inside input to `IBM Plex Mono`.
        *   Change placeholder to Sentence Case: `"Search 21 tracked companies — try 'M-Kopa'..."`.
        *   Add a subtle inner focus state: `border: 2px solid #0E4630; box-shadow: inset 0 0 0 1px #0E4630;` (remove outline).

3.  **Rectify Typography & Spacing Rhythm**
    *   **Why:** The "mapped" italic and the cramped bar chart make the design feel unpolished/amateurish rather than "editorial."
    *   **Fix:**
        *   Change "mapped" to the standard Fraunces Roman (or use the Amber color `#B87503` for emphasis instead of italics).
        *   Add `gap: 4px` or `margin-right: 4px` to the bar chart columns.
        *   Reduce Cookie Banner opacity to `bg-opacity-90` or `backdrop-blur` so the underlying text (the "human" credibility copy) peeks through, ensuring the page doesn't look broken on load.

**(3) Score: 6/10**
*Reasoning:* The brand palette and font choices are strong and correctly applied to the logo/nav. However, the execution of the core components (the data widget and the search bar) relies on default web aesthetics (soft shadows, rounded buttons, cramped charts) rather than the specific "paper/terminal" identity requested. It reads as a generic SaaS landing page wearing a custom skin, rather than a bespoke editorial tool. The "human" element is buried by the aggressive cookie modal and the rigid form inputs.

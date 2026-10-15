# VLM review — s4-home-mobile

File: qa/shots/home-mobile.png
Date: 2026-10-16

### 1. Visual DEFECTS (Concrete & Visible)

*   **Hero H1 (Top):** The headline "Kenya's startup economy, *mapped* & measured." is wrapping too aggressively on the italicized word. It breaks the visual rhythm of the serif typeface, making the "editorial" intent look like a broken layout.
*   **Cookie Banner (Top):** A massive, high-contrast intrusion that destroys the "paper" aesthetic immediately. It looks like a generic WordPress plugin overlay, not a custom terminal component.
*   **Stats Grid (Upper):** The four data points (29 Jobs, $126M, etc.) are cramped. The labels are too small relative to the numerals, and the spacing feels like a default CSS grid rather than a typeset statistical abstract.
*   **Map Section:** The map container is too narrow for the detail level. The dots are clustering, and the legend/type below it is getting squeezed.
*   **Funding Intelligence Chart (Dark Section):** The bar chart labels (X-axis) are microscopic and illegible on mobile. This is a critical failure for a "data terminal."
*   **Featured Startups (Card Stack):** While better than a grid, the vertical rhythm is monotonous. Every card has the exact same height and padding. It lacks the "snappy" feel of a news feed or a dossier.
*   **Ecosystem Insights (List):** The progress bars for sectors are thin and hard to tap. The text hierarchy (Sector Name vs. Count) is weak; they fight for attention.
*   **Pricing Section (Bottom):** The "KSh 0", "KSh 2,900", "KSh 24,500" headers are massive but lack the sophisticated spacing (kerning/leading) expected of the Fraunces font at that size.
*   **Footer:** Extremely dense wall of text. The links are too small for thumb targets (likely under 44px), violating mobile usability standards.

### 2. TOP 3 Highest-Impact Fixes

**Fix 1: The "Editorial" Typography Reset (Hero & Headings)**
The current scaling feels fluid and responsive in a generic way. It needs to be "set," not just scaled.
*   **Guidance:** Lock the `line-height` of the Hero H1 to `1.1` and increase `letter-spacing` to `-0.02em`. Force the word "*mapped*" to stay on the second line using a `<br>` or `white-space: nowrap` if viewport permits, to create a solid block of text rather than a ragged shape. For section headers (e.g., "Funding intelligence"), increase bottom margin to `2rem` to give the heavy dark sections room to breathe.

**Fix 2: Data Legibility (Charts & Stats)**
The "Data Terminal" brand promise fails if the data is unreadable.
*   **Guidance:** In the **Funding Intelligence** chart section, rotate X-axis labels to 45 degrees (`transform: rotate(-45deg)`) or hide them entirely and show values on **tap/active state** only. For the **Stats Grid**, switch from a 2x2 grid to a horizontal scrollable flex container (`flex-nowrap overflow-x-auto snap-x`) with larger cards. This allows the numbers to be huge (display size) and legible without cramping the labels.

**Fix 3: Interaction Zones (Cards & Lists)**
Mobile requires "thumb-friendly" zones. The current design is too dense.
*   **Guidance:** Increase padding inside the **Startup Cards** to `24px` vertical. Add a subtle `border-left: 4px solid #0E4630` to the active/card container to anchor the eye. For the **Ecosystem Insights** list, make the entire row a tappable target (`min-height: 64px`). Increase the font weight of the sector names to `600` and color them `#181712`, while keeping the counts in `IBM Plex Mono` (lighter grey) to establish clear information hierarchy.

### 3. Score: 6 / 10

**Reasoning:** The brand identity (colors, fonts) is strong and distinct—it avoids the "purple gradient AI" trap. However, the **mobile execution is mechanically flawed**. It reads like a desktop layout that was merely squashed into 390px rather than re-orchestrated for it. The illegible chart labels and cramped footer drag down the "Human-Crafted" credibility. It looks like a designer's mockup, not a living, breathing tool used by analysts in Nairobi.

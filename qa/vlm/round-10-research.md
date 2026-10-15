# round-10-research

File: 10-research.png

### 1. Visual DEFECTS

*   **Header / Ticker:** The top status bar (green) text is extremely tight. The amber dot and the first item ("WIRE") have almost zero padding, creating a "cramped" feel that violates the "editorial" whitespace protocol.
*   **Hero Section (Kenya Funding Landscape):** The "FLAGSHIP" and "CONFIRMED" chips are misaligned vertically relative to the H1 baseline. They appear to float slightly too high or lack a consistent `align-items: center` relationship with the title.
*   **Library Section Header:** The sub-label "DATA · COMPILED FROM PUBLIC SOURCES" is rendered in a heavy black box with white text. This breaks the minimalist "ink on paper" aesthetic. It looks like a browser default selection or a missing style class rather than an intentional design element.
*   **Library List (Table):** 
    *   **Inconsistent Button Widths:** The action buttons ("UNLOCK", "DOWNLOAD") and price chips ("KSH 2,500", "MEMBERS", "FREE") vary wildly in width across rows. This causes the right-hand column to "jiggle" vertically, destroying the vertical rhythm.
    *   **Orphaned Metadata:** The page counts and dates (e.g., "28 PAGES · SEP 2026") are very small and sit dangerously close to the description text, risking crowding on smaller viewports.
*   **Bottom Grid (Methodology vs. Trends):** 
    *   **Height Mismatch:** The "METHODOLOGY REFERENCES" card is significantly taller than the "CONSUMER PULSE" card. In a strict grid system, these should either have equal heights or a clear reason for the disparity.
    *   **Dashed Border Inconsistency:** The "REPORTED" tag in the Methodology card uses a dashed border that feels slightly out of place compared to the solid chips used elsewhere.
*   **Footer:** The "HONESTY NOTICE" block at the very bottom is a wall of tiny text. While legally necessary, the line-height is too tight, making it look like "fine print" rather than transparent editorial disclosure.

---

### 2. TOP 3 Highest-Impact Fixes

**1. Normalize the Library Action Column (Layout Integrity)**
The "Library" section looks like a messy spreadsheet because the right-side controls have no fixed constraint.
*   **Fix:** Implement a CSS Grid or Flexbox layout for the list items where the right-hand action area has a fixed width (e.g., `width: 180px`) and uses `justify-content: flex-end`.
*   **CSS Guidance:**
    ```css
    .library-row {
      display: grid;
      grid-template-columns: 1fr auto; /* Content | Actions */
      align-items: center;
      gap: 2rem;
    }
    .library-actions {
      display: flex;
      gap: 0.5rem;
      width: 160px; /* Lock the width to stop the jiggle */
      justify-content: flex-end;
    }
    .btn-action {
      min-width: 80px; /* Standardize button sizes */
      text-align: center;
    }
    ```

**2. Fix the "Data Source" Label Aesthetic (Brand Compliance)**
The black box label under "Library of all reports" violates the `#F6F3EA` paper texture rule. It looks like a debugging error.
*   **Fix:** Replace the solid black background with the brand's "label" style: `IBM Plex Mono`, uppercase, `#181712` text, perhaps with a hairline border or simply spaced out (`letter-spacing: 0.05em`).
*   **CSS Guidance:**
    ```css
    .section-meta-label {
      background: transparent;
      color: #181712;
      font-family: 'IBM Plex Mono', monospace;
      font-size: 0.75rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      border-bottom: 1px solid #181712; /* Optional: hairline rule */
      padding-bottom: 2px;
      display: inline-block;
    }
    ```

**3. Enforce Vertical Rhythm in the Hero & Grid (Typographic Hierarchy)**
The chips in the Hero and the cards in the bottom grid feel "loose."
*   **Fix:** 
    *   **Hero:** Ensure the "FLAGSHIP/CONFIRMED" chips are perfectly centered on the H1's x-height using `align-items: center` in the flex container.
    *   **Grid:** Force the two bottom cards (Methodology & Consumer Pulse) to have equal heights using `align-items: stretch` on the parent grid container, or ensure their padding is mathematically identical so they don't look unbalanced.
*   **CSS Guidance:**
    ```css
    .hero-header-group {
      display: flex;
      flex-wrap: wrap;
      align-items: center; /* Crucial for chip/title alignment */
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    
    .bottom-grid-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      align-items: stretch; /* Forces cards to match height */
    }
    .card {
      display: flex;
      flex-direction: column;
      /* Ensure padding is consistent, e.g., padding: 2rem; */
    }
    ```

---

### 3. Credibility Score: **8.5 / 10**

**Rationale:** This is high-fidelity work. The typographic pairing (Fraunces/Mono) is sophisticated and correctly applied. The "paper" texture and ink colors create a premium, "terminal" feel that stands out against generic SaaS dashboards. 

It loses points for the **layout jitter** in the library list (which makes it feel slightly unfinished) and the **stylistic outlier** of the black data-label. To a PitchBook reader, those small inconsistencies suggest "v1.0 energy"—brilliant but needing a final pass of rigor. Fix the alignment and it's a 9.5.

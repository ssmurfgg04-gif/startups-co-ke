# round-02-directory

File: 02-startups-directory.png

### 1. Visual Defects

*   **Section: Main Table (Apollo Agriculture Row):** **Critical UI Overlay.** A dark, pill-shaped "accessibility" or "translation" widget (containing icons for person, eye, and text) is floating directly over the company description of the 6th row ("Apollo Agriculture"). This obscures content and breaks the "data-terminal" aesthetic.
*   **Section: Sidebar (Sector Filter):** **Misaligned Counters.** The numerical counts (e.g., 7, 4, 1) on the right side of the sector list are not vertically aligned with the checkbox labels. They appear to float slightly high or lack a consistent baseline alignment with the `IBM Plex Mono` text.
*   **Section: Main Table (Funding Column):** **Inconsistent Data Density.** The "Amount Raised" column has varying vertical heights due to wrapped text (e.g., "Bootstrapped-lean (self-reported)" vs "$241.0M"). This creates a ragged visual rhythm in the rightmost column.
*   **Section: Header:** **Search Bar Contrast/Style Mismatch.** The search input field uses a white background (`#FFFFFF`) which feels slightly too "heavy" or default compared to the subtle paper texture (`#F6F3EA`) of the rest of the interface. It lacks the "terminal" input feel.
*   **Section: Footer:** **Legibility Risk.** The "Honesty Notice" text at the very bottom is extremely small and low contrast against the dark footer background, risking illegibility on non-retina screens.

---

### 2. Top 3 Highest-Impact Fixes

**1. Eliminate the Floating Widget (Apollo Agriculture Row)**
*   **Issue:** The overlay destroys the credibility of the data view.
*   **Fix:** Remove the third-party script injecting this toolbar or set `display: none` via CSS for the specific container class (likely `.accessibility-widget` or similar).
*   **CSS/Layout:**
    ```css
    .floating-toolbar-overlay {
      display: none !important; /* Ruthless removal */
    }
    /* If it must exist, pin it to a corner, never center-content */
    ```

**2. Standardize Table Row Heights & Typography**
*   **Issue:** The table looks messy where funding amounts wrap to multiple lines.
*   **Fix:** Enforce a strict `nowrap` on the funding column or implement a fixed-width container with ellipsis (`text-overflow: ellipsis`) for long status strings like "Bootstrapped...".
*   **CSS/Layout:**
    ```css
    .col-funding {
      width: 140px;
      white-space: nowrap; /* Force single line for cleaner look */
      overflow: hidden;
      text-overflow: ellipsis;
      font-family: 'IBM Plex Mono', monospace;
      font-weight: 500;
    }
    /* Alternatively, increase row min-height to 72px to accommodate wrapping gracefully */
    .table-row {
      min-height: 72px;
      align-items: center; /* Ensure vertical centering */
    }
    ```

**3. Fix Sidebar Grid Alignment (Sector List)**
*   **Issue:** The counts look "loose".
*   **Fix:** Use a strict CSS Grid or Flexbox layout for the sidebar items to ensure the label and count are perfectly baseline-aligned.
*   **CSS/Layout:**
    ```css
    .sector-item {
      display: flex;
      justify-content: space-between;
      align-items: baseline; /* Key for typographic perfection */
      padding: 4px 0;
      font-family: 'IBM Plex Mono', monospace;
      font-size: 13px;
    }
    .sector-count {
      color: #888; /* Muted ink for metadata */
      margin-left: 12px;
    }
    ```

---

### 3. Credibility Score: **8.5 / 10**

**Rationale:**
The execution of the "Data-Terminal" brand identity is exceptionally high. The use of **Fraunces** for headers paired with **IBM Plex Mono** for data, the specific palette (`#0E4630`, `#B87503`), and the paper-texture background create a premium, "PitchBook-for-Africa" feel.

It loses points only for the **sloppy overlay** (which looks like a dev tool was left open) and slight **typographic looseness** in the sidebar. If the overlay is removed and the grid is tightened, this is a **9.5/10** interface. It looks expensive and authoritative.

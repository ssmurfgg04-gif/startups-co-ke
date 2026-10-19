# round-05-investors

File: 05-investors.png

### 1. Visual Defects

*   **BlueOrchard Row (Main List):** A dark, pill-shaped "zoom/pan" UI overlay (likely a screenshot artifact or dev tool) is obscuring the `SERIES B-GROWTH` chip and the row's right-side content.
*   **Logo Consistency & Quality:** The list is a mess of visual weights. You have high-fidelity SVGs (Antler, Flourish) sitting next to blurry, low-res raster images (Enza Capital, WaterEquity, HAVAIC, SavViu, Ajm, Villgro). The "EC", "WA", "HA", "SA", "VK" grey boxes look like lazy fallbacks that break the "data-terminal" aesthetic.
*   **Chip/Label Inconsistency:** 
    *   **Verified vs. Unverified:** The "VERIFIED" badges are solid green blocks, while "UNVERIFIED" is a thin, weak outlined box. This creates an unwanted visual hierarchy where unverified funds look like "errors" rather than just "unconfirmed."
    *   **Stage Chips:** The border-radius on the stage chips (e.g., `$1M-$10M`) is slightly rounded (`4px`?), clashing with the strict "square corners" protocol defined in your brand guide.
*   **Right Rail Chart (Investor Activity):** The line chart in the "DEALS / QUARTER" module is illegible. It lacks axis lines, gridlines, or data points, making it look like a decorative squiggle rather than intelligence.
*   **Typography Orphans:** In the footer "HONESTY NOTICE" block, the text is dense and lacks the hairline rule separation seen elsewhere, making it look like a wall of warning text rather than a refined legal footnote.

---

### 2. Top 3 Highest-Impact Fixes

**1. Enforce Strict "Square & Sharp" Geometry (The "Terminal" Fix)**
Your brand relies on precision. The rounded chips and buttons soften the "intelligence" feel too much.
*   **CSS Guidance:**
    ```css
    /* Kill all border radius on data components */
    .chip, .badge, .btn-primary, .card, input, select {
      border-radius: 0 !important; 
    }
    
    /* Sharpen the Verified badge */
    .badge-verified {
      background-color: #0E4630; /* Brand Green */
      color: #F6F3EA; /* Paper */
      padding: 2px 6px;
      font-family: 'IBM Plex Mono', monospace;
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    ```

**2. Standardize the Logo Mark System (The Credibility Fix)**
A PitchBook user will judge data quality by the visual quality of the logos. Mixed resolutions scream "scraped data, not curated intelligence."
*   **Layout Guidance:** 
    *   Implement a **strict 40x40px container** for all investor logos.
    *   **Rule:** If a high-res vector/SVG isn't available, use the **Initials Fallback** (grey box with white serif letters) for *everyone*, or no one. Do not mix rasters and vectors. 
    *   Ensure the initials fallback uses `font-family: 'Fraunces', serif` to match the editorial header feel.

**3. Fix the "Unverified" Visual Weight (The Data Integrity Fix)**
Currently, "UNVERIFIED" looks broken. It should look "pending," not "failed."
*   **CSS Guidance:**
    ```css
    /* Change Unverified from outline to solid neutral */
    .badge-unverified {
      background-color: #E6E2D5; /* Light ink/paper mix */
      color: #181712;
      border: 1px solid #181712; /* Hairline rule */
      /* Keep it square and monospaced like its verified counterpart */
    }
    ```

---

### 3. Investor Credibility Score: **7.5 / 10**

**Verdict:** Strong concept, "okay" execution.
The information architecture is solid—the specific funding ranges (e.g., "$500K-$5M") and the distinction between Venture Capital and Impact Fund Manager are exactly what an investor wants. The "Deal Flow Requests" module on the right is a high-value feature.

**Why not higher?** The **visual noise** (blurry logos, the random zoom overlay in the screenshot, inconsistent rounding) undermines the "Premium Terminal" claim. An investor platform must look ruthlessly clean to be trusted. Fix the geometry and the assets, and this is a **9/10**.

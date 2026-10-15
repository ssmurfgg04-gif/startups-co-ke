# round-04-twiga-failure

File: 04-profile-twiga-failure.png

**1. VISUAL DEFECTS**

*   **Header / Status Bar:** The top status bar (green bg) has a severe **contrast failure**. The amber `•` bullet and text are nearly illegible against the dark green (`#0E4630`).
*   **Hero Section:** The "IN ADMINISTRATION" badge uses a pale red fill with dark text. It lacks the weight of a critical status. The "VERIFIED" checkmark icon is slightly misaligned vertically with its text baseline.
*   **Key Facts Table:** The "Employees" cell contains an orphaned em-dash (`—`) that looks like a rendering error or missing data artifact rather than intentional null-state design.
*   **Data Source Label:** A black tooltip/label reading "**DATA · COMPILED FROM PUBLIC SOURCES**" is awkwardly floating over the bottom-left border of the Key Facts table, creating a visual collision with the table's hairline rule.
*   **Technology Stack Widget:** The floating pill widget containing icons (A, chart, etc.) appears unmoored. Its drop-shadow is too soft ("gooey") compared to the sharp, offset shadows defined in your brand protocol.
*   **Right Rail Alignment:** In the "Hiring" card, the link "jobs board" has inconsistent underline styling compared to other interactive elements. The "0 TRACKED" labels in the right rail are visually weak; they lack the monospace rigidity of the rest of the data layer.
*   **Footer:** The social buttons (WhatsApp, X, LinkedIn) have overly thick borders that fight the minimalist aesthetic.

---

**2. TOP 3 HIGHEST-IMPACT FIXES**

**Fix A: Rescue the Status Bar Contrast (Accessibility/Brand Integrity)**
The current green-on-green/amber mix fails WCAG AA.
*   **Guidance:** Change the status bar background to `#181712` (ink) or keep `#0E4630` but force all text/icons to `#F6F3EA` (paper) at `font-weight: 700`. Remove the amber accent entirely or use it only for the specific company name highlight if it must remain.

**Fix B: Fix the "In Administration" Badge (Visual Hierarchy)**
This is the most important data point on the page (the company is dead), yet it looks like a passive filter tag.
*   **Guidance:** 
    ```css
    .badge-administration {
      background-color: #181712;
      color: #F6F3EA;
      border: 1px solid #181712;
      letter-spacing: 0.05em;
      font-family: 'IBM Plex Mono', monospace;
      font-weight: 500;
      padding: 4px 8px;
    }
    ```
    Make it look like a terminal error state, not a pastel UI element.

**Fix C: Anchor the Data Source Label & Clean Table Edges (Layout Precision)**
The floating label breaks the grid.
*   **Guidance:** Move "DATA · COMPILED FROM PUBLIC SOURCES" to a dedicated row *inside* the Key Facts table (spanning all columns) or position it as a fixed caption below the table with a `margin-top: -12px` and `margin-left: 4px`. Ensure it uses `font-size: 10px` and `letter-spacing: 0.1em` to feel like metadata, not a UI component.

---

**3. CREDIBILITY SCORE**

**8.5 / 10**

**Rationale:** This is exceptionally high for a startup profile page. The typographic hierarchy (Fraunces + Plex Mono) is executed with discipline. The information density is "PitchBook-grade"—it respects the reader's time by putting the failure mode (Administration) front and center without sensationalism. 

It loses points for the **status bar contrast** (looks like a dev oversight) and the **floating data-label** (breaks the otherwise rigid editorial grid). If I'm an investor, I trust this source because it feels like a dossiers, not a marketing landing page. The "paper/ink" palette is consistent and easy on the eyes during deep-dive sessions. 

**Verdict:** Clean, credible, and ruthlessly functional. Fix the contrast bug and it's a 9.

# round-03-profile-mkopa

File: 03-profile-mkopa.png

### 1. Visual DEFECTS

*   **Header / Ticker:** The top status bar (WIRE • THU...) is a wall of text with zero breathing room. The amber `POST A JOB` button feels visually heavy and slightly misaligned vertically against the search input.
*   **Hero Section (M-KOPA):** The "Verified" and "Active" badges are crammed against the serif typeface. The "Request Introduction" solid black block creates an awkward visual weight imbalance on the right side of the hero.
*   **Key Facts Table:** The grid lines are inconsistent. The vertical divider between "HQ" and "Sector" is missing or faint, making the 3-column layout feel like a messy 2-column split. 
*   **Data Source Overlay:** The dark tooltip/overlay ("DATA • COMPILED FROM PUBLIC SOURCES") is overlapping the "PUBLIC SOURCES" tab and the signal icons below it. It looks like a debug element left in production.
*   **Signals Section:** The green left-border accent on the signal items is too thick (looks like 4px+) for this minimalist aesthetic; it should be a hairline (1px). The background alternating rows are too subtle, reducing scannability.
*   **Right Sidebar (Hiring):** Text wrapping in the "Hiring" list is aggressive (e.g., "Retail Customer Experience Agent — Mobility"). The "ON-SITE" label is orphaned on its own line.
*   **Footer:** The footer is a massive block of "dark mode" that breaks the paper-terminal metaphor. It feels like a standard template rather than a continuation of the editorial design.

---

### 2. TOP 3 Highest-Impact Fixes

**1. Fix the Data Source Overlap & Clutter (Signals Area)**
The floating black overlay is a critical UI bug that obscures navigation.
*   **Guidance:** Remove the absolute-positioned dark overlay. Integrate the "Compiled from public sources" text as a static sub-header in `IBM Plex Mono`, `10px`, `#181712`, with `letter-spacing: 0.05em`. Ensure the tab bar (`PUBLIC SOURCES`, etc.) has a clear `margin-bottom: 16px` to separate it from the signal list.

**2. Standardize the Key Facts Grid (Table Integrity)**
The current table looks like a misaligned flex container.
*   **Guidance:** Use a strict CSS Grid: `grid-template-columns: 1fr 1fr 1fr`. Apply a `1px solid #DCD8C9` border to all cells. Ensure all labels (`EMPLOYEES`, `SECTOR`) are `uppercase`, `11px`, `color: #666`. Align values to the top of the cell. This restores the "terminal" precision.

**3. Refine Typography & Spacing (Visual Hierarchy)**
The interface suffers from "crowding" which hurts credibility.
*   **Guidance:** Increase `line-height` in the Hero description to `1.5`. Change the Signal list's left-border from a thick green bar to a `border-left: 1px solid #0E4630`. In the Sidebar, change the "Hiring" role titles to `font-weight: 600` and keep location/type tags (`HYBRID`) on the same line using `flex-wrap: nowrap` or truncation.

---

### 3. Credibility Score: **7.5 / 10**

**Reasoning:** The brand identity (Fraunces + Mono) is strong and the data density is high, which appeals to a PitchBook user. However, the **overlapping UI elements** (the data source box) and the **slightly "template-like" footer** detract from the "bespoke terminal" feel. It looks 90% finished. An investor would trust the data but might question the engineering polish of the platform itself.

**Verdict:** High-quality data presentation marred by minor layout "rot." Clean up the overlaps to hit a 9/10.

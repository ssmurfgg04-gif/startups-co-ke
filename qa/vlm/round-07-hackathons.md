# round-07-hackathons

File: 07-hackathons.png

### 1. Visual DEFECTS

*   **Hero Section (DevFest Nairobi):** The "Kind" label is orphaned and misaligned. The pill-shaped container for the tech stack (Android, Web, Cloud) is overlapping the text below it. The "Organizers" label lacks a clear visual anchor.
*   **Event Cards (Grid):** Inconsistent vertical rhythm. The "Dates TBA" headers in the second row of cards have different internal padding/alignment compared to the "+X Days" headers above them. The "Verified" chip on the GopherCon card breaks the grid's strict alignment.
*   **Ecosystem Calendar:** The "15" date box has a heavy black border that feels like a legacy UI element rather than a minimalist selection state. It clashes with the hairline-rule aesthetic of the rest of the table.
*   **Footer:** The "Honesty Notice" block at the very bottom is a wall of micro-text with poor line-height, making it look like a legal disclaimer rather than an editorial note.

---

### 2. TOP 3 Highest-Impact Fixes

**1. Fix Hero Component Overlap & Alignment**
The tech stack pills are floating over the metadata. Enforce a strict `display: grid` or `flex` layout for the hero meta-row.
*   *Guidance:* Use `align-items: baseline` for the row containing City/Dates/Organizers. Ensure the "Kind" label has a fixed width or is part of a definition list (`dl/dt/dd`) to prevent the pills from drifting left into the text area. Add `margin-top: 12px` to the stats boxes (28 Days, 13 Hours) to clear the overlapping element.

**2. Standardize Card Header Heights**
The transition from "Countdown" headers to "TBA" headers creates a jagged grid line.
*   *Guidance:* Apply `min-height: 48px` to all card headers. Center the text vertically using `display: flex; align-items: center; justify-content: center`. Ensure the background color fills the entire height without internal margin inconsistencies.

**3. Refine the Calendar Selection State**
The thick black border on the "15th" is too heavy for this brand.
*   *Guidance:* Replace the `border: 2px solid #181712` with a `background-color: #181712; color: #F6F3EA` inversion or a subtle `box-shadow: 0 0 0 1px #B87503` (Amber) to match the "Featured" dot color. This maintains the "terminal" feel without looking like a 1990s HTML table.

---

### 3. Credibility Score: **8.5 / 10**

**Rationale:** This is a high-fidelity execution of a very specific, difficult aesthetic. It avoids the "SaaS template" trap almost entirely. The typography (Fraunces + Mono) is used correctly to establish hierarchy. It loses points for the minor alignment slop in the hero section and the slightly cluttered footer, but it looks like a tool built by people who actually understand data density and editorial design. An investor would trust this as a serious intelligence product.

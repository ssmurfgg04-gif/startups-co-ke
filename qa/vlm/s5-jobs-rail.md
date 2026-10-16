# s5-jobs-rail

### 1. Visual DEFECTS (Concrete & Visible)

*   **Right Rail: "Live board status" (Top Section)**
    *   **Inconsistent Data Density:** The "2 LIVE" and "12 LIVE" counts for Apollo and Moniepoint are visually identical in weight to the "0 KE ROLES" text, creating a flat hierarchy. The "live" signal is the most critical data point here; it needs to breathe.
    *   **Typographic Collision:** The employer names (e.g., *Apollo Agriculture*, *Tala*) are set in a standard sans-serif that clashes with the editorial `Fraunces`/`IBM Plex Mono` brand voice established in the brief. It looks like a generic database dump, not a curated terminal.
    *   **Weak Micro-interactions:** The "BOARD OK" status is just text. In an enterprise-grade UI, this should be a subtle icon or a monospaced badge to signal system health at a glance.

*   **Right Rail: "Coverage check" (Middle Note)**
    *   **Apologetic Tone:** The phrase *"We're smaller and honest about it"* undermines the "data terminal" authority. A terminal reports facts; it doesn't make excuses for its size.
    *   **Legibility Failure:** The light grey text (`#888` or lighter) on the `#F6F3EA` background fails WCAG contrast ratios. It reads as "fine print" rather than "methodology."
    *   **Container Ambiguity:** The note sits in a box with a hairline border, but the internal padding is tight, making the paragraph look like a crowded legal disclaimer.

*   **Right Rail: Pricing / Posting (Bottom Section)**
    *   **Visual Hierarchy Inversion:** The "POST A JOB" header has the same weight as the pricing tiers ("Free listing", "Standard"). The CTA should dominate this section to drive conversion.
    *   **Misaligned Currency:** "KSh 0" and "KSh 2,900" are right-aligned but lack the tabular spacing of the `IBM Plex Mono` font, making the numbers look messy.

*   **Global Layout**
    *   **The "Data Compiled" Footer:** The black bar at the bottom left ("DATA · COMPILED FROM PUBLIC SOURCES") feels like an afterthought. It breaks the paper/ink aesthetic by introducing a heavy solid block that doesn't align with the grid above it.

---

### 2. TOP 3 Highest-Impact Fixes

**Fix 1: The "Confidence Over Apology" Rewrite (Editorial Tone)**
*   **Current:** *"We're smaller and honest about it—but every row here is sourced..."*
*   **Guidance:** Rewrite to sound like a Nairobi desk analyst. Use sentence case.
    *   *New Copy:* "**Methodology note:** StartupJobs Kenya tracks 54 active employer boards (Oct 2026). We prioritize direct-source verification over scraping. Dead links are auto-dropped within 24h via GitHub Actions."
*   **CSS/Layout:** Change font to `IBM Plex Mono`, size `11px`, color `#181712` (full ink weight). Increase `line-height` to `1.5`. Add a subtle left border (`border-left: 2px solid #0E4630`) to make it look like a margin note, not a disclaimer.

**Fix 2: Enterprise-Grade Status Indicators (Visual Hierarchy)**
*   **The "Live" Count:** 
    *   Wrap the number (e.g., **2**) in a `span` with `font-family: 'IBM Plex Mono'; font-weight: 700; color: #0E4630;`.
    *   Make the label "LIVE" smaller, uppercase, and tracked out (`letter-spacing: 0.05em`) in the amber color `#B87503` to indicate "active/energy".
*   **The "Board OK" Status:**
    *   Replace text with a minimal SVG icon (a circle with a checkmark) or a micro-badge: `background: #F6F3EA; border: 1px solid #181712; padding: 2px 6px; font-size: 10px; font-family: 'IBM Plex Mono';`.

**Fix 3: Structural Grid Alignment (Layout Integrity)**
*   **Issue:** The right rail feels disconnected from the main job list.
*   **Guidance:** Ensure the right rail's top edge aligns perfectly with the first job card's top edge. 
*   **Pricing Section:** 
    *   Make "POST A JOB" a proper button or strong header (`font-family: 'Fraunces'; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;`).
    *   Align prices using `font-variant-numeric: tabular-nums` so the "KSh" symbols and digits stack perfectly vertically.

---

### 3. Score: 6.5 / 10

**Verdict:** Functional but currently lacking the "curated terminal" soul. 

It earns points for the raw data density and the specific "auto-dropped dead links" detail (which screams credibility), but loses significant ground due to the **apologetic copy** in the coverage note and the **generic typography** in the right rail. To hit the "enterprise-grade yet human" brief, the right rail must stop looking like a sidebar widget and start looking like a live system dashboard. Fix the tone and the monospaced hierarchy, and this becomes a 9/10.

# round-01-home

File: 01-home-full.png

**1. VISUAL DEFECTS (Concrete & Cited)**

*   **Header / Top Bar:** The top-most utility bar (green background) has text that is **clipped vertically** or cut off at the very top edge of the viewport. It looks like a `z-index` or `overflow` issue, or simply a lack of top padding.
*   **Hero Section (Map):**
    *   **Map Clipping:** The map container has a hard, unstyled clip on the right side where the "Explore by region" column begins. The map stroke cuts off abruptly without a fade or proper containment margin.
    *   **Floating UI:** The zoom controls (+/-) and the location pin overlay look like default browser/leaflet elements that haven't been restyled to match the "terminal" aesthetic. They break the custom UI immersion.
*   **Stats Bar (The 5-column strip):** The transition from the light paper background to the dark green section below is jarring. There is no hairline rule or visual separator to ground the stats before the heavy color inversion.
*   **Section 01 (Funding Intelligence - Dark Mode):**
    *   **Chart Contrast:** The amber bars (`#B87503`) against the deep green/black background (`#0E4630`/`#181712`) have **insufficient contrast** for the smaller data labels if they exist, and the X-axis labels are too light/greyed out, risking illegibility on non-retina screens.
    *   **List Density:** The "Latest Tracked Rounds" list is extremely dense. The rows are cramped. The alignment between the company name, the "Lead" label, and the amount ($166M) feels loose; the amounts should be right-aligned strictly to create a clean vertical axis.
*   **Section 02 (Featured Startups):**
    *   **Card Alignment:** The grid of startup cards (M-KOPA, BasiGo, etc.) shows slight vertical misalignment. The bottom edges of the cards do not form a perfectly straight line (likely due to varying description lengths not being handled by a strict flex/grid `align-items: stretch`).
    *   **Icon Consistency:** The verification badges and logos vary slightly in weight and optical centering within their circles/squares.
*   **Section 03 (Ecosystem Insights):**
    *   **Bar Chart Alignment:** In the "Startups Tracked by Sector" chart, the bar lengths correspond to numbers, but the numbers (6, 3, 3...) are floating with inconsistent padding relative to the end of the bars.
    *   **List Legibility:** The funding list on the right repeats the density issue from Section 01. The "Confirmed" vs "Reported" status chips are tiny and hard to distinguish.
*   **Section 04 (Hackathon/News):**
    *   **Image Quality:** The image in "The Wire" section looks low-resolution or heavily compressed (artifacting visible in the texture), clashing with the sharp vector aesthetic of the rest of the site.
    *   **Countdown Timer:** The large numbers (28, 13, 40, 00) in the Hackathon section lack the "monospace" rigidity expected for a timer. If these are dynamic, they appear to be using a proportional font, causing jitter or misalignment.
*   **Footer:** The footer is a massive block of text with poor hierarchy. The links are small and crowded.

---

**2. TOP 3 HIGHEST-IMPACT FIXES**

**Fix A: Enforce Strict Typographic Grid & Rhythm (The "Data Terminal" Look)**
*   **Problem:** The mix of serif body copy and mono labels is good, but the spacing (leading/margins) is inconsistent between sections. The lists feel like "web paragraphs" rather than "database entries."
*   **Guidance:**
    *   Apply a global `line-height` of `1.4` for body and `1.0` (or strict `1.2`) for all tabular data/lists.
    *   **CSS:** For all funding tables/lists, use `display: grid; grid-template-columns: 1fr auto auto 100px; align-items: center;`. Force the monetary values into the last column with `text-align: right; font-variant-numeric: tabular-nums;`. This creates the "spreadsheet" credibility instantly.

**Fix B: Dark Mode Contrast & Container Polish (Section 01)**
*   **Problem:** The dark green section risks looking "muddy." The chart axes disappear.
*   **Guidance:**
    *   Increase the opacity of axis labels to `0.6` or `0.7` (from current ~0.4).
    *   Add a subtle `1px solid rgba(243, 234, 234, 0.1)` border around the chart container to separate it from the background.
    *   Ensure the Amber (`#B87503`) bars have a `mix-blend-mode: screen` or simply sit on a slightly lighter green card background to pop, rather than blending into the dark void.

**Fix C: Map Integration & Hero Balance**
*   **Problem:** The hero feels like two separate columns (Text+Search | Map) rather than one cohesive unit. The map looks like an iframe dropped in.
*   **Guidance:**
    *   Remove the default Leaflet/Mapbox UI controls. Replace them with custom HTML/CSS buttons that use `font-family: 'IBM Plex Mono'`, `border: 1px solid #181712`, and `background: #F6F3EA`.
    *   Add a shared `border-bottom: 1px solid #181712` that spans across *both* the map column and the "Explore by region" column to lock them together visually at the base.

---

**3. SCORE: 7.5 / 10**

**Rationale:**
You have successfully avoided the generic "startup gradient" cliché. The **editorial direction is strong**—the font pairing (Fraunces + Plex Mono) signals intelligence immediately. The color palette is distinctive and appropriately "African market" without being kitschy.

**Why not higher?**
It lacks the **"pixel-perfect"** finish that PitchBook/Crunchbase users expect. The **data density** is currently fighting the **whitespace**. To hit 9/10, you need to ruthlessly standardize the padding inside every single card and row (currently it fluctuates), and fix the legibility of the dark mode charts. An investor forgives a boring layout; they do not forgive confusing data presentation.

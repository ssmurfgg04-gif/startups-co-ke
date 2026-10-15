# qa/vlm/expansion-home.raw.json

**VISUAL DEFECTS — HOME MAP BAND**

**1. Map Data Visualization (47-County Dot Map)**
*   **Defect:** The map is entirely absent or rendered as a blank void. A "startup intelligence" platform claiming to map the economy while displaying a literal empty canvas destroys the core value proposition immediately.
*   **Defect:** No visual hierarchy for the "6 green hub rings." Without the base map, these rings float in undefined space, making the geographic context of Nairobi, Mombasa, etc., impossible to decipher.

**2. County Anchors Railbox**
*   **Defect:** The railbox is missing. There is no list of verified hub names, no source citations, and no data density. The section promises specific county-level intelligence but delivers nothing.

**3. Layout & Spacing**
*   **Defect:** Excessive negative space (whitespace) between the header and the map area suggests a broken lazy-load state or a missing asset container rather than intentional "breathing room."
*   **Defect:** Lack of a "loading" skeleton or placeholder state implies the page has finished rendering, which makes the empty map look like a critical data failure.

***

**TOP 3 FIXES**

1.  **Render the GeoJSON Map Immediately:** Implement the vector map of Kenya with the 47 county boundaries. Ensure the dots are plotted with correct lat/long coordinates relative to the borders.
2.  **Populate the Railbox:** Display the horizontal scrolling list of counties. Each anchor must include the Hub Name in **Fraunces**, the specific metric (e.g., "Active Startups"), and the source line in **IBM Plex Mono** (e.g., `SOURCE: CRB / KRA`).
3.  **Define the Hub Rings:** Overlay the 6 green concentric rings centered on the primary hub (Nairobi). Ensure they have low opacity so they don't obscure the underlying county dots.

***

**INVESTOR CREDIBILITY SCORE: 2/10**
*Reasoning:* An intelligence site with a missing map is like a financial report with blank charts. It signals either technical incompetence or a complete lack of data—both fatal for investor confidence.

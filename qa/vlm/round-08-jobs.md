# round-08-jobs

File: 08-jobs.png

### 1. Visual Defects

*   **Hero Search Bar (Top Section):** The "Search" button is misaligned vertically with the input field and the location dropdown. It sits noticeably lower than the baseline of the adjacent elements.
*   **Job List Row 4 ("Sales and Service Center Associate"):** A dark, blurry, semi-transparent UI overlay (resembling a browser developer tool tooltip or a broken hover state) is obscuring the salary data. The text "KSh" is visible but the range is hidden behind this artifact.
*   **Job List Row 3 ("Quality Assurance..."):** A black tooltip/label reading "**DATA · COMPILED FROM PUBLIC SOURCES**" is overlapping the left border of the job card container. It breaks the grid alignment.
*   **Sidebar Salary Benchmark:** The progress bars for the salary ranges have inconsistent right-alignment. The numerical values (e.g., "180-400") are not aligned to a consistent vertical axis, making the data look ragged.
*   **Footer Typography:** The footer text blocks (Platform, Intelligence, Company) lack strict vertical rhythm. The line heights appear slightly loose compared to the dense data density of the main content, creating a "floppy" visual finish at the bottom.

### 2. Top 3 Highest-Impact Fixes

1.  **Rectify Hero Input Group Alignment**
    *   **Issue:** The search button drops below the input baseline.
    *   **Fix:** Wrap the `input`, `select`, and `button` in a flex container (`display: flex; align-items: stretch;`). Ensure all elements share the same `height` (approx 48px) and remove any default margins. The button should fill the height exactly to maintain the "terminal" block aesthetic.

2.  **Eliminate Overlay Artifacts in Job List**
    *   **Issue:** Broken tooltips and overlapping labels on rows 3 and 4 destroy the minimalist integrity.
    *   **Fix:** 
        *   For the "DATA..." label: Position it absolutely inside the card padding (`top: 0; left: 1rem; transform: translateY(-50%);`) or move it into the sub-header metadata line. Do not let it bleed outside the card border.
        *   For the "Sales" row: Inspect the z-index stack. Ensure the job card has `position: relative; z-index: 1;` and remove any stray `div` or pseudo-element causing the dark blur. If it's a "market band" indicator, style it as an inline badge, not a floating shadow.

3.  **Standardize Sidebar Data Visualization**
    *   **Issue:** The salary benchmark bars look unpolished due to misaligned numbers.
    *   **Fix:** Use CSS Grid for the sidebar list items. Define columns as `1fr auto`. Force the numerical value column to `text-align: right;` and apply a fixed width or `min-width` to ensure the KSH values align perfectly down the page. Ensure the bar container has a fixed height (e.g., `6px`) and the fill color matches the brand amber `#B87503` exactly.

### 3. Credibility Score

**6.5 / 10**

**Rationale:** The underlying design system (Fraunces + Mono, paper texture, strict grid) signals high taste and "PitchBook-level" ambition. However, the execution errors—specifically the floating UI artifacts (tooltips/blurs) and the misaligned hero controls—signal a lack of QA polish. An investor seeing a "glitchy" data layer will question the accuracy of the underlying intelligence data. It looks like a high-fidelity prototype that hasn't been cleaned up for production.

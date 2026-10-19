# s6-jobs-mobile-rows

### (1) Visual DEFECTS

*   **Job Row 1 (Asset Finance):** The `FEATURED` amber chip is visually dominant and unbalanced. It lacks the 1px hairline border (`#181712`) present on the `ACTIVE` chip, making it look like a heavy, solid block rather than a refined UI tag.
*   **Job Rows (All):** The "Pay Strip" alignment is imprecise. The left-aligned pay text (`KSh ...`) and the right-aligned date/bookmark container are not vertically centered to each other. The date text appears to float slightly higher than the baseline of the currency text.
*   **Global Overlay (Cookie Banner):** The cookie banner violates the "paper" aesthetic. It uses a generic, soft drop-shadow instead of the brand's signature hard, offset shadow (e.g., `box-shadow: 4px 4px 0px #181712`). Furthermore, the corners are rounded; they must be perfectly square (`border-radius: 0`) to match the brutalist/minimalist design system.
*   **Typography (Pay Strip):** The `/ MO · BAND` suffix uses standard weight. Per the brand protocol, this metadata should be rendered in `IBM Plex Mono` at a lighter weight or smaller size to create a clear hierarchy against the primary `Fraunces` or sans-serif salary figure.

### (2) TOP 3 Highest-Impact Fixes

**1. Enforce Strict Grid Alignment for the Pay Strip**
The pay strip must be a non-negotiable flex or grid container to prevent any "floating."
*   **Layout:** Use `display: flex; justify-content: space-between; align-items: center;`.
*   **Left Node (Pay):** `flex: 0 1 auto`. Ensure `white-space: nowrap` is applied to the salary range to prevent wrapping on narrow viewports.
*   **Right Node (Actions):** `flex: 0 0 auto`. Contains the Date (mono) and Bookmark button.
*   **Vertical Rhythm:** Ensure the `padding-top` and `padding-bottom` of this strip are exactly equal (e.g., `12px`) to center the content relative to the dashed divider above it.

**2. Standardize Chip Borders & Corners**
*   **CSS:** Apply `border: 1px solid #181712; border-radius: 0;` to *both* `FEATURED` and `ACTIVE` chips.
*   **Visuals:** Change `FEATURED` background to a lighter tint (e.g., `#B87503` at 15% opacity) with solid ink text, rather than the current solid amber fill which creates too much visual noise.

**3. Fix the Cookie Banner Shadow & Geometry**
*   **Shadow:** Replace the default blur shadow with `box-shadow: 6px 6px 0px #181712;`.
*   **Radius:** Force `border-radius: 0 !important;` on the banner container and the internal buttons to maintain the "data terminal" square-corner aesthetic.

### (3) Score: 8/10

**Reasoning:** The core objective—anchoring the pay data—is successfully resolved. The deterministic 2-row layout (Meta / Pay-Strip) transforms the list into a scannable, trustworthy directory. The dashed divider effectively separates the "editorial" job details from the "terminal" hard data. It loses points for the misaligned vertical baselines in the pay strip and the sloppy execution of the overlay/banner, which breaks the otherwise rigorous minimalist immersion.

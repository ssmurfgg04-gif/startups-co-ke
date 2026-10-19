# s6-jobs-desktop-rows

**Review: s6-jobs-desktop-rows (1366px)**

### 1. Concrete Visual Defects

*   **Pay Column Misalignment (Jobs List):** The "KSh" compensation values are not vertically aligned. The `Ksh 350-500K` in the first row sits higher than the `Ksh 300-450K` in the second row. This breaks the "data terminal" grid structure.
*   **Inconsistent Sub-label Baseline:** The secondary pay text ("MARKET BAND · MO") is floating. In the first row, it aligns with the bottom of the main price; in subsequent rows, the vertical rhythm shifts, creating a jittery scan line down the column.
*   **Filter Bar Visual Weight Imbalance:** The "ALL" active state (solid black) is too heavy compared to the light gray text of "ENGINEERING", "DATA", etc. It feels like a system default rather than a deliberate editorial choice. It dominates the hierarchy unnecessarily.
*   **Vetted Box Typography Density:** The "HOW LISTINGS ARE VETTED" checklist uses a standard sans-serif or slightly loose serif that lacks the crispness of the `IBM Plex Mono` labels used elsewhere. The line height is too generous for a sidebar utility box, making it feel like body copy instead of scannable metadata.

### 2. Top 3 Highest-Impact Fixes

**Fix #1: Hard-Anchor the Pay Grid (CSS Grid Template)**
The brief demands an anchored pay slot. Do not use Flexbox `justify-content: space-between` for the row internals; use explicit CSS Grid columns to force alignment.
*Guidance:*
```css
.job-row {
  display: grid;
  /* Logo | Title/Meta | Pay Block | Date | Actions | Caret */
  grid-template-columns: 48px 1fr 160px 100px 44px 24px;
  align-items: center; /* Forces vertical centering for all items */
  gap: 1rem;
}

.pay-block {
  display: flex;
  flex-direction: column;
  justify-content: center; /* Centers content within the fixed-width cell */
  text-align: right; /* Or left, but pick one and stick to it */
  min-width: 0; /* Prevents overflow */
}
```
*Result:* Every "KSh" value will hit the exact same pixel coordinate on the Y-axis regardless of title length.

**Fix 2: Standardize Pay Typography Rhythm**
The sub-label (`MARKET BAND · MO`) needs strict typographic containment to stop it from shifting the perceived weight of the block.
*Guidance:*
```css
.pay-primary {
  font-family: 'IBM Plex Mono', monospace;
  font-weight: 600;
  font-size: 0.875rem;
  color: #181712;
  line-height: 1.2;
}

.pay-secondary {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.6875rem; /* Smaller, tighter */
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #666;
  margin-top: 2px; /* Fixed tight margin */
  opacity: 0.8;
}
```

**Fix 3: Refine Filter & Rail Hierarchy**
The "ALL" tab should be an underline indicator (like the nav) or a subtle background tint, not a heavy solid block. The Vetted box needs to look like a "terminal log."
*Guidance:*
*   **Filters:** Change `.filter-active` from `background: #181712; color: #fff` to `color: #181712; border-bottom: 2px solid #0E4630; font-weight: 700`. Keep others at `color: #666`.
*   **Vetted Box:** Change font to `IBM Plex Mono`, size `11px`, line-height `1.4`. Add a hairline top/bottom border (`1px solid #e5e2d6`) to frame it as a distinct data module.

### 3. Score: 8/10

**Reasoning:** The layout successfully adopts the "data terminal" aesthetic with strong use of mono-spaced fonts and a disciplined palette. The information density is high but readable. However, the score is docked for the **pay column misalignment**, which is a critical failure for a site positioning itself as a precision intelligence tool. If the numbers don't line up, the "directory" trust erodes. The fix is trivial (CSS Grid), but until applied, it looks like a draft.

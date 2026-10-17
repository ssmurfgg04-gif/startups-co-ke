# s6-jobs-mobile-expanded

**Review: s6-jobs-mobile-expanded (375px)**

### 1. Visual DEFECTS (Concrete & Visible)

*   **Pay/Salary Slot Instability (Critical):** The "KSh 350-500K / MO · BAND" text is visually unanchored. It floats in a whitespace void between the metadata and the bookmark icon. It lacks a consistent baseline or container, making it feel like an afterthought rather than a primary data point.
*   **Inconsistent Metadata Rhythm:** The first card ("Senior Backend Engineer") includes a `FEATURED` badge (Amber) which pushes the `ACTIVE` tag and subsequent lines down. The second card ("Senior Product Manager") lacks this badge. This vertical shift destroys the "directory" rhythm—users cannot scan salaries or dates down a straight line.
*   **CTA Visibility Failure:** The primary action ("Apply on employer board") is buried at the very bottom of the expanded accordion, below the fold of the initial interaction. The visual weight of the Amber button is competing with the heavy Cookie Consent modal overlay.
*   **Cookie Modal Obstruction:** The "Cookies" banner is aggressively large and opaque, obscuring the bottom ~30% of the viewport. It completely hides the source line and the CTA, forcing a dismiss action before the user can evaluate the job's credibility.
*   **Typography Hierarchy Collision:** In the expanded description ("Pioneer the product side..."), the body copy uses the same serif weight as the job title, blurring the distinction between the *header* and the *content*.

### 2. TOP 3 Highest-Impact Fixes

**Fix 1: Anchor the Pay Slot (The "Terminal" Grid)**
To fix the floating salary and establish the "trustworthy directory" look, you must lock the pay range into a rigid grid row that ignores the variable height of the tags above it.
*   **Layout:** Use CSS Grid for the card footer.
    ```css
    .job-card-footer {
      display: grid;
      grid-template-columns: 1fr auto auto; /* Pay | Date | Bookmark */
      align-items: baseline; /* Forces text to sit on the same line */
      border-top: 1px solid #181712; /* Hairline rule separation */
      padding-top: 12px;
      margin-top: auto; /* Pushes to bottom if card heights vary */
    }
    ```
*   **Visual:** This ensures "KSh..." always starts at the exact same X/Y coordinate on every single card, creating that "data terminal" scanning experience.

**Fix 2: Normalize the Header Height (The "Directory" Consistency)**
The `FEATURED` badge is breaking your layout. You need a fixed-height container for the status area.
*   **Layout:** Give the tag/badge area a `min-height`.
    ```css
    .status-area {
      min-height: 32px; /* Accommodates one row of badges */
      display: flex;
      align-items: center;
      gap: 8px;
    }
    ```
*   **Logic:** If a job isn't featured, inject an invisible spacer (`visibility: hidden`) or simply rely on the `min-height` to keep the "Verified Employer" text aligned with the card below it.

**Fix 3: Sticky Footer CTA & Modal Taming**
Don't let the user scroll past the application button.
*   **Layout:** Make the "Apply" bar sticky within the expanded card or the viewport.
    ```css
    .job-actions {
      position: sticky;
      bottom: 0;
      background: #F6F3EA; /* Match paper bg to cover scrolling content */
      border-top: 1px solid #181712;
      padding: 16px;
      z-index: 10;
    }
    ```
*   **Modal:** Reduce the cookie banner height by 40%. Change background to `rgba(246, 234, 234, 0.95)` so the user can see the content behind it is valuable, or move the "Essential Only" button to the top-right corner to dismiss it faster.

### 3. Score: 6/10

**Verdict:** Strong brand identity (the ink/paper aesthetic is distinct), but currently failing the "usability" test on mobile. The "Data Terminal" promise is broken by the loose typography and lack of alignment. It looks like an editorial draft, not a vetted engineering tool.

**Deductions:**
*   **-2 for Layout Instability:** The misaligned pay scales make the data look unreliable.
*   **-1 for Obstruction:** The cookie banner is hostile to mobile users trying to read the "Source" line (crucial for verification trust).
*   **-1 for Hierarchy:** The expanded view is too dense; it needs more "terminal" breathing room (margin-bottom) between the description and the tags.

# s5-founder-modal

**Review: "Submit your startup" Modal (s5-founder-modal)**

### 1. Concrete Visual Defects
*   **Modal Header & Close Icon:** The `✕` close button is a generic, unstyled browser-default square. It lacks the brand's signature hairline rule border and doesn't align with the "offset shadow / square corners" aesthetic. The header text "SUBMIT YOUR STARTUP" is tracking too wide for the chosen typeface, making it look like a system default rather than a deliberate editorial choice.
*   **Form Grid Alignment:** The 2-column grid is visually broken. The left column (Company Name, Website) and right column (Contact Email, County) have misaligned baselines for their labels vs. inputs. Specifically, the "County" label/input block appears slightly lower than its "Website" counterpart, breaking the horizontal rhythm.
*   **Dropzone Aesthetic:** While the dashed border is present, the internal layout is weak. The upload icon (↑) and text are center-aligned but lack the "terminal" feel. It looks like a standard Bootstrap component rather than a custom "data terminal" interaction zone.
*   **Helper Text Typography:** The helper text ("Submissions are reviewed...") uses a standard sans-serif or default serif that clashes with the mandated `IBM Plex Mono` for labels/metadata. It lacks the monospaced "log" feel required by the brand protocol.
*   **CTA Hierarchy:** The "Cancel" link is correctly subdued, but the "SUBMIT FOR REVIEW →" button feels visually heavy and flat. It needs the specific amber (`#B87503`) treatment with a subtle offset shadow to match the "paper" aesthetic of the rest of the site.

### 2. Top 3 Highest-Impact Fixes

**Fix 1: Enforce the "Terminal" Typographic System (Labels & Helpers)**
The form currently looks like a standard SaaS widget. You must force the `IBM Plex Mono` stack for all functional text to signal "enterprise-grade data entry."
*   **CSS Guidance:**
    ```css
    /* Force mono on all labels and metadata */
    .modal label, .modal .helper-text {
      font-family: 'IBM Plex Mono', monospace;
      font-size: 0.75rem;
      letter-spacing: 0.05em;
      text-transform: uppercase; /* Or sentence-case per brief, but keep the font */
      color: #181712;
      opacity: 0.8;
    }

    /* Specific fix for the helper text to match "human" brief */
    .helper-text {
      text-transform: none; /* Override uppercase for sentence case */
      font-size: 0.8rem;
      color: #555;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    ```

**Fix 2: Redesign the Dropzone as a "Custom Data Port"**
Replace the generic dashed box with a structured input area that feels like uploading a file to a secure server.
*   **Layout/CSS Guidance:**
    *   Keep the `1px dashed #181712` border.
    *   Change background to `#F6F3EA` (matching the page bg) to make it pop against the white modal.
    *   Center the content vertically but use `IBM Plex Mono` for the instruction text: `Drag & drop logo.svg`.
    *   Add a hairline rule separator between the dropzone and the helper text below it.

**Fix 3: Refine the Header & CTA for "Editorial" Credibility**
The modal needs to look like a printed form from a high-end publication, not a pop-up.
*   **CSS/Layout Guidance:**
    *   **Header:** Add a `border-bottom: 1px solid #181712` to the header. Set `padding-bottom: 1.5rem`. Use `Fraunces` (Serif) for the title, size `1.25rem`, weight `700`.
    *   **Close Button:** Remove default styling. Apply `border: 1px solid #181712`, `width: 32px`, `height: 32px`, `display: flex`, `align-items: center`, `justify-content: center`. Use an SVG for the 'X' with `stroke-width: 1.5`.
    *   **Submit Button:** Ensure background is exactly `#B87503`. Add `box-shadow: 4px 4px 0px #181712` (the offset shadow). Remove border-radius. Text should be `IBM Plex Mono`, uppercase, `letter-spacing: 0.1em`.

### 3. Score: 6/10
**Reasoning:** The structure is logical and follows the UX audit's requirements well (2-col grid, quiet cancel). However, it fails the "Taste Protocol." It currently looks like a generic React component library modal (e.g., MUI/AntD) rather than a bespoke "data terminal × editorial publication." The typography is mixed, the inputs lack the specific "hairline" branding, and the dropzone is too conventional. It functions, but it doesn't yet *feel* like a Nairobi-based intelligence desk built it.

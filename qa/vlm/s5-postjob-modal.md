# s5-postjob-modal

### (1) Visual DEFECTS (Concrete & Visible)

*   **Modal Container (The "Box"):** The modal lacks the brand’s signature "offset shadow" and square-corner rigidity. It looks like a default browser `<dialog>`. It needs a hard `box-shadow: 8px 8px 0px #181712;` to feel like a physical data terminal card.
*   **Header Section:** The close icon (`x`) is a generic, thin-lined cross. It should be a solid, heavy geometric mark or a text-based `[CLOSE]` link in `IBM Plex Mono` to match the "terminal" aesthetic. The title `POST A JOB` is correctly cased but lacks the typographic weight of `Fraunces`.
*   **Field Grouping (The Grid):** The form uses a rigid 2-column grid for everything. This forces the `PAY – OPTIONAL...` section into a cramped, confusing layout. The label is squeezed above the dropdown, while the Min/Max inputs fight for space. It reads like a spreadsheet, not a human-crafted form.
*   **Input Fields (The "Ink"):** The borders are a soft, generic grey (`#ccc`). They must be the brand ink color (`#181712`) with a heavier stroke (`1.5px` or `2px`) to look "enterprise-grade" and tactile.
*   **Helper Text / Placeholders:** The placeholders inside the inputs ("e.g. Backend Engineer") fade out when typing. Real enterprise forms use persistent helper text *below* the input in `IBM Plex Mono`, sentence-case.
*   **Typography Hierarchy:** Labels like `COMPANY *` and `ROLE TITLE *` are using a standard sans-serif (likely Inter/System UI). They must be `IBM Plex Mono`, uppercase, tracked-out (`letter-spacing: 0.05em`), and smaller (`11px` or `12px`).
*   **The "Pay" Section:** The logic here is visually broken. "Optional, but it doubles replies" is a critical value prop, but it's crammed into a tiny label. It needs to be a distinct sub-header or a highlighted callout box.
*   **Textareas:** The `DUTIES` and `QUALIFICATIONS` boxes lack the "paper" texture. They need the specific background tint (`#F6F3EA` or pure white if the modal is already paper-colored) and sharper corners.

---

### (2) TOP 3 Highest-Impact Fixes

**1. Enforce the "Data Terminal" Styling System (CSS Overhaul)**
The current UI feels like SaaS vaporware. You need to ground it in the brand's "paper/ink" reality.
*   **Modal Wrapper:** `background: #F6F3EA; border: 2px solid #181712; box-shadow: 10px 10px 0px #181712; border-radius: 0;`
*   **Inputs/Selects:** `border: 2px solid #181712; background: #fff; font-family: 'IBM Plex Mono';`
*   **Labels:** `font-family: 'IBM Plex Mono'; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #181712; margin-bottom: 8px; display: block;`

**2. Restructure Layout for Scannability (Grid Logic)**
Stop forcing 2 columns on complex fields. Use vertical stacking for "heavy" data entry to reduce cognitive load.
*   **Top Row (Identity):** Keep Company + Role Title side-by-side (50%/50%).
*   **Middle Row (Logistics):** Stack Location + Employment Type vertically? Or keep side-by-side but ensure Email gets full width below them.
*   **The "Pay" Block (Crucial Fix):** Make this a full-width `<fieldset>` with a top-border or background highlight.
    *   *Layout:* Header ("Pay Range") -> Helper text ("Optional...") -> Row of [Disclosure Dropdown] [Min Input] [Max Input].
    *   *CSS:* `display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-top: 24px; padding-top: 24px; border-top: 1px solid #181712;`

**3. Humanize the Micro-copy & Inputs**
Move away from "form builder" defaults to "Nairobi desk" editorial tone.
*   **Placeholders:** Remove internal placeholders. Move that text to a `div.helper-text` below the input.
    *   *Example:* Label: `ROLE TITLE`. Helper: `e.g. Senior Backend Engineer`.
    *   *Style:* `font-size: 13px; color: #666; font-style: italic; margin-top: 4px;`
*   **Textareas:** Add a subtle character count or line hint in the bottom right corner of the text area (e.g., `// one line per duty`) to feel like a code editor or notepad.

---

### (3) Score: 5 / 10

**Verdict:** It functions, but it has zero "soul." Currently, it looks like a generic React component library modal pasted over your beautiful homepage. It fails the "enterprise-grade yet human" brief because it relies on system fonts, weak borders, and cramped spacing. To hit the 8-9 range, it needs to look like a physical job application card sitting on a messy desk—sharp edges, heavy ink, and clear, mono-spaced instructions.

# s5r-postjob-modal

### 1. Visual DEFECTS (Concrete & Cited)

*   **Modal Container (Global):** The modal lacks the brand's signature "offset shadow" (e.g., `box-shadow: 4px 4px 0 #181712`). It looks like a generic HTML `<dialog>` floating on top, lacking the "paper" weight of the rest of the UI.
*   **Header Section:** The close icon (`x`) is a default, thin-lined UI element. It clashes with the heavy, editorial aesthetic. The title "POST A JOB" is correctly in `IBM Plex Mono`, but it lacks the hairline rule separator that usually defines the header boundary in this design system.
*   **Fieldset: Pay Disclosure:** The grouping is good, but the visual hierarchy is flat. The label "PAY – OPTIONAL..." is screaming in all-caps mono, competing with the field labels inside. The dropdown for "Not disclosed" and the number inputs have slightly misaligned baselines.
*   **Textareas (Duties/Qualifications):** The placeholder text ("What the person will actually do...") is too long and conversational for a minimalist data terminal. It creates visual noise before the user even types. The textareas lack the subtle "paper" background texture or inner shadow seen in high-end editorial forms.
*   **Missing Fieldset (How-to-Apply):** The brief mentions a "how-to-apply method + destination + deadline fieldset," but it is missing from this view. If it's below the fold, the scroll indicator is absent.
*   **Background Context:** The backdrop blur/dim is too aggressive, completely washing out the underlying "data terminal" context.

### 2. TOP 3 Highest-Impact Fixes

**Fix 1: Implement the "Offset Paper" Modal Style**
The modal currently looks like a SaaS pop-up. It needs to look like a physical card placed on the desk.
*   **CSS Guidance:**
    ```css
    .modal-container {
      background-color: #F6F3EA; /* Paper */
      border: 1px solid #181712; /* Ink border */
      box-shadow: 6px 6px 0px #181712; /* Hard offset shadow */
      border-radius: 0; /* Square corners per protocol */
      padding: 32px;
      max-width: 720px;
    }
    ```

**Fix 2: Refine Typography & Spacing for "Human" Enterprise Feel**
The all-caps labels are too loud. We need to use sentence-case for helpers and tighten the grid to feel like a precise Nairobi desk ledger, not a bloated US SaaS form.
*   **Layout Guidance:**
    *   Change primary labels (COMPANY, ROLE TITLE) to `text-transform: uppercase; font-family: 'IBM Plex Mono'; font-size: 0.75rem; letter-spacing: 0.05em;`.
    *   Change helper text (inside the Pay fieldset) to `text-transform: none; font-family: 'IBM Plex Mono'; color: #666; font-size: 0.8rem;`.
    *   Reduce vertical margin between fieldsets from ~40px to ~24px.
    *   Add a `border-bottom: 1px solid #E5E2D9` between major sections (e.g., after Package, before Pay).

**Fix 3: Fix Input Aesthetics & Placeholders**
The inputs look like browser defaults. They need to match the "terminal" input style (square, monospace values).
*   **CSS/Layout Guidance:**
    *   **Inputs:** `border: 1px solid #181712; background: #fff; border-radius: 0; padding: 12px; font-family: 'IBM Plex Mono';`
    *   **Placeholders:** Shorten them. Use "List key duties..." instead of the full sentence.
    *   **Pay Fieldset:** Wrap the three inputs (Disclosure, Min, Max) in a flex container with `gap: 16px`. Ensure the "Min/Max (KSH)" labels are tiny (10px) and sit *above* the inputs, not beside them, to clean up the horizontal space.

### 3. Score: 6/10

**Reasoning:**
It functions, but it fails the "taste protocol." It feels like a standard Bootstrap modal was dropped onto a custom-designed site.
*   **Credibility Hit:** The lack of the offset shadow and square corners makes it look cheap/template-like compared to the underlying list view.
*   **Market Fit:** The "Never pay to apply" pledge is excellent for KE market trust (fighting scam perception), but its visual execution is weak—it's just text, not a distinct "Trust Badge" component.
*   **Verdict:** It passes usability but fails the "Editorial Publication" sniff test. It needs harder edges, stricter grids, and quieter typography to hit that 9/10 "Nairobi Desk" vibe.

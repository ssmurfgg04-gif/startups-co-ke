# s5r-founder-modal

### 1. Visual DEFECTS (Concrete & Visible)

*   **Modal Container (Close Button):** The close 'X' is a generic, unstyled square with a thin border. It lacks the "offset shadow" or "hairline rule" craft specified in the brand protocol. It looks like a default browser element, not a custom data-terminal component.
*   **Modal Container (Header):** "SUBMIT YOUR STARTUP" is set in a standard sans-serif font. It fails to use the required **Fraunces display serif** for primary headings, breaking the editorial authority of the brand.
*   **Form Grid (Rhythm):** The 2-column grid is rigid. The "County" dropdown and "Stage" dropdown have misaligned baselines relative to their labels compared to the text inputs above them. The vertical spacing between the "One-Liner" input and the "Company Logo" dropzone is too tight, compressing the "breathing room" needed for an enterprise feel.
*   **Dropzone (Visual Weight):** While the dashed border is correct, the background fill is too dark/grey (`#F0F0F0` approx). It should be lighter (`#F6F3EA` or white) to feel "quiet" and premium. The upload icon feels slightly generic.
*   **Helper Text (Typography):** The helper text below the dropzone uses a standard sans-serif. It must use **IBM Plex Mono** to match the "data terminal" aesthetic. Furthermore, the info icon `i` is too large and bold; it should be a hairline circle or a subtle glyph to fit the minimalist UI.
*   **CTA Section (Hierarchy):** The "Cancel" link is correctly underlined and quiet, but the spacing between it and the "Submit" button is loose. The amber CTA button lacks the specific "offset shadow" depth that defines the brand's tactile quality.

---

### 2. TOP 3 Highest-Impact Fixes

**Fix 1: Typographic Authority (The "Editorial" Fix)**
*   **Issue:** The modal header and labels look like a SaaS template, not a Nairobi publication.
*   **Guidance:**
    *   Change `h2` / Modal Title to **Fraunces Serif**, weight 700, size ~24px, color `#181712`. Letter-spacing -0.02em.
    *   Change all Labels ("COMPANY NAME", "SECTOR") to **IBM Plex Mono**, size 11px, uppercase, color `#181712` (or 60% opacity), tracking 0.08em.
    *   Change Helper Text to **IBM Plex Mono**, size 13px, sentence-case, color `#555`.

**Fix 2: The "Crafted" Dropzone (The "Enterprise-Human" Fix)**
*   **Issue:** The file upload area looks like a standard HTML5 drag-drop demo.
*   **Guidance:**
    *   **Background:** Set to pure White (`#FFFFFF`) or very faint paper (`#FCFBF7`).
    *   **Border:** 1px dashed `#B87503` (Amber) or `#CCC`. Radius 0px (Square corners per protocol).
    *   **Internal Layout:** Center align content. Use a 16x16 SVG icon (upload arrow) in `#0E4630`.
    *   **Text:** "Drag & drop your logo here..." in IBM Plex Mono.
    *   **Interaction:** On hover, border turns solid `#0E4630`, background shifts to `#F6F3EA`.

**Fix 3: Refined Controls & Close (The "Anti-Cliché" Fix)**
*   **Issue:** The Close button and Submit button lack the "offset shadow" signature style.
*   **Guidance:**
    *   **Close Button:** Remove border. Use an 'X' in IBM Plex Mono. Add a hover state where the background becomes `#181712` and text becomes `#F6F3EA`.
    *   **Submit CTA:** Background `#B87503` (Amber). Text White, Bold, IBM Plex Mono Uppercase (Size 12px).
    *   **Shadow:** Apply `box-shadow: 4px 4px 0px #181712;` (The offset shadow). On active/click: `transform: translate(2px, 2px); box-shadow: 2px 2px 0px #181712;`.

---

### 3. Score: 6.5 / 10

**Verdict:** Functional but currently lacking "soul." It reads as a standard Webflow form overlay rather than a bespoke data-terminal component.

*   **+ points:** Good use of 2-column grid efficiency. Correct implementation of the "quiet cancel" vs "loud submit" hierarchy logic. Sentence-case helper text is a nice touch for humanity.
*   **- points:** The typography is the biggest offender—using system fonts instead of Fraunces/Mono kills the credibility immediately. The dropzone is too grey/heavy. The missing offset shadows on the modal/buttons make it feel flat rather than tactile.

**To reach 9/10:** Apply the type scale rigorously (Serif headers, Mono labels/data), lighten the dropzone, and add the signature hard-offset shadows to the container and buttons.

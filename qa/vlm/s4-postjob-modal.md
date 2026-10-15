# VLM review — s4-postjob-modal

File: qa/shots/postjob-modal.png
Date: 2026-10-16

### 1. VISUAL DEFECTS (Concrete)

*   **Modal Container (The "SaaS Box"):** The modal is a generic, centered, soft-shadowed white rectangle. It lacks the "paper" texture (`#F6F3EA`), the sharp corners, and the offset shadow defined in your brand protocol. It looks like a default Bootstrap/React-Modal component, not a custom editorial insertion.
*   **Form Grid & Spacing:** The 2-column grid is too uniform. The "Company" and "Role Title" inputs are oversized relative to the data density of the rest of the site. There is excessive vertical whitespace between the "How should people apply?" dropdown and the pledge text, breaking the rhythm.
*   **Typography Hierarchy Failure:** 
    *   Labels ("COMPANY *", "LOCATION") are using a generic sans-serif or a weak weight of the mono font. They lack the `IBM Plex Mono` uppercase snap that defines your "data terminal" aesthetic.
    *   The placeholder text ("e.g. Backend Engineer") is too light and styled like a standard HTML input, lacking editorial intent.
    *   The "POST A JOB" header is centered and bland. It should be left-aligned, serif (`Fraunces`), or strictly terminal-style to match the nav.
*   **Input Styling:** The inputs have rounded corners (approx. 4px-6px radius visible). Your protocol demands **square corners**. The focus state on "Company" is a generic blue/orange glow; it should be a hard `#0E4630` border or an underline shift.
*   **The "Pledge" & Pricing Block:** The text "Applicants never pay..." is a wall of grey sans-serif. It reads like legal disclaimer copy from a US SaaS template. It needs to look like an editor's note—smaller, sharper, perhaps with a hairline rule above it.
*   **Action Buttons:** "CANCEL" is a ghost button with a thin border (too generic). "SEND IT FOR REVIEW" is a standard amber block. Neither has the weight or typography of a high-trust publication.

---

### 2. TOP 3 HIGHEST-IMPACT FIXES

**Fix 1: The "Paper Terminal" Modal Overhaul**
Ditch the white box. Make the modal background `#F6F3EA` (paper) with `#181712` (ink) text. Use a hard, offset shadow (e.g., `box-shadow: 4px 4px 0px #181712;`) and force `border-radius: 0`. This immediately signals "custom build" vs. "generic plugin."

**Fix 2: Typographic Restraint & Label Snapping**
Switch all labels to `IBM Plex Mono`, `font-size: 10px`, `letter-spacing: 0.05em`, `text-transform: uppercase`, `color: #181712` (or slightly muted). Remove all rounded corners from inputs (`border-radius: 0`). Set borders to `1px solid #D1CCC0` (ink at low opacity) that turns solid `#181712` on focus.

**Fix 3: Editorial Layout for the Footer**
Left-align the "Pledge" text. Reduce its size to `12px` or `13px` with increased `line-height` for readability. Place the pricing summary (`FREE LISTING KSH 0...`) in a distinct block—perhaps a full-width bar with a hairline top border (`border-top: 1px solid #181712`) and `IBM Plex Mono` formatting to make it look like a receipt or a ledger line, not a footnote.

---

### 3. SCORE: 3/10
**Verdict:** This fails the "Nairobi editorial team" test completely. It reads as a drop-in SaaS widget (likely copied from a Western job board template). The rounded corners, generic spacing, and lack of monospaced data-labels make it feel untrustworthy and mass-produced. It needs to be stripped down and rebuilt with your specific typographic constraints to earn credibility.

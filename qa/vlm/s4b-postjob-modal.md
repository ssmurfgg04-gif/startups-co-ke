# VLM review — s4b-postjob-modal

File: qa/shots/postjob-modal.png
Date: 2026-10-16

### 1. VISUAL DEFECTS (Concrete)

*   **Modal Container:** The `box-shadow` is too soft and diffuse. It reads like a standard Material UI or Bootstrap overlay rather than a "hard" physical object. The border weight looks closer to 1px than the requested 2px.
*   **Form Inputs:** The input fields (`Company`, `Role Title`, etc.) have rounded corners (approx. 4-6px radius). This violates the "square corners" brand rule. They also lack the specific "ink" border treatment, looking like default browser inputs.
*   **Typography Hierarchy:** The labels (`COMPANY *`, `ROLE TITLE *`) are using a generic sans-serif font stack. They are not set in **IBM Plex Mono** as per the brand protocol. The placeholder text inside the inputs lacks the editorial "ink" feel.
*   **Select Dropdowns:** The dropdown arrows are generic browser-default UI elements. They do not match the custom aesthetic of the rest of the terminal.
*   **Button Styling:** The primary CTA ("SEND IT FOR REVIEW") uses a gradient or flat amber fill that feels slightly too "digital." It needs to look more like a physical ink stamp or a solid block of color with a hard edge. The "CANCEL" button is too plain; it lacks the structural definition of the design system.
*   **Pledge Text:** The body copy ("Applicants never pay...") is too light in weight and lacks the authoritative serif or high-quality sans-serif texture required for an "editorial publication."

---

### 2. TOP 3 HIGHEST-IMPACT FIXES

**Fix 1: Enforce "Hard Terminal" Geometry & Borders**
The modal must look like a sheet of paper dropped on a desk, not a floating cloud.
*   **CSS Guidance:**
    ```css
    .modal-container {
      background-color: #F6F3EA; /* Paper */
      border: 2px solid #181712; /* Ink - Hard Rule */
      box-shadow: 8px 8px 0px #181712; /* Offset Shadow - No blur */
      border-radius: 0px !important; /* Square Corners */
    }
    
    /* Apply same logic to internal inputs */
    input, select {
      border: 1px solid #181712;
      border-radius: 0;
      background: #fff;
      font-family: 'IBM Plex Mono', monospace; /* Or clean sans for value */
    }
    ```

**Fix 2: Implement Editorial Typography Stack**
The current font usage erases the "Nairobi editorial team" vibe immediately.
*   **Layout/CSS Guidance:**
    *   **Labels:** Change all uppercase labels (`COMPANY`, `LOCATION`, `PACKAGE`) to `font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 1.5px; color: #181712; text-transform: uppercase;`
    *   **Headings:** Use `Fraunces` (Serif) for the Modal Header ("POST A JOB") to establish authority.
    *   **Body Copy:** Use a clean geometric sans (or the Serif) for the pledge text, ensuring line-height is generous (1.5) for readability.

**Fix 3: Custom Form Controls (Selects & Buttons)**
Generic form elements scream "SaaS Template."
*   **CSS/Layout Guidance:**
    *   **Selects:** Hide the default arrow (`appearance: none`) and inject a custom SVG arrow (downward chevron) in `#0E4630` (Green) or `#181712` (Ink).
    *   **Primary Button:** Make it `#B87503` (Amber) with **no gradient**, square corners, and uppercase `IBM Plex Mono` text. Add a subtle hover state that shifts the button 2px down and reduces the shadow to `6px 6px 0px` to simulate a physical press.
    *   **Secondary Button (Cancel):** Give it a transparent background, 1px ink border, and square corners.

---

### 3. SCORE: 6/10

**Reasoning:**
You have successfully killed the *layout* clichés (it's no longer a centered card with huge whitespace). The content structure (Pricing Ledger, Pledge) is smart. However, it currently reads as a **"Wireframe of a custom component"** rather than the finished product. The persistence of rounded corners on inputs and the lack of the specific Mono/Serif font pairing means it still retains ~40% "generic web form" DNA. Fix the geometry and fonts to hit 9/10.

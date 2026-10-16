# s5-contact

### 1. Visual DEFECTS

*   **Header Search Placeholder:** The search bar contains the placeholder `Search — press /`. This is a functional interaction hint, not editorial copy. It breaks the "data terminal × publication" immersion. It should be empty or contain a contextual query like `Search startups, people, funds`.
*   **Inconsistent Card Geometry:** The "Email" and "Phone" cards are sized to their content, while the "Office" card spans the full width. This creates a ragged, unbalanced "staircase" layout that violates the grid-based rigor of a data terminal.
*   **Missing Fast-Path Actions:** The brief specifies 6 fast paths (Submit startup, Post job, List event, Report issue, Sponsor, Investor membership). The screenshot only displays 4. The grid is visually incomplete.
*   **Weak Grid Definition:** The "Fast paths" grid relies on a single horizontal rule. Without vertical dividers (hairlines), the items read as a loose list rather than a structured directory or command palette.
*   **Footer Data Tag:** The black box `DATA · COMPILED FROM PUBLIC SOURCES` feels like a generic UI component rather than a printed marginalia note. It lacks the offset shadow and paper texture of the brand identity.

### 2. Top 3 Highest-Impact Fixes

**1. Enforce a Rigid 2-Column Contact Grid**
The contact details must sit in a strict 2-column grid to match the "Fast paths" section below.
*   **Layout:** Use CSS Grid: `grid-template-columns: 1fr 1fr; gap: 1px; background-color: #181712;` (the hairline color). 
*   **Cards:** Each card gets `background-color: #F6F3EA; padding: 24px;`.
*   **Result:** The "Office" card sits in the second row, spanning both columns (`grid-column: span 2`). This creates a perfect rectangular block of information.

**2. Transform Fast Paths into a "Command Palette"**
Make the fast paths look like selectable database records or terminal commands.
*   **Grid:** Apply the same hairline grid technique as above (borders via gap/background-color trick).
*   **Typography:** Change the link color from default green to Ink `#181712`. Use `font-weight: 600`.
*   **Interaction:** Add a subtle hover state: `background-color: #EDE9D5;` (a slightly darker paper shade) and translate the arrow icon `transform: translateX(4px);`.

**3. Humanize the Header & Footer**
*   **Search:** Remove the `/` shortcut text. Set placeholder to `e.g. M-Pesa` in Italics.
*   **Footer:** Replace the solid black box with a "stamp" style. Use the amber color `#B87503` for the border/text, add an `box-shadow: 4px 4px 0px rgba(24,23,18,0.15)`, and use `text-transform: uppercase; letter-spacing: 0.05em;` in IBM Plex Mono.

### 3. Score: 7/10

**Reasoning:** The tone is excellent—specifically the phrase *"we're a small desk"* hits the Nairobi-editorial brief perfectly. The typography hierarchy (Fraunces headers, Mono labels) is solid. However, it loses points for **layout sloppiness** (the misaligned contact cards) and **incompleteness** (missing grid items). It looks like a draft that hasn't been strictly gridded yet. To hit 9+, it needs the ruthless geometric precision of a printed datasheet.

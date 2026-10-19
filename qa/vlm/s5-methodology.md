# s5-methodology

**1. Concrete Visual DEFECTS**

*   **Header / Nav Dropdown:** The "Discover" dropdown is open and obscuring the page title. The dropdown lacks the brand's signature **offset shadow** (e.g., `box-shadow: 4px 4px 0 0 #181712`) and uses a generic grey border. It also violates the "square corners" rule with visible (if subtle) rounding.
*   **Typography Hierarchy:** The body copy is set too wide for comfortable reading (likely exceeding 75ch). The section subheads ("Status tags", "Rounds feed") use the same weight as the body text, creating a "wall of text" effect rather than a scannable document structure.
*   **The "One Rule" Opener:** The lead sentence ("The one rule...") is bolded but lacks the editorial weight of a true *dek* or *pull quote*. It feels like a formatting afterthought rather than a deliberate design choice.
*   **Footer Element:** The black "DATA · COMPILED FROM PUBLIC SOURCES" badge in the bottom-left looks like a stray UI element or a sticky footer that broke free. It lacks the `#F6F3EA` paper texture and hairline rule context of the rest of the page.
*   **Link Styling:** The inline link "funding database" uses a standard underline. It should use the brand amber (`#B87503`) or a custom highlight style to feel like a "terminal" cross-reference.

**2. Top 3 Highest-Impact Fixes**

*   **Fix 1: Implement "Terminal" Typography Rhythm (Layout/CSS)**
    *   **Issue:** The page reads like a Word doc, not a data terminal.
    *   **Guidance:** Constrain the main content container to `max-width: 680px` (or `65ch`). Increase vertical rhythm: set `margin-bottom: 2rem` on paragraphs. Style the `<h3>` equivalents (Status tags, Rounds feed) in **IBM Plex Mono**, uppercase, `letter-spacing: 0.05em`, with a `border-top: 1px solid #181712` and `padding-top: 1rem` to create distinct "data blocks."

*   **Fix 2: Visualize the Status Tags (Component Design)**
    *   **Issue:** The definitions for "Verified," "Confirmed," etc., are buried in text. This is a *methodology* page; these tags are the product.
    *   **Guidance:** Convert the list of status tags into a visual definition list (`<dl>`).
        *   **DT (Term):** A physical-looking tag component. Background `#F6F3EA`, border `1px solid #181712`, **square corners**, font `IBM Plex Mono`, padding `4px 8px`.
        *   **DD (Definition):** The explanatory text below it.
        *   *Effect:* This proves you have a system, not just a blog post.

*   **Fix 3: The "Nairobi Desk" Metadata Header (UI/UX)**
    *   **Issue:** The metadata line ("Compiled from public sources...") is too small and grey, getting lost.
    *   **Guidance:** Treat this as a "Document Control" block, typical of intelligence briefings.
        *   Place it directly under the H1 "How the data works."
        *   Use `font-family: 'IBM Plex Mono', monospace;`.
        *   Separate items with a middle dot `·` or a vertical pipe `|`.
        *   Color: `color: #0E4630` (Brand Green) for the date/source to imply "active/live" status.

**3. Score: 6/10**

**Verdict:** It builds trust through *content* specificity (the distinction between "Reported" and "Estimated" is excellent), but fails on *visual* credibility. Currently, it looks like a styled Medium post. To hit the "Data Terminal" brief, it needs stricter typographic grids, mono-spaced metadata, and visual representations of the data states (the tags) described in the text. The content is "small Nairobi desk"; the layout is "generic SaaS blog." Close the gap.

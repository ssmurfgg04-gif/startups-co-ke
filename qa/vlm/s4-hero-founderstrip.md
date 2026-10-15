# VLM review — s4-hero-founderstrip

File: qa/shots/hero-strip.png
Date: 2026-10-16

**Visual Defects**

*   **Masthead (Logo):** The "s." logo mark is too small and lacks the "hand-set" weight required for a display serif. The amber dot is barely visible, failing to act as the brand's primary visual anchor. The wordmark `startups.co.ke` is too light and gets lost against the paper background.
*   **Hero (Typography):** The headline "Kenya’s startup economy..." is solid, but the sub-headline is a dense wall of text. It lacks the editorial "air" (leading) expected of a premium data terminal. The search bar feels like a generic SaaS component rather than a bespoke input field.
*   **Founder Strip (Layout):** This section is critically crowded. The text block is squeezed between the left margin and the CTAs. The "CLAIM YOUR PROFILE" button uses a heavy, generic gradient/fill that clashes with the minimalist "ink on paper" aesthetic. It looks like a standard WordPress plugin banner.
*   **Cookie Banner:** A massive, distracting overlay that blocks the "Explore by region" content. It uses rounded corners and soft shadows that violate the "square corners, offset shadows" protocol.

**Top 3 Fixes**

1.  **Bloat the Masthead & Fix the Wordmark:**
    Increase the logo mark size by ~40%. Use `Fraunces` at `font-weight: 900` for the "s". Make the amber dot (`#B87503`) significantly larger—almost the height of the 's'. Change the wordmark to `IBM Plex Mono` or a heavier `Fraunces` at `#181712` to ensure it reads as "data," not just "web text."
    ```css
    .logo-mark { font-family: 'Fraunces', serif; font-size: 2.5rem; font-weight: 900; color: #181712; }
    .logo-dot { color: #B87503; font-size: 1.2em; vertical-align: super; }
    .wordmark { font-family: 'IBM Plex Mono', monospace; font-weight: 600; letter-spacing: -0.02em; margin-left: 1rem; }
    ```

2.  **De-crowd the Founder Strip (The "Why"):**
    Increase the vertical padding of this strip to `padding: 4rem 0`. Change the layout so the copy and CTAs are not fighting for space. Replace the heavy amber button with an **outlined** button (`border: 2px solid #181712; background: transparent`) to match the "editorial" vibe. The secondary CTA should be plain underlined text.
    ```css
    .founder-strip { padding: 4rem 0; border-top: 1px solid #181712; }
    .btn-primary { 
      border: 2px solid #181712; 
      background: transparent; 
      color: #181712; 
      padding: 1rem 2rem; 
      font-family: 'IBM Plex Mono', monospace; 
      text-transform: uppercase; 
      transition: all 0.2s ease;
    }
    .btn-primary:hover { background: #181712; color: #F6F3EA; }
    ```

3.  **Enforce the "Terminal" Aesthetic on UI Elements:**
    Remove all border-radius (`border-radius: 0`) from the search bar, buttons, and the ecosystem snapshot box. Apply a hard, offset shadow to the "Ecosystem Snapshot" card to make it look like a physical index card placed on the desk.
    ```css
    .snapshot-card, .search-input, .btn { border-radius: 0 !important; }
    .snapshot-card { 
      box-shadow: 4px 4px 0px #181712; 
      border: 1px solid #181712; 
      background: #F6F3EA; 
    }
    ```

**Score: 6/10**
It has the bones of a high-end editorial product—the typography choice and color palette are correct—but it currently suffers from "SaaS defaultism." The spacing is too tight, the buttons are too generic, and the hierarchy doesn't yet scream "Nairobi editorial team." It needs more breathing room and stricter adherence to the square/hairline grid to reach its potential.

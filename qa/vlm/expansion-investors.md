# qa/vlm/expansion-investors.raw.json

**INVESTOR CREDIBILITY SCORE: 4/10**

### **VISUAL DEFECTS**

**1. COOKIE OVERLAY OBSTRUCTION**
The "Cookies & Data" modal is aggressively positioned, completely obscuring the primary data payload (the expanded fund's track record rows). It creates a "paywall" or broken-state appearance that hides the site's core value prop.

**2. TYPOGRAPHIC & GRAMMATICAL ERRORS**
*   **Intro Copy:** "These and cheque ranges are self-reported..." contains a glaring typo ("These" instead of "These ranges").
*   **Label Inconsistency:** The search placeholder reads "Search - press /", which is non-standard UI language for a web directory.
*   **Header Density:** The top ticker bar is cluttered with mixed data types (Market data vs. Startup news), reducing scannability.

**3. DATA VISUALIZATION & LAYOUT FAILURES**
*   **Truncated Content:** The description text under the fund name ("...market entrepreneur in East and West Africa whose businesse") is abruptly cut off without an ellipsis or expansion mechanism.
*   **Chip Hierarchy:** The "$1M–$10M+" chip lacks clear visual separation from the location chips (Nairobi, Lagos, London), making the "Stage/Sector" vs. "Geo" distinction ambiguous.
*   **Alignment:** The "Focus Sectors" sidebar on the left feels disconnected from the main card grid, creating a visual void where the cookie modal sits.

---

### **TOP 3 FIXES**

1.  **KILL THE MODAL OR REPOSITION:** Move cookie consent to a bottom banner or a subtle slide-in. Never block the center of the viewport on a data-heavy dashboard; it signals an amateurish tech stack implementation.
2.  **PROOFREAD & STANDARDIZE:** Fix the "These" typo immediately—it destroys trust in a "intelligence" product. Standardize the search placeholder to "Search investors, funds..." and ensure all labels use consistent casing (UPPERCASE for IBM Plex Mono).
3.  **FIX THE GRID & TRUNCATION:** Implement a strict max-height with CSS `line-clamp` for fund descriptions. Ensure the "Verified" badge and stage chips have distinct background fills (e.g., light green for Verified, light amber for Stage) to differentiate metadata types at a glance.

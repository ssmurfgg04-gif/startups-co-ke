"""Screenshot scripts/og.html -> public/og.png (1200x630) for WhatsApp/OG previews."""
from playwright.sync_api import sync_playwright
import pathlib

ROOT = pathlib.Path("/home/z/my-project")
with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 1200, "height": 630}, device_scale_factor=1)
    page.goto((ROOT / "scripts/og.html").as_uri())
    page.wait_for_timeout(400)
    page.screenshot(path=str(ROOT / "public/og.png"))
    browser.close()
print("og.png written")

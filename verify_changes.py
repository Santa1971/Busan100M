from playwright.sync_api import sync_playwright, expect
import os

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    # Define file path
    file_path = f"file://{os.getcwd()}/index.html"

    # Navigate to the page
    page.goto(file_path)

    # Assertions
    expect(page).to_have_title("부산 갈맷길 100M | 3.1절 특별 이벤트")
    expect(page.locator("#countdown-card")).to_be_visible()

    # Take screenshot
    os.makedirs("/home/jules/verification", exist_ok=True)
    screenshot_path = "/home/jules/verification/index_countdown.png"
    page.screenshot(path=screenshot_path)

    browser.close()
    print(f"Screenshot saved to {screenshot_path}")

with sync_playwright() as playwright:
    run(playwright)

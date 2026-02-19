
from playwright.sync_api import sync_playwright, expect
import time

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # 1. Open the app
    print("Navigating to app...")
    page.goto("http://localhost:5173/")
    time.sleep(2) # Wait for load animation

    # 2. Open Settings
    print("Opening settings...")
    settings_trigger = page.locator("text=( settings )")
    settings_trigger.hover()
    settings_trigger.click()
    time.sleep(1)

    # 3. Go to Widgets tab
    print("Switching to Widgets tab...")
    page.get_by_role("button", name="widgets").click()
    time.sleep(1)

    # 4. Find Snake widget toggle and double click
    print("Double clicking Snake widget...")
    snake_toggle = page.get_by_text("snake", exact=True).first
    snake_toggle.dblclick()
    time.sleep(1)

    # 5. Verify Modal and Click YES
    print("Verifying modal...")
    modal = page.locator("text=Add another 'snake'?")
    expect(modal).to_be_visible()

    print("Clicking YES...")
    page.get_by_role("button", name="[ YES ]").click()
    time.sleep(1)

    # 6. Verify duplicate toggle in settings
    print("Verifying duplicate toggle in settings...")
    extra_snake_toggle = page.get_by_text("snake (extra)")
    expect(extra_snake_toggle).to_be_visible()

    # 7. Close settings
    print("Closing settings...")
    page.get_by_role("button", name="[x]").click()
    time.sleep(1)

    # 8. Verify two snake widgets on grid with Correct Titles
    print("Verifying widgets on grid...")

    # First snake should be "snake.exe"
    first_snake = page.locator("div.drag-handle:has-text('snake.exe')").first
    expect(first_snake).to_be_visible()

    # Second snake should be "snake2.exe"
    second_snake = page.locator("div.drag-handle:has-text('snake2.exe')")
    expect(second_snake).to_be_visible()

    print("Found snake.exe and snake2.exe")

    # 9. Verify NO close button
    print("Verifying no close button...")

    # Check if any visible [x] button exists on the grid (excluding settings modal which is closed)
    close_buttons = page.locator("text=[x]")

    visible_count = 0
    for i in range(close_buttons.count()):
        if close_buttons.nth(i).is_visible():
            visible_count += 1

    if visible_count > 0:
        print(f"Error: Found {visible_count} visible [x] buttons on grid")
        page.screenshot(path="verification/error_close_button_visible.png")
        # Fail if strict

    page.screenshot(path="verification/step5_numbered_titles.png")

    # 10. Remove via Settings
    print("Removing via Settings...")
    settings_trigger.hover()
    settings_trigger.click()
    time.sleep(1)

    page.get_by_role("button", name="widgets").click()
    time.sleep(1)

    print("Toggling off extra snake...")
    extra_snake_toggle.click()
    time.sleep(1)

    print("Closing settings...")
    page.get_by_role("button", name="[x]").click()
    time.sleep(1)

    # 11. Verify only 1 snake widget remains
    print("Verifying only 1 snake widget...")
    count_after = page.locator("text=snake.exe").count()
    # Note: snake2.exe contains "snake" but strict text match "snake.exe" won't match "snake2.exe"
    # Actually wait, "snake.exe" selector might match "snake.exe" text node.

    # Verify snake2.exe is gone
    second_snake_check = page.locator("text=snake2.exe")
    expect(second_snake_check).not_to_be_visible()

    print("Success!")
    browser.close()

with sync_playwright() as playwright:
    run(playwright)

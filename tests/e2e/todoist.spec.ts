import { test, expect, chromium, BrowserContext, Page } from '@playwright/test';
import path from 'path';

const extensionPath = path.resolve(process.cwd(), 'extension');

let context: BrowserContext;
let page: Page;

test.beforeAll(async () => {
    context = await chromium.launchPersistentContext('', {
        headless: false,
        args: [
            `--disable-extensions-except=${extensionPath}`,
            `--load-extension=${extensionPath}`,
            '--no-first-run',
            '--disable-default-apps',
        ],
    });

    page = await context.newPage();
    await page.goto('chrome://newtab');
    await page.waitForSelector('#root', { timeout: 10000 });
    await page.waitForTimeout(2000);
});

test.afterAll(async () => {
    await context?.close();
});

test.describe('Todoist Integration', () => {

    test('settings panel shows Todo Widget section with Todoist toggle', async () => {
        await page.hover('text=( settings )');
        await page.click('text=( settings )');
        await page.click('button:has-text("advanced")');
        await page.waitForTimeout(500);

        const todoSection = page.locator('h3:has-text("Todo Widget")');
        await expect(todoSection).toBeVisible();

        const todoistToggle = page.locator('text=Sync with Todoist');
        await expect(todoistToggle).toBeVisible();
    });

    test('enabling Todoist toggle shows API key input', async () => {
        await page.click('text=Sync with Todoist');
        await page.waitForTimeout(300);

        const apiKeyInput = page.locator('input[placeholder="Enter your Todoist API token"]');
        await expect(apiKeyInput).toBeVisible();

        const helperText = page.locator('text=todoist.com. Stored locally');
        await expect(helperText).toBeVisible();
    });

    test('entering a bad key shows permission prompt or error', async () => {
        const apiKeyInput = page.locator('input[placeholder="Enter your Todoist API token"]');
        await apiKeyInput.fill('not-a-real-key');
        await page.waitForTimeout(500);

        // Close settings
        await page.click('button:has-text("[x]")');
        await page.waitForTimeout(3000);

        // In automated tests, host permission isn't granted so widget shows
        // either a permission prompt or (if permission is already granted) an API error
        const permissionBtn = page.locator('text=GRANT TODOIST ACCESS');
        const errorMsg = page.locator('text=/todoist:/');
        await expect(permissionBtn.or(errorMsg)).toBeVisible({ timeout: 10000 });
    });

    test('disabling Todoist toggle returns to local mode', async () => {
        await page.hover('text=( settings )');
        await page.click('text=( settings )');
        await page.click('button:has-text("advanced")');
        await page.waitForTimeout(500);

        // Click the Sync with Todoist toggle to disable it
        const toggleLabel = page.locator('span:text-is("Sync with Todoist")');
        await toggleLabel.click();
        await page.waitForTimeout(500);

        // The Todoist API token input should now be hidden
        const apiKeyInput = page.locator('input[placeholder="Enter your Todoist API token"]');
        await expect(apiKeyInput).not.toBeVisible({ timeout: 3000 });

        // Close settings
        await page.click('button:has-text("[x]")');
        await page.waitForTimeout(500);

        // Widget should show local mode content
        const emptyList = page.locator('text=empty list...');
        const localTasks = page.locator('span:has-text("[ ]"), span:has-text("[x]")');
        await expect(emptyList.or(localTasks.first())).toBeVisible({ timeout: 5000 });
    });
});

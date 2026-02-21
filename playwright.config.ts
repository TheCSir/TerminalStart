import { defineConfig } from '@playwright/test';
import path from 'path';

const extensionPath = path.resolve(process.cwd(), 'extension');

export default defineConfig({
    testDir: './tests/e2e',
    testMatch: '**/*.spec.ts',
    timeout: 30000,
    use: {
        // Chrome extension testing requires headed mode with a persistent context
        // configured per-test via BrowserType.launchPersistentContext
    },
    projects: [
        {
            name: 'chromium-extension',
            use: {
                // Extension path passed to tests via metadata
            },
            metadata: {
                extensionPath,
            },
        },
    ],
});

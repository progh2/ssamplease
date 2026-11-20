import { type Page } from '@playwright/test';
export async function replyMessage(page: Page, _intent = 'ack') {
 await page.locator('.task-workspace:not([hidden]) .quick-replies button').first().click();
}

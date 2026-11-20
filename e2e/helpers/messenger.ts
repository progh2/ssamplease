import { type Page } from '@playwright/test';
export async function replyMessage(page: Page, intent = 'ack') {
 const composer = page.locator('.task-workspace:not([hidden]) .chat-composer');
 const attachment = page.locator('.task-workspace:not([hidden]) .chat-attachment');
 if (await attachment.count()) await attachment.last().click();
 await composer.getByLabel('답장 의도').selectOption(intent);
 await composer.getByRole('button', {name:'답장 예시 넣기',exact:true}).click();
 if (await composer.getByRole('checkbox').count()) await composer.getByRole('checkbox').check();
 await composer.getByRole('button',{name:'전송',exact:true}).click();
 await page.getByRole('dialog').getByRole('button',{name:'확인',exact:true}).click();
}

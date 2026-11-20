import { test, expect } from '@playwright/test';
import data from '../src/content/messenger.json' with { type: 'json' };
const dayById: Record<string,number>={message_welcome:1,message_request:3,message_broadcast:4,message_admin:5,message_homeroom:6,message_approval_return:7,message_approval_done:9,message_exam_schedule:10,message_room_change:12,message_budget_close:14,message_final:15};
for(const [id,message] of Object.entries(data)) test(`chat ${id}: two valid tones and a visible reaction`,async({page})=>{
 for(const choice of message.quickReplies){
 await page.goto('/');await page.evaluate(day=>localStorage.setItem('teachers-please-save-v1',JSON.stringify({version:8,state:{currentDay:day}})),dayById[id]);await page.reload();
 await page.getByRole('button',{name:'핫메신저',exact:true}).click();
 await page.locator('.conversation-list button').filter({hasText:message.name.ko}).click();
 await expect(page.getByRole('combobox')).toHaveCount(0);
 await expect(page.getByRole('textbox',{name:'답장 내용'})).toHaveCount(0);
 await page.getByRole('button',{name:choice.text.ko,exact:true}).click();
 await expect(page.getByRole('alert')).toHaveCount(0);
 await expect(page.getByRole('dialog')).toHaveCount(0);
 await expect(page.locator('.chat-entry').last().locator('.chat-bubble.received').last()).toHaveText(choice.reply.ko);
 await page.reload();await page.getByRole('button',{name:'핫메신저',exact:true}).click();await page.locator('.conversation-list button').filter({hasText:message.name.ko}).click();
 await expect(page.locator('.chat-entry').last().locator('.chat-bubble.sent')).toHaveText(choice.text.ko);
 }
});

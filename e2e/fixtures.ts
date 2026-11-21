import { test as base } from '@playwright/test';
export { expect } from '@playwright/test';
export type { Page } from '@playwright/test';
export const test=base.extend({page:async({page},use)=>{
 const enter=async()=>{
  await page.locator('.title-screen, .app-shell, .ending').first().waitFor();
  if(await page.locator('.title-screen').count()){
   const resume=page.getByRole('button',{name:/^(이어하기|Continue)/});
   if(await resume.isEnabled()) await resume.click();
   else await page.getByRole('button',{name:/^(새 게임|New game)$/}).click();
  }
 };
 const go=page.goto.bind(page);const reload=page.reload.bind(page);
 page.goto=async(...args)=>{const response=await go(...args);await enter();return response;};
 page.reload=async(...args)=>{const response=await reload(...args);await enter();return response;};
 await use(page);
}});

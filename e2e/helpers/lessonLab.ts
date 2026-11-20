import { expect, type Page } from '@playwright/test';
import labs from '../../src/content/lessonLabs.json' with { type: 'json' };
export async function finishLab(page: Page, id: string, en = false) {
  const lab = labs[id as keyof typeof labs];
  const lang = en ? 'en' : 'ko';
  await expect(page.getByRole('heading', {name:lab.title[lang],exact:true})).toBeVisible();
  await page.getByRole('button',{name:en?'Compare the class responses':'학생 활동 결과 대조',exact:true}).click();
  await expect(page.getByRole('alert')).toBeVisible();
  for (const card of lab.cards) {
    await page.locator('.lab-cards button').filter({hasText:card.text[lang]}).click();
    await page.locator('.lab-decision').getByRole('button',{name:lab.bins.find(bin=>bin.id===card.target)!.label[lang],exact:true}).click();
  }
  await page.getByRole('button',{name:en?'Compare the class responses':'학생 활동 결과 대조',exact:true}).click();
  await expect(page.getByRole('status')).toContainText(lab.ending[lang]);
  await page.getByRole('button',{name:en?'Add workshop results to lesson record':'활동 결과를 수업 기록에 반영',exact:true}).click();
}

import { type Page } from '@playwright/test';
import grading from '../../src/content/grading.json' with { type: 'json' };
export async function markBatch(page: Page, id: keyof typeof grading) {
 const data=grading[id];
 for(const paper of data.papers){
  const score=paper.ambiguous?'같이 보기':data.criteria.reduce((s,c)=>s+(paper.credits.includes(c.id)?c.points:0),0)+'점';
  await page.getByRole('button',{name:score,exact:true}).click();
  await page.getByRole('button',{name:'점수 칸에 도장 찍기',exact:true}).click();
  await page.getByRole('button',{name:'처리함으로 슥 넘기기',exact:true}).click();
 }
 await page.getByRole('button',{name:'빨간 펜 뚜껑 닫기',exact:true}).click();
 await page.getByRole('dialog').getByRole('button',{name:'확인',exact:true}).click();
}

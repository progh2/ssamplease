import {expect,test} from '@playwright/test';
test('stamp, doodle, correct and file without a quiz gate',async({page})=>{
 await page.goto('/');await page.evaluate(()=>localStorage.setItem('teachers-please-save-v1',JSON.stringify({version:8,state:{currentDay:2}})));await page.reload();
 const open=()=>page.getByRole('button',{name:'업무 시작 · 형성평가 채점',exact:true}).click();await open();
 await expect(page.getByRole('combobox')).toHaveCount(0);await expect(page.getByRole('checkbox')).toHaveCount(0);
 await page.getByRole('button',{name:'꽃 스티커 ✿',exact:true}).click();await page.getByRole('button',{name:'답안에 빨간 동그라미 그리기',exact:true}).click();
 await page.getByRole('button',{name:'0점',exact:true}).click();await page.getByRole('button',{name:'점수 칸에 도장 찍기',exact:true}).click();
 await expect(page.getByRole('status')).toContainText('3/3');await expect(page.getByRole('alert')).toHaveCount(0);
 await page.reload();await open();await expect(page.locator('.pen-circle')).toHaveCount(1);await expect(page.getByLabel('꽃 스티커',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'처리함으로 슥 넘기기',exact:true}).click();
 for(let i=0;i<2;i++){await page.getByRole('button',{name:'같이 보기',exact:true}).click();await page.getByRole('button',{name:'점수 칸에 도장 찍기',exact:true}).click();await page.getByRole('button',{name:'처리함으로 슥 넘기기',exact:true}).click();}
 await page.getByRole('button',{name:'빨간 펜 뚜껑 닫기',exact:true}).click();await page.getByRole('dialog').getByRole('button',{name:'확인',exact:true}).click();
 const state=await page.evaluate(()=>JSON.parse(localStorage.getItem('teachers-please-save-v1')!).state);
 expect(state.taskStatuses.grading_basic).toBe('resolved_with_issue');expect(state.memories.grading_basic.quickRecords).toEqual(['3','review','review']);expect(state.memories.grading_basic.teachingPlan).toBe('trace');
});

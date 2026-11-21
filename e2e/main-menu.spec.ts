import {test,expect} from '@playwright/test';
test('title, continue, cancel new game, settings and pause preserve the story',async({page})=>{
 await page.goto('/');await expect(page.getByRole('button',{name:/^이어하기/})).toBeDisabled();
 await page.getByRole('button',{name:'설정',exact:true}).click();
 await page.getByLabel('글자 크게 보기',{exact:true}).check();await page.getByLabel('화면 움직임 줄이기',{exact:true}).check();
 await page.getByRole('button',{name:'돌아가기',exact:true}).click();await page.getByRole('button',{name:'새 게임',exact:true}).click();
 await page.getByRole('button',{name:'업무 시작 · 선배 교사의 환영 메시지',exact:true}).click();await page.locator('.quick-replies button').first().click();
 await page.getByRole('button',{name:'업무 시작 · 가정통신문 3장 확인',exact:true}).click();await page.getByRole('button',{name:'파란 잉크',exact:true}).click();await page.getByRole('button',{name:'서류에 도장 찍기',exact:true}).click();
 await page.getByRole('button',{name:'게임 메뉴',exact:true}).click();await page.getByRole('button',{name:'설정',exact:true}).click();
 await page.getByRole('combobox',{name:'언어',exact:true}).selectOption('en');await page.getByRole('button',{name:'Back',exact:true}).click();await page.getByRole('button',{name:'Resume',exact:true}).click();
 await expect(page.getByText('RECEIVED',{exact:true})).toBeVisible();await page.getByRole('button',{name:'Game menu',exact:true}).click();await page.getByRole('button',{name:'Return to title',exact:true}).click();
 await expect(page.getByRole('button',{name:/^Continue/})).toContainText('1/3');await page.getByRole('button',{name:'New game',exact:true}).click();await page.getByRole('button',{name:'Keep my story',exact:true}).click();
 await page.reload();await expect(page.locator('html')).toHaveAttribute('data-large-text','true');await page.getByRole('button',{name:/^Continue/}).click();
 await page.getByRole('button',{name:/^Open task · 가정통신문/}).click();await expect(page.getByText('RECEIVED',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Game menu',exact:true}).click();await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).toHaveCount(0);
});
test('confirmed new game clears story but retains settings',async({page})=>{
 await page.goto('/');await page.evaluate(()=>localStorage.setItem('teachers-please-save-v1',JSON.stringify({version:8,state:{currentDay:9}})));await page.reload();
 await page.getByRole('button',{name:'새 게임',exact:true}).click();await page.getByRole('button',{name:'첫 출근부터 시작',exact:true}).click();await expect(page.locator('.day-badge')).toHaveText('01');
});

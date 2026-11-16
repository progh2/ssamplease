import { expect, test, type Page } from '@playwright/test';

async function closeFeedback(page: Page) {
  await page.getByRole('dialog').getByRole('button', { name: '확인', exact: true }).click();
}

async function act(page: Page, name: string) {
  await page.getByRole('button', { name, exact: true }).click();
  await closeFeedback(page);
}

async function enterClassroom(page: Page) {
  await page.locator('.task-card.kind-class:not(.done)').locator(':scope > button').click();
}

test('first three days support locking, issue resolutions, reload and language changes', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('.day-badge')).toHaveText('01');
  await expect(page.locator('footer button')).toBeDisabled();
  await expect(page.getByRole('button', { name: '확인 도장 찍기', exact: true })).toBeDisabled();
  await expect(page.getByRole('button', { name: '생활 속 예시로 설명', exact: true })).toBeDisabled();
  await act(page, '메시지 읽기');
  await page.reload();
  await expect(page.locator('.task-card').filter({ has: page.getByRole('heading', { name: '선배 교사의 환영 메시지' }) })).toHaveClass(/done/);
  await page.getByRole('button', { name: '보완 요청하기', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('다시 확인');
  await page.getByRole('button', { name: '확인 도장 찍기', exact: true }).click();
  await expect(page.getByRole('heading', { name: '서류 2 / 3', exact: true })).toBeVisible();
  await page.getByRole('button', { name: '확인 도장 찍기', exact: true }).click();
  await act(page, '확인 도장 찍기');
  await enterClassroom(page);
  await act(page, '생활 속 예시로 설명');
  await expect(page.locator('footer button')).toBeEnabled();
  await page.locator('footer button').click();
  await expect(page.locator('.day-badge')).toHaveText('02');
  await page.getByRole('button', { name: '확인 도장 찍기', exact: true }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  await page.getByRole('button', { name: '보완 요청하기', exact: true }).click();
  await expect(page.getByRole('heading', { name: '서류 2 / 2', exact: true })).toBeVisible();
  await act(page, '보완 요청하기');
  await expect(page.locator('.task-card').filter({ has: page.getByRole('heading', { name: '가정통신문 재확인' }) })).toContainText('절차 처리');
  await enterClassroom(page);
  await act(page, '간단한 실습 진행');
  await page.getByLabel('부여할 점수').selectOption('0');
  await page.getByRole('button', { name: '점수 기록하기', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('기준표와 점수가 다릅니다');
  await page.getByLabel('부여할 점수').selectOption('3');
  await act(page, '점수 기록하기');
  await page.locator('footer button').click();
  await expect(page.locator('.day-badge')).toHaveText('03');
  await act(page, '요청 확인');
  await page.getByLabel('부여할 점수').selectOption('2');
  await act(page, '점수 기록하기');
  await enterClassroom(page);
  await act(page, '생활 속 예시로 설명');
  await page.getByRole('button', { name: 'EN', exact: true }).click();
  await expect(page.locator('.day-badge')).toHaveText('03');
  await expect(page.locator('footer button')).toBeEnabled();
  await page.reload();
  await expect(page.getByRole('button', { name: '한국어', exact: true })).toBeVisible();
  await expect(page.locator('footer button')).toBeEnabled();
  expect(errors).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('day-3-complete.png'), fullPage: true });
});

test('malformed save does not prevent starting a new day', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('teachers-please-save-v1', '{broken json'));
  await page.goto('/');
  await expect(page.locator('.day-badge')).toHaveText('01');
  await expect(page.getByRole('alert')).toHaveText('저장을 확인할 수 없습니다. 새로고침하면 진행이 사라질 수 있습니다.');
  await expect(page.getByRole('button', { name: '메시지 읽기', exact: true })).toBeEnabled();
  await act(page, '메시지 읽기');
});

test('purchase budget and revision attachment survive reload', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.setItem('teachers-please-save-v1', JSON.stringify({
    version: 7,
    state: { currentDay: 5, taskStatuses: { message_admin: 'completed', cable_repair: 'completed' }, purchaseQuantity: 2 },
  })));
  await page.reload();
  await page.getByRole('combobox', { name: '수량', exact: true }).selectOption('3');
  await expect(page.getByRole('alert')).toContainText('예산을 초과');
  await expect(page.getByRole('button', { name: '내용 확인 후 제출', exact: true })).toBeDisabled();
  await page.reload();
  await expect(page.getByRole('combobox', { name: '수량', exact: true })).toHaveValue('3');
  await page.getByRole('combobox', { name: '수량', exact: true }).selectOption('1');
  await act(page, '내용 확인 후 제출');
  await page.getByRole('button', { name: '에듀그렛', exact: true }).click();
  await expect(page.locator('.purchase-record')).toContainText('제출 완료');
  await expect(page.locator('.purchase-record')).toContainText('× 1');
  await page.evaluate(() => {
    const save = JSON.parse(localStorage.getItem('teachers-please-save-v1')!);
    save.state.currentDay = 7;
    save.state.taskStatuses = {};
    localStorage.setItem('teachers-please-save-v1', JSON.stringify(save));
  });
  await page.reload();
  await expect(page.getByRole('button', { name: '자료 첨부 및 재제출', exact: true })).toBeDisabled();
  await act(page, '메시지 읽기');
  await expect(page.getByRole('button', { name: '자료 첨부 및 재제출', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: '비교견적서.pdf 첨부', exact: true }).click();
  await page.reload();
  await expect(page.getByRole('button', { name: '비교견적서.pdf 첨부 완료', exact: true })).toBeDisabled();
  await act(page, '자료 첨부 및 재제출');
  await page.getByRole('button', { name: '에듀그렛', exact: true }).click();
  await expect(page.locator('.purchase-record')).toContainText('보완 제출');
  await expect(page.locator('.purchase-record')).toContainText('× 1');
});

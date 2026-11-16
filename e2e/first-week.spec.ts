import { expect, test, type Page } from '@playwright/test';

async function open(page: Page, title: string) {
  await page.getByRole('button', { name: `업무 시작 · ${title}`, exact: true }).click();
  await expect(page.getByRole('region', { name: title, exact: true })).toBeVisible();
}
async function finish(page: Page, name: string) {
  await page.getByRole('button', { name, exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: '확인', exact: true }).click();
}
async function lesson(page: Page, title: string) {
  await page.getByRole('button', { name: /교실로 이동/ }).click();
  await open(page, title);
  for (const label of ['입력', '처리', '출력']) await page.getByRole('button', { name: label, exact: true }).click();
  await page.getByRole('button', { name: '순서 실행하기', exact: true }).click();
  await page.reload();
  await page.getByRole('button', { name: /교실로 이동/ }).click();
  await open(page, title);
  await expect(page.getByRole('heading', { name: '학생이 손을 들었습니다', exact: true })).toBeVisible();
  await page.getByRole('button', { name: '칠판에서 3 + 2를 단계별로 실행', exact: true }).click();
  await finish(page, '5');
}
async function seed(page: Page, day: number, statuses = {}) {
  await page.goto('/');
  await page.evaluate(({ day, statuses }) => localStorage.setItem('teachers-please-save-v1', JSON.stringify({ version: 7, state: { currentDay: day, taskStatuses: statuses } })), { day, statuses });
  await page.reload();
}

test('first three days use separate workspaces and retain completion', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('button', { name: '업무 시작 · 가정통신문 3장 확인', exact: true })).toBeDisabled();
  await open(page, '선배 교사의 환영 메시지'); await finish(page, '메시지 읽기');
  await open(page, '가정통신문 3장 확인');
  await page.getByRole('button', { name: '보완 요청하기', exact: true }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  for (let i = 0; i < 2; i++) await page.getByRole('button', { name: '확인 도장 찍기', exact: true }).click();
  await finish(page, '확인 도장 찍기');
  await lesson(page, '2교시 정보 수업');
  await page.locator('footer button').click();
  await open(page, '가정통신문 재확인');
  await page.getByRole('button', { name: '보완 요청하기', exact: true }).click();
  await finish(page, '보완 요청하기');
  await lesson(page, '3교시 정보 수업');
  await open(page, '형성평가 채점');
  await page.getByLabel('부여할 점수').selectOption('0');
  await page.getByRole('button', { name: '점수 기록하기', exact: true }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  await page.getByLabel('부여할 점수').selectOption('3'); await finish(page, '점수 기록하기');
  await page.locator('footer button').click();
  await open(page, '교무부 업무 요청'); await finish(page, '요청 확인');
  await open(page, '서술형 채점');
  await page.getByLabel('부여할 점수').selectOption('2'); await finish(page, '점수 기록하기');
  await lesson(page, '4교시 정보 수업');
  await page.reload();
  await expect(page.locator('.day-badge')).toHaveText('03');
  await expect(page.locator('footer button')).toBeEnabled();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('phone records unanswered call before attendance unlocks', async ({ page }) => {
  await seed(page, 7);
  await expect(page.getByRole('button', { name: '업무 시작 · 사유 미확인 결석', exact: true })).toBeDisabled();
  await open(page, '보호자 전화 연락');
  await page.getByRole('button', { name: '전화 걸기', exact: true }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  await page.getByLabel('연락처 선택').selectOption('guardian');
  await page.getByRole('button', { name: '전화 걸기', exact: true }).click();
  await page.getByLabel('연락 목적').selectOption('absence');
  await page.reload();
  await open(page, '보호자 전화 연락');
  await expect(page.getByLabel('연락 목적')).toHaveValue('absence');
  await page.getByLabel('처리 결과').selectOption('pending');
  await finish(page, '연락 기록 저장');
  await page.reload();
  await expect(page.getByRole('button', { name: '업무 시작 · 사유 미확인 결석', exact: true })).toBeEnabled();
});

test('OMR missing ID is set aside and totals are checked', async ({ page }) => {
  await seed(page, 13, { supervise_day13: 'completed' });
  const sceneHeight = await page.locator('.scene-panel').evaluate(el => el.getBoundingClientRect().height);
  await page.getByRole('button', { name: /할 일 보드/ }).click();
  expect(await page.locator('.scene-panel').evaluate(el => el.getBoundingClientRect().height)).toBe(sceneHeight);
  await page.getByRole('button', { name: /할 일 보드/ }).click();
  await open(page, '학번 누락 OMR');
  await page.getByRole('button', { name: '기재 사항 일치', exact: true }).click();
  await page.reload(); await open(page, '학번 누락 OMR');
  await expect(page.getByRole('heading', { name: '확인 카드 2 / 3', exact: true })).toBeVisible();
  await page.getByRole('button', { name: '기재 사항 일치', exact: true }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  await page.getByRole('button', { name: '확인 필요로 분리', exact: true }).click();
  await page.getByRole('button', { name: '기재 사항 일치', exact: true }).click();
  await page.getByLabel('전체 회수 수량').fill('27');
  await page.getByRole('button', { name: '기록 후 인계', exact: true }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  await page.getByLabel('전체 회수 수량').fill('28');
  await finish(page, '기록 후 인계');
  await expect(page.getByRole('button', { name: '업무 시작 · 시험 자료 정리', exact: true })).toBeEnabled();
});

test('cable connections and packing selections survive reload', async ({ page }) => {
  await seed(page, 5, { message_admin: 'completed' });
  await open(page, '방송 장비 임시 복구');
  await page.getByRole('button', { name: 'MIC', exact: true }).click();
  await page.reload(); await open(page, '방송 장비 임시 복구');
  await expect(page.getByRole('button', { name: 'MIC', exact: true })).toBeDisabled();
  for (const name of ['MIXER', 'AMP']) await page.getByRole('button', { name, exact: true }).click();
  await finish(page, 'SPEAKER');
  await seed(page, 10, { message_exam_schedule: 'completed' });
  await open(page, '시험 자료 정리·봉입');
  await page.getByRole('button', { name: /정보 시험지 28부/ }).click();
  await page.reload(); await open(page, '시험 자료 정리·봉입');
  await expect(page.getByRole('button', { name: /정보 시험지 28부/ })).toHaveClass(/selected/);
  await page.getByRole('button', { name: /답안지 28부/ }).click();
  await page.getByRole('button', { name: /수량 확인표/ }).click();
  await finish(page, '▣ 수량 확인 후 봉인');
});

test('official document requires writing and review', async ({ page }) => {
  await seed(page, 9);
  await open(page, '방송 장비 구매 공문 작성');
  await page.getByLabel('공문 제목').fill('방송실 케이블 구매 요청');
  await page.getByLabel('수신처').selectOption('admin');
  await page.getByLabel('요청 금액 (원)').fill('30000');
  await page.getByLabel('장비점검표.pdf 첨부', { exact: true }).check();
  await page.getByRole('button', { name: '공문 미리보기', exact: true }).click();
  await page.reload();
  await open(page, '방송 장비 구매 공문 작성');
  await expect(page.locator('.document-preview')).toContainText('방송실 케이블 구매 요청');
  await page.getByRole('button', { name: '검토 후 결재 요청', exact: true }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  for (const checkbox of await page.getByRole('checkbox').all()) await checkbox.check();
  await finish(page, '검토 후 결재 요청');
  await expect(page.locator('.task-card.done')).toContainText('방송 장비 구매 공문 작성');
});

test('desk objects unlock and equipment inspection uses every test', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.object-papers')).toHaveCount(0);
  await page.getByRole('button', { name: /할 일 보드/ }).click();
  await page.getByRole('button', { name: '컴퓨터 · 업무 열기', exact: true }).click();
  await finish(page, '메시지 읽기');
  await expect(page.getByRole('button', { name: '서류와 도장 · 업무 열기', exact: true })).toBeVisible();
  await seed(page, 4, { message_broadcast: 'completed' });
  await page.getByRole('button', { name: '방송 장비 · 업무 열기', exact: true }).click();
  await page.getByRole('button', { name: '점검 결과 기록', exact: true }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  for (const name of ['마이크', '믹서', '연결 케이블', '스피커']) await page.getByRole('button', { name, exact: true }).click();
  await page.getByLabel('고장 부위').selectOption('cable');
  await finish(page, '점검 결과 기록');
  await expect(page.getByRole('button', { name: '방송 장비 · 대기 업무 없음', exact: true })).toBeDisabled();
});

test('budget correction and malformed save recovery', async ({ page }) => {
  await seed(page, 5, { message_admin: 'completed', cable_repair: 'completed' });
  await open(page, '에듀그렛 구매 요청');
  await page.getByRole('combobox', { name: '수량', exact: true }).selectOption('3');
  await expect(page.getByRole('button', { name: '내용 확인 후 제출', exact: true })).toBeDisabled();
  await page.reload(); await open(page, '에듀그렛 구매 요청');
  await expect(page.getByRole('combobox', { name: '수량', exact: true })).toHaveValue('3');
  await page.getByRole('combobox', { name: '수량', exact: true }).selectOption('1'); await finish(page, '내용 확인 후 제출');
  await page.evaluate(() => localStorage.setItem('teachers-please-save-v1', '{broken'));
  await page.reload();
  await expect(page.locator('.day-badge')).toHaveText('01');
  await expect(page.getByRole('alert')).toBeVisible();
});

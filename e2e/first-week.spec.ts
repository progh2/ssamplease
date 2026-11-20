import { finishLab } from './helpers/lessonLab';
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
  if (title.startsWith('4')) {
    await expect(page.getByRole('heading', { name: '채점에서 이어진 수업 약속', exact: true })).toBeVisible();
    await page.getByRole('button', { name: '6', exact: true }).click();
  }
  await page.getByRole('button', { name: /칠판에서 교사가 시연/ }).click();
  if (title.startsWith('2')) {
    for (const label of ['입력', '처리', '출력']) await page.getByRole('button', { name: label, exact: true }).click();
  } else if (title.startsWith('3')) {
    await page.getByRole('button', { name: '시각 ≥ 12이면 방송', exact: true }).click();
  } else {
    await page.getByRole('button', { name: 'i = 1부터 i ≤ n 동안 1씩 더하기', exact: true }).click();
  }
  await page.getByRole('button', { name: '예제 모두 실행', exact: true }).click();
  await page.reload();
  await page.getByRole('button', { name: /교실로 이동/ }).click();
  await open(page, title);
  await page.getByRole('button', { name: '학생 설명 듣기', exact: true }).click();
  const explanation = title.startsWith('2') ? '0도 값이다. 0 + 4의 출력은 4' : title.startsWith('3') ? '≥는 유지하고 기준 시각을 13으로 바꾼다' : '가장 작은 입력에서 반복이 빠지는지 확인하려고';
  await page.getByRole('button', { name: explanation, exact: true }).click();
  await page.getByRole('button', { name: '설명 확인하기', exact: true }).click();
  await finishLab(page, title.startsWith('2') ? 'class_first' : title.startsWith('3') ? 'class_question' : 'class_followup');
  await finish(page, '수업 기록 후 마치기');
}
async function seed(page: Page, day: number, statuses = {}) {
  await page.goto('/');
  await page.evaluate(({ day, statuses }) => localStorage.setItem('teachers-please-save-v1', JSON.stringify({ version: 7, state: { currentDay: day, taskStatuses: statuses } })), { day, statuses });
  await page.reload();
}

test('first three days use separate workspaces and retain completion', async ({ page }) => {
  test.setTimeout(180_000);
  await page.goto('/');
  await expect(page.getByRole('button', { name: '업무 시작 · 가정통신문 3장 확인', exact: true })).toBeDisabled();
  await open(page, '선배 교사의 환영 메시지'); await finish(page, '메시지 읽기');
  await open(page, '가정통신문 3장 확인');
  await page.getByRole('button', { name: '보완 요청하기', exact: true }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  for (const permission of ['allow', 'restrict', 'allow']) {
    await page.getByLabel('사진 공개 범위 기록').selectOption(permission);
    await page.getByRole('button', { name: '확인 도장 찍기', exact: true }).click();
  }
  await finish(page, '접수 기록 마무리');
  await lesson(page, '2교시 정보 수업');
  await page.locator('footer button').click();
  await open(page, '가정통신문 재확인');
  await page.getByRole('button', { name: /^보호자 서명/ }).click();
  await page.getByRole('button', { name: '보완 요청하기', exact: true }).click();
  await page.getByRole('button', { name: /^서류 학번/ }).click();
  await page.getByRole('button', { name: '보완 요청하기', exact: true }).click();
  await page.getByLabel('사진 공개 범위 기록').selectOption('restrict');
  await page.getByRole('button', { name: '확인 도장 찍기', exact: true }).click();
  await finish(page, '접수 기록 마무리');
  await lesson(page, '3교시 정보 수업');
  await open(page, '형성평가 채점');
  await page.getByRole('button', { name: '점수와 피드백 기록', exact: true }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  for (const comment of ['clear', 'order', 'clear']) {
    if (comment === 'clear') {
      await page.getByRole('checkbox', { name: /정해진 순서대로/ }).check();
      await page.getByRole('checkbox', { name: /한 단계 뒤에/ }).check();
    }
    await page.getByLabel('학생에게 남길 피드백').selectOption(comment);
    await page.getByRole('button', { name: '점수와 피드백 기록', exact: true }).click();
  }
  await page.getByRole('radio', { name: /실행 순서와 각 단계의 이유/ }).check();
  await finish(page, '채점 기록과 수업 메모 저장');
  await page.locator('footer button').click();
  await open(page, '교무부 업무 요청'); await finish(page, '요청 확인');
  await open(page, '서술형 채점');
  await page.getByRole('checkbox', { name: /0에서 시작해/ }).check();
  await page.getByLabel('학생에게 남길 피드백').selectOption('result');
  await page.getByRole('button', { name: '점수와 피드백 기록', exact: true }).click();
  await page.getByRole('checkbox', { name: /0에서 시작해/ }).check();
  await page.getByRole('checkbox', { name: /최종 결과 6/ }).check();
  await page.getByLabel('학생에게 남길 피드백').selectOption('clear');
  await page.getByRole('button', { name: '점수와 피드백 기록', exact: true }).click();
  await page.getByLabel('공동 검토 사유 (필요한 경우만)').selectOption('unreadable');
  await page.getByRole('button', { name: '원본 보존 후 공동 검토 요청', exact: true }).click();
  await page.getByRole('radio', { name: /과정은 인정하고 마지막 계산/ }).check();
  await finish(page, '채점 기록과 수업 메모 저장');
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
  await page.getByRole('button', { name: 'SPEAKER', exact: true }).click();
  await page.getByRole('button', { name: '시험 방송 실행', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('케이블');
  await page.getByLabel('손상된 구간에 쓸 케이블').selectOption('spare');
  await page.getByLabel('출력 레벨').fill('3');
  await page.getByRole('button', { name: '시험 방송 실행', exact: true }).click();
  await finish(page, '임시 복구 결과 기록');
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
  await seed(page, 9, { message_approval_done: 'completed' });
  await open(page, '방송 장비 구매 공문 작성');
  await page.getByLabel('공문 제목').fill('방송실 케이블 구매 요청');
  await page.getByLabel('수신처').selectOption('admin');
  await page.getByLabel('요청 금액 (원)').fill('30000');
  await page.getByLabel('장비점검표.pdf 첨부', { exact: true }).check();
  await page.getByRole('button', { name: '공문 미리보기', exact: true }).click();
  await page.reload();
  await open(page, '방송 장비 구매 공문 작성');
  await expect(page.locator('.document-preview')).toContainText('방송실 케이블 구매 요청');
  await page.getByRole('button', { name: '검토 후 시행 공문 등록', exact: true }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  for (const checkbox of await page.getByRole('checkbox').all()) await checkbox.check();
  await finish(page, '검토 후 시행 공문 등록');
  await expect(page.locator('.task-card.done').filter({ hasText: '방송 장비 구매 공문 작성' })).toHaveCount(1);
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
  await page.getByRole('combobox', { name: '수량', exact: true }).selectOption('1');
  await page.getByLabel('예산 항목 선택').selectOption('broadcast');
  await page.getByLabel('결재선 선택').selectOption('admin');
  await page.getByLabel('장비점검표 첨부', { exact: true }).check();
  await finish(page, '내용 확인 후 제출');
  await page.evaluate(() => localStorage.setItem('teachers-please-save-v1', '{broken'));
  await page.reload();
  await expect(page.locator('.day-badge')).toHaveText('01');
  await expect(page.getByRole('alert')).toBeVisible();
});

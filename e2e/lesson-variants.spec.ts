import { finishLab } from './helpers/lessonLab';
import { expect, test, type Page } from './fixtures';

const scenarios = [
  { day: 1, id: 'class_first', title: '2교시 정보 수업', cards: ['입력', '처리', '출력'], answer: '0도 값이다. 0 + 4의 출력은 4' },
  { day: 2, id: 'class_question', title: '3교시 정보 수업', rule: '시각 ≥ 12이면 방송', wrong: '시각 > 12이면 방송', answer: '≥는 유지하고 기준 시각을 13으로 바꾼다' },
  { day: 3, id: 'class_followup', title: '4교시 정보 수업', rule: 'i = 1부터 i ≤ n 동안 1씩 더하기', wrong: 'i = 1부터 i < n 동안 1씩 더하기', answer: '가장 작은 입력에서 반복이 빠지는지 확인하려고' },
  { day: 4, id: 'class_broadcast_day', title: '2교시 정보 수업', cards: ['마이크에서 소리 입력', '믹서에서 음량 조절', '스피커에서 소리 출력'], answer: '믹서 이후 연결을 순서대로 점검한다' },
  { day: 6, id: 'class_homeroom', title: '3교시 정보 수업', rule: '확인된 사유만 확정, 빈칸은 확인 중', answer: '확인 시도와 다음 조치를 기록하고 당일 처리한다' },
  { day: 8, id: 'class_counseling_day', title: '4교시 정보 수업', rule: '공지는 학급, 개인 기록은 담당 교사', answer: '업무에 필요한 사람에게 필요한 내용만 공유한다' },
  { day: 9, id: 'class_admin_day', title: '2교시 정보 수업', rule: '합계 ≤ 예산일 때 가능', answer: '단가 × 수량으로 합계를 다시 계산한다' },
  { day: 15, id: 'class_final', title: '마지막 정보 수업', cards: ['관찰하고 사실 확인', '가설을 작은 예제로 시험', '결과와 후속 조치 기록'], answer: '시험 결과로 규칙을 고치면 다음 판단이 더 좋아진다' },
];

async function seed(page: Page, day: number) {
  await page.goto('/');
  await page.evaluate((day) => localStorage.setItem('teachers-please-save-v1', JSON.stringify({ version: 8, state: { currentDay: day, taskStatuses: day === 1 ? { message_welcome: 'completed', notice_basic: 'completed' } : {} } })), day);
  await page.reload();
}

async function enter(page: Page, title: string) {
  await page.getByRole('button', { name: /교실로 이동/ }).click();
  await page.getByRole('button', { name: `업무 시작 · ${title}`, exact: true }).click();
}

for (const scenario of scenarios) {
  test(`lesson day ${scenario.day}: distinct challenge and recorded classroom outcome`, async ({ page }) => {
    await seed(page, scenario.day);
    await enter(page, scenario.title);
    await page.getByRole('button', { name: scenario.day % 2 ? /칠판에서 교사가 시연/ : /짝과 먼저 예측하기/ }).click();
    await expect(page.getByRole('button', { name: '예제 모두 실행', exact: true })).toBeDisabled();
    if (scenario.wrong) {
      await page.getByRole('button', { name: scenario.wrong, exact: true }).click();
      await page.getByRole('button', { name: '예제 모두 실행', exact: true }).click();
      await expect(page.getByRole('alert')).toContainText('단서');
      await expect(page.getByRole('button', { name: '학생 설명 듣기', exact: true })).toHaveCount(0);
    }
    if (scenario.cards) {
      for (const card of scenario.cards) await page.getByRole('button', { name: card, exact: true }).click();
    } else {
      await page.getByRole('button', { name: scenario.rule!, exact: true }).click();
    }
    await page.getByRole('button', { name: '예제 모두 실행', exact: true }).click();
    if (scenario.day === 2) {
      await page.reload(); await enter(page, scenario.title);
      await expect(page.getByRole('button', { name: scenario.rule!, exact: true })).toHaveAttribute('aria-pressed', 'true');
    }
    await page.getByRole('button', { name: '학생 설명 듣기', exact: true }).click();
    if (scenario.day === 1) {
      await page.getByRole('button', { name: '0은 없다는 뜻이니 입력을 생략한다', exact: true }).click();
      await page.getByRole('button', { name: '설명 확인하기', exact: true }).click();
      await expect(page.getByRole('alert')).toBeVisible();
      await expect(page.getByRole('button', { name: '수업 기록 후 마치기', exact: true })).toHaveCount(0);
    }
    await page.getByRole('button', { name: scenario.answer, exact: true }).click();
    await page.getByRole('button', { name: '설명 확인하기', exact: true }).click();
    await finishLab(page, scenario.id);
    await expect(page.getByRole('heading', { name: '이제 학생들이 이유를 설명합니다', exact: true })).toBeVisible();
    await page.getByRole('button', { name: '수업 기록 후 마치기', exact: true }).click();
    await page.getByRole('dialog').getByRole('button', { name: '확인', exact: true }).click();
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('teachers-please-save-v1')!).state);
    expect(saved.taskStatuses[scenario.id]).toBe('completed');
    expect(saved.memories[scenario.id].approach).toBe(scenario.day % 2 ? 'demo' : 'pairs');
    expect(saved.memories[scenario.id].lessonExitChecked).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test('English classroom preserves a Korean draft while changing language', async ({ page }) => {
  await seed(page, 9);
  await enter(page, '2교시 정보 수업');
  await page.getByRole('button', { name: /짝과 먼저 예측하기/ }).click();
  await page.getByRole('button', { name: '합계 ≤ 예산일 때 가능', exact: true }).click();
  await page.getByRole('button', { name: '예제 모두 실행', exact: true }).click();
  await page.getByRole('region', { name: '2교시 정보 수업', exact: true }).getByRole('button', { name: '교무실로 돌아가기', exact: true }).click();
  await page.getByRole('button', { name: 'EN', exact: true }).click();
  await page.getByRole('button', { name: /^Open task ·/ }).filter({ hasText: '2교시 정보 수업' }).click();
  await expect(page.getByRole('heading', { name: 'A budget that stays balanced', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Allow if total ≤ budget', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Ask the class to explain', exact: true }).click();
  await page.getByRole('button', { name: 'Recalculate the total as price × quantity', exact: true }).click();
  await page.getByRole('button', { name: 'Check the explanation', exact: true }).click();
  await finishLab(page, 'class_admin_day', true);
  await page.getByRole('button', { name: 'Record the lesson and finish', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('peer explanation');
  await page.getByRole('dialog').getByRole('button', { name: 'Close', exact: true }).click();
});

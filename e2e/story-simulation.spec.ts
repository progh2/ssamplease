import { expect, test, type Page } from '@playwright/test';
import attendance from '../src/content/attendance.json' with { type: 'json' };
import grading from '../src/content/grading.json' with { type: 'json' };
import examDesk from '../src/content/examDesk.json' with { type: 'json' };

async function seed(page: Page, state: object) {
  await page.goto('/');
  await page.evaluate(state => localStorage.setItem('teachers-please-save-v1', JSON.stringify({ version: 8, state })), state);
  await page.reload();
}
async function open(page: Page, title: string) {
  await page.getByRole('button', { name: `업무 시작 · ${title}`, exact: true }).click();
}
async function close(page: Page) {
  await page.getByRole('dialog').getByRole('button', { name: '확인', exact: true }).click();
}
const supervision = [
  { day: 11, id: 'supervise_day11', title: '시험 감독', room: '2-3', statuses: { exam_count_day11: 'completed' }, seats: [2,5], rules: ['필기구·인쇄 상태', '필기구·인쇄 상태'], actions: ['예비 필기구로 교체하고 기록','정상 예비 시험지와 교환·기록'], report: 'supplies' },
  { day: 12, id: 'supervise_question', title: '시험 중 학생 질문', room: '2-4', statuses: { message_room_change: 'completed' }, seats: [1,6], rules: ['문항 내용 문의','의심스러운 행동'], actions: ['담당자 확인 후 전체에 동일 안내','눈부심 조정 후 관찰 사실만 기록'], report: 'clarification' },
  { day: 13, id: 'supervise_day13', title: '시험 감독 3일 차', room: '2-3', statuses: {}, seats: [3,4], rules: ['의심스러운 행동','기재 누락·답안 인계'], actions: ['지우개 확인·전달 후 사실 기록','답안 보존·학번 확인 필요로 표시'], report: 'identity' },
];
for (const scenario of supervision) test(`supervision day ${scenario.day}: observe, recover and hand over`, async ({ page }) => {
  test.setTimeout(120_000);
  await seed(page, { currentDay: scenario.day, taskStatuses: scenario.statuses });
  await page.getByRole('button', { name: /교실로 이동/ }).click();
  await open(page, scenario.title);
  await page.getByLabel('감독 교실 확인').selectOption('2-1');
  await page.getByRole('button', { name: '교실 확인 후 감독 시작', exact: true }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  await page.getByLabel('감독 교실 확인').selectOption(scenario.room);
  await page.getByRole('button', { name: '교실 확인 후 감독 시작', exact: true }).click();
  for (let i = 0; i < 2; i++) {
    await expect(page.getByRole('button', { name: scenario.actions[i], exact: true })).toBeDisabled();
    await page.getByRole('button', { name: new RegExp(`좌석 ${scenario.seats[i]}.*신호 확인`) }).click();
    await page.locator('.supervision-rules button').filter({ hasText: scenario.rules[i] }).click();
    const wrong = page.locator('.supervision-decisions button').filter({ hasNotText: scenario.actions[i] }).first();
    await wrong.click(); await expect(page.getByRole('alert')).toBeVisible();
    await page.getByRole('button', { name: scenario.actions[i], exact: true }).click();
    if (i === 0) {
      await page.reload();
      await page.getByRole('button', { name: /교실로 이동/ }).click();
      await open(page, scenario.title);
    }
    await page.getByRole('button', { name: i === 0 ? '다음 상황 관찰' : '회수·인계 확인으로', exact: true }).click();
  }
  await page.getByLabel('감독 답안 회수 수량').fill('27');
  await page.getByLabel('감독 인계 사항').selectOption(scenario.report);
  await page.getByRole('button', { name: '감독 기록 저장·인계', exact: true }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  await page.getByLabel('감독 답안 회수 수량').fill('28');
  await page.getByRole('button', { name: '감독 기록 저장·인계', exact: true }).click();
  await close(page);
  await expect(page.locator('.task-card.done').filter({ hasText: scenario.title })).toHaveCount(1);
});

test('counseling promise survives reload and returns in day14 story', async ({ page }) => {
  await seed(page, { currentDay: 8 });
  await open(page, '방송반 학생 상담');
  await page.getByRole('button', { name: '앞으로 절대 고장 나지 않는다고 약속하기', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('걱정');
  for (const name of ['하늘의 이야기 듣기','장비 점검 기록 대조','다음 방송에 대한 마음 묻기']) await page.getByRole('button', { name, exact: true }).click();
  await page.getByRole('button', { name: '케이블 고장을 설명하고 걱정을 인정하기', exact: true }).click();
  await page.getByRole('button', { name: '동료 학생과 점검표를 함께 쓰기', exact: true }).click();
  await page.getByLabel('상담 기록').selectOption('blame');
  await page.getByRole('button', { name: '상담 약속 기록', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('근거');
  await page.reload(); await open(page, '방송반 학생 상담');
  await expect(page.getByRole('button', { name: '동료 학생과 점검표를 함께 쓰기', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.getByLabel('상담 기록').selectOption('support');
  await page.getByRole('button', { name: '상담 약속 기록', exact: true }).click(); await close(page);
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('teachers-please-save-v1')!).state);
  expect(saved.memories.student_counseling.supportPlan).toBe('buddy');
  await seed(page, { ...saved, currentDay: 14, taskStatuses: {}, drafts: {} });
  await open(page, '학생 상담 후속 대화');
  await expect(page.locator('.speech-card')).toContainText('지우랑 번갈아 점검표');
  await page.getByRole('button', { name: '함께 리허설하고 역할을 나누기', exact: true }).click();
  await page.getByLabel('상담 기록').selectOption('support');
  await page.getByRole('button', { name: '상담 약속 기록', exact: true }).click(); await close(page);
});

for (const [id, data] of Object.entries(attendance)) test(`attendance ${id}: evidence and totals persist`, async ({ page }) => {
  const day = { attendance_basic: 6, attendance_unknown: 7, attendance_followup: 8, attendance_final: 15 }[id]!;
  const title = { attendance_basic: '2학년 3반 출결 확인', attendance_unknown: '사유 미확인 결석', attendance_followup: '결석 사유 후속 반영', attendance_final: '마지막 아침 출결' }[id]!;
  await seed(page, { currentDay: day, taskStatuses: { message_homeroom: 'completed', phone_guardian: 'resolved_with_issue' } });
  await open(page, title);
  await page.getByRole('button', { name: '출결 대장 대조하기', exact: true }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  for (const student of data.students) {
    await page.getByLabel(`${student.name} 출결 처리`).selectOption(student.status);
    await page.getByLabel(`${student.name} 근거 문서`).selectOption(student.evidence);
  }
  if (id === 'attendance_followup') await page.getByRole('checkbox').check();
  await page.reload(); await open(page, title);
  await page.getByRole('button', { name: '출결 대장 대조하기', exact: true }).click();
  await expect(page.locator('.attendance-totals')).toContainText('28 / 28');
  await page.getByRole('button', { name: '출결 기록 인계', exact: true }).click(); await close(page);
});

for (const id of ['grading_review', 'grading_post_exam'] as const) test(`later marking ${id} is a full batch`, async ({ page }) => {
  const data = grading[id];
  await seed(page, { currentDay: id === 'grading_review' ? 9 : 14 });
  await open(page, id === 'grading_review' ? '채점 기록 재확인' : '시험 채점');
  for (const paper of data.papers) {
    if (paper.ambiguous) {
      await page.getByLabel('공동 검토 사유 (필요한 경우만)').selectOption('unreadable');
      await page.getByRole('button', { name: '원본 보존 후 공동 검토 요청', exact: true }).click();
    } else {
      for (const criterion of data.criteria.filter(c => paper.credits.includes(c.id))) await page.getByRole('checkbox', { name: `${criterion.label} (+${criterion.points})`, exact: true }).check();
      await page.getByLabel('학생에게 남길 피드백').selectOption(paper.comment);
      await page.getByRole('button', { name: '점수와 피드백 기록', exact: true }).click();
    }
  }
  await page.getByRole('radio', { name: id === 'grading_review' ? /실행 순서와 각 단계의 이유/ : /같은 생활 사례로 AND와 OR/ }).check();
  await page.getByRole('button', { name: '채점 기록과 수업 메모 저장', exact: true }).click(); await close(page);
  if (id === 'grading_review') {
    await page.getByRole('button', { name: /교실로 이동/ }).click();
    await open(page, '2교시 정보 수업');
    await expect(page.getByRole('heading', { name: '채점에서 이어진 수업 약속', exact: true })).toBeVisible();
    await page.getByRole('button', { name: '갑작스러운 큰 소리를 예방하려고', exact: true }).click();
    await expect(page.getByRole('button', { name: /칠판에서 교사가 시연/ })).toBeVisible();
  }
});

test('approved purchase quantity carries into reviewed dispatch', async ({ page }) => {
  await seed(page, { currentDay: 9, purchaseQuantity: 1 });
  await expect(page.getByRole('button', { name: '업무 시작 · 방송 장비 구매 공문 작성', exact: true })).toBeDisabled();
  await open(page, '구매 요청 승인');
  await page.getByRole('button', { name: '메시지 읽기', exact: true }).click(); await close(page);
  await open(page, '방송 장비 구매 공문 작성');
  await page.getByLabel('공문 제목').fill('승인된 방송 케이블 구매 시행');
  await page.getByLabel('수신처').selectOption('admin');
  await page.getByLabel('요청 금액 (원)').fill('30000');
  await page.getByLabel('장비점검표.pdf 첨부', { exact: true }).check();
  await page.getByRole('button', { name: '공문 미리보기', exact: true }).click();
  for (const check of await page.getByRole('checkbox').all()) await check.check();
  await page.getByRole('button', { name: '검토 후 시행 공문 등록', exact: true }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  await page.getByRole('button', { name: '수정으로 돌아가기', exact: true }).click();
  await page.getByLabel('요청 금액 (원)').fill('15000');
  await page.getByRole('button', { name: '공문 미리보기', exact: true }).click();
  for (const check of await page.getByRole('checkbox').all()) await check.check();
  await page.getByRole('button', { name: '검토 후 시행 공문 등록', exact: true }).click(); await close(page);
});

for (const [id, data] of Object.entries(examDesk)) test(`exam desk ${id}: classify materials with recoverable errors`, async ({ page }) => {
  const day = id === 'check_supervision' ? 10 : id === 'exam_count_day11' ? 11 : 13;
  const title = id === 'check_supervision' ? '감독 일정 확인' : id === 'exam_count_day11' ? '시험지 수량 확인' : '시험 자료 정리';
  await seed(page, { currentDay: day, taskStatuses: { exam_pack: 'completed', message_exam_schedule: 'completed', supervise_day13: 'completed', omr_missing: 'resolved_with_issue' } });
  await open(page, title);
  await page.getByRole('button', { name: '분류 결과 대조', exact: true }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  for (const item of data.items) {
    await page.locator('.document-tray button').filter({ hasText: item.ko }).click();
    await page.locator('.sort-bins button').filter({ hasText: data.bins.find(b => b.id === item.target)!.ko }).click();
  }
  await page.reload(); await open(page, title);
  await page.getByRole('button', { name: '분류 결과 대조', exact: true }).click();
  await page.getByRole('button', { name: '대조 기록 마무리', exact: true }).click(); await close(page);
});

test('day12 OMR has a name omission instead of repeating the day13 ID omission', async ({ page }) => {
  await seed(page, { currentDay: 12, taskStatuses: { message_room_change: 'completed', supervise_question: 'completed' } });
  await open(page, 'OMR 기본 기재 확인');
  for (let i = 0; i < 2; i++) await page.getByRole('button', { name: '기재 사항 일치', exact: true }).click();
  await page.getByRole('button', { name: '기재 사항 일치', exact: true }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  await page.getByRole('button', { name: '확인 필요로 분리', exact: true }).click();
  await page.getByLabel('전체 회수 수량').fill('28');
  await page.getByRole('button', { name: '기록 후 인계', exact: true }).click(); await close(page);
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('teachers-please-save-v1')!).state);
  expect(saved.taskStatuses.omr_day12).toBe('resolved_with_issue');
});

test('revision compares equivalent quotes instead of choosing the cheapest', async ({ page }) => {
  await seed(page, { currentDay: 7, taskStatuses: { message_approval_return: 'completed' }, purchaseQuantity: 1 });
  await open(page, '구매 기안 보완');
  await page.getByRole('button', { name: /^견적 A/ }).click();
  await page.getByRole('button', { name: /^견적 C/ }).click();
  await page.getByLabel('비교 견적 선택 근거').selectOption('cheapest');
  await page.getByRole('button', { name: '비교 근거 첨부', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('3m');
  await page.getByRole('button', { name: /^견적 C/ }).click();
  await page.getByRole('button', { name: /^견적 B/ }).click();
  await page.getByLabel('비교 견적 선택 근거').selectOption('equivalent');
  await page.getByRole('button', { name: '비교 근거 첨부', exact: true }).click();
  await page.reload(); await open(page, '구매 기안 보완');
  await expect(page.getByRole('button', { name: '비교 견적 첨부됨', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: '보완 기안 재제출', exact: true }).click(); await close(page);
});

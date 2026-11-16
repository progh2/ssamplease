import { useState } from 'react';
import { createPortal } from 'react-dom';
import { PhoneGame, OfficialDocumentGame, LessonGame } from './components/SchoolActivities';
import { OmrGame } from './components/OmrGame';
import { useTranslation } from 'react-i18next';
import { days } from './content/days';
import { OfficeScene } from './OfficeScene';
import { useGameStore, useSaveHealth } from './store';
import timetables from './content/timetables.json';
import { nextLesson, timetable } from './engine/schedule';
import { purchaseBudget, purchaseStage, unitPrice } from './engine/workflow';
import { DeskExercise, exerciseIds } from './components/DeskExercises';
import { canLeaveSchool, canStartTask, prerequisites, requiredTasksRemaining } from './engine/taskEngine';

type View = 'desk' | 'messenger' | 'timetable' | 'approval';

export function App() {
  const { t, i18n } = useTranslation();
  const [view, setView] = useState<View>('desk');
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [boardOpen, setBoardOpen] = useState(true);
  const en = i18n.language.startsWith('en');
  const saveFailed = useSaveHealth((state) => state.failed);
  const { currentDay, taskStatuses, feedback, completeTask, closeFeedback, advanceDay, reset, accuracy, history, activeScheduledId, enterClassroom, returnToOffice } = useGameStore();
  const day = days.find((entry) => entry.day === currentDay);
  const pending = day ? requiredTasksRemaining(day.tasks, taskStatuses).length : 0;
  const done = !!day && canLeaveSchool(day.tasks, taskStatuses);

  const changeLanguage = () => {
    const next = i18n.language.startsWith('ko') ? 'en' : 'ko';
    void i18n.changeLanguage(next);
    document.documentElement.lang = next;
    try { localStorage.setItem('teachers-language', next); } catch { useSaveHealth.setState({ failed: true }); }
  };
  const restart = () => { if (window.confirm(t('app.resetConfirm'))) reset(); };

  if (!day) return <main className="ending"><div className="ending-card"><span className="ending-icon">✦</span><h1>{t('app.demoEnd')}</h1><p>{t('app.demoEndBody')}</p><button onClick={restart}>{t('app.restart')}</button></div></main>;

  const visibleTasks = day.tasks.filter((task) => view === 'messenger' ? task.kind === 'message' : view === 'approval' ? task.kind === 'approval' : true);
  const currentLesson = nextLesson(currentDay, taskStatuses);
  const progress = { ...history, ...taskStatuses };
  return <main className="app-shell" inert={selectedTask !== null}>
    <header>
      <div><p className="eyebrow">{t('app.week', { week: Math.ceil(currentDay / 5) })} · {day.weekday}</p><h1>{t('app.title')} <small>{t('app.subtitle')}</small></h1></div>
      <div className="header-actions"><span className="save-dot">● {t(saveFailed ? 'flow.saveFailed' : 'app.saved')}</span><button className="ghost" onClick={changeLanguage}>{t('app.language')}</button><button className="ghost" aria-label={t('app.restart')} onClick={restart}>↻</button></div>
    </header>
    {saveFailed && <p role="alert" className="save-warning">{t('flow.saveFailed')}</p>}
    <section className="story-strip"><div className="day-badge">{String(currentDay).padStart(2, '0')}</div><div><strong>{t('app.day', { day: currentDay })} — {t(day.titleKey)}</strong><p>{t(day.introKey)}</p></div><span className="accuracy">ACC {accuracy}%</span></section>
    <div className="game-grid">
      <section className="scene-panel"><OfficeScene key={activeScheduledId ?? 'office'} classroom={activeScheduledId ? timetable[activeScheduledId].classroom : undefined} /><div className="scene-label">{activeScheduledId ? `${timetable[activeScheduledId].period} · ${timetable[activeScheduledId].classroom}` : t('flow.office')}</div></section>
      <aside className={`work-panel ${boardOpen ? '' : 'board-collapsed'}`}>
        <button className="board-toggle" onClick={() => setBoardOpen(!boardOpen)}>{en ? 'Task board' : '할 일 보드'} {boardOpen ? '−' : '+'}</button>
        {boardOpen && <>
        <nav>{(['desk', 'messenger', 'timetable', 'approval'] as View[]).map((item) => <button key={item} className={view === item ? 'active' : ''} onClick={() => setView(item)}>{t(`nav.${item}`)}</button>)}</nav>
        <div className="schedule-strip"><span>{activeScheduledId ? t('flow.inClass', { room: timetable[activeScheduledId].classroom, period: timetable[activeScheduledId].period }) : currentLesson ? t('flow.nextClass', { room: timetable[currentLesson.id].classroom, period: timetable[currentLesson.id].period }) : t('flow.deskTime')}</span>{activeScheduledId && <button onClick={returnToOffice}>{t('flow.return')}</button>}</div>
        {view === 'approval' && <PurchaseRecord />}
        {view === 'timetable' ? <Timetable /> : <div className="task-list">
          {view === 'messenger' && visibleTasks.length === 0 && <p className="empty">{t('messenger.empty')}</p>}
          {visibleTasks.map((task) => {
            const status = taskStatuses[task.id] ?? 'available'; const isDone = ['completed', 'resolved_with_issue'].includes(status);
            const locked = !canStartTask(task.id, progress);
            const scheduled = timetable[task.id];
            const needsRoom = !!scheduled && activeScheduledId !== task.id;
            return <article className={`task-card kind-${task.kind} ${isDone ? 'done' : ''}`} key={task.id}>
              <div className="task-head"><span>{task.kind === 'message' ? 'HOT' : task.kind.toUpperCase()}</span><em>{t(`status.${status}`)}</em></div>
              <h2>{t(task.titleKey)}</h2><p>{t(task.descriptionKey)}</p>
              {locked && <p>{prerequisites(task.id).map((id) => t(days.flatMap((entry) => entry.tasks).find((entry) => entry.id === id)!.titleKey)).join(' → ')} → {t(task.titleKey)}</p>}
              {!isDone && needsRoom && <button disabled={locked || currentLesson?.id !== task.id} onClick={() => enterClassroom(task.id)}>{t('flow.enter', { room: scheduled.classroom, period: scheduled.period })}</button>}
              {!isDone && <button disabled={locked || needsRoom} onClick={() => setSelectedTask(task.id)}>{en ? 'Open task' : '업무 시작'} · {t(task.titleKey)}</button>}
              {!isDone && createPortal(<section hidden={selectedTask !== task.id} className={`task-workspace workspace-${task.kind}`} role="region" aria-label={t(task.titleKey)}>
              <header><div><small>{en ? 'WORKSPACE' : '전용 작업 화면'}</small><h1>{t(task.titleKey)}</h1></div><button autoFocus onClick={() => setSelectedTask(null)}>{en ? 'Back to office' : '교무실로 돌아가기'}</button></header>
              <p className="workspace-brief">{t(task.descriptionKey)}</p>
              <div className="workspace-body">
              <fieldset disabled={locked || needsRoom} style={{ border: 0, padding: 0, margin: 0 }}>
              {task.kind === 'class' && <LessonGame onDone={(status, feedback) => { completeTask(task.id, status, feedback); setSelectedTask(null); }} />}
              {task.id === 'phone_guardian' && <PhoneGame onDone={(status, feedback) => { completeTask(task.id, status, feedback); setSelectedTask(null); }} />}
              {task.id === 'official_document' && <OfficialDocumentGame onDone={(status, feedback) => { completeTask(task.id, status, feedback); setSelectedTask(null); }} />}
              {task.id.startsWith('omr_') && <OmrGame missing={task.id === 'omr_missing'} onDone={() => completeTask(task.id, task.choices[0].outcome, t(task.choices[0].feedbackKey))} />}
              {!isDone && exerciseIds.includes(task.id) && <DeskExercise taskId={task.id} onDone={(status, feedbackKey) => completeTask(task.id, status, t(feedbackKey))} />}
              {!isDone && task.id === 'cable_repair' && <CableRepair onDone={() => completeTask(task.id, 'completed', t('feedback.repaired'))} />}
              {!isDone && task.id === 'edugreat_purchase' && <ApprovalForm onDone={() => completeTask(task.id, 'completed', t('feedback.submitted'))} />}
              {!isDone && task.id === 'approval_revision' && <RevisionForm onDone={() => completeTask(task.id, 'completed', t('feedback.approvalResubmitted'))} />}
              {!isDone && task.kind === 'attendance' && <AttendanceSheet unknown={task.id === 'attendance_unknown'} followup={task.id === 'attendance_followup'} onDone={() => completeTask(task.id, task.id === 'attendance_unknown' ? 'resolved_with_issue' : 'completed', t(task.choices[0].feedbackKey))} />}
              {!isDone && task.id === 'exam_pack' && <ExamPack onDone={() => completeTask(task.id, 'completed', t('feedback.examPacked'))} />}
              {!isDone && !task.id.startsWith('omr_') && !exerciseIds.includes(task.id) && !['cable_repair', 'edugreat_purchase', 'approval_revision', 'exam_pack', 'phone_guardian', 'official_document'].includes(task.id) && task.kind !== 'attendance' && task.kind !== 'class' && <div className="choices">{task.choices.map((choice, index) => <button key={choice.labelKey} onClick={() => completeTask(task.id, choice.outcome, t(choice.feedbackKey), task.id === 'grading_partial' && index === 1)}>{t(choice.labelKey)}</button>)}</div>}
              </fieldset>
              </div></section>, document.body)}
            </article>;
          })}
        </div>}
        <footer className={done ? 'ready' : ''}><span>{done ? t('app.allDone') : t('app.pending', { count: pending })}</span><button disabled={!done} onClick={advanceDay}>{currentDay === 15 ? t('app.quit') : t('app.next')} →</button></footer>
        </>}
      </aside>
    </div>
    {feedback && createPortal(<div className="modal-backdrop" role="dialog" aria-modal="true"><div className="feedback-modal"><div className="stamp">처리</div><p>{feedback}</p><button autoFocus onClick={() => { closeFeedback(); setSelectedTask(null); }}>{t('actions.close')}</button></div></div>, document.body)}
  </main>;
}

function CableRepair({ onDone }: { onDone: () => void }) {
  const { t } = useTranslation();
  const expected = ['mic', 'mixer', 'amp', 'speaker'];
  const labels: Record<string, string> = { mic: 'MIC', mixer: 'MIXER', amp: 'AMP', speaker: 'SPEAKER' };
  const [chain, setChain] = useState<string[]>([]);
  const [wrong, setWrong] = useState(false);
  const select = (part: string) => {
    if (chain.includes(part)) return;
    const next = [...chain, part];
    setChain(next); setWrong(false);
    if (next.length === expected.length) {
      if (next.every((value, index) => value === expected[index])) onDone();
      else setWrong(true);
    }
  };
  return <div className="repair-game"><p>{t('repair.instruction')}</p><div className="signal-chain">{chain.map((part, index) => <span key={part}>{index > 0 && <i>→</i>}{labels[part]}</span>)}</div><div className="parts">{['speaker', 'mic', 'amp', 'mixer'].map((part) => <button disabled={chain.includes(part)} key={part} onClick={() => select(part)}>{labels[part]}</button>)}</div>{wrong && <strong>{t('repair.wrong')}</strong>}<button className="reset-link" onClick={() => { setChain([]); setWrong(false); }}>{t('repair.reset')}</button></div>;
}

function ApprovalForm({ onDone }: { onDone: () => void }) {
  const { t } = useTranslation();
  const quantity = useGameStore((state) => state.purchaseQuantity);
  const setQuantity = useGameStore((state) => state.setPurchaseQuantity);
  const fields = [['purpose', 'purposeValue'], ['item', 'itemValue'], ['budget', 'budgetValue'], ['attachment', 'attachmentValue'], ['line', 'lineValue']];
  return <div className="approval-form"><h3>{t('approval.title')}</h3>{fields.slice(0, 2).map(([label, value]) => <label key={label}><span>{t(`approval.${label}`)}</span><input value={t(`approval.${value}`)} readOnly /></label>)}<label><span>{t('approval.quantity')}</span><select value={quantity} onChange={(event) => setQuantity(Number(event.target.value))}><option value="1">1</option><option value="2">2</option><option value="3">3</option></select></label>{fields.slice(2).map(([label, value]) => <label key={label}><span>{t(`approval.${label}`)}</span><input value={t(`approval.${value}`)} readOnly /></label>)}<p>{t('flow.cost', { total: quantity * unitPrice, budget: purchaseBudget })}</p>{quantity * unitPrice > purchaseBudget && <p role="alert">{t('flow.overBudget')}</p>}<button disabled={quantity * unitPrice > purchaseBudget} onClick={onDone}>{t('approval.submit')}</button></div>;
}

function PurchaseRecord() {
  const { t } = useTranslation();
  const { history, purchaseQuantity } = useGameStore();
  const stage = purchaseStage(history);
  return <section className="purchase-record"><h2>{t('approval.title')}</h2><p>{t(`flow.${stage}`)}</p>{stage !== 'draft' && <p>{t('approval.itemValue')} × {purchaseQuantity} · {purchaseQuantity * unitPrice}</p>}</section>;
}

function RevisionForm({ onDone }: { onDone: () => void }) {
  const { t } = useTranslation();
  const { comparisonAttached, attachComparison, purchaseQuantity } = useGameStore();
  return <div className="approval-form"><p>{t('flow.revisionReason')}</p><p>{t('approval.itemValue')} × {purchaseQuantity}</p><button disabled={comparisonAttached} onClick={attachComparison}>{t(comparisonAttached ? 'flow.attached' : 'flow.attach')}</button><button disabled={!comparisonAttached} onClick={onDone}>{t('actions.revise')}</button></div>;
}

function AttendanceSheet({ unknown, followup, onDone }: { unknown: boolean; followup: boolean; onDone: () => void }) {
  const { t } = useTranslation();
  const [pending, setPending] = useState(false);
  const students = unknown
    ? [['2301', '김하늘', pending ? 'pending' : 'unknown'], ['2302', '박지우', 'present'], ['2303', '서민준', 'present']]
    : [['2301', '김하늘', followup ? 'absent' : 'present'], ['2302', '박지우', 'fieldTrip'], ['2303', '서민준', 'present']];
  return <div className="attendance-sheet"><h3>{t('attendance.title')}</h3>{students.map(([number, name, status]) => <div className="student-row" key={number}><b>{number}</b><span>{name}</span><em className={`attendance-${status}`}>{t(`attendance.${status}`)}</em></div>)}{unknown && <><p className="call-log">☎ {t('attendance.callLog')}</p><p>{t('attendance.hint')}</p><button onClick={() => setPending(true)} disabled={pending}>{t('actions.pending')}</button></>}<button className="attendance-save" disabled={unknown && !pending} onClick={onDone}>{t('actions.saveAttendance')}</button></div>;
}

function ExamPack({ onDone }: { onDone: () => void }) {
  const { t } = useTranslation();
  const required = ['paper', 'answers', 'checklist'];
  const all = [...required, 'wrongGrade', 'memo'];
  const [selected, setSelected] = useState<string[]>([]);
  const [warning, setWarning] = useState(false);
  const toggle = (item: string) => setSelected((current) => current.includes(item) ? current.filter((value) => value !== item) : [...current, item]);
  const seal = () => {
    const valid = selected.length === required.length && required.every((item) => selected.includes(item));
    if (valid) onDone(); else setWarning(true);
  };
  return <div className="exam-pack"><p>{t('examPack.instruction')}</p><div className="exam-materials">{all.map((item) => <button className={selected.includes(item) ? 'selected' : ''} onClick={() => { toggle(item); setWarning(false); }} key={item}><span>▤</span>{t(`examPack.${item}`)}{selected.includes(item) && <em>✓ {t('examPack.selected')}</em>}</button>)}</div>{warning && <strong>{t('examPack.incomplete')}</strong>}<button className="seal-button" onClick={seal}>▣ {t('examPack.seal')}</button></div>;
}

function Timetable() {
  const { t } = useTranslation();
  const { currentDay, taskStatuses } = useGameStore();
  const tasks = days.find((day) => day.day === currentDay)?.tasks ?? [];
  const schedule = timetables as Record<string, { period: number; classroom: string }>;
  return <div className="timetable"><h2>{t('timetable.title')}</h2>{[1, 2, 3, 4].map((period) => {
    const task = tasks.find((entry) => schedule[entry.id]?.period === period);
    return <div key={period}><b>{period}</b><span>{task ? `${t(task.titleKey)} · ${schedule[task.id].classroom} · ${t(`status.${taskStatuses[task.id]}`)}` : t('timetable.free')}</span></div>;
  })}<div><b>+</b><span>{t('timetable.after')}</span></div></div>;
}

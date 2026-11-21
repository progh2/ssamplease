import { useEffect, useState } from 'react';
import { FirstDayPapers } from './components/FirstDayPapers';
import { HotMessenger } from './components/HotMessenger';
import { createPortal } from 'react-dom';
import { PhoneGame, OfficialDocumentGame } from './components/SchoolActivities';
import { LessonGame } from './components/LessonGame';
import { CounselingGame } from './components/CounselingGame';
import { AttendanceGame } from './components/AttendanceGame';
import { ExamSupervisionGame } from './components/ExamSupervisionGame';
import { ExamDeskGame, examDeskIds } from './components/ExamDeskGame';
import { OmrGame } from './components/OmrGame';
import { DeskObjects } from './components/DeskObjects';
import { PurchaseGame, RevisionGame } from './components/PurchaseGames';
import { CableRepairGame } from './components/CableRepairGame';
import { EquipmentCheck } from './components/EquipmentCheck';
import { useDraftState } from './components/useDraftState';
import { useTranslation } from 'react-i18next';
import { days } from './content/days';
import { OfficeScene } from './OfficeScene';
import { useGameStore, useSaveHealth } from './store';
import timetables from './content/timetables.json';
import { nextLesson, timetable } from './engine/schedule';
import { purchaseStage, unitPrice } from './engine/workflow';
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
  const { currentDay, taskStatuses, feedback, completeTask, closeFeedback, advanceDay, reset, history, activeScheduledId, enterClassroom, returnToOffice } = useGameStore();
  const day = days.find((entry) => entry.day === currentDay);
  const pending = day ? requiredTasksRemaining(day.tasks, taskStatuses).length : 0;
  const done = !!day && canLeaveSchool(day.tasks, taskStatuses);
  useEffect(() => { if (selectedTask && ['completed', 'resolved_with_issue'].includes(taskStatuses[selectedTask])) setSelectedTask(null); }, [selectedTask, taskStatuses]);

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
      <div className="header-actions"><span className="save-dot">● {t(saveFailed ? 'flow.saveFailed' : 'app.saved')}</span><button className="ghost" onClick={changeLanguage}>{t('app.language')}</button></div>
    </header>
    {saveFailed && <p role="alert" className="save-warning">{t('flow.saveFailed')}</p>}
    <section className="story-strip"><div className="day-badge">{String(currentDay).padStart(2, '0')}</div><div><strong>{t('app.day', { day: currentDay })} — {t(day.titleKey)}</strong><p>{t(day.introKey)}</p></div><span className="accuracy">{day.tasks.length - pending} / {day.tasks.length}</span></section>
    <div className="game-grid">
      <section className="scene-panel"><OfficeScene key={activeScheduledId ?? 'office'} classroom={activeScheduledId ? timetable[activeScheduledId].classroom : undefined} />{!activeScheduledId && <DeskObjects onOpen={id => { setBoardOpen(true); setView('desk'); setSelectedTask(id); }} />}<div className="scene-label">{activeScheduledId ? `${timetable[activeScheduledId].period} · ${timetable[activeScheduledId].classroom}` : t('flow.office')}</div></section>
      <aside className={`work-panel ${boardOpen ? '' : 'board-collapsed'}`}>
        <button className="board-toggle" onClick={() => setBoardOpen(!boardOpen)}>{en ? 'Task board' : '할 일 보드'} {boardOpen ? '−' : '+'}</button>
        {boardOpen && <>
        <nav>{(['desk', 'messenger', 'timetable', 'approval'] as View[]).map((item) => <button key={item} className={view === item ? 'active' : ''} onClick={() => setView(item)}>{t(`nav.${item}`)}</button>)}</nav>
        <div className="schedule-strip"><span>{activeScheduledId ? t('flow.inClass', { room: timetable[activeScheduledId].classroom, period: timetable[activeScheduledId].period }) : currentLesson ? t('flow.nextClass', { room: timetable[currentLesson.id].classroom, period: timetable[currentLesson.id].period }) : t('flow.deskTime')}</span>{activeScheduledId && <button onClick={returnToOffice}>{t('flow.return')}</button>}</div>
        {view === 'approval' && <PurchaseRecord />}
        {view === 'messenger' ? <HotMessenger compact /> : view === 'timetable' ? <Timetable /> : <div className="task-list">
          {visibleTasks.map((task) => {
            const status = taskStatuses[task.id] ?? 'available'; const isDone = ['completed', 'resolved_with_issue'].includes(status);
            const locked = !canStartTask(task.id, progress);
            const scheduled = timetable[task.id];
            const needsRoom = !!scheduled && activeScheduledId !== task.id;
            return <article className={`task-card kind-${task.kind} ${isDone ? 'done' : ''}`} key={task.id}>
              <div className="task-head"><span>{en ? task.kind.toUpperCase() : ({message:'대화',document:'서류',class:'수업',grading:'빨간 펜',equipment:'방송실',approval:'에듀그렛',attendance:'출석부',counseling:'이야기',exam:'시험'}[task.kind])}</span><em>{t(`status.${status}`)}</em></div>
              <h2>{t(task.titleKey)}</h2><p>{t(task.descriptionKey)}</p>
              {locked && <p>{prerequisites(task.id).map((id) => t(days.flatMap((entry) => entry.tasks).find((entry) => entry.id === id)!.titleKey)).join(' → ')} → {t(task.titleKey)}</p>}
              {!isDone && needsRoom && <button disabled={locked || currentLesson?.id !== task.id} onClick={() => enterClassroom(task.id)}>{t('flow.enter', { room: scheduled.classroom, period: scheduled.period })}</button>}
              {!isDone && <button disabled={locked || needsRoom} onClick={() => setSelectedTask(task.id)}>{en ? 'Open task' : '업무 시작'} · {t(task.titleKey)}</button>}
              {!isDone && createPortal(<section hidden={selectedTask !== task.id} className={`task-workspace workspace-${task.kind} ${task.id.startsWith('supervise_') ? 'workspace-supervision' : ''}`} role="region" aria-label={t(task.titleKey)}>
              <header><div><small>{en ? 'WORKSPACE' : '전용 작업 화면'}</small><h1>{t(task.titleKey)}</h1></div><button autoFocus onClick={() => setSelectedTask(null)}>{en ? 'Back to office' : '교무실로 돌아가기'}</button></header>
              <p className="workspace-brief">{t(task.descriptionKey)}</p>
              <div className="workspace-body">
              <fieldset disabled={locked || needsRoom} style={{ border: 0, padding: 0, margin: 0 }}>
              {task.kind === 'class' && <LessonGame taskId={task.id} onDone={(status, feedback) => { completeTask(task.id, status, feedback); setSelectedTask(null); }} />}
              {task.kind === 'counseling' && <CounselingGame taskId={task.id} onDone={(status, feedback) => completeTask(task.id, status, feedback)} />}
              {task.id.startsWith('supervise_') && <ExamSupervisionGame taskId={task.id} onDone={(status, feedback) => completeTask(task.id, status, feedback)} />}
              {examDeskIds.includes(task.id) && <ExamDeskGame taskId={task.id} onDone={feedback => completeTask(task.id, 'completed', feedback)} />}
              {task.id === 'phone_guardian' && <PhoneGame onDone={(status, feedback) => { completeTask(task.id, status, feedback); setSelectedTask(null); }} />}
              {task.id === 'official_document' && <OfficialDocumentGame onDone={(status, feedback) => { completeTask(task.id, status, feedback); setSelectedTask(null); }} />}
              {task.id === 'equipment_check' && <EquipmentCheck onDone={() => completeTask(task.id, 'completed', t('feedback.equipmentFound'))} />}
              {task.id.startsWith('omr_') && <OmrGame taskId={task.id} missing={task.id === 'omr_missing'} onDone={status => completeTask(task.id, status, status === 'resolved_with_issue' ? (en ? 'Original preserved and flagged for identity confirmation. All 28 cards are included in the handover.' : '원본을 보존하고 기재 사항 확인 필요로 분리했습니다. 별도 확인 카드까지 28장으로 인계합니다.') : t(task.choices[0].feedbackKey))} />}
              {task.id === 'notice_basic' && <FirstDayPapers onDone={() => completeTask(task.id, 'completed', en ? 'Three forms received. First class, here we come!' : '서류 세 장 접수! 첫 수업을 만나러 가요.')} />}
              {!isDone && task.id !== 'notice_basic' && exerciseIds.includes(task.id) && <DeskExercise taskId={task.id} onDone={(status, feedbackKey) => completeTask(task.id, status, t(feedbackKey))} />}
              {!isDone && task.id === 'cable_repair' && <CableRepairGame onDone={() => completeTask(task.id, 'completed', t('feedback.repaired'))} />}
              {!isDone && task.id === 'edugreat_purchase' && <PurchaseGame onDone={() => completeTask(task.id, 'completed', t('feedback.submitted'))} />}
              {!isDone && task.id === 'approval_revision' && <RevisionGame onDone={() => completeTask(task.id, 'completed', t('feedback.approvalResubmitted'))} />}
              {task.kind === 'attendance' && <AttendanceGame taskId={task.id} onDone={(status, feedback) => completeTask(task.id, status, feedback)} />}
              {!isDone && task.id === 'exam_pack' && <ExamPack onDone={() => completeTask(task.id, 'completed', t('feedback.examPacked'))} />}
              {task.kind === 'message' && selectedTask === task.id && <HotMessenger initialTask={task.id} />}
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

function PurchaseRecord() {
  const { t } = useTranslation();
  const { history, purchaseQuantity } = useGameStore();
  const stage = purchaseStage(history);
  return <section className="purchase-record"><h2>{t('approval.title')}</h2><p>{t(`flow.${stage}`)}</p>{stage !== 'draft' && <p>{t('approval.itemValue')} × {purchaseQuantity} · {purchaseQuantity * unitPrice}</p>}</section>;
}

function ExamPack({ onDone }: { onDone: () => void }) {
  const { t } = useTranslation();
  const required = ['paper', 'answers', 'checklist'];
  const all = [...required, 'wrongGrade', 'memo'];
  const [selected, setSelected] = useDraftState<string[]>('exam_pack', 'selected', [], v => new Set(v).size === v.length && v.every(id => ['paper', 'answers', 'checklist', 'wrongGrade', 'memo'].includes(id)));
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

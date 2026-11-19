import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import attendance from '../content/attendance.json';
import { useGameStore } from '../store';
import { useDraftState } from './useDraftState';

type AttendanceId = keyof typeof attendance;
type Props = { taskId: string; onDone: (status: 'completed' | 'resolved_with_issue', feedback: string) => void };
const statusIds = ['present', 'late', 'authorized', 'illness', 'pending'] as const;
type AttendanceStatus = typeof statusIds[number];
const labels: Record<AttendanceStatus, { ko: string; en: string }> = {
  present: { ko: '정상 출석', en: 'Present' },
  late: { ko: '지각', en: 'Late' },
  authorized: { ko: '인정 결석', en: 'Authorized absence' },
  illness: { ko: '질병 결석', en: 'Illness absence' },
  pending: { ko: '결석 사유 확인 중', en: 'Absent · reason pending' },
};

export function AttendanceGame({ taskId, onDone }: Props) {
  const data = attendance[taskId as AttendanceId];
  const en = useTranslation().i18n.language.startsWith('en');
  const phone = useGameStore(state => state.memories.phone_guardian);
  const [statuses, setStatuses] = useDraftState<string[]>(taskId, 'attendanceStatuses', ['', '', ''], values => values.length === 3 && values.every(value => value === '' || statusIds.includes(value as AttendanceStatus)));
  const [evidence, setEvidence] = useDraftState<string[]>(taskId, 'attendanceEvidence', ['', '', ''], values => values.length === 3 && values.every(value => value === '' || data.sources.some(source => source.id === value)));
  const [correction, setCorrection] = useDraftState<boolean>(taskId, 'previousDayCorrection', false);
  const [reviewed, setReviewed] = useDraftState<boolean>(taskId, 'attendanceReviewed', false);
  const [errors, setErrors] = useState<string[]>([]);
  const name = (student: typeof data.students[number]) => en ? student.nameEn : student.name;
  const counts = statusIds.map(id => ({ id, count: (id === 'present' ? 25 : 0) + statuses.filter(status => status === id).length }));
  const selectedCount = 25 + statuses.filter(Boolean).length;
  const verified = data.students.every((student, index) => statuses[index] === student.status && evidence[index] === student.evidence) && (taskId !== 'attendance_followup' || correction);
  function compare() {
    const mistakes = data.students.flatMap((student, index) => {
      if (statuses[index] === student.status && evidence[index] === student.evidence) return [];
      return [name(student) + (en ? ': Match today’s status to a documented source. A rumor or an older record is not current confirmation.' : ': 오늘의 상태와 근거 문서를 대조하세요. 추측이나 지난 기록은 오늘의 확인 자료가 아닙니다.')];
    });
    if (taskId === 'attendance_followup' && !correction) mistakes.push(en ? 'Keep the original contact log and attach the reply to yesterday’s pending entry.' : '어제 연락 기록은 보존하고, 미확정 사유에 회신을 연결하는 보완 절차를 선택하세요.');
    setErrors(mistakes);
    if (mistakes.length === 0) setReviewed(true);
  }
  return <section className="school-activity attendance-game">
    <header><span>{en ? 'HOMEROOM · EVIDENCE DESK' : '임시 담임 · 출결 근거 대조'}</span><h2>{en ? data.titleEn : data.title}</h2></header>
    <p>{en ? data.briefEn : data.brief}</p>
    <p className="story-callback">{taskId === 'attendance_unknown' && phone?.result === 'pending'
      ? (en ? 'Your phone log is attached: purpose — absence inquiry; result — no answer. The attempt does not establish a reason.' : '직접 남긴 전화 기록을 연결했습니다: 결석 사유 문의 · 응답 없음. 연락했다는 사실만으로 사유가 확정되지는 않습니다.')
      : taskId === 'attendance_followup'
        ? (en ? 'Yesterday: reason pending. Today: a new reply supplies evidence. The original attempt remains in the history.' : '어제: 사유 확인 중. 오늘: 새 회신으로 근거 확보. 당시 연락 시도는 이력에 남깁니다.')
        : (en ? '28 students in total. The other 25 have already been verified present; review only these three exceptions.' : '전체 28명 중 나머지 25명은 정상 출석 확인을 마쳤습니다. 아래 3명만 추가 대조하세요.')}</p>
    <p>{en ? 'This sheet covers 3 students; 25 others are confirmed present. Status categories are mutually exclusive under the fictional school rules.' : '대조 대상 3명 + 정상 출석 확인 완료 25명입니다. 게임 속 학교 규정에 따라 한 학생은 하나의 상태로만 집계합니다.'}</p>
    {!reviewed || !verified ? <div className="activity-columns">
      <aside className="reference-sheet"><h3>{en ? 'Evidence folder' : '근거 자료함'}</h3>{data.sources.map(source => <article key={source.id}><h4>{en ? source.titleEn : source.title}</h4><p>{en ? source.bodyEn : source.body}</p></article>)}</aside>
      <div className="activity-workspace">{data.students.map((student, index) => <fieldset className="attendance-case" key={student.id}><legend>{student.id} · {name(student)}</legend>
        <label>{name(student)} {en ? 'attendance status' : '출결 처리'}<select value={statuses[index]} onChange={event => { setStatuses(statuses.map((value, i) => i === index ? event.target.value : value)); setErrors([]); }}><option value="">{en ? 'Compare evidence first' : '근거를 보고 선택'}</option>{statusIds.map(id => <option key={id} value={id}>{en ? labels[id].en : labels[id].ko}</option>)}</select></label>
        <label>{name(student)} {en ? 'supporting document' : '근거 문서'}<select value={evidence[index]} onChange={event => { setEvidence(evidence.map((value, i) => i === index ? event.target.value : value)); setErrors([]); }}><option value="">{en ? 'Select source' : '자료 선택'}</option>{data.sources.map(source => <option key={source.id} value={source.id}>{en ? source.titleEn : source.title}</option>)}</select></label>
      </fieldset>)}
        {taskId === 'attendance_followup' && <label className="check-row"><input type="checkbox" checked={correction} onChange={event => { setCorrection(event.target.checked); setErrors([]); }} />{en ? 'Preserve yesterday’s contact log and attach this reply to complete the pending reason' : '어제 연락 기록을 보존하고 회신을 연결해 확인 중 사유 보완'}</label>}
        {errors.length > 0 && <div role="alert">{errors.map(error => <p key={error}>{error}</p>)}</div>}
        <button onClick={compare}>{en ? 'Cross-check register' : '출결 대장 대조하기'}</button>
      </div>
    </div> : <div className="activity-workspace"><h3>{en ? 'Handover summary' : '출결 인계 요약'}</h3><ul className="paper-ledger">{data.students.map((student, index) => <li key={student.id}><strong>{name(student)}</strong><span>{en ? labels[statuses[index] as AttendanceStatus].en : labels[statuses[index] as AttendanceStatus].ko}</span><p>{en ? data.sources.find(source => source.id === evidence[index])?.titleEn : data.sources.find(source => source.id === evidence[index])?.title}</p></li>)}</ul><p>{en ? data.endingEn : data.ending}</p><div className="choices"><button onClick={() => setReviewed(false)}>{en ? 'Review entries again' : '기록 다시 대조'}</button><button onClick={() => onDone(taskId === 'attendance_unknown' ? 'resolved_with_issue' : 'completed', en ? data.endingEn : data.ending)}>{en ? 'Save attendance handover' : '출결 기록 인계'}</button></div></div>}
    <div className="attendance-totals" role="status"><strong>{en ? 'Recorded' : '기록 인원'} {selectedCount} / 28</strong>{counts.filter(item => item.count > 0).map(item => <span key={item.id}>{en ? labels[item.id].en : labels[item.id].ko}: {item.count}</span>)}</div>
  </section>;
}

import { useState } from 'react';
import { useDraftState } from './useDraftState';
import { useTranslation } from 'react-i18next';
import exercises from '../content/exercises.json';

export const exerciseIds = Object.keys(exercises);
type Done = (status: 'completed' | 'resolved_with_issue', feedbackKey: string) => void;

export function DeskExercise({ taskId, onDone }: { taskId: string; onDone: Done }) {
  return taskId.startsWith('notice_') ? <Documents taskId={taskId as 'notice_basic' | 'notice_variant'} onDone={onDone} /> : <Grading taskId={taskId as 'grading_basic' | 'grading_partial'} onDone={onDone} />;
}

function Documents({ taskId, onDone }: { taskId: 'notice_basic' | 'notice_variant'; onDone: Done }) {
  const { i18n } = useTranslation();
  const en = i18n.language.startsWith('en');
  const [index, setIndex] = useDraftState<number>(taskId, 'index', 0, n => Number.isInteger(n) && n >= 0 && n < exercises[taskId].length);
  const [error, setError] = useState(false);
  const documents = exercises[taskId];
  const doc = documents[index];
  const needsCorrection = !doc.signed || doc.id !== doc.submittedId || !doc.consent;
  function decide(correction: boolean) {
    if (correction !== needsCorrection) { setError(true); return; }
    setError(false);
    if (index + 1 < documents.length) setIndex(index + 1);
    else onDone(taskId === 'notice_basic' ? 'completed' : 'resolved_with_issue', taskId === 'notice_basic' ? 'feedback.noticeOk' : 'feedback.requestedFix');
  }
  return <section className="desk-exercise">
    <p>{en ? 'Compare the roster, signature and consent before stamping.' : '명부와 학번·보호자 서명·동의 표시를 비교하세요.'}</p>
    <h3>{en ? 'Document' : '서류'} {index + 1} / {documents.length}</h3>
    <dl><dt>{en ? 'Roster' : '학생 명부'}</dt><dd>{doc.name} · {doc.id}</dd><dt>{en ? 'Submitted ID' : '서류 학번'}</dt><dd>{doc.submittedId}</dd><dt>{en ? 'Guardian signature' : '보호자 서명'}</dt><dd>{doc.signed ? '✓' : '—'}</dd><dt>{en ? 'Consent' : '동의 여부'}</dt><dd>{doc.consent ? '✓' : '—'}</dd></dl>
    {error && <p role="alert">{en ? 'Check the fields again. Correct documents can be approved; missing or mismatched fields need correction.' : '다시 확인하세요. 누락이나 불일치가 있으면 보완을 요청하고, 모두 맞으면 승인하세요.'}</p>}
    <div className="choices"><button onClick={() => decide(false)}>{en ? 'Stamp approved' : '확인 도장 찍기'}</button><button onClick={() => decide(true)}>{en ? 'Request correction' : '보완 요청하기'}</button></div>
  </section>;
}

function Grading({ taskId, onDone }: { taskId: 'grading_basic' | 'grading_partial'; onDone: Done }) {
  const { i18n } = useTranslation();
  const en = i18n.language.startsWith('en');
  const data = exercises[taskId];
  const [score, setScore] = useDraftState<string>(taskId, 'score', '');
  const [error, setError] = useState(false);
  function submit() {
    if (score === '' || Number(score) !== data.expected) { setError(true); return; }
    onDone('completed', taskId === 'grading_basic' ? 'feedback.graded' : 'feedback.partialCorrect');
  }
  return <section className="desk-exercise"><h3>{en ? 'Marking rubric' : '채점 기준표'}</h3><p>{en ? data.rubricEn : data.rubric}</p><h3>{en ? 'Student answer' : '학생 답안'}</h3><p>{en ? data.answerEn : data.answer}</p><label>{en ? 'Score' : '부여할 점수'}<select value={score} onChange={(event) => { setScore(event.target.value); setError(false); }}><option value="">{en ? 'Select' : '선택'}</option>{Array.from({ length: data.max + 1 }, (_, n) => <option key={n} value={n}>{n}</option>)}</select></label>{error && <p role="alert">{en ? 'The score does not match the rubric. Review each criterion and try again.' : '기준표와 점수가 다릅니다. 과정 점수와 결과 점수를 확인하고 다시 입력하세요.'}</p>}<div className="choices"><button onClick={submit}>{en ? 'Record score' : '점수 기록하기'}</button></div></section>;
}

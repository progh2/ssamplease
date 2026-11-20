import { useState } from 'react';
import { QuickMarking } from './QuickMarking';
import { ReferenceSheet } from './ReferenceSheet';
import { useDraftState } from './useDraftState';
import { useTranslation } from 'react-i18next';
import exercises from '../content/exercises.json';
import grading from '../content/grading.json';
import { noticeIssues, sameEvidence } from '../engine/deskJudgement';

export const exerciseIds = [...Object.keys(exercises), ...Object.keys(grading)];
type Done = (status: 'completed' | 'resolved_with_issue', feedbackKey: string) => void;
type NoticeId = keyof typeof exercises;
type GradingId = keyof typeof grading;

export function DeskExercise({ taskId, onDone }: { taskId: string; onDone: Done }) {
  return taskId in exercises
    ? <Documents taskId={taskId as NoticeId} onDone={onDone} />
    : <QuickMarking taskId={taskId as GradingId} onDone={onDone} />;
}

function Documents({ taskId, onDone }: { taskId: NoticeId; onDone: Done }) {
  const en = useTranslation().i18n.language.startsWith('en');
  const documents = exercises[taskId];
  const [receipts, setReceipts] = useDraftState<string[]>(taskId, 'receipts', [], value => value.length <= documents.length && value.every(id => ['approve', 'return'].includes(id)));
  const [marked, setMarked] = useDraftState<string[]>(taskId, 'marked', [], value => value.every(id => ['id', 'signature', 'consent'].includes(id)) && new Set(value).size === value.length);
  const [permission, setPermission] = useDraftState<string>(taskId, 'permission', '');
  const [error, setError] = useState('');
  const index = receipts.length;
  const doc = documents[index];
  const names = (item: typeof documents[number]) => en ? item.nameEn : item.name;
  const toggle = (field: string) => {
    setMarked(marked.includes(field) ? marked.filter(id => id !== field) : [...marked, field]);
    setError('');
  };
  function decide(correction: boolean) {
    const issues = noticeIssues(doc);
    if (!sameEvidence(marked, issues) || correction !== (issues.length > 0)) {
      setError(en ? 'Compare the roster with each marked field. A return note must identify the actual missing or mismatched information. A signed refusal is a valid choice.' : '표시한 항목을 명부와 다시 대조하세요. 보완 메모에는 실제 누락·불일치만 표시해야 합니다. 서명된 비동의는 유효한 선택입니다.');
      return;
    }
    if (!correction && permission !== (doc.consent === 'yes' ? 'allow' : 'restrict')) {
      setError(en ? 'Record the guardian’s actual photo-publication choice. Receiving the form does not override a refusal.' : '보호자가 선택한 사진 공개 범위를 기록하세요. 서류를 접수해도 비동의를 동의로 바꾸면 안 됩니다.');
      return;
    }
    setReceipts([...receipts, correction ? 'return' : 'approve']);
    setMarked([]); setPermission(''); setError('');
  }
  if (!doc) return <section className="desk-exercise document-desk"><header><span>{en ? 'RECEIPT LEDGER' : '가정통신문 · 접수 대장'}</span><h2>{en ? 'Every form has a next step' : '서류마다 다음 할 일이 생겼습니다'}</h2></header>
    <ul className="paper-ledger">{documents.map((item, i) => <li key={item.id}><strong>{names(item)}</strong><span>{receipts[i] === 'return' ? (en ? 'Correction requested with a specific reason' : '누락·불일치 사유를 적어 보완 요청') : item.consent === 'no' ? (en ? 'Received · photo publication restricted' : '접수 · 사진 공개 제한') : (en ? 'Received · consent recorded' : '접수 · 동의 기록')}</span></li>)}</ul>
    <blockquote>{taskId === 'notice_basic' ? (en ? 'Jiwoo: “Thank you for accepting our choice without making me explain it in front of everyone.”' : '지우: “친구들 앞에서 이유를 설명하지 않아도 돼서 다행이에요.”') : (en ? 'Haneul: “Now I know exactly which field my guardian needs to complete.”' : '하늘: “어디를 다시 받아 와야 하는지 이제 알겠어요.”')}</blockquote>
    <button onClick={() => onDone(receipts.includes('return') ? 'resolved_with_issue' : 'completed', en ? 'Forms were received with consent respected; correction requests identify the exact fields to confirm.' : '보호자의 선택을 존중해 접수했고, 보완할 서류에는 확인할 항목을 구체적으로 남겼습니다.')}>{en ? 'File receipt ledger' : '접수 기록 마무리'}</button>
  </section>;
  return <section className="desk-exercise document-desk">
    <header><span>{en ? 'PAPER INSPECTION' : '가정통신문 · 문서 대조'}</span><h2>{en ? 'A form is more than a stamp' : '도장을 찍기 전에'}</h2><p>{en ? 'Paper' : '서류'} {index + 1} / {documents.length}</p></header>
    <div className="paper-progress" aria-label={en ? 'Document progress' : '서류 진행'}>{documents.map((item, i) => <span key={item.id} className={i < index ? 'is-filed' : i === index ? 'is-current' : ''}>{i + 1} {i < index ? '✓' : ''}</span>)}</div>
    <div className="activity-columns">
      <ReferenceSheet title={en ? 'Open roster and receiving rules' : '명부·접수 규칙 펼쳐 대조하기'}>{documents.map(item => <p key={item.id}><strong>{item.id}</strong> · {names(item)}</p>)}<h3>{en ? 'Receiving rules' : '접수 규칙'}</h3><p>{en ? 'Match the student ID and guardian signature. Both consent and refusal are valid when explicitly marked. Missing information needs confirmation, not a guess.' : '학번·보호자 서명을 대조합니다. 동의와 비동의 모두 명시되어 있으면 유효합니다. 누락은 추측해서 채우지 않습니다.'}</p><p>{en ? 'Tap only the incorrect fields on the paper to write a correction note.' : '서류에서 잘못된 항목만 눌러 보완 메모에 표시하세요.'}</p></ReferenceSheet>
      <article className="inspection-paper"><span className="paper-eyebrow">{en ? 'School photo publication consent' : '학교 활동 사진 공개 동의서'}</span><h3>{names(doc)}</h3>
        <button className="paper-field" aria-pressed={marked.includes('id')} onClick={() => toggle('id')}><span>{en ? 'Student ID' : '서류 학번'}</span><strong>{doc.submittedId}</strong><small>{marked.includes('id') ? (en ? 'Flagged: ID mismatch' : '보완 표시: 학번 불일치') : (en ? 'Tap to flag mismatch' : '불일치하면 눌러 표시')}</small></button>
        <button className="paper-field" aria-pressed={marked.includes('signature')} onClick={() => toggle('signature')}><span>{en ? 'Guardian signature' : '보호자 서명'}</span><strong>{doc.signed ? (en ? 'Signed by guardian' : '보호자 서명 있음') : '—'}</strong><small>{marked.includes('signature') ? (en ? 'Flagged: missing signature' : '보완 표시: 서명 누락') : (en ? 'Tap to flag missing signature' : '서명이 없으면 눌러 표시')}</small></button>
        <button className="paper-field" aria-pressed={marked.includes('consent')} onClick={() => toggle('consent')}><span>{en ? 'Publication choice' : '사진 공개 선택'}</span><strong>{doc.consent === 'yes' ? (en ? '☑ Consent' : '☑ 동의') : doc.consent === 'no' ? (en ? '☑ Do not consent' : '☑ 동의하지 않음') : '—'}</strong><small>{marked.includes('consent') ? (en ? 'Flagged: choice missing' : '보완 표시: 선택 누락') : (en ? 'A refusal is not an omission' : '비동의는 누락이 아닙니다')}</small></button>
        <blockquote>{en ? doc.noteEn : doc.note}</blockquote>
        <label>{en ? 'Record publication permission' : '사진 공개 범위 기록'}<select value={permission} onChange={event => { setPermission(event.target.value); setError(''); }}><option value="">{en ? 'Select before receiving' : '접수 전 선택'}</option><option value="allow">{en ? 'Publication allowed' : '공개 동의로 기록'}</option><option value="restrict">{en ? 'Publication restricted' : '공개 제한으로 기록'}</option></select></label>
        {marked.length > 0 && <p className="correction-note">{en ? 'Correction note: ' : '보완 메모: '}{marked.map(id => ({ id: en ? 'student ID' : '학번', signature: en ? 'guardian signature' : '보호자 서명', consent: en ? 'publication choice' : '사진 공개 선택' })[id]).join(' · ')}</p>}
        {error && <p role="alert">{error}</p>}
        <div className="choices stamp-actions"><button onClick={() => decide(false)}>{en ? 'Stamp received' : '확인 도장 찍기'}</button><button onClick={() => decide(true)}>{en ? 'Return with correction note' : '보완 요청하기'}</button></div>
      </article>
    </div>
  </section>;
}

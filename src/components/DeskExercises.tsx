import { useState } from 'react';
import { ReferenceSheet } from './ReferenceSheet';
import { useDraftState } from './useDraftState';
import { useTranslation } from 'react-i18next';
import exercises from '../content/exercises.json';
import grading from '../content/grading.json';
import { gradePaper, noticeIssues, sameEvidence } from '../engine/deskJudgement';

export const exerciseIds = [...Object.keys(exercises), ...Object.keys(grading)];
type Done = (status: 'completed' | 'resolved_with_issue', feedbackKey: string) => void;
type NoticeId = keyof typeof exercises;
type GradingId = keyof typeof grading;

export function DeskExercise({ taskId, onDone }: { taskId: string; onDone: Done }) {
  return taskId in exercises
    ? <Documents taskId={taskId as NoticeId} onDone={onDone} />
    : <Grading taskId={taskId as GradingId} onDone={onDone} />;
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

function Grading({ taskId, onDone }: { taskId: GradingId; onDone: Done }) {
  const en = useTranslation().i18n.language.startsWith('en');
  const data = grading[taskId];
  const [records, setRecords] = useDraftState<string[]>(taskId, 'records', [], value => value.length <= data.papers.length && value.every(id => ['0', '1', '2', '3', 'review'].includes(id)));
  const [credits, setCredits] = useDraftState<string[]>(taskId, 'credits', [], value => value.every(id => data.criteria.some(criterion => criterion.id === id)) && new Set(value).size === value.length);
  const [comment, setComment] = useDraftState<string>(taskId, 'comment', '');
  const [reviewReason, setReviewReason] = useDraftState<string>(taskId, 'reviewReason', '');
  const [teachingPlan, setTeachingPlan] = useDraftState<string>(taskId, 'teachingPlan', '');
  const [revisions, setRevisions] = useDraftState<number>(taskId, 'revisions', 0, n => Number.isInteger(n) && n >= 0 && n < 10000);
  const [error, setError] = useState('');
  const index = records.length;
  const paper = data.papers[index];
  const total = data.criteria.reduce((sum, criterion) => sum + (credits.includes(criterion.id) ? criterion.points : 0), 0);
  const name = (item: typeof data.papers[number]) => en ? item.nameEn : item.name;
  const plans = [
    { id: 'trace', label: en ? 'Trace the order and reason for each step' : '실행 순서와 각 단계의 이유를 함께 추적' },
    { id: 'calculation', label: en ? 'Check the final calculation while preserving process credit' : '과정은 인정하고 마지막 계산을 검산' },
    { id: 'condition', label: en ? 'Compare AND and OR with the same everyday example' : '같은 생활 사례로 AND와 OR 비교' },
  ];
  function submit(review: boolean) {
    const verdict = gradePaper(paper, credits, comment, review, reviewReason);
    if (verdict !== 'ok') {
      setRevisions(Math.min(9999, revisions + 1));
      setError(verdict === 'needs_review'
        ? (en ? 'Some writing cannot be read. Preserve the original and record why joint review is needed; do not guess a score.' : '판독할 수 없는 부분이 있습니다. 점수를 추측하지 말고 원본을 보존한 채 공동 검토 사유를 기록하세요.')
        : verdict === 'unnecessary_review'
          ? (en ? 'This answer is readable and the rubric applies. Compare its meaning with each criterion before deferring it.' : '이 답안은 읽을 수 있고 기준표를 적용할 수 있습니다. 표현이 달라도 뜻을 대조해 직접 채점하세요.')
          : (en ? 'The selected credits or comment do not match the evidence. Judge each criterion separately and choose feedback about this answer.' : '부여한 기준 점수 또는 피드백이 답안의 근거와 다릅니다. 기준을 각각 판단하고 이 답안에 맞는 피드백을 골라 주세요.'));
      return;
    }
    setRecords([...records, review ? 'review' : String(total)]);
    setCredits([]); setComment(''); setReviewReason(''); setError('');
  }
  if (!paper) return <section className="desk-exercise grading-desk"><header><span>{en ? 'MARKING CONFERENCE' : '채점 · 수업으로 연결하기'}</span><h2>{en ? 'What should the next lesson address?' : '점수에서 다음 수업을 찾기'}</h2></header>
    <ul className="paper-ledger">{data.papers.map((item, i) => <li key={item.id}><strong>{name(item)}</strong><span>{records[i] === 'review' ? (en ? 'Joint review · score pending' : '공동 검토 · 점수 미확정') : records[i] + (en ? ' / 3 points' : ' / 3점')}</span><p>{en ? item.reactionEn : item.reaction}</p></li>)}</ul>
    <p>{en ? 'Revisions before recording' : '기록 전 다시 대조한 횟수'}: {revisions} · {en ? 'Corrections are part of fair grading.' : '다시 확인하는 것도 공정한 채점의 일부입니다.'}</p>
    <fieldset><legend>{en ? 'Choose a follow-up supported by these answers' : '이번 답안에서 근거를 찾을 수 있는 후속 수업'}</legend>{plans.map(plan => <label className="check-row" key={plan.id}><input type="radio" name={taskId + '-plan'} checked={teachingPlan === plan.id} onChange={() => { setTeachingPlan(plan.id); setError(''); }} />{plan.label}</label>)}</fieldset>
    {error && <p role="alert">{error}</p>}
    <button onClick={() => {
      if (teachingPlan !== data.nextStep) { setError(en ? 'Use the students’ actual difficulties in this batch to choose the follow-up. Review their comments above.' : '이번 답안에서 학생들이 어려워한 내용을 근거로 골라 주세요. 위의 학생별 피드백을 다시 살펴보세요.'); return; }
      onDone(records.includes('review') ? 'resolved_with_issue' : 'completed', en ? data.nextStoryEn : data.nextStory);
    }}>{en ? 'File marks and lesson note' : '채점 기록과 수업 메모 저장'}</button>
  </section>;
  return <section className="desk-exercise grading-desk">
    <header><span>{en ? 'RED PEN · MARKING DESK' : '빨간 펜 · 채점 작업대'}</span><h2>{en ? data.titleEn : data.title}</h2><p>{en ? 'Answer sheet' : '답안지'} {index + 1} / {data.papers.length}</p></header>
    <div className="paper-progress" aria-label={en ? 'Marking progress' : '채점 진행'}>{data.papers.map((item, i) => <span key={item.id} className={i < index ? 'is-filed' : i === index ? 'is-current' : ''}>{i + 1} {i < index ? records[i] === 'review' ? '?' : '✓' : ''}</span>)}</div>
    {index > 0 && <p className="student-response" role="status"><strong>{name(data.papers[index - 1])}</strong> · {en ? data.papers[index - 1].reactionEn : data.papers[index - 1].reaction}</p>}
    <div className="activity-columns">
      <ReferenceSheet title={en ? 'Open marking agreement' : '채점 기준표 펼쳐 대조하기'}><p>{en ? data.briefEn : data.brief}</p>{data.criteria.map(criterion => <p key={criterion.id}><strong>{criterion.points}{en ? ' points' : '점'}</strong> · {en ? criterion.labelEn : criterion.label}</p>)}<p>{en ? 'Mark each criterion independently. Use joint review only when the evidence is genuinely unreadable.' : '기준별 점수는 독립적으로 부여합니다. 판독 불가처럼 판단 근거가 없는 경우에만 공동 검토로 넘깁니다.'}</p></ReferenceSheet>
      <article className="inspection-paper answer-paper"><span className="paper-eyebrow">{paper.id} · {name(paper)}</span><h3>{en ? data.questionEn : data.question}</h3>{'priorScore' in paper && <p className="correction-note">{en ? 'Previous provisional entry (verify against the answer)' : '기존 임시 입력 점수 (답안 근거로 재검토)'}: {Number(paper.priorScore)} / 3</p>}<blockquote className="handwritten-answer">{en ? paper.answerEn : paper.answer}</blockquote>
        <fieldset><legend>{en ? 'Award credit where the answer meets the criterion' : '답안에서 충족한 기준에 점수 부여'}</legend>{data.criteria.map(criterion => <label key={criterion.id} className="check-row"><input type="checkbox" checked={credits.includes(criterion.id)} onChange={event => { setCredits(event.target.checked ? [...credits, criterion.id] : credits.filter(id => id !== criterion.id)); setError(''); }} />{en ? criterion.labelEn : criterion.label} (+{criterion.points})</label>)}</fieldset>
        <p className="score-stamp"><output aria-label={en ? 'Provisional score' : '임시 점수'}>{total} / 3</output></p>
        <label>{en ? 'Student feedback' : '학생에게 남길 피드백'}<select value={comment} onChange={event => { setComment(event.target.value); setError(''); }}><option value="">{en ? 'Choose a comment based on the evidence' : '답안 근거에 맞는 피드백 선택'}</option>{data.comments.map(item => <option key={item.id} value={item.id}>{en ? item.labelEn : item.label}</option>)}</select></label>
        <div className="review-referral"><label>{en ? 'Reason for joint review (only if needed)' : '공동 검토 사유 (필요한 경우만)'}<select value={reviewReason} onChange={event => { setReviewReason(event.target.value); setError(''); }}><option value="">{en ? 'Not requested' : '요청하지 않음'}</option><option value="unreadable">{en ? 'Writing cannot be read; original needs confirmation' : '판독 불가 — 원본 확인 필요'}</option><option value="wording">{en ? 'Wording differs from the textbook' : '교과서와 표현이 다름'}</option></select></label></div>
        {error && <p role="alert">{error}</p>}
        <div className="choices stamp-actions"><button onClick={() => submit(false)}>{en ? 'Record score and feedback' : '점수와 피드백 기록'}</button><button onClick={() => submit(true)}>{en ? 'Preserve original and request review' : '원본 보존 후 공동 검토 요청'}</button></div>
      </article>
    </div>
  </section>;
}

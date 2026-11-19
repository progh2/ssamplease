import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDraftState } from './useDraftState';
import { useGameStore } from '../store';
import story from '../content/counseling.json';
import haneul from '../assets/characters/haneul.png';

export function CounselingGame({ taskId, onDone }: { taskId: string; onDone: (status: 'completed' | 'resolved_with_issue', feedback: string) => void }) {
  const en = useTranslation().i18n.language.startsWith('en');
  const lang = en ? 'en' : 'ko';
  const followup = taskId === 'counseling_followup';
  const memory = useGameStore(s => s.memories.student_counseling);
  const [heard, setHeard] = useDraftState<string[]>(taskId, 'heard', [], v => new Set(v).size === v.length && v.every(id => story.clues.some(c => c.id === id)));
  const [selected, setSelected] = useDraftState<string>(taskId, 'selectedClue', '');
  const [response, setResponse] = useDraftState<string>(taskId, 'response', '');
  const [plan, setPlan] = useDraftState<string>(taskId, 'supportPlan', '', v => v === '' || story.plans.some(p => p.id === v));
  const [reflection, setReflection] = useDraftState<string>(taskId, 'reflection', '');
  const [error, setError] = useState('');
  const chosen = story.plans.find(p => p.id === plan);
  const earlier = story.plans.find(p => p.id === memory?.supportPlan);
  const clue = story.clues.find(c => c.id === selected);
  return <section className="school-activity counseling-game">
    <div className="conversation-scene"><img src={haneul} alt={en ? 'Haneul, broadcasting club student' : '방송반 학생 김하늘'} /><div className="speech-card"><small>{en ? 'HANEUL · BROADCASTING CLUB' : '김하늘 · 방송반'}</small><h2>{followup ? (en ? 'Back at the microphone' : '다시 마이크 앞에서') : (en ? 'It was not your fault' : '고장과 마음 사이')}</h2><p>{followup ? earlier?.followup[lang] ?? (en ? 'The new cable worked today. I would like to decide my next role together.' : '새 케이블로 오늘 방송을 마쳤어요. 다음 역할은 같이 정해 보고 싶어요.') : chosen ? chosen.reply[lang] : story.opening[lang]}</p></div></div>
    {!followup && <><h3>{en ? 'Understand before advising' : '조언하기 전에, 서로의 이야기 확인하기'}</h3><div className="choices">{story.clues.map(c => <button key={c.id} aria-pressed={heard.includes(c.id)} onClick={() => { setSelected(c.id); if (!heard.includes(c.id)) setHeard([...heard, c.id]); setError(''); }}>{c.label[lang]} {heard.includes(c.id) ? '✓' : ''}</button>)}</div>{clue && <p className="evidence-note" role="status">{clue.text[lang]}</p>}
      <h3>{en ? 'What will you say?' : '어떻게 답할까요?'}</h3><div className="choices"><button onClick={() => { if (heard.length < 3) { setError(en ? 'There is more to understand. Read the record and ask what Haneul wants.' : '점검 기록뿐 아니라 하늘의 경험과 바람도 먼저 들어 주세요.'); return; } setResponse('evidence'); setError(''); }}>{en ? 'Explain the cable fault and acknowledge the worry' : '케이블 고장을 설명하고 걱정을 인정하기'}</button><button onClick={() => { setResponse('repair'); setError(en ? '“I know you mean well, but I am still afraid.” Try asking what would help before promising perfection.' : '“괜찮다고 하셔도 다음에 또 그러면 무서울 것 같아요.” 걱정을 없던 일로 하지 말고, 어떤 도움이 필요한지 다시 이야기하세요.'); }}>{en ? 'Promise it will never happen again' : '앞으로 절대 고장 나지 않는다고 약속하기'}</button></div></>}
    {(followup || response === 'evidence') && <><h3>{en ? 'Agree a manageable next step' : '함께 정하는 다음 한 걸음'}</h3><div className="plan-cards">{story.plans.map(p => <button aria-pressed={plan === p.id} key={p.id} onClick={() => { setPlan(p.id); setError(''); }}>{p.label[lang]}</button>)}</div>{chosen && <p className="evidence-note">{chosen.reply[lang]}</p>}
      <label>{en ? 'Counseling record' : '상담 기록'}<select value={reflection} onChange={e => setReflection(e.target.value)}><option value="">{en ? 'What should remain in the record?' : '어떤 내용을 남길까요?'}</option><option value="blame">{en ? 'Student caused the equipment failure' : '학생 과실로 장비 고장 발생'}</option><option value="support">{en ? 'Confirmed facts and agreed support plan' : '확인된 사실과 합의한 지원 계획'}</option></select></label><button onClick={() => { if (!chosen || reflection !== 'support') { setError(en ? 'Agree a plan and record facts without assigning unsupported blame.' : '지원 계획을 함께 정하고, 근거 없는 책임 대신 확인된 사실을 기록하세요.'); return; } onDone('completed', (en ? 'Haneul agreed to: ' : '하늘과 약속했습니다: ') + chosen.label[lang] + (followup ? '' : (en ? '. This promise will return in the next conversation.' : '. 다음 상담에서 이 약속을 다시 확인합니다.'))); }}>{en ? 'Save our agreement' : '상담 약속 기록'}</button></>}
    {error && <p role="alert">{error}</p>}
  </section>;
}

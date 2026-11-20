import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import labs from '../content/lessonLabs.json';
import { useDraftState } from './useDraftState';

export function LessonLab({ taskId, onComplete }: { taskId: string; onComplete: () => void }) {
  const en = useTranslation().i18n.language.startsWith('en');
  const lang = en ? 'en' : 'ko';
  const lab = labs[taskId as keyof typeof labs];
  const [answers, setAnswers] = useDraftState<string[]>(taskId, 'labAnswers', lab.cards.map(() => ''), v => v.length === lab.cards.length && v.every(id => id === '' || lab.bins.some(b => b.id === id)));
  const [checked, setChecked] = useDraftState<boolean>(taskId, 'labChecked', false);
  const [selected, setSelected] = useDraftState<number>(taskId, 'labSelected', 0, v => Number.isInteger(v) && v >= 0 && v < lab.cards.length);
  const [attempted, setAttempted] = useState(false);
  const valid = lab.cards.every((card, i) => answers[i] === card.target);
  return <section className={`lesson-lab lab-${lab.kind}`}>
    <span className="paper-eyebrow">{en ? 'STUDENT WORKSHOP' : '학생 참여 활동'}</span><h3>{lab.title[lang]}</h3><p>{lab.brief[lang]}</p>
    <div className="lab-cards">{lab.cards.map((card, i) => <button key={card.id} aria-pressed={selected === i} onClick={() => setSelected(i)}><b>{i + 1}</b><span>{card.text[lang]}</span><small>{lab.bins.find(bin => bin.id === answers[i])?.label[lang] ?? (en ? 'Undecided' : '판단 전')}</small>{attempted && answers[i] !== card.target && <em>{en ? 'Revisit' : '다시 대조'}</em>}</button>)}</div>
    <div className="lab-decision"><p>{en ? 'Selected card' : '선택한 카드'}: {lab.cards[selected].text[lang]}</p><div className="choices">{lab.bins.map(bin => <button key={bin.id} aria-pressed={answers[selected] === bin.id} onClick={() => { const next = [...answers]; next[selected] = bin.id; setAnswers(next); setChecked(false); setAttempted(false); const empty = next.findIndex(value => !value); if (empty >= 0) setSelected(empty); }}>{bin.label[lang]}</button>)}</div></div>
    <button onClick={() => { setAttempted(true); setChecked(valid); }}>{en ? 'Compare the class responses' : '학생 활동 결과 대조'}</button>
    {attempted && !valid && <div role="alert"><p>{en ? 'Discuss the evidence for the highlighted cards and try again.' : '다시 대조할 카드의 근거를 함께 이야기하고 고쳐 보세요.'}</p>{lab.cards.filter((card, i) => answers[i] !== card.target).map(card => <p key={card.id}>{card.text[lang]} — {card.explanation[lang]}</p>)}</div>}
    {checked && valid && <div className="lesson-reflection"><p role="status">{lab.ending[lang]}</p><button onClick={onComplete}>{en ? 'Add workshop results to lesson record' : '활동 결과를 수업 기록에 반영'}</button></div>}
  </section>;
}

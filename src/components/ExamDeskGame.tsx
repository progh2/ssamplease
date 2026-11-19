import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import content from '../content/examDesk.json';
import { useDraftState } from './useDraftState';
export const examDeskIds = Object.keys(content);
export function ExamDeskGame({ taskId, onDone }: { taskId: string; onDone: (feedback: string) => void }) {
  const en = useTranslation().i18n.language.startsWith('en');
  const lang = en ? 'en' : 'ko';
  const data = content[taskId as keyof typeof content];
  const [destinations, setDestinations] = useDraftState<string[]>(taskId, 'destinations', data.items.map(() => ''), v => v.length === data.items.length && v.every(id => id === '' || data.bins.some(bin => bin.id === id)));
  const [current, setCurrent] = useDraftState<number>(taskId, 'currentCard', 0, n => Number.isInteger(n) && n >= 0 && n < data.items.length);
  const [checked, setChecked] = useDraftState<boolean>(taskId, 'sortedChecked', false);
  const [errors, setErrors] = useState<string[]>([]);
  const valid = data.items.every((item, i) => destinations[i] === item.target);
  return <section className="school-activity exam-desk"><header><span>{en ? 'EXAM DESK · SORT AND VERIFY' : '시험 작업대 · 분류하고 대조하기'}</span><h2>{data.title[lang]}</h2></header><p className="evidence-note">{data.brief[lang]}</p><h3>{en ? '1. Select a card' : '1. 자료 카드 선택'}</h3><div className="document-tray">{data.items.map((item,i) => <button key={item.id} aria-pressed={current === i} onClick={() => setCurrent(i)}><strong>{item[lang]}</strong><small>{data.bins.find(b => b.id === destinations[i])?.[lang] ?? (en ? 'Unsorted' : '분류 전')}</small></button>)}</div><h3>{en ? '2. Choose its destination' : '2. 선택한 자료를 놓을 곳'}</h3><p>{data.items[current][lang]}</p><div className="sort-bins">{data.bins.map(bin => <button key={bin.id} onClick={() => { const next = [...destinations]; next[current] = bin.id; setDestinations(next); setChecked(false); setErrors([]); const empty = next.findIndex(v => !v); if (empty >= 0) setCurrent(empty); }}>{bin[lang]} <small>{destinations.filter(id => id === bin.id).length}</small></button>)}</div><button onClick={() => { setChecked(valid); setErrors(data.items.filter((item, i) => destinations[i] !== item.target).map(item => item[lang])); }}>{en ? 'Compare the sorted records' : '분류 결과 대조'}</button>{errors.length > 0 && <p role="alert">{en ? 'Recheck these cards against the reference: ' : '안내와 다시 대조할 카드: '}{errors.join(' · ')}</p>}{checked && valid && <div className="lesson-reflection"><p role="status">{data.ending[lang]}</p><button onClick={() => onDone(data.ending[lang])}>{en ? 'File the verified record' : '대조 기록 마무리'}</button></div>}</section>;
}

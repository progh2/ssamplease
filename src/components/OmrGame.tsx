import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDraftState } from './useDraftState';

export function OmrGame({ missing, onDone, taskId }: { missing: boolean; onDone: () => void; taskId: string }) {
  const en = useTranslation().i18n.language.startsWith('en');
  const [index, setIndex] = useDraftState<number>(taskId, 'index', 0, n => Number.isInteger(n) && n >= 0 && n <= 3);
  const [count, setCount] = useDraftState<string>(taskId, 'count', '');
  const [error, setError] = useState(false);
  const cards = [
    { name: '김하늘', id: '2301', printed: '2301' },
    { name: '박지우', id: '2302', printed: missing ? '' : '2302' },
    { name: '서민준', id: '2303', printed: '2303' },
  ];
  const card = cards[index];
  function inspect(flag: boolean) {
    if (flag !== !card.printed) { setError(true); return; }
    setError(false); setIndex(index + 1);
  }
  return <section className="school-activity"><h2>{en ? 'OMR handover check' : 'OMR 회수·기재 확인'}</h2><p>{en ? '28 students, 28 returned cards. Inspect the three cards selected for manual review; do not alter student answers.' : '응시 28명, 회수 카드 28장. 수동 확인 대상으로 분류된 3장을 점검하세요. 학생 답안은 수정하지 않습니다.'}</p>{card ? <div className="activity-columns"><aside className="reference-sheet"><h3>{en ? 'Roster' : '응시자 명부'}</h3>{cards.map(item => <p key={item.id}>{item.id} · {item.name}</p>)}</aside><article className="activity-workspace"><h3>{en ? 'Card' : '확인 카드'} {index + 1} / 3</h3><dl><dt>{en ? 'Name' : '성명'}</dt><dd>{card.name}</dd><dt>{en ? 'Student ID' : '학번'}</dt><dd>{card.printed || '—'}</dd></dl><div className="choices"><button onClick={() => inspect(false)}>{en ? 'Details match' : '기재 사항 일치'}</button><button onClick={() => inspect(true)}>{en ? 'Set aside for confirmation' : '확인 필요로 분리'}</button></div></article></div> : <div className="activity-workspace"><p>{en ? 'All selected cards checked. Enter the total returned count before handing over.' : '확인 대상 카드를 모두 점검했습니다. 전체 회수 수량을 입력하고 인계하세요.'}</p><label>{en ? 'Returned card count' : '전체 회수 수량'}<input type="number" min="0" value={count} onChange={event => setCount(event.target.value)} /></label><button onClick={() => { if (Number(count) === 28) onDone(); else setError(true); }}>{en ? 'Record and hand over' : '기록 후 인계'}</button></div>}{error && <p role="alert">{en ? 'Compare the card against the roster and count again. Do not guess missing information.' : '명부와 카드, 수량을 다시 대조하세요. 누락된 정보는 추측해 채우지 않습니다.'}</p>}</section>;
}

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDraftState } from './useDraftState';

export function EquipmentCheck({ onDone }: { onDone: () => void }) {
  const en = useTranslation().i18n.language.startsWith('en');
  const [checked, setChecked] = useDraftState<string[]>('equipment_check', 'checked', [], v => v.every(x => ['mic','mixer','cable','speaker'].includes(x)));
  const [selected, setSelected] = useState('');
  const [answer, setAnswer] = useDraftState<string>('equipment_check', 'answer', '');
  const [error, setError] = useState(false);
  const parts = [{id:'mic', ko:'마이크', en:'Microphone', result: en?'Input signal is normal.':'입력 신호 정상.'}, {id:'mixer', ko:'믹서', en:'Mixer', result: en?'Output meter responds.':'출력 미터 정상.'}, {id:'cable', ko:'연결 케이블', en:'Cable', result: en?'Signal cuts out when the connector moves.':'단자를 움직이면 신호가 끊깁니다.'}, {id:'speaker', ko:'스피커', en:'Speaker', result: en?'Test tone plays with a spare cable.':'예비 케이블을 연결하면 시험음이 들립니다.'}];
  return <section className="school-activity"><h2>{en?'Trace the signal':'신호가 끊기는 곳 찾기'}</h2><p>{en?'Test every component and record the faulty part.':'각 장비의 시험 결과를 확인한 뒤 고장 부위를 기록하세요.'}</p><div className="choices">{parts.map(part=><button key={part.id} onClick={()=>{setSelected(part.id); if(!checked.includes(part.id)) setChecked([...checked,part.id]);}}>{en?part.en:part.ko} {checked.includes(part.id)?'✓':''}</button>)}</div><p role="status">{parts.find(part=>part.id===selected)?.result}</p><label>{en?'Faulty component':'고장 부위'}<select aria-label={en?'Faulty component':'고장 부위'} value={answer} onChange={event=>{setError(false);setAnswer(event.target.value);}}><option value="">{en?'Select':'선택'}</option>{parts.map(part=><option key={part.id} value={part.id}>{en?part.en:part.ko}</option>)}</select></label>{error&&<p role="alert">{en?'Inspect all four components and compare their results.':'장비 네 가지를 모두 시험하고 결과를 대조하세요.'}</p>}<button onClick={()=>{if(checked.length===4&&answer==='cable') onDone(); else setError(true);}}>{en?'Record inspection':'점검 결과 기록'}</button></section>;
}

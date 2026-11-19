import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDraftState } from './useDraftState';

const sequence = ['mic', 'mixer', 'amp', 'speaker'];
const labels: Record<string, string> = { mic: 'MIC', mixer: 'MIXER', amp: 'AMP', speaker: 'SPEAKER' };
export function CableRepairGame({ onDone }: { onDone: () => void }) {
  const en = useTranslation().i18n.language.startsWith('en');
  const [chain, setChain] = useDraftState<string[]>('cable_repair', 'chain', [], v => new Set(v).size === v.length && v.length <= 4 && v.every(id => sequence.includes(id)));
  const [cable, setCable] = useDraftState<string>('cable_repair', 'replacement', 'worn', v => ['worn', 'spare'].includes(v));
  const [level, setLevel] = useDraftState<number>('cable_repair', 'level', 0, v => Number.isInteger(v) && v >= 0 && v <= 5);
  const [tested, setTested] = useDraftState<boolean>('cable_repair', 'tested', false);
  const [error, setError] = useState('');
  const signal = chain.join(',') === sequence.join(',') && cable === 'spare' && level >= 2 && level <= 3;
  const test = () => {
    setTested(true);
    if (chain.join(',') !== sequence.join(',')) setError(en ? 'Signal stops before the output. A microphone needs the mixer, then the amplifier, then a speaker.' : '출력까지 신호가 닿지 않습니다. 마이크 신호를 믹서에서 조절하고 앰프로 보낸 뒤 스피커로 연결해 보세요.');
    else if (cable !== 'spare') setError(en ? 'The meter flickers when the connector moves. Changing the order did not repair the worn cable.' : '단자를 움직일 때 미터가 끊깁니다. 연결 순서만 바꿔도 손상된 케이블이 고쳐지지는 않습니다.');
    else if (level < 2) setError(en ? 'The input reaches the mixer, but output is too low. Raise it into the green range.' : '믹서에 신호는 들어오지만 출력이 너무 작습니다. 녹색 범위로 올려 보세요.');
    else if (level > 3) setError(en ? 'The output clips red. Lower the level to keep speech clear.' : '출력이 빨간색으로 넘치며 소리가 찌그러집니다. 말소리가 또렷해지도록 레벨을 낮추세요.');
    else setError('');
  };
  return <section className="school-activity cable-lab"><header><span>{en ? 'BROADCAST ROOM · BENCH TEST' : '방송실 · 신호 시험대'}</span><h2>{en ? 'Restore the announcement' : '다시 들리는 점심 방송'}</h2></header><p className="evidence-note">{en ? 'Inspection found a worn connector. Use one borrowed cable for today. Purchasing a permanent replacement comes next.' : '점검에서 케이블 단자 손상을 확인했습니다. 오늘은 빌린 예비 케이블로 임시 복구하고, 다음 업무에서 정식 교체품 구매를 요청합니다.'}</p>
    <div className="activity-columns"><aside className="reference-sheet"><h3>{en ? 'Signal guide' : '장비 카드'}</h3><p>MIC → MIXER → AMP → SPEAKER</p><p>{en ? 'MIC: collects voice. MIXER: adjusts input. AMP: raises power. SPEAKER: plays sound.' : '마이크는 소리를 받고, 믹서는 신호를 조절합니다. 앰프로 출력을 높인 뒤 스피커에서 듣습니다.'}</p><p>{en ? 'Stable speech: output level 2–3. This is a fictional simplified test.' : '안정적인 말소리: 출력 2~3. 게임용으로 단순화한 시험입니다.'}</p></aside><div className="activity-workspace"><h3>{en ? 'Connect signal route' : '신호 경로 연결'}</h3><ol className="patch-route">{sequence.map((_, index) => <li key={index}>{labels[chain[index]] ?? '○'}</li>)}</ol><div className="choices">{['speaker', 'mic', 'amp', 'mixer'].map(part => <button disabled={chain.includes(part)} key={part} onClick={() => { setChain([...chain, part]); setTested(false); setError(''); }}>{labels[part]}</button>)}</div><button onClick={() => { setChain([]); setTested(false); setError(''); }}>{en ? 'Reconnect' : '다시 연결'}</button><label>{en ? 'Cable at the damaged connection' : '손상된 구간에 쓸 케이블'}<select value={cable} onChange={e => { setCable(e.target.value); setTested(false); }}><option value="worn">{en ? 'Original cable' : '기존 케이블'}</option><option value="spare">{en ? 'Borrowed spare cable' : '빌린 예비 케이블'}</option></select></label><label>{en ? 'Output level' : '출력 레벨'}<input type="range" min="0" max="5" step="1" value={level} onChange={e => { setLevel(Number(e.target.value)); setTested(false); }} /><output>{level} / 5</output></label><div className={`signal-meter ${tested && signal ? 'stable' : ''}`} aria-hidden="true">{[1,2,3,4,5].map(n => <i className={n <= level ? 'lit' : ''} key={n}/>)}</div><button onClick={test}>{en ? 'Run test announcement' : '시험 방송 실행'}</button>{tested && signal && <p role="status">{en ? 'A clear announcement reaches the speaker. Haneul smiles: “I can hear every word!”' : '또렷한 안내가 스피커까지 닿습니다. 하늘: “이번에는 끝까지 잘 들려요!”'}</p>}{error && <p role="alert">{error}</p>}<button disabled={!tested || !signal} onClick={onDone}>{en ? 'Record temporary repair' : '임시 복구 결과 기록'}</button></div></div></section>;
}

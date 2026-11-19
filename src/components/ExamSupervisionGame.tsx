import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import supervision from '../content/supervision.json';
import { useDraftState } from './useDraftState';

type Text = { ko: string; en: string };
type ScenarioId = keyof typeof supervision.scenarios;
type Props = { taskId: string; onDone: (status: 'completed' | 'resolved_with_issue', feedback: string) => void };
const reportOptions = [
  { id: 'supplies', ko: '필기구·시험지 교체 기록', en: 'Stationery and paper replacement log' },
  { id: 'clarification', ko: '문항 문의 회신·관찰 사실 기록', en: 'Question clarification and factual observation log' },
  { id: 'identity', ko: '학번 확인 필요 카드 1장 포함', en: 'Includes one card flagged for ID verification' },
  { id: 'none', ko: '특이 사항 없음', en: 'No incidents to report' },
];

export function ExamSupervisionGame({ taskId, onDone }: Props) {
  const en = useTranslation().i18n.language.startsWith('en');
  const tr = (text: Text) => en ? text.en : text.ko;
  const scenario = supervision.scenarios[taskId as ScenarioId];
  const events = scenario.events;
  const [room, setRoom] = useDraftState<string>(taskId, 'supervisionRoom', '', value => ['', '2-1', '2-3', '2-4'].includes(value));
  const [ready, setReady] = useDraftState<boolean>(taskId, 'supervisionReady', false);
  const [index, setIndex] = useDraftState<number>(taskId, 'supervisionIndex', 0, value => Number.isInteger(value) && value >= 0 && value <= events.length);
  const [observed, setObserved] = useDraftState<string[]>(taskId, 'supervisionObserved', [], value => value.every(id => events.some(event => event.id === id)) && new Set(value).size === value.length);
  const [rulesRead, setRulesRead] = useDraftState<string[]>(taskId, 'supervisionRules', [], value => value.every(id => supervision.rules.some(rule => rule.id === id)) && new Set(value).size === value.length);
  const [resolved, setResolved] = useDraftState<string[]>(taskId, 'supervisionResolved', [], value => value.every(id => events.some(event => event.id === id)) && new Set(value).size === value.length);
  const [count, setCount] = useDraftState<string>(taskId, 'supervisionCount', '');
  const [report, setReport] = useDraftState<string>(taskId, 'supervisionReport', '', value => value === '' || reportOptions.some(option => option.id === value));
  const [selectedRule, setSelectedRule] = useState('');
  const [error, setError] = useState('');
  const [quietSeat, setQuietSeat] = useState(false);
  const event = events[index];
  const eventResolved = event && resolved.includes(event.id);
  const evidenceReady = event && observed.includes(event.id) && rulesRead.includes(event.ruleId);
  const openRule = supervision.rules.find(rule => rule.id === selectedRule);

  function begin() {
    if (room !== scenario.room) { setError(en ? 'Compare your room with the current assignment notice. Yesterday’s room may be different.' : '현재 감독 공지의 교실과 대조하세요. 이전 교실과 오늘 교실이 다를 수 있습니다.'); return; }
    setError(''); setReady(true);
  }
  function choose(id: string) {
    if (!event || eventResolved) return;
    if (!evidenceReady) { setError(en ? 'Observe the student and consult the relevant rule before deciding.' : '학생의 상황과 관련 지침을 확인한 뒤 조치하세요.'); return; }
    if (id !== event.correct) { setError(tr(event.choices.find(choice => choice.id === id)!.feedback)); return; }
    setResolved([...resolved, event.id]); setError('');
  }
  function handover() {
    if (!events.every(item => resolved.includes(item.id)) || Number(count) !== 28 || count.trim() === '' || report !== scenario.expectedReport) {
      setError(en ? 'Compare the collection count and incident records. Include flagged cards in the total, and hand over the record matching today’s events.' : '회수 수량과 오늘의 처리 기록을 대조하세요. 확인 필요 카드도 총수량에 포함하고, 오늘 사건에 맞는 인계 사항을 고르세요.'); return;
    }
    onDone('completed', tr(scenario.completion));
  }

  return <section className="school-activity supervision-game">
    <header><span>{en ? 'EXAM · OBSERVE AND RESPOND' : '시험 감독 · 관찰과 대응'}</span><h2>{en ? 'A calm room, an accurate handover' : '차분한 교실, 정확한 인계'}</h2></header>
    <p>{tr(scenario.intro)}</p>
    <p className="supervision-notice">{tr(scenario.notice)}</p>
    {!ready ? <div className="activity-workspace supervision-briefing">
      <p>{en ? 'This is a fictional school procedure. There is no countdown; events advance only after your decisions.' : '게임 속 가상 학교 지침입니다. 시간제한 없이 판단하며, 사건은 처리 후에만 진행됩니다.'}</p>
      <label>{en ? 'Confirm assigned room' : '감독 교실 확인'}<select value={room} onChange={e => { setRoom(e.target.value); setError(''); }}><option value="">{en ? 'Choose a room' : '교실 선택'}</option>{['2-1', '2-3', '2-4'].map(value => <option key={value} value={value}>{value}</option>)}</select></label>
      <button onClick={begin}>{en ? 'Confirm room and begin observation' : '교실 확인 후 감독 시작'}</button>
    </div> : event ? <>
      <p className="activity-progress">{en ? 'Incident' : '상황'} {index + 1} / {events.length} · {en ? 'Handled' : '처리 기록'} {resolved.length} / {events.length}</p>
      <div className="activity-columns supervision-columns">
        <aside className="reference-sheet supervision-manual"><h3>{en ? 'Invigilation handbook' : '감독 지침 수첩'}</h3><p>{en ? 'Choose the rule that applies to the facts you observe.' : '관찰한 사실에 적용할 지침을 찾아보세요.'}</p>
          <div className="supervision-rules">{supervision.rules.map(rule => <button key={rule.id} aria-pressed={selectedRule === rule.id} onClick={() => { setSelectedRule(rule.id); if (!rulesRead.includes(rule.id)) setRulesRead([...rulesRead, rule.id]); setError(''); }}>{tr(rule.title)}{rulesRead.includes(rule.id) ? ' ✓' : ''}</button>)}</div>
          {openRule && <article className="supervision-rule" role="note"><h4>{tr(openRule.title)}</h4><p>{tr(openRule.text)}</p></article>}
        </aside>
        <div className="activity-workspace supervision-observation">
          <h3>{en ? 'Classroom observation' : '교실 관찰'}</h3><p>{en ? 'Six representative seats from 28 candidates. Check the seat showing a signal.' : '응시자 28명 중 관찰 구역 6석입니다. 신호를 보이는 자리를 확인하세요.'}</p>
          <div className="supervision-seat-map" role="group" aria-label={en ? 'Observation seating plan' : '관찰 좌석 배치'}>{[1, 2, 3, 4, 5, 6].map(seat => {
            const active = event.seat === seat;
            return <button key={seat} className={`supervision-seat ${active ? 'has-signal' : ''}`} aria-label={`${en ? 'Seat' : '좌석'} ${seat}${active ? ` · ${tr(event.student)} · ${en ? 'Check signal' : '신호 확인'}` : ` · ${en ? 'Quietly working' : '응시 중'}`}`} onClick={() => {
              setQuietSeat(!active); setError('');
              if (active && !observed.includes(event.id)) setObserved([...observed, event.id]);
            }}><span className="seat-student" aria-hidden="true">{active ? '!' : '·'}</span><span>{en ? 'Seat' : '좌석'} {seat}</span><small>{active ? tr(event.student) : en ? 'Working' : '응시 중'}</small></button>;
          })}</div>
          {quietSeat && <p role="status">{en ? 'This student is quietly working. Another seat is signaling for attention.' : '차분히 문제를 풀고 있습니다. 다른 자리에서 신호를 보내고 있습니다.'}</p>}
          <p className="supervision-cue">{tr(event.student)} — {tr(event.cue)}</p>
          {observed.includes(event.id) ? <blockquote className="supervision-evidence">{tr(event.observation)}</blockquote> : <p>{en ? 'Select the signaling seat to observe what is happening.' : '신호가 있는 좌석을 눌러 상황을 살펴보세요.'}</p>}
          {!eventResolved ? <><p>{evidenceReady ? (en ? 'Observation and relevant rule checked. Choose your response.' : '상황과 관련 지침을 확인했습니다. 조치를 선택하세요.') : (en ? 'A response requires both observation and the relevant rule.' : '상황 관찰과 관련 지침 확인이 있어야 조치할 수 있습니다.')}</p><div className="choices supervision-decisions">{event.choices.map(choice => <button key={choice.id} disabled={!evidenceReady} onClick={() => choose(choice.id)}>{tr(choice.label)}</button>)}</div></> : <article className="supervision-result" role="status"><h3>{en ? 'Recorded response' : '처리 기록'}</h3><p>{tr(event.result)}</p><button onClick={() => { setIndex(index + 1); setError(''); setQuietSeat(false); setSelectedRule(''); }}>{index + 1 === events.length ? (en ? 'Review handover' : '회수·인계 확인으로') : (en ? 'Continue observation' : '다음 상황 관찰')}</button></article>}
        </div>
      </div>
    </> : <div className="activity-columns supervision-handover">
      <aside className="reference-sheet"><h3>{en ? 'Today’s incident log' : '오늘의 감독 기록'}</h3>{events.filter(item => resolved.includes(item.id)).map(item => <p key={item.id}><strong>{tr(item.student)}</strong> — {tr(item.result)}</p>)}<dl><dt>{en ? 'Candidates' : '응시자'}</dt><dd>28</dd><dt>{en ? 'Collected by row' : '열별 회수 수량'}</dt><dd>7 + 7 + 7 + 7</dd></dl></aside>
      <div className="activity-workspace"><h3>{en ? 'Handover sheet' : '감독 인계서'}</h3><label>{en ? 'Total answer sheets collected' : '감독 답안 회수 수량'}<input type="number" min="0" max="99" value={count} onChange={e => { setCount(e.target.value); setError(''); }} /></label><label>{en ? 'Handover note' : '감독 인계 사항'}<select value={report} onChange={e => { setReport(e.target.value); setError(''); }}><option value="">{en ? 'Choose the matching record' : '기록과 맞는 사항 선택'}</option>{reportOptions.map(option => <option key={option.id} value={option.id}>{en ? option.en : option.ko}</option>)}</select></label><div className="choices"><button onClick={() => { setIndex(0); setError(''); }}>{en ? 'Review incident records again' : '감독 상황 다시 확인'}</button><button onClick={handover}>{en ? 'Save invigilation log and hand over' : '감독 기록 저장·인계'}</button></div></div>
    </div>}
    {error && <p role="alert" className="supervision-feedback">{error}</p>}
  </section>;
}

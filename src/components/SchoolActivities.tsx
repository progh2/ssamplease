import { useState } from 'react';
import { useDraftState } from './useDraftState';
import { useTranslation } from 'react-i18next';

type ActivityProps = {
  onDone: (status: 'completed' | 'resolved_with_issue', feedback: string) => void;
};

export function PhoneGame({ onDone }: ActivityProps) {
  const { i18n } = useTranslation();
  const en = i18n.language.startsWith('en');
  const [contact, setContact] = useDraftState<string>('phone_guardian', 'contact', '');
  const [called, setCalled] = useDraftState<boolean>('phone_guardian', 'called', false);
  const [purpose, setPurpose] = useDraftState<string>('phone_guardian', 'purpose', '');
  const [result, setResult] = useDraftState<string>('phone_guardian', 'result', '');
  const [error, setError] = useState('');
  const call = () => {
    if (contact !== 'guardian') {
      setError(en ? 'Use the guardian contact listed in the student record.' : '학생 기록에 등록된 보호자 연락처를 선택하세요.');
      return;
    }
    setCalled(true);
    setError('');
  };
  const record = () => {
    if (purpose !== 'absence' || result !== 'pending') {
      setError(en ? 'There was no answer. Record an absence inquiry and leave the reason pending.' : '통화가 연결되지 않았습니다. 결석 사유 확인을 위해 연락했고, 사유는 아직 확인 중입니다.');
      return;
    }
    onDone('resolved_with_issue', en ? 'The contact attempt is recorded. The absence reason remains pending until a reply arrives.' : '보호자 연락 시도와 응답 없음을 기록했습니다. 결석 사유는 회신 전까지 확인 중으로 남깁니다.');
  };
  return <section className="school-activity phone-game">
    <header><span>{en ? 'CONTACT LOG' : '전화 업무'}</span><h2>{en ? 'An unanswered call' : '연결되지 않은 전화'}</h2></header>
    <div className="activity-columns">
      <aside className="reference-sheet"><h3>{en ? 'Student record' : '학생 기록'}</h3><p>2301 · 김하늘</p><p>{en ? 'Absent from morning roll call. No reason has been confirmed.' : '아침 출결 확인 시 부재. 확인된 결석 사유 없음.'}</p><p>{en ? 'Contact: registered guardian. Use the in-game directory; no real call is placed.' : '연락 대상: 등록된 보호자. 게임 속 주소록이며 실제 전화를 걸지 않습니다.'}</p></aside>
      <div className="activity-workspace">
        {!called ? <><div className="telephone-display" aria-hidden="true">☎</div><label>{en ? 'Contact directory' : '연락처 선택'}<select value={contact} onChange={(event) => { setContact(event.target.value); setError(''); }}><option value="">{en ? 'Choose contact' : '연락처를 선택하세요'}</option><option value="office">{en ? 'Administrative office' : '행정실'}</option><option value="guardian">{en ? 'Kim Haneul — registered guardian' : '김하늘 — 등록된 보호자'}</option></select></label><button onClick={call}>{en ? 'Place call' : '전화 걸기'}</button></> : <>
          <p role="status" className="call-result">{en ? 'No answer. Do not guess the reason for absence.' : '응답 없음. 결석 사유를 추측해서 기록하지 마세요.'}</p>
          <h3>{en ? 'Record this attempt' : '연락 시도 기록'}</h3>
          <label>{en ? 'Purpose' : '연락 목적'}<select value={purpose} onChange={(event) => setPurpose(event.target.value)}><option value="">{en ? 'Select' : '선택'}</option><option value="absence">{en ? 'Confirm reason for absence' : '결석 사유 확인'}</option><option value="broadcast">{en ? 'Broadcast equipment purchase' : '방송 장비 구매'}</option></select></label>
          <label>{en ? 'Result' : '처리 결과'}<select value={result} onChange={(event) => setResult(event.target.value)}><option value="">{en ? 'Select' : '선택'}</option><option value="illness">{en ? 'Confirmed illness' : '질병 결석 확정'}</option><option value="pending">{en ? 'No answer — reason pending' : '응답 없음 — 사유 확인 중'}</option></select></label>
          <button onClick={record}>{en ? 'Save contact record' : '연락 기록 저장'}</button>
        </>}
        {error && <p role="alert">{error}</p>}
      </div>
    </div>
  </section>;
}

export function OfficialDocumentGame({ onDone }: ActivityProps) {
  const { i18n } = useTranslation();
  const en = i18n.language.startsWith('en');
  const [title, setTitle] = useDraftState<string>('official_document', 'title', '');
  const [recipient, setRecipient] = useDraftState<string>('official_document', 'recipient', '');
  const [amount, setAmount] = useDraftState<string>('official_document', 'amount', '');
  const [attachment, setAttachment] = useDraftState<boolean>('official_document', 'attachment', false);
  const [preview, setPreview] = useDraftState<boolean>('official_document', 'preview', false);
  const [checks, setChecks] = useDraftState<string[]>('official_document', 'checks', [], v => v.every(x => ['0', '1', '2'].includes(x)) && new Set(v).size === v.length);
  const [error, setError] = useState(false);
  const valid = title.trim().length >= 5 && recipient === 'admin' && amount.trim() !== '' && Number(amount) === 30000 && attachment;
  const reviewItems = en ? ['Recipient and title', '2 × ₩15,000 = ₩30,000', 'Equipment inspection attached'] : ['수신처와 제목 대조', '2개 × 15,000원 = 30,000원 확인', '장비점검표 첨부 확인'];
  function submit() {
    if (!valid || checks.length !== reviewItems.length) { setError(true); return; }
    onDone('completed', en ? 'The document was checked against the request and sent for approval.' : '요청 내용과 수신처·금액·첨부 자료를 대조한 뒤 결재 요청을 보냈습니다.');
  }
  return <section className="school-activity document-game">
    <header><span>{en ? 'EDUGREAT · DOCUMENT REVIEW' : '에듀그렛 · 공문 작성·검토'}</span><h2>{en ? 'Write, then verify' : '작성한 뒤, 다시 확인하기'}</h2></header>
    <div className="activity-columns">
      <aside className="reference-sheet"><h3>{en ? 'Work request' : '업무 요청서'}</h3><p>{en ? 'Submit a broadcast cable purchase request to the administrative office.' : '행정실에 방송실 케이블 구매 요청을 제출하세요.'}</p><dl><dt>{en ? 'Item' : '품목'}</dt><dd>XLR {en ? 'cable' : '케이블'} 5m</dd><dt>{en ? 'Quantity / unit price' : '수량 / 단가'}</dt><dd>2 / 15,000</dd><dt>{en ? 'Required attachment' : '필수 첨부'}</dt><dd>{en ? 'Equipment inspection report' : '장비점검표.pdf'}</dd></dl><p>{en ? 'Give the document a descriptive title of at least five characters.' : '무엇을 요청하는지 알 수 있는 제목을 5자 이상 작성하세요.'}</p></aside>
      <div className="activity-workspace">
        {!preview ? <><label>{en ? 'Document title' : '공문 제목'}<input value={title} maxLength={100} onChange={(event) => setTitle(event.target.value)} /></label><label>{en ? 'Recipient' : '수신처'}<select value={recipient} onChange={(event) => setRecipient(event.target.value)}><option value="">{en ? 'Select' : '선택'}</option><option value="academic">{en ? 'Academic affairs' : '교무부'}</option><option value="admin">{en ? 'Administrative office' : '행정실'}</option></select></label><label>{en ? 'Requested amount (KRW)' : '요청 금액 (원)'}<input type="number" min="0" step="1" value={amount} onChange={(event) => setAmount(event.target.value)} /></label><label className="check-row"><input type="checkbox" checked={attachment} onChange={(event) => setAttachment(event.target.checked)} />{en ? 'Attach equipment inspection report' : '장비점검표.pdf 첨부'}</label><button onClick={() => { setPreview(true); setChecks([]); setError(false); }}>{en ? 'Open document preview' : '공문 미리보기'}</button></> : <>
          <article className="document-preview"><h3>{title || (en ? '(Untitled)' : '(제목 없음)')}</h3><p>{en ? 'Recipient' : '수신'}: {recipient === 'admin' ? (en ? 'Administrative office' : '행정실') : recipient === 'academic' ? (en ? 'Academic affairs' : '교무부') : '—'}</p><p>{en ? 'Purchase request: two XLR cables to restore broadcasting equipment.' : '방송 장비 복구를 위해 XLR 케이블 2개 구매를 요청합니다.'}</p><p>{en ? 'Amount' : '금액'}: {amount || '—'} {en ? 'KRW' : '원'}</p><p>{en ? 'Attachment' : '첨부'}: {attachment ? (en ? 'Equipment inspection report' : '장비점검표.pdf') : (en ? 'Missing' : '없음')}</p></article>
          <fieldset><legend>{en ? 'Review against the request' : '요청서와 대조한 항목'}</legend>{reviewItems.map((item, index) => <label className="check-row" key={index}><input type="checkbox" checked={checks.includes(String(index))} onChange={(event) => setChecks(event.target.checked ? [...checks, String(index)] : checks.filter((value) => value !== String(index)))} />{item}</label>)}</fieldset>
          {error && <p role="alert">{en ? 'Review incomplete or a field does not match the request. Edit the document, then review it again.' : '검토가 끝나지 않았거나 요청 내용과 다른 항목이 있습니다. 제목·수신처·금액·첨부를 수정한 뒤 다시 대조하세요.'}</p>}
          <div className="choices"><button onClick={() => { setPreview(false); setError(false); }}>{en ? 'Return to editing' : '수정으로 돌아가기'}</button><button onClick={submit}>{en ? 'Request approval' : '검토 후 결재 요청'}</button></div>
        </>}
      </div>
    </div>
  </section>;
}

export function LessonGame({ onDone, taskId }: ActivityProps & { taskId: string }) {
  const { i18n } = useTranslation();
  const en = i18n.language.startsWith('en');
  const [order, setOrder] = useDraftState<string[]>(taskId, 'order', [], v => v.length <= 3 && new Set(v).size === v.length && v.every(id => ['input', 'process', 'output'].includes(id)));
  const [stage, setStage] = useDraftState<'sequence' | 'question' | 'check'>(taskId, 'stage', 'sequence', v => ['sequence', 'question', 'check'].includes(v));
  const [error, setError] = useState(false);
  const labels: Record<string, string> = en ? { input: 'Input', process: 'Process', output: 'Output' } : { input: '입력', process: '처리', output: '출력' };
  function checkOrder() {
    if (order.join(',') !== 'input,process,output') { setError(true); return; }
    setStage('question'); setError(false);
  }
  return <section className="school-activity lesson-game">
    <header><span>{en ? 'INFORMATICS · CLASS ACTIVITY' : '정보 수업 · 활동'}</span><h2>{en ? 'Teach an algorithm' : '알고리즘을 함께 만들어 보기'}</h2></header>
    <div className="lesson-board">
      {stage === 'sequence' && <><h3>{en ? 'Arrange the three steps' : '세 단계를 순서대로 놓으세요'}</h3><p>{en ? 'Our program adds two numbers. Tap the cards in the order the computer needs them.' : '두 수를 더하는 프로그램입니다. 컴퓨터가 수행할 순서대로 카드를 누르세요.'}</p><ol className="sequence-slots">{[0, 1, 2].map((index) => <li key={index}>{labels[order[index]] ?? '…'}</li>)}</ol><div className="choices">{['output', 'input', 'process'].map((id) => <button disabled={order.includes(id)} key={id} onClick={() => { setOrder([...order, id]); setError(false); }}>{labels[id]}</button>)}</div><div className="choices"><button onClick={() => { setOrder([]); setError(false); }}>{en ? 'Reset cards' : '카드 다시 놓기'}</button><button onClick={checkOrder}>{en ? 'Try this sequence' : '순서 실행하기'}</button></div>{error && <p role="alert">{en ? 'We need numbers before we can add them, and a result before we display it.' : '더하려면 먼저 수가 필요하고, 보여주려면 계산 결과가 필요합니다. 다시 배치해 보세요.'}</p>}</>}
      {stage === 'question' && <><h3>{en ? 'A student has a question' : '학생이 손을 들었습니다'}</h3><blockquote>{en ? '“Can we display the answer before we do the calculation?”' : '“계산하기 전에 답을 먼저 보여주면 안 돼요?”'}</blockquote><p>{en ? 'Choose a response that helps the student test the idea.' : '학생이 직접 차이를 확인할 수 있도록 설명을 골라 보세요.'}</p><div className="choices"><button onClick={() => { setStage('check'); setError(false); }}>{en ? 'Trace 3 + 2 on the board' : '칠판에서 3 + 2를 단계별로 실행'}</button><button onClick={() => setError(true)}>{en ? 'Just memorize the order' : '순서만 외우라고 안내'}</button></div>{error && <p role="alert">{en ? 'The student still wonders why. Show what each step produces.' : '학생은 왜 그런지 아직 궁금해합니다. 각 단계에서 무엇이 생기는지 보여주세요.'}</p>}</>}
      {stage === 'check' && <><h3>{en ? 'Check understanding together' : '함께 실행하고 이해 확인하기'}</h3><p>{en ? 'Input: 3 and 2 → Process: add → Output: ?' : '입력: 3과 2 → 처리: 더하기 → 출력: ?'}</p><div className="choices">{[2, 5, 32].map((answer) => <button key={answer} onClick={() => { if (answer === 5) onDone('completed', en ? 'Students arranged the steps, tested an example and explained why processing comes before output.' : '학생들과 순서를 구성하고 예시를 실행했습니다. 처리 뒤에 출력해야 하는 이유를 함께 확인했습니다.'); else setError(true); }}>{answer}</button>)}</div>{error && <p role="alert">{en ? 'The process is addition, not joining digits. Try again.' : '처리는 두 수를 더하는 것입니다. 숫자를 이어 붙이지 말고 다시 계산해 보세요.'}</p>}</>}
    </div>
  </section>;
}

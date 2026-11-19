import { useState } from 'react';
import { useDraftState } from './useDraftState';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '../store';
import { unitPrice } from '../engine/workflow';

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
  const quantity = useGameStore(state => state.purchaseQuantity);
  const total = quantity * unitPrice;
  const { i18n } = useTranslation();
  const en = i18n.language.startsWith('en');
  const [title, setTitle] = useDraftState<string>('official_document', 'title', '');
  const [recipient, setRecipient] = useDraftState<string>('official_document', 'recipient', '');
  const [amount, setAmount] = useDraftState<string>('official_document', 'amount', '');
  const [attachment, setAttachment] = useDraftState<boolean>('official_document', 'attachment', false);
  const [preview, setPreview] = useDraftState<boolean>('official_document', 'preview', false);
  const [checks, setChecks] = useDraftState<string[]>('official_document', 'checks', [], v => v.every(x => ['0', '1', '2'].includes(x)) && new Set(v).size === v.length);
  const [error, setError] = useState(false);
  const valid = title.trim().length >= 5 && recipient === 'admin' && amount.trim() !== '' && Number(amount) === total && attachment;
  const reviewItems = en ? ['Recipient and title', `${quantity} × ₩15,000 = ₩${total.toLocaleString()}`, 'Equipment inspection attached'] : ['수신처와 제목 대조', `${quantity}개 × 15,000원 = ${total.toLocaleString()}원 확인`, '장비점검표 첨부 확인'];
  function submit() {
    if (!valid || checks.length !== reviewItems.length) { setError(true); return; }
    onDone('completed', en ? 'The document was checked against the request and prepared for dispatch against the approved purchase.' : '요청 내용과 수신처·금액·첨부 자료를 대조한 뒤 승인된 구매 건의 시행 문서를 등록했습니다.');
  }
  return <section className="school-activity document-game">
    <header><span>{en ? 'EDUGREAT · DOCUMENT REVIEW' : '에듀그렛 · 공문 작성·검토'}</span><h2>{en ? 'Write, then verify' : '작성한 뒤, 다시 확인하기'}</h2></header>
    <div className="activity-columns">
      <aside className="reference-sheet"><h3>{en ? 'Work request' : '업무 요청서'}</h3><p>{en ? 'Prepare the dispatch memo for the previously approved cable purchase. Use the saved quantity.' : '이미 승인된 케이블 구매 건의 시행 공문을 작성하세요. 새 구매가 아니라 기존 기안의 수량과 금액을 옮기는 업무입니다.'}</p><dl><dt>{en ? 'Item' : '품목'}</dt><dd>XLR {en ? 'cable' : '케이블'} 5m</dd><dt>{en ? 'Quantity / unit price' : '수량 / 단가'}</dt><dd>{quantity} / 15,000</dd><dt>{en ? 'Required attachment' : '필수 첨부'}</dt><dd>{en ? 'Equipment inspection report' : '장비점검표.pdf'}</dd></dl><p>{en ? 'Give the document a descriptive title of at least five characters.' : '무엇을 요청하는지 알 수 있는 제목을 5자 이상 작성하세요.'}</p></aside>
      <div className="activity-workspace">
        {!preview ? <><label>{en ? 'Document title' : '공문 제목'}<input value={title} maxLength={100} onChange={(event) => setTitle(event.target.value)} /></label><label>{en ? 'Recipient' : '수신처'}<select value={recipient} onChange={(event) => setRecipient(event.target.value)}><option value="">{en ? 'Select' : '선택'}</option><option value="academic">{en ? 'Academic affairs' : '교무부'}</option><option value="admin">{en ? 'Administrative office' : '행정실'}</option></select></label><label>{en ? 'Requested amount (KRW)' : '요청 금액 (원)'}<input type="number" min="0" step="1" value={amount} onChange={(event) => setAmount(event.target.value)} /></label><label className="check-row"><input type="checkbox" checked={attachment} onChange={(event) => setAttachment(event.target.checked)} />{en ? 'Attach equipment inspection report' : '장비점검표.pdf 첨부'}</label><button onClick={() => { setPreview(true); setChecks([]); setError(false); }}>{en ? 'Open document preview' : '공문 미리보기'}</button></> : <>
          <article className="document-preview"><h3>{title || (en ? '(Untitled)' : '(제목 없음)')}</h3><p>{en ? 'Recipient' : '수신'}: {recipient === 'admin' ? (en ? 'Administrative office' : '행정실') : recipient === 'academic' ? (en ? 'Academic affairs' : '교무부') : '—'}</p><p>{en ? `Approved purchase: ${quantity} XLR cable(s) to restore broadcasting equipment.` : `방송 장비 복구를 위해 승인된 XLR 케이블 ${quantity}개 구매를 시행합니다.`}</p><p>{en ? 'Amount' : '금액'}: {amount || '—'} {en ? 'KRW' : '원'}</p><p>{en ? 'Attachment' : '첨부'}: {attachment ? (en ? 'Equipment inspection report' : '장비점검표.pdf') : (en ? 'Missing' : '없음')}</p></article>
          <fieldset><legend>{en ? 'Review against the request' : '요청서와 대조한 항목'}</legend>{reviewItems.map((item, index) => <label className="check-row" key={index}><input type="checkbox" checked={checks.includes(String(index))} onChange={(event) => setChecks(event.target.checked ? [...checks, String(index)] : checks.filter((value) => value !== String(index)))} />{item}</label>)}</fieldset>
          {error && <p role="alert">{en ? 'Review incomplete or a field does not match the request. Edit the document, then review it again.' : '검토가 끝나지 않았거나 요청 내용과 다른 항목이 있습니다. 제목·수신처·금액·첨부를 수정한 뒤 다시 대조하세요.'}</p>}
          <div className="choices"><button onClick={() => { setPreview(false); setError(false); }}>{en ? 'Return to editing' : '수정으로 돌아가기'}</button><button onClick={submit}>{en ? 'Register reviewed memo' : '검토 후 시행 공문 등록'}</button></div>
        </>}
      </div>
    </div>
  </section>;
}

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '../store';
import { purchaseBudget, unitPrice } from '../engine/workflow';
import { useDraftState } from './useDraftState';

export function PurchaseGame({ onDone }: { onDone: () => void }) {
  const en = useTranslation().i18n.language.startsWith('en');
  const quantity = useGameStore(s => s.purchaseQuantity);
  const setQuantity = useGameStore(s => s.setPurchaseQuantity);
  const [budget, setBudget] = useDraftState<string>('edugreat_purchase', 'budget', '');
  const [line, setLine] = useDraftState<string>('edugreat_purchase', 'approvalLine', '');
  const [attachment, setAttachment] = useDraftState<boolean>('edugreat_purchase', 'inspection', false);
  const [error, setError] = useState(false);
  const over = quantity * unitPrice > purchaseBudget;
  return <section className="school-activity"><header><span>{en ? 'EDUGREAT · ONE PURCHASE, MANY STEPS' : '에듀그렛 · 하나의 구매가 이어지는 과정'}</span><h2>{en ? 'A replacement, or a spare too?' : '교체품만 살까, 예비품도 살까?'}</h2></header><div className="activity-columns"><aside className="reference-sheet"><h3>{en ? 'Administrative office reply' : '행정실 회신'}</h3><p>{en ? 'The borrowed cable must be returned. One new cable restores service; two also give the club a spare. Either is acceptable within budget.' : '빌린 케이블은 돌려줘야 합니다. 1개면 고장품을 교체하고, 2개면 예비품도 확보합니다. 예산 안이라면 두 계획 모두 가능합니다.'}</p><p>{en ? '5m XLR cable: ₩15,000 each. Broadcasting activity budget: ₩40,000. Attach the inspection record. Route: teacher → administration → vice principal.' : 'XLR 케이블 5m: 개당 15,000원. 방송반 교육활동운영비 잔액 40,000원. 장비점검표를 첨부하고 담당 → 행정실 → 교감 순으로 올립니다.'}</p></aside><div className="activity-workspace"><label>{en ? 'Quantity' : '수량'}<select value={quantity} onChange={e => setQuantity(Number(e.target.value))}>{[1,2,3].map(n => <option key={n} value={n}>{n}</option>)}</select></label><p className="evidence-note">{quantity === 1 ? (en ? 'Replace the faulty cable. No new spare remains.' : '고장품 1개 교체. 새 예비품은 남지 않습니다.') : quantity === 2 ? (en ? 'Replace one cable and keep one spare for future broadcasts.' : '고장품 1개 교체 + 예비품 1개 보관.') : (en ? 'Three cables exceed the current allocation.' : '3개 구매는 현재 배정 예산을 넘습니다.')}</p><p>{en ? 'Total / budget' : '합계 / 예산'}: {quantity * unitPrice} / {purchaseBudget}</p>{over && <p role="alert">{en ? 'Revise the quantity before submission.' : '예산을 초과했습니다. 수량을 조정한 뒤 제출하세요.'}</p>}<label>{en ? 'Budget account' : '예산 항목 선택'}<select value={budget} onChange={e => setBudget(e.target.value)}><option value="">—</option><option value="office">{en ? 'Office stationery' : '행정실 사무용품비'}</option><option value="broadcast">{en ? 'Broadcasting educational activities' : '교육활동운영비 · 방송반'}</option></select></label><label>{en ? 'Approval route' : '결재선 선택'}<select value={line} onChange={e => setLine(e.target.value)}><option value="">—</option><option value="class">{en ? 'Teacher → class representative' : '담당 → 학급 대표'}</option><option value="admin">{en ? 'Teacher → administration → vice principal' : '담당 → 행정실 → 교감'}</option></select></label><label className="check-row"><input type="checkbox" checked={attachment} onChange={e => setAttachment(e.target.checked)} />{en ? 'Attach equipment inspection record' : '장비점검표 첨부'}</label>{error && <p role="alert">{en ? 'Compare the account, route and evidence against the office reply.' : '행정실 회신과 예산 항목·결재선·근거 첨부를 다시 대조하세요.'}</p>}<button disabled={over} onClick={() => { if (budget !== 'broadcast' || line !== 'admin' || !attachment) { setError(true); return; } onDone(); }}>{en ? 'Review and submit' : '내용 확인 후 제출'}</button></div></div></section>;
}

const quotes = [
  { id: 'a', spec: 'XLR 5m', price: 15000 },
  { id: 'b', spec: 'XLR 5m', price: 16000 },
  { id: 'c', spec: 'XLR 3m', price: 9000 },
];
export function RevisionGame({ onDone }: { onDone: () => void }) {
  const en = useTranslation().i18n.language.startsWith('en');
  const quantity = useGameStore(s => s.purchaseQuantity);
  const attached = useGameStore(s => s.comparisonAttached);
  const attach = useGameStore(s => s.attachComparison);
  const [selected, setSelected] = useDraftState<string[]>('approval_revision', 'quotes', [], v => new Set(v).size === v.length && v.every(id => quotes.some(q => q.id === id)));
  const [reason, setReason] = useDraftState<string>('approval_revision', 'comparisonReason', '');
  const [error, setError] = useState(false);
  const valid = selected.length === 2 && selected.includes('a') && selected.includes('b') && reason === 'equivalent';
  return <section className="school-activity"><header><span>{en ? 'EDUGREAT · RETURNED FOR EVIDENCE' : '에듀그렛 · 반려는 보완의 시작'}</span><h2>{en ? 'Compare like with like' : '같은 규격끼리 비교하기'}</h2></header><p className="evidence-note">{en ? `Your request for ${quantity} five-meter cables needs comparable price evidence. The third quote is cheaper, but check its length. The quantity is already in the submitted request.` : `제출한 5m 케이블 ${quantity}개 기안에 가격 비교 근거가 필요합니다. 가장 싼 견적이 같은 제품인지 길이까지 확인하세요. 수량은 제출한 기안을 그대로 따릅니다.`}</p><div className="document-tray">{quotes.map(q => <button key={q.id} disabled={attached} aria-pressed={selected.includes(q.id)} onClick={() => { setSelected(selected.includes(q.id) ? selected.filter(id => id !== q.id) : [...selected, q.id]); setError(false); }}>{en ? 'Quote' : '견적'} {q.id.toUpperCase()}<strong>{q.spec} · {q.price.toLocaleString()}{en ? ' KRW each' : '원/개'}</strong><small>{en ? 'Request total' : '요청 수량 합계'} {q.price * quantity}</small></button>)}</div><label>{en ? 'Reason for selecting comparison quotes' : '비교 견적 선택 근거'}<select disabled={attached} value={reason} onChange={e => setReason(e.target.value)}><option value="">—</option><option value="cheapest">{en ? 'Lowest total regardless of specification' : '규격과 관계없이 합계가 가장 낮음'}</option><option value="equivalent">{en ? 'Same connector, length and quantity' : '단자·길이·수량이 같은 조건'}</option></select></label>{error && <p role="alert">{en ? 'A 3m cable cannot replace a required 5m cable. Compare A and B on equal terms.' : '필요한 5m 케이블을 3m 제품으로 대신할 수 없습니다. 같은 조건인 A와 B를 비교하세요.'}</p>}<button disabled={attached} onClick={() => { if (!valid) { setError(true); return; } attach(); }}>{attached ? (en ? 'Comparison attached' : '비교 견적 첨부됨') : (en ? 'Attach comparison evidence' : '비교 근거 첨부')}</button><button disabled={!attached} onClick={onDone}>{en ? 'Resubmit corrected request' : '보완 기안 재제출'}</button></section>;
}

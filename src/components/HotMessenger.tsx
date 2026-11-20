import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import messages from '../content/messenger.json';
import { days } from '../content/days';
import { useGameStore } from '../store';
import { canStartTask, isTaskResolved } from '../engine/taskEngine';
import { useDraftState } from './useDraftState';

type MessageId = keyof typeof messages;
const intents = [{id:'ack',en:'Acknowledge duties'},{id:'inquiry',en:'Ask about purchase conditions'},{id:'revise',en:'Plan an equivalent-spec quote comparison'},{id:'room',en:'Confirm changed room 2-4'},{id:'thanks',en:'Thank mentor and plan next steps'},{id:'guess',en:'Report completion without checking'}];
const korean: Record<string,string> = {ack:'담당 업무와 다음 절차를 확인했습니다.', inquiry:'케이블 단자를 움직이면 신호가 끊깁니다. 점검표를 첨부하니 교체품 구매 조건을 알려 주세요.', revise:'보완 사유를 확인했습니다. 같은 규격의 견적을 비교해 기존 기안을 수정하겠습니다.',room:'오늘 2교시 감독 교실이 2-4로 변경된 것을 확인했습니다.',thanks:'도와주셔서 감사합니다. 앞으로도 불확실한 사실은 함께 확인하고 기록하겠습니다.',guess:'확인은 하지 않았지만 모두 완료했습니다.'};
const english: Record<string,string> = {ack:'I have checked the assigned duties and next steps.',inquiry:'The signal cuts out when the connector moves. Inspection attached; please advise on purchase conditions.',revise:'I read the revision note. I will compare equivalent quotes and revise the existing request.',room:'I confirm that today’s period 2 assignment has moved to 2-4.',thanks:'Thank you for your help. I will keep checking uncertain facts with colleagues and record the results.',guess:'I have not checked, but everything is complete.'};

export function HotMessenger({ initialTask, compact = false }: { initialTask?: string; compact?: boolean }) {
  const { i18n } = useTranslation();
  const en = i18n.language.startsWith('en');
  const lang = en ? 'en' : 'ko';
  const state = useGameStore();
  const [selected, setSelected] = useState<string | null>(initialTask ?? null);
  const [search, setSearch] = useState('');
  useEffect(() => { if (initialTask) useGameStore.getState().setDraft(initialTask, 'messageRead', true); }, [initialTask]);
  const allTasks = days.flatMap(day => day.tasks).filter(task => task.kind === 'message' && task.day <= state.currentDay);
  const available = allTasks.filter(task => canStartTask(task.id, {...state.history,...state.taskStatuses}));
  const contacts = [...new Set(available.map(task => messages[task.id as MessageId].contact))];
  const current = available.find(task => task.id === selected);
  const contact = current && messages[current.id as MessageId].contact;
  const open = (id: string) => {
    setSelected(id);
    if (allTasks.find(task => task.id === id)?.day === state.currentDay) state.setDraft(id, 'messageRead', true);
  };
  return <section className={`hot-messenger ${compact ? 'messenger-compact' : ''}`} aria-label={en ? 'Hot Messenger' : '핫메신저 대화'}>
    <div className="messenger-brand">HOT <strong>{en ? 'School messenger' : '교내 메신저'}</strong><small>{en ? 'School network · online' : '교내망 · 접속 중'}</small></div>
    <div className={`messenger-layout ${current ? 'has-conversation' : ''}`}>
      <aside className="conversation-list"><label>{en ? 'Search conversations' : '대화 검색'}<input value={search} onChange={e => setSearch(e.target.value)} placeholder={en ? 'Name or subject' : '이름 또는 제목'} /></label>{contacts.map(id => {
        const entries = available.filter(task => messages[task.id as MessageId].contact === id);
        const latest = entries.at(-1)!;
        const data = messages[latest.id as MessageId];
        if (!(data.name[lang]+entries.map(task=>messages[task.id as MessageId].subject[lang]).join(' ')).toLowerCase().includes(search.toLowerCase())) return null;
        const unread = entries.filter(task => task.day === state.currentDay && !state.drafts[task.id]?.messageRead && !isTaskResolved(state.taskStatuses[task.id])).length;
        return <button key={id} aria-pressed={contact === id} onClick={() => open(latest.id)}><strong>{data.name[lang]}</strong><span>{data.subject[lang]}</span>{unread > 0 && <em aria-label={en ? 'Unread' : '읽지 않음'}>{unread}</em>}</button>;
      })}{contacts.length === 0 && <p>{en ? 'No conversations yet.' : '아직 도착한 대화가 없습니다.'}</p>}</aside>
      {current ? <div className="conversation-pane"><div className="conversation-heading"><button onClick={() => setSelected(null)}>{en ? 'Conversation list' : '대화 목록'}</button><strong>{messages[current.id as MessageId].name[lang]}</strong></div><div className="chat-history" role="log" aria-label={en ? 'Conversation history' : '대화 내용'}>{available.filter(task => messages[task.id as MessageId].contact === contact).map(task => <MessageEntry key={task.id} taskId={task.id as MessageId} day={task.day} active={task.id === selected} onSelect={() => open(task.id)} />)}</div><p className="messenger-note">{en ? 'Drafts stay private until Send. Reading alone does not complete requested work.' : '작성 중인 답장은 전송 전까지 상대에게 보이지 않습니다. 읽음과 업무 처리는 구분됩니다.'}</p></div> : <div className="messenger-empty"><h3>{en ? 'Open a conversation' : '대화방을 선택하세요'}</h3><p>{en ? 'Read requests, inspect attachments and send a reply.' : '요청을 읽고 첨부 자료를 확인한 뒤 답장을 보내세요.'}</p></div>}
    </div>
  </section>;
}

function MessageEntry({ taskId, day, active, onSelect }: { taskId: MessageId; day: number; active: boolean; onSelect: () => void }) {
  const en = useTranslation().i18n.language.startsWith('en'); const lang = en ? 'en' : 'ko';
  const data = messages[taskId];
  const state = useGameStore();
  const done = isTaskResolved(state.history[taskId]) || isTaskResolved(state.taskStatuses[taskId]);
  const [text, setText] = useDraftState<string>(taskId, 'messageText', '');
  const [intent, setIntent] = useDraftState<string>(taskId, 'messageIntent', '');
  const [recipient, setRecipient] = useDraftState<string>(taskId, 'messageRecipient', data.contact);
  const [opened, setOpened] = useDraftState<boolean>(taskId, 'attachmentOpened', false);
  const [attach, setAttach] = useDraftState<boolean>(taskId, 'messageAttach', false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(false);
  const memory = state.memories[taskId];
  function send() {
    if (recipient !== data.contact) { setError(en ? 'Check the recipient. This request belongs in the sender’s conversation, not the whole-school room.' : '받는 사람을 확인하세요. 이 요청은 보낸 담당자에게 답해야 합니다. 전체 교직원에게 보낼 내용이 아닙니다.'); return; }
    if (data.attachment && !opened) { setError(en ? 'Read the attached source before replying.' : '첨부된 근거 자료를 열어 확인한 뒤 답장하세요.'); return; }
    if (intent !== data.intent || text.trim().length < 4 || (taskId === 'message_admin' && !attach)) { setError(en ? 'Check the requested action and your reply. Do not claim unverified completion; include evidence when required.' : '요청 내용과 답장 의도를 다시 대조하세요. 확인 전 업무를 끝냈다고 보고하면 안 되며, 구매 문의에는 점검표를 첨부해야 합니다.'); return; }
    state.setDraft(taskId, 'messageRead', true);
    state.completeTask(taskId, 'completed', data.reply[lang]);
    setError('');
  }
  return <article className="chat-entry"><p className="chat-date">DAY {day} · {data.subject[lang]}</p><div className="chat-bubble received">{data.body[lang]}</div>
    {data.attachment && <button className="chat-attachment" onClick={() => { setPreview(!preview); if (!done) setOpened(true); }}>{data.attachment.name[lang]} · {en ? 'Open attachment' : '첨부 열기'}</button>}
    {preview && data.attachment && <article className="attachment-preview"><h4>{data.attachment.name[lang]}</h4><p>{data.attachment.body[lang]}</p><button onClick={() => setPreview(false)}>{en ? 'Close attachment' : '첨부 닫기'}</button></article>}
    {done ? <><div className="chat-bubble sent">{typeof memory?.messageText === 'string' ? memory.messageText : (en ? 'Acknowledged in an earlier save.' : '이전 진행에서 요청을 확인했습니다.')}{memory?.messageAttach === true && <small>{en ? 'Inspection attached' : '첨부: 장비점검표.pdf'}</small>}</div><small className="delivery-state">{en ? 'Sent · Read' : '전송됨 · 읽음'}</small><div className="chat-bubble received">{data.reply[lang]}</div></> : !active ? <button onClick={onSelect}>{en ? 'Reply to this request' : '이 요청에 답장'}</button> : <div className="chat-composer"><p className="reply-goal">{data.goal[lang]}</p><label>{en ? 'Recipient' : '받는 사람'}<select value={recipient} onChange={e => setRecipient(e.target.value)}><option value={data.contact}>{data.name[lang]}</option><option value="all">{en ? 'All school staff' : '전체 교직원 대화방'}</option></select></label><label>{en ? 'Reply purpose' : '답장 의도'}<select value={intent} onChange={e => {setIntent(e.target.value);setError('');}}><option value="">{en ? 'Choose purpose' : '의도를 선택하세요'}</option>{intents.map(item => <option key={item.id} value={item.id}>{en ? item.en : korean[item.id]}</option>)}</select></label><button onClick={() => { if (intent) setText((en ? english : korean)[intent]); }}>{en ? 'Insert editable suggestion' : '답장 예시 넣기'}</button><label>{en ? 'Message' : '답장 내용'}<textarea value={text} maxLength={1000} rows={3} onChange={e => setText(e.target.value)} placeholder={en ? 'Write your reply…' : '답장을 입력하세요…'} /></label>{taskId === 'message_admin' && <label><input type="checkbox" checked={attach} onChange={e => setAttach(e.target.checked)} />{en ? 'Attach inspection report' : '장비점검표.pdf 첨부'}</label>}{error && <p role="alert">{error}</p>}<button className="chat-send" disabled={!text.trim()} onClick={send}>{en ? 'Send' : '전송'}</button></div>}
  </article>;
}

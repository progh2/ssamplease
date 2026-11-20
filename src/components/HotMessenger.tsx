import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import messages from '../content/messenger.json';
import { days } from '../content/days';
import { useGameStore } from '../store';
import { canStartTask, isTaskResolved } from '../engine/taskEngine';
import { useDraftState } from './useDraftState';

type MessageId = keyof typeof messages;

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
      {current ? <div className="conversation-pane"><div className="conversation-heading"><button onClick={() => setSelected(null)}>{en ? 'Conversation list' : '대화 목록'}</button><strong>{messages[current.id as MessageId].name[lang]}</strong></div><div className="chat-history" role="log" aria-label={en ? 'Conversation history' : '대화 내용'}>{available.filter(task => messages[task.id as MessageId].contact === contact).map(task => <MessageEntry key={task.id} taskId={task.id as MessageId} day={task.day} active={task.id === selected} onSelect={() => open(task.id)} />)}</div><p className="messenger-note">{en ? 'A small chat before the next little adventure.' : '짧은 대화 뒤에, 다음 작은 사건이 기다립니다.'}</p></div> : <div className="messenger-empty"><h3>{en ? 'Open a conversation' : '대화방을 선택하세요'}</h3><p>{en ? 'Read requests, inspect attachments and send a reply.' : '요청을 읽고 첨부 자료를 확인한 뒤 답장을 보내세요.'}</p></div>}
    </div>
  </section>;
}

function MessageEntry({ taskId, day, active, onSelect }: { taskId: MessageId; day: number; active: boolean; onSelect: () => void }) {
  const en = useTranslation().i18n.language.startsWith('en'); const lang = en ? 'en' : 'ko';
  const data = messages[taskId];
  const state = useGameStore();
  const done = isTaskResolved(state.history[taskId]) || isTaskResolved(state.taskStatuses[taskId]);
  const [preview, setPreview] = useState(false);
  const memory = state.memories[taskId];
  function send(choice: typeof data.quickReplies[number]) {
    state.setDraft(taskId, 'messageText', choice.text[lang]);
    state.setDraft(taskId, 'quickReply', choice.id);
    state.setDraft(taskId, 'messageRead', true);
    state.completeTask(taskId, 'completed', '');
  }
  const chosen = data.quickReplies.find(choice => choice.id === memory?.quickReply);
  return <article className="chat-entry"><p className="chat-date">DAY {day} · {data.subject[lang]}</p><div className="chat-bubble received">{data.body[lang]}</div>
    {data.attachment && <button className="chat-attachment" onClick={() => { setPreview(!preview);  }}>{data.attachment.name[lang]} · {en ? 'Open attachment' : '첨부 열기'}</button>}
    {preview && data.attachment && <article className="attachment-preview"><h4>{data.attachment.name[lang]}</h4><p>{data.attachment.body[lang]}</p><button onClick={() => setPreview(false)}>{en ? 'Close attachment' : '첨부 닫기'}</button></article>}
    {done ? <><div className="chat-bubble sent">{typeof memory?.messageText === 'string' ? memory.messageText : (en ? 'Acknowledged in an earlier save.' : '이전 진행에서 요청을 확인했습니다.')}{memory?.messageAttach === true && <small>{en ? 'Inspection attached' : '첨부: 장비점검표.pdf'}</small>}</div><small className="delivery-state">{en ? 'Sent · Read' : '전송됨 · 읽음'}</small><div className="chat-bubble received">{chosen?.reply[lang] ?? data.reply[lang]}</div></> : !active ? <button onClick={onSelect}>{en ? 'Reply to this request' : '이 요청에 답장'}</button> : <div className="chat-composer quick-composer"><small>{en ? 'Your reply' : '내 답장'}</small><div className="quick-replies">{data.quickReplies.map(choice => <button key={choice.id} onClick={() => send(choice)}>{choice.text[lang]} <span aria-hidden="true">↗</span></button>)}</div><p className="quick-note">{en ? 'Both replies continue the story.' : '어느 쪽이든 이야기가 이어집니다.'}</p></div>}

  </article>;
}

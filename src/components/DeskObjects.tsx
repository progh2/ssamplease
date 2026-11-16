import { useTranslation } from 'react-i18next';
import { useGameStore } from '../store';
import { days } from '../content/days';
import { canStartTask, isTaskResolved } from '../engine/taskEngine';

const objects = [
  { id: 'computer', ko: '컴퓨터', en: 'Computer', from: 1, ids: ['message', 'approval'] },
  { id: 'papers', ko: '서류와 도장', en: 'Documents', from: 1, ids: ['document'] },
  { id: 'pen', ko: '빨간 펜', en: 'Marking pen', from: 2, ids: ['grading'] },
  { id: 'audio', ko: '방송 장비', en: 'Audio equipment', from: 4, ids: ['equipment'] },
  { id: 'register', ko: '출석부', en: 'Attendance book', from: 6, ids: ['attendance'] },
  { id: 'phone', ko: '전화기', en: 'Telephone', from: 7, ids: ['phone'] },
];

export function DeskObjects({ onOpen }: { onOpen: (id: string) => void }) {
  const en = useTranslation().i18n.language.startsWith('en');
  const { currentDay, history, taskStatuses } = useGameStore();
  const tasks = days.find(day => day.day === currentDay)?.tasks ?? [];
  const progress = { ...history, ...taskStatuses };
  return <div className="desk-objects" aria-label={en ? 'Desk objects' : '책상 위 물건'}>{objects.filter(object => currentDay >= object.from && (object.id !== 'papers' || currentDay > 1 || isTaskResolved(history.message_welcome))).map(object => {
    const matches = tasks.filter(task => object.id === 'phone' ? task.id === 'phone_guardian' : task.id !== 'phone_guardian' && object.ids.includes(task.kind));
    const next = matches.find(task => !isTaskResolved(taskStatuses[task.id]) && canStartTask(task.id, progress));
    const label = (en ? object.en : object.ko) + ' · ' + (next ? (en ? 'Open task' : '업무 열기') : (en ? 'No pending work' : '대기 업무 없음'));
    return <button className={`desk-object object-${object.id}`} key={object.id} disabled={!next} onClick={() => next && onOpen(next.id)} aria-label={label}>
      <svg viewBox="0 0 80 64" aria-hidden="true" shapeRendering="crispEdges">
        {object.id === 'computer' ? <><path fill="#283c3c" d="M4 4h72v42H4zM32 46h16v8H32zM20 54h40v6H20z"/><path fill="#b9d0b1" d="M10 10h60v30H10z"/><path fill="#44655a" d="M16 16h30v4H16zM16 24h48v4H16z"/></> : object.id === 'pen' ? <><path fill="#a94137" d="M36 4h12v44H36z"/><path fill="#e5c18c" d="m36 48 6 12 6-12z"/><path fill="#f8eee0" d="M36 12h12v4H36z"/></> : object.id === 'phone' ? <><path fill="#3c4949" d="M12 24h56v36H12zM4 4h72v12H4zM4 16h16v12H4zM60 16h16v12H60z"/><path fill="#b7c5a6" d="M22 30h36v8H22z"/><path fill="#d8d3bf" d="M24 42h8v6h-8zM36 42h8v6h-8zM48 42h8v6h-8z"/></> : object.id === 'audio' ? <><path fill="#38423f" d="M28 4h24v26H28zM34 30h12v24H34zM38 54h4v10H38z"/><path fill="#a6b8a9" d="M32 8h16v4H32zM32 16h16v4H32z"/></> : <><path fill={object.id === 'register' ? '#3d6252' : '#e9e0c7'} d="M12 4h54v56H12z"/><path fill="#fff8e8" d="M22 14h34v18H22z"/><path fill="#a39577" d="M22 40h32v3H22zM22 48h26v3H22z"/><path fill="#8e5341" d="M12 4h6v56h-6z"/></>}
      </svg><span>{en ? object.en : object.ko}</span>{next && <i>{en ? 'Open' : '진행 가능'}</i>}
    </button>;
  })}</div>;
}

import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { App } from '../App';
import { useGameStore, useSaveHealth } from '../store';
import { days } from '../content/days';
import { isTaskResolved } from '../engine/taskEngine';

function readSetting(key: string, fallback: boolean) {
 try { const value=localStorage.getItem(key);return value===null?fallback:value==='true'; } catch {return fallback;}
}
export function GameShell(){
 const {i18n}=useTranslation();const en=i18n.language.startsWith('en');
 const game=useGameStore();const failed=useSaveHealth(s=>s.failed);
 const [playing,setPlaying]=useState(false);
 const [menu,setMenu]=useState<'pause'|'settings'|'new'|null>(null);
 const [reduced,setReduced]=useState(()=>readSetting('teachers-reduced-motion',window.matchMedia('(prefers-reduced-motion: reduce)').matches));
 const [large,setLarge]=useState(()=>readSetting('teachers-large-text',false));
 const dialog=useRef<HTMLDialogElement>(null);const trigger=useRef<HTMLButtonElement>(null);
 const hasSave=game.currentDay>1||Object.values(game.taskStatuses).some(isTaskResolved)||Object.values(game.drafts).some(fields=>Object.keys(fields).length>0);
 const completed=Object.values(game.taskStatuses).filter(isTaskResolved).length;
 const total=days.find(d=>d.day===game.currentDay)?.tasks.length??0;
 useEffect(()=>{document.documentElement.dataset.reducedMotion=String(reduced);document.documentElement.dataset.largeText=String(large);try{localStorage.setItem('teachers-reduced-motion',String(reduced));localStorage.setItem('teachers-large-text',String(large));}catch{useSaveHealth.setState({failed:true});}},[reduced,large]);
 useEffect(()=>{
  const element=dialog.current;
  if(menu&&element&&!element.open)element.showModal();
  if(!menu&&element?.open){element.close();trigger.current?.focus();}
 },[menu]);
 useEffect(()=>{
  const onKey=(event:KeyboardEvent)=>{if(event.key==='Escape'&&playing&&!menu&&!document.querySelector('[role="dialog"], .attachment-preview')){event.preventDefault();setMenu('pause');}};
  window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey);
 },[playing,menu]);
 useEffect(()=>{document.documentElement.lang=i18n.language.startsWith('en')?'en':'ko';},[i18n.language]);
 const start=()=>{game.reset();useGameStore.getState().setDraft('message_welcome','started',true);setMenu(null);setPlaying(true);};
 const language=(language:string)=>{void i18n.changeLanguage(language);document.documentElement.lang=language;try{localStorage.setItem('teachers-language',language);}catch{useSaveHealth.setState({failed:true});}};
 return <>
 {playing?<><App /><button ref={trigger} className="game-menu-trigger" aria-label={en?'Game menu':'게임 메뉴'} onClick={()=>setMenu('pause')}>☰ <span>{en?'Menu':'메뉴'}</span></button></>:<main className="title-screen">
  <div className="title-shade"/><div className="title-layout"><section className="title-copy"><p className="title-kicker">TEACHERS, PLEASE!</p><h1>{en?'Teachers,':'선생님,'}<br/>{en?'Please!':'잠깐만요!'}</h1><p className="title-subtitle">{en?'Suddenly, Homeroom':'어쩌다 담임'}</p><p className="title-tagline">{en?'One desk. Fifteen days. A school full of little surprises.':'빈 책상 하나, 첫 출근.\n정신 차려 보니 어쩌다 담임.'}</p><div className="title-chips"><span>{en?'15 school days':'3주간의 학교생활'}</span><span>{en?'At your pace':'시간제한 없이'}</span></div></section>
  <section className="title-menu" aria-label={en?'Main menu':'메인 메뉴'}><div className="menu-plaque">{en?'THE STAFF ROOM':'교무실 문 앞에서'}</div><button className="menu-primary" disabled={!hasSave} onClick={()=>setPlaying(true)}>{en?'Continue':'이어하기'}<small>{hasSave?(game.currentDay>15?(en?'Three weeks complete':'3주 생활 완료'):(en?`Day ${game.currentDay} · ${completed}/${total} handled`:`${game.currentDay}일 차 · 업무 ${completed}/${total} 처리`)):(en?'No saved progress yet':'아직 저장된 이야기가 없어요')}</small></button><button onClick={()=>hasSave?setMenu('new'):start()}>{en?'New game':'새 게임'}</button><button onClick={()=>setMenu('settings')}>{en?'Settings':'설정'}</button><p className="menu-save-note">{failed?(en?'Saving unavailable. Progress lasts for this session.':'저장을 사용할 수 없어요. 현재 접속 중에만 진행이 유지됩니다.'):(en?'Your story saves automatically.':'이야기는 진행할 때마다 자동 저장돼요.')}</p><span className="menu-version">WEB DEMO · v0.2</span></section></div>
  <footer className="title-footer">{en?'A small school-life adventure':'작은 사건들이 쌓이는 교사 생활 게임'}<span>✦</span></footer>
 </main>}
 <dialog ref={dialog} className="game-menu-dialog" aria-labelledby="game-menu-heading" onCancel={event=>{event.preventDefault();setMenu(null);}}>
  <div className="menu-plaque">TEACHERS, PLEASE!</div><h2 id="game-menu-heading">{menu==='settings'?(en?'Settings':'설정'):menu==='new'?(en?'Start a new story?':'새 이야기로 시작할까요?'):(en?'Take a breather':'잠깐, 숨 돌리기')}</h2>
  {menu==='settings'?<><label>{en?'Language':'언어'}<select value={en?'en':'ko'} onChange={event=>language(event.target.value)}><option value="ko">한국어</option><option value="en">English</option></select></label><label className="menu-check"><input type="checkbox" checked={reduced} onChange={e=>setReduced(e.target.checked)}/>{en?'Reduce motion':'화면 움직임 줄이기'}</label><label className="menu-check"><input type="checkbox" checked={large} onChange={e=>setLarge(e.target.checked)}/>{en?'Larger text':'글자 크게 보기'}</label><p>{en?'Settings are saved separately from your story.':'설정은 이야기 진행과 별도로 저장돼요.'}</p><button onClick={()=>setMenu(playing?'pause':null)}>{en?'Back':'돌아가기'}</button></>:menu==='new'?<><p>{en?'This replaces your saved story. Your settings will stay.':'지금까지의 이야기를 지우고 첫날부터 시작해요. 설정은 유지됩니다.'}</p><button onClick={start}>{en?'Start from day one':'첫 출근부터 시작'}</button><button onClick={()=>setMenu(playing?'pause':null)}>{en?'Keep my story':'이야기 남겨두기'}</button></>:<><p>{en?'Your progress is kept as you play.':'진행한 내용은 자동으로 남아 있어요.'}</p><button className="menu-primary" onClick={()=>setMenu(null)}>{en?'Resume':'게임으로 돌아가기'}</button><button onClick={()=>setMenu('settings')}>{en?'Settings':'설정'}</button><button onClick={()=>{game.closeFeedback();setMenu(null);setPlaying(false);}}>{en?'Return to title':'타이틀로 돌아가기'}</button></>}
 </dialog>
 </>;
}

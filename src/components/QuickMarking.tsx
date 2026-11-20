import { useTranslation } from 'react-i18next';
import grading from '../content/grading.json';
import { useDraftState } from './useDraftState';
import { resolveMark } from '../engine/quickMarking';

type Props = { taskId: keyof typeof grading; onDone: (status:'completed'|'resolved_with_issue', feedback:string)=>void };
export function QuickMarking({taskId,onDone}:Props){
 const en=useTranslation().i18n.language.startsWith('en');
 const data=grading[taskId];
 const [records,setRecords]=useDraftState<string[]>(taskId,'quickRecords',[],v=>v.length<=data.papers.length&&v.every(x=>['0','1','2','3','review'].includes(x)));
 const [picked,setPicked]=useDraftState<string>(taskId,'quickStamp','',v=>['','0','1','2','3','review'].includes(v));
 const [stamped,setStamped]=useDraftState<boolean>(taskId,'quickStamped',false);
 const [sticker,setSticker]=useDraftState<string>(taskId,'quickSticker','star',v=>['star','flower'].includes(v));
 const [marks,setMarks]=useDraftState<string[]>(taskId,'quickPen',[],v=>v.length<=12&&v.every(x=>/^\d{1,3},\d{1,3}$/.test(x)));
 const [corrections,setCorrections]=useDraftState<number>(taskId,'quickCorrections',0,n=>Number.isInteger(n)&&n>=0&&n<=data.papers.length);
 const [,setPlan]=useDraftState<string>(taskId,'teachingPlan','');
 const paper=data.papers[records.length];
 const result=paper?resolveMark(paper,data.criteria,picked):null;
 function file(){
  if(!stamped||!result)return;
  setRecords([...records,result.score]);setCorrections(corrections+(result.corrected?1:0));setPicked('');setStamped(false);setMarks([]);
 }
 return <section className="quick-marking"><header><small>{en?'RED PEN BREAK':'빨간 펜 타임'}</small><h2>{en?data.titleEn:data.title}</h2></header>
 {!paper?<div className="lesson-reflection"><h3>{en?'The pile has disappeared!':'답안지 더미가 사라졌다!'}</h3><p>{en?'Three papers filed. Your teaching note is tucked into the timetable.':'세 장 정리 끝. 다음 수업 메모도 시간표 사이에 끼워뒀어요.'}</p><div className="marking-tray">{records.map((record,i)=><span key={i}>{en?data.papers[i].nameEn:data.papers[i].name} · {record==='review'?(en?'Together':'같이 보기'):record+'/3'}</span>)}</div><button onClick={()=>{setPlan(data.nextStep);onDone(records.includes('review')||corrections>0?'resolved_with_issue':'completed',en?'Red pen capped. A little more room on the desk!':'빨간 펜 뚜껑 닫기 완료. 책상이 조금 가벼워졌어요!');}}>{en?'Cap the red pen':'빨간 펜 뚜껑 닫기'}</button></div>:<>
 <p className="marking-count">{records.length+1} / {data.papers.length} · {en?'Pick a stamp and tap the score box. You can circle the answer with the red pen.':'점수 도장을 골라 빈칸에 꾹! 답안에는 빨간 펜으로 동그라미도 칠 수 있어요.'}</p>
 <details className="marking-hint"><summary>{en?'Peek at the tiny marking note':'작은 채점 메모 펼치기'}</summary>{data.criteria.map(c=><p key={c.id}>{c.points}{en?' points':'점'} · {en?c.labelEn:c.label}</p>)}</details>
 <article className="marking-paper"><small>{paper.id} · {en?paper.nameEn:paper.name}</small><h3>{en?data.questionEn:data.question}</h3>
 <button className="pen-answer" disabled={stamped} aria-label={en?'Circle a spot on the answer':'답안에 빨간 동그라미 그리기'} onClick={e=>{if(marks.length>=12)return;const r=e.currentTarget.getBoundingClientRect();const x=e.detail===0?50:Math.round(Math.max(0,Math.min(100,(e.clientX-r.left)/r.width*100)));const y=e.detail===0?50:Math.round(Math.max(0,Math.min(100,(e.clientY-r.top)/r.height*100)));setMarks([...marks,`${x},${y}`]);}}><span>{en?paper.answerEn:paper.answer}</span>{marks.map((m,i)=>{const [x,y]=m.split(',');return <i key={i} className="pen-circle" style={{left:x+'%',top:y+'%'}}/>;})}</button>
 <button className="marking-score-box" aria-label={en?'Stamp the score box':'점수 칸에 도장 찍기'} disabled={!picked||stamped} onClick={()=>setStamped(true)}>{stamped?<strong className="paper-ink">{picked==='review'?'?':picked+'/3'}</strong>:<span>{en?'Stamp here':'점수 도장 자리'} ↓</span>}{stamped&&<span className="encouragement" aria-label={sticker==='star'?(en?'Star sticker':'별 스티커'):(en?'Flower sticker':'꽃 스티커')}>{sticker==='star'?'✦':'✿'}</span>}</button></article>
 {!stamped?<><div className="marking-stamps" aria-label={en?'Score stamps':'점수 도장'}>{['0','1','2','3','review'].map(score=><button key={score} aria-pressed={picked===score} onClick={()=>setPicked(score)}>{score==='review'?(en?'Review together':'같이 보기'):score+(en?' points':'점')}</button>)}</div><div className="choices"><button aria-pressed={sticker==='star'} onClick={()=>setSticker('star')}>{en?'Star sticker':'별 스티커'} ✦</button><button aria-pressed={sticker==='flower'} onClick={()=>setSticker('flower')}>{en?'Flower sticker':'꽃 스티커'} ✿</button><button disabled={!marks.length} onClick={()=>setMarks([])}>{en?'Wipe pen marks':'동그라미 지우기'}</button></div></>:<div className="marking-reaction" role="status">
 <p>{result?.score==='review'?(en?'Mentor: “Let’s keep this original and take a look together. No guessing needed.”':'선배: “이건 원본을 두고 같이 보죠. 혼자 정하지 않아도 돼요.”'):result?.corrected?(en?`Mentor: “A tiny correction: this one is ${result.score}/3. I added the note. Keep going!”`:`선배: “앗, 이건 ${result?.score}/3이네요. 정정 메모 붙였어요. 계속해 봐요!”`):(en?paper.reactionEn:paper.reaction)}</p>
 <p>{sticker==='star'?(en?'A small star lands beside the score.':'점수 옆에 작은 별 하나가 앉았습니다.'):(en?'A flower blooms in the margin.':'답안 여백에 꽃 한 송이가 피었습니다.')}</p>
 {result?.corrected&&<p className="correction-note">{en?'Final record':'정정 후 기록'}: {result.score==='review'?(en?'Pending joint review':'공동 검토 중'):result.score+'/3'}</p>}
 <div className="choices"><button onClick={()=>setStamped(false)}>{en?'Try a different stamp':'도장 다시 고르기'}</button><button onClick={file}>{en?'Slide into the done tray':'처리함으로 슥 넘기기'}</button></div></div>}
 </>}
 </section>;
}

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { lessons, lessonPasses, localizedSample } from '../engine/lessons';
import { useDraftState } from './useDraftState';
import { useGameStore } from '../store';
import { LessonLab } from './LessonLab';

type Props = { taskId: string; onDone: (status: 'completed' | 'resolved_with_issue', feedback: string) => void };

export function LessonGame({ taskId, onDone }: Props) {
  const en = useTranslation().i18n.language.startsWith('en');
  const language = en ? 'en' : 'ko';
  const lesson = lessons.find(item => item.id === taskId) ?? lessons[0];
  const memories = useGameStore(state => state.memories);
  const warmup = taskId === 'class_followup' && memories.grading_partial?.teachingPlan === 'calculation'
    ? { story: en ? 'Your marking note: Haneul had the correct process but a final total of 5. Start by checking the calculation together.' : '채점 메모를 가져왔습니다. 하늘은 과정은 맞았지만 최종 값을 5로 썼습니다. 약속한 대로 계산을 함께 검산하고 수업을 시작합니다.', question: en ? 'What is 0 + 1 + 2 + 3?' : '0 + 1 + 2 + 3을 차례로 계산하면?', choices: ['5', '6', '123'], correct: '6' }
    : taskId === 'class_followup' && memories.grading_basic?.teachingPlan === 'trace'
      ? { story: en ? 'Yesterday you promised Jiwoo a trace-table follow-up. Start by checking when a calculated value exists.' : '어제 지우에게 실행 순서를 다시 따라가기로 약속했습니다. 계산 결과가 언제 생기는지 확인하며 시작합니다.', question: en ? 'When can the calculated result be displayed?' : '계산 결과를 출력할 수 있는 때는?', choices: en ? ['Before input', 'After calculation'] : ['입력하기 전', '계산을 마친 뒤'], correct: en ? 'After calculation' : '계산을 마친 뒤' }
      : taskId === 'class_admin_day' && memories.grading_review?.teachingPlan === 'trace'
        ? { story: en ? 'Your review found that knowing the order and knowing why are different. Revisit the broadcast check before today’s budget problem.' : '재검토에서 순서를 아는 것과 이유를 아는 것이 다름을 확인했습니다. 예산 문제에 앞서 방송 점검의 이유를 함께 확인합니다.', question: en ? 'Why lower the output before checking a connection?' : '연결을 점검하기 전에 출력을 낮추는 이유는?', choices: en ? ['To prevent sudden loud sound', 'To hide the fault'] : ['갑작스러운 큰 소리를 예방하려고', '고장을 숨기려고'], correct: en ? 'To prevent sudden loud sound' : '갑작스러운 큰 소리를 예방하려고' }
      : taskId === 'class_final' && memories.grading_post_exam?.teachingPlan === 'condition'
        ? { story: en ? 'Your exam marking note asked for an AND/OR comparison. Keep that promise before the final class discussion.' : '시험 채점 때 AND와 OR를 같은 사례로 비교하기로 했습니다. 마지막 수업도 그 약속을 확인하며 시작합니다.', question: en ? 'Borrow only if it rains AND you have no umbrella. It is raining, but you have one. What happens?' : '비가 오고 우산이 없을 때만 빌립니다. 비가 오지만 우산이 있다면?', choices: en ? ['Borrow an umbrella', 'Go directly to school'] : ['우산을 빌린다', '바로 등교한다'], correct: en ? 'Go directly to school' : '바로 등교한다' }
        : undefined;
  const [warmupDone, setWarmupDone] = useDraftState<boolean>(taskId, 'lessonWarmupDone', false);
  const [warmupError, setWarmupError] = useState(false);
  const [approach, setApproach] = useDraftState<string>(taskId, 'approach', '', value => ['', 'demo', 'pairs'].includes(value));
  const [order, setOrder] = useDraftState<string[]>(taskId, 'lessonOrder', [], value => value.length <= (lesson.cards?.length ?? 0) && new Set(value).size === value.length && value.every(id => lesson.cards?.some(card => card.id === id)));
  const [rule, setRule] = useDraftState<string>(taskId, 'lessonRule', '', value => value === '' || !!lesson.options?.some(option => option.id === value));
  const [tested, setTested] = useDraftState<boolean>(taskId, 'lessonTested', false);
  const [runs, setRuns] = useDraftState<number>(taskId, 'lessonRuns', 0, value => Number.isInteger(value) && value >= 0 && value <= 999);
  const [demonstrated, setDemonstrated] = useDraftState<boolean>(taskId, 'lessonDemonstrated', false);
  const [exitAnswer, setExitAnswer] = useDraftState<string>(taskId, 'lessonExit', '', value => value === '' || lesson.exitOptions.some(option => option.id === value));
  const [checked, setChecked] = useDraftState<boolean>(taskId, 'lessonExitChecked', false);
  const [hint, setHint] = useState(false);
  const [labDone, setLabDone] = useDraftState<boolean>(taskId, 'lessonLabDone', false);
  const passed = tested && lessonPasses(lesson, order, rule);
  const readyForQuestion = demonstrated && passed;
  const understood = checked && !!lesson.exitOptions.find(option => option.id === exitAnswer)?.correct;
  const option = lesson.options?.find(item => item.id === rule);
  const resetResult = () => { setTested(false); setDemonstrated(false); setChecked(false); };
  const finish = () => {
    if (!approach || !readyForQuestion || !understood || !labDone || warmup && !warmupDone) return;
    const method = approach === 'pairs' ? (en ? 'peer explanation' : '짝 설명') : (en ? 'teacher demonstration' : '교사 시연');
    onDone('completed', en
      ? `${lesson.title.en}: the class tested ${lesson.cases.length} examples through ${method} and explained the transfer question. ${runs > 1 ? 'A failed test became evidence for revising the rule.' : 'The examples supported the proposed rule.'}`
      : `${lesson.title.ko}: ${method}으로 예제 ${lesson.cases.length}개를 검증하고 새로운 상황까지 설명했습니다. ${runs > 1 ? '틀린 시험 결과를 규칙을 고치는 근거로 활용했습니다.' : '제안한 규칙이 예제에서 성립하는 것을 확인했습니다.'}`);
  };
  return <section className="school-activity lesson-game">
    <header><span>{en ? 'CLASSROOM LAB · NO TIME LIMIT' : '교실 실험실 · 시간제한 없음'}</span><h2>{lesson.title[language]}</h2></header>
    <p className="lesson-story">{lesson.context[language]}</p>
    <ol className="lesson-progress" aria-label={en ? 'Lesson progress' : '수업 진행'}>
      <li aria-current={!approach ? 'step' : undefined}>{en ? 'Teaching approach' : '수업 방식'}</li>
      <li aria-current={approach && !readyForQuestion ? 'step' : undefined}>{en ? 'Build and test' : '만들고 시험하기'}</li>
      <li aria-current={readyForQuestion && !understood ? 'step' : undefined}>{en ? 'Check understanding' : '이해 확인'}</li>
      <li aria-current={understood ? 'step' : undefined}>{en ? 'Class reflection' : '수업 마무리'}</li>
    </ol>
    {warmup && !warmupDone ? <div className="lesson-board lesson-callback"><h3>{en ? 'A promise from your marking notes' : '채점에서 이어진 수업 약속'}</h3><p>{warmup.story}</p><h4>{warmup.question}</h4><div className="choices">{warmup.choices.map(choice => <button key={choice} onClick={() => { if (choice === warmup.correct) { setWarmupDone(true); setWarmupError(false); } else setWarmupError(true); }}>{choice}</button>)}</div>{warmupError && <p role="alert">{en ? 'Trace each value or condition with the student, then try again. The previous score is not changed.' : '학생과 각 값이나 조건을 하나씩 따라가며 다시 확인하세요. 이전 점수는 바꾸지 않습니다.'}</p>}</div> : !approach ? <div className="lesson-approaches"><h3>{en ? 'How will you make room for thinking?' : '학생들이 생각할 시간을 어떻게 만들까요?'}</h3><div className="choices">
      <button onClick={() => setApproach('demo')}><strong>{en ? 'Model it on the board' : '칠판에서 교사가 시연'}</strong><span>{en ? 'Everyone follows one clear model. Invite a student to explain the final example.' : '공통 예제로 차근차근 정리합니다. 마지막 예제는 학생에게 설명을 맡깁니다.'}</span></button>
      <button onClick={() => setApproach('pairs')}><strong>{en ? 'Let pairs predict first' : '짝과 먼저 예측하기'}</strong><span>{en ? 'More voices join in. Compare conflicting predictions before collecting the class.' : '더 많은 학생이 이야기합니다. 다른 예측을 모아 전체 흐름을 정리합니다.'}</span></button>
    </div><p>{en ? 'Both approaches can work. The conversation changes with your choice.' : '두 방식 모두 수업을 마칠 수 있습니다. 선택에 따라 교실의 대화가 달라집니다.'}</p></div> : <>
      <blockquote className="student-reaction">{approach === 'pairs'
        ? (en ? 'Jiwoo: “Our predictions differ. Let’s run both and see which one works.”' : '지우: “짝과 예상이 달라요. 직접 실행해서 어느 쪽이 맞는지 볼게요.”')
        : (en ? 'Minjun: “I can follow the example. Let me explain the next one myself.”' : '민준: “예제를 보니 따라갈 수 있어요. 다음 건 제가 설명해 볼게요.”')}</blockquote>
      {!readyForQuestion ? <div className="lesson-board">
        <h3>{lesson.mode === 'sequence' ? (en ? 'Build the process' : '과정 구성하기') : (en ? 'Choose a rule to test' : '시험할 규칙 고르기')}</h3>
        {lesson.mode === 'sequence' ? <><p>{en ? 'Tap cards in execution order. Reset freely before testing.' : '실행할 순서대로 카드를 놓으세요. 시험 전에 자유롭게 다시 놓을 수 있습니다.'}</p><ol className="sequence-slots">{lesson.cards!.map((_, index) => <li key={index}>{lesson.cards!.find(card => card.id === order[index])?.[language] ?? '…'}</li>)}</ol><div className="choices">{[...lesson.cards!].reverse().map(card => <button key={card.id} disabled={order.includes(card.id)} onClick={() => { setOrder([...order, card.id]); resetResult(); }}>{card[language]}</button>)}</div><button onClick={() => { setOrder([]); resetResult(); }}>{en ? 'Reset cards' : '카드 다시 놓기'}</button></>
          : <div className="lesson-rule-options" role="group" aria-label={en ? 'Rules' : '규칙 선택'}>{lesson.options!.map(item => <button key={item.id} aria-pressed={rule === item.id} onClick={() => { setRule(item.id); resetResult(); }}>{item[language]}</button>)}</div>}
        <div className="lesson-test-cases"><h4>{en ? 'Class test bench' : '우리 반 시험대'}</h4><table><thead><tr><th>{en ? 'Input / situation' : '입력 / 상황'}</th><th>{en ? 'Expected result' : '기대 결과'}</th><th>{en ? 'Our result' : '실행 결과'}</th></tr></thead><tbody>{lesson.cases.map((example, index) => {
          const result = lesson.mode === 'rule' ? option?.outputs[index] : passed ? example.expected : undefined;
          return <tr key={example.input}><td>{localizedSample(example.input, en)}</td><td>{localizedSample(example.expected, en)}</td><td>{!tested ? '—' : result ? `${localizedSample(result, en)} ${result === example.expected ? '✓' : '✕'}` : (en ? 'Order interrupted ✕' : '순서 중단 ✕')}</td></tr>;
        })}</tbody></table></div>
        <div className="choices"><button disabled={lesson.mode === 'sequence' ? order.length !== lesson.cards!.length : !rule} onClick={() => { setTested(true); setRuns(Math.min(999, runs + 1)); }}>{en ? 'Run all examples' : '예제 모두 실행'}</button><button onClick={() => setHint(!hint)} aria-expanded={hint}>{en ? 'Discuss a hint' : '설명 힌트 보기'}</button></div>
        {hint && <p className="lesson-hint">{lesson.hint[language]}</p>}
        {tested && <p role={passed ? 'status' : 'alert'}>{passed ? (en ? 'Every example matches. Now ask a student to apply the idea to a new situation.' : '모든 예제가 맞았습니다. 이제 학생에게 새로운 상황을 설명해 달라고 해보세요.') : (en ? 'The mismatch is useful evidence. Compare the failed example, change your process, and test again.' : '다른 결과가 나온 예제가 단서입니다. 어떤 조건에서 달라졌는지 보고 고친 뒤 다시 시험하세요.')}</p>}
        {passed && <button onClick={() => setDemonstrated(true)}>{en ? 'Ask the class to explain' : '학생 설명 듣기'}</button>}
      </div> : !understood ? <div className="lesson-board"><h3>{en ? 'Apply it to a new situation' : '새로운 상황에 적용하기'}</h3><blockquote>{lesson.question[language]}</blockquote><p>{approach === 'pairs' ? (en ? 'The pairs offer two explanations. Choose the one to share with the class.' : '짝들이 두 가지 설명을 내놓았습니다. 함께 정리할 설명을 고르세요.') : (en ? 'A student extends your demonstration. Choose the explanation that checks their understanding.' : '학생이 시연을 새 상황에 적용했습니다. 이해를 확인할 설명을 고르세요.')}</p><div className="choices">{lesson.exitOptions.map(answer => <button key={answer.id} aria-pressed={exitAnswer === answer.id} onClick={() => { setExitAnswer(answer.id); setChecked(false); }}>{answer[language]}</button>)}</div><button disabled={!exitAnswer} onClick={() => setChecked(true)}>{en ? 'Check the explanation' : '설명 확인하기'}</button>{checked && !understood && <p role="alert">{lesson.hint[language]} {en ? 'Revise the explanation together.' : '함께 설명을 고쳐보세요.'}</p>}<button onClick={() => { setDemonstrated(false); setChecked(false); }}>{en ? 'Return to the examples' : '예제로 돌아가기'}</button></div>
          : !labDone ? <LessonLab taskId={taskId} onComplete={() => setLabDone(true)} /> : <div className="lesson-reflection"><h3>{en ? 'The class can explain why' : '이제 학생들이 이유를 설명합니다'}</h3><p>{approach === 'pairs' ? (en ? 'Jiwoo and Minjun compare their first predictions, then present one shared explanation. A quiet pair joins the discussion.' : '지우와 민준이 처음 예측을 비교하고 하나의 설명으로 정리했습니다. 조용하던 짝도 발표에 참여합니다.') : (en ? 'Minjun explains the final example without your help. The common model gives the class a clear point of reference.' : '민준이 마지막 예제를 도움 없이 설명했습니다. 공통 예제가 생겨 학생들이 같은 기준으로 이야기합니다.')}</p><p>{en ? `${lesson.cases.length} examples verified · ${runs} test runs · Transfer question explained` : `예제 ${lesson.cases.length}개 검증 · ${runs}회 실행 · 새 상황 설명 완료`}</p><p>{runs > 1 ? (en ? 'Revisions are part of learning, not a penalty.' : '고쳐 실행한 과정도 배움입니다. 재시도 횟수는 감점하지 않습니다.') : (en ? 'Next time, invite students to invent a counterexample.' : '다음에는 학생에게 반례를 만들어 달라고 해보세요.')}</p><button onClick={finish}>{en ? 'Record the lesson and finish' : '수업 기록 후 마치기'}</button></div>}
    </>}
  </section>;
}

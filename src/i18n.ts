import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import flow from './locales/flow.json';

const ko = {
  translation: {
    app: { title: '선생님, 잠깐만요!', subtitle: '어쩌다 담임', week: '{{week}}주 차', day: '{{day}}일 차', quit: '퇴근하기', next: '다음 날 출근', restart: '처음부터', resetConfirm: '저장된 진행을 초기화할까요?', allDone: '오늘의 필수 업무를 모두 처리했습니다.', pending: '필수 업무 {{count}}개가 남았습니다.', demoEnd: '3주 완주!', demoEndBody: '신규 교사로 보낸 15일이 끝났습니다. 완벽하지 않은 날도 있었지만, 필요한 절차를 지키며 모든 업무를 마쳤습니다.', language: 'EN', saved: '자동 저장됨' },
    nav: { desk: '작업대', messenger: '핫메신저', timetable: '시간표' },
    days: { 1: { title: '첫 출근', intro: '낯선 교무실, 새 책상, 그리고 벌써 도착한 메시지.' }, 2: { title: '업무 적응', intro: '어제와 같은 서류처럼 보이지만, 오늘은 한 군데가 이상하다.' }, 3: { title: '부분점수의 세계', intro: '업무 요청이 늘고 채점 기준은 조금 더 복잡해졌다.' }, 4: { title: '방송반 담당', intro: '방송반 학생이 찾아왔다. 점심 방송 장비 상태가 좋지 않다고 한다.' }, 5: { title: '신호가 없습니다', intro: '결국 방송 장비가 멈췄다. 수리와 구매 요청을 오늘 안에 처리해야 한다.' }, 6: { title: '어쩌다 담임', intro: '담임 선생님이 갑자기 출근하지 못했다. 부담임인 내가 아침 출결을 맡는다.' }, 7: { title: '확인 중입니다', intro: '결석생 한 명의 사유가 확인되지 않는다. 임의로 판단하지 않고 절차대로 처리해야 한다.' }, 8: { title: '먼저 들어볼게', intro: '결석 사유가 확인되었다. 점심에는 방송반 학생이 조심스럽게 상담을 요청한다.' }, 9: { title: '결재 완료', intro: '보완한 구매 요청이 승인되었다. 반복 업무도 이전 기록을 살펴야 한다.' }, 10: { title: '시험 전 금요일', intro: '다음 주는 시험 기간이다. 시험 자료와 감독 일정을 빠짐없이 준비한다.' }, 11: { title: '시험 1일 차', intro: '지침과 수량을 차분히 확인한다. 오늘은 기본 절차에 집중한다.' }, 12: { title: '감독 교실 변경', intro: '아침에 감독 교실이 바뀌었다. 시험 중에는 학생이 질문을 한다.' }, 13: { title: '마지막 시험', intro: '사흘째라 익숙해졌지만 OMR 카드 한 장에 학번이 빠져 있다.' }, 14: { title: '시험이 끝난 뒤', intro: '시험은 끝났지만 채점과 상담, 행정 마무리가 책상 위에 남아 있다.' }, 15: { title: '마지막 금요일', intro: '어느새 익숙해진 교무실. 출결과 수업, 메시지를 차례로 마무리한다.' } },
    tasks: {
      messageWelcome: { title: '선배 교사의 환영 메시지', desc: '핫메신저에 새 메시지가 왔습니다. 오늘 일정과 교무실 사용법을 확인하세요.' },
      noticeBasic: { title: '가정통신문 3장 확인', desc: '학생 정보, 보호자 서명, 동의 표시가 모두 있습니다. 확인 도장을 찍으세요.' },
      classFirst: { title: '2교시 정보 수업', desc: '학생이 묻습니다. “선생님, 알고리즘은 왜 배워요?”' },
      noticeVariant: { title: '가정통신문 재확인', desc: '한 장에 보호자 서명이 없습니다. 그대로 승인할지, 보완을 요청할지 결정하세요.' },
      classQuestion: { title: '3교시 정보 수업', desc: '어제 설명한 알고리즘을 짧은 활동으로 복습합니다.' },
      gradingBasic: { title: '형성평가 채점', desc: '정답 기준과 학생 답안을 대조해 점수를 기록하세요.' },
      messageRequest: { title: '교무부 업무 요청', desc: '핫메신저로 이번 주 평가 결과 정리 요청이 도착했습니다.' },
      gradingPartial: { title: '서술형 채점', desc: '핵심 과정은 맞지만 마지막 답이 틀렸습니다. 기준표에는 과정 2점이 명시되어 있습니다.' },
      classFollowup: { title: '4교시 정보 수업', desc: '학생 반응을 살피며 생활 속 알고리즘 예시를 연결합니다.' },
      messageBroadcast: { title: '방송반 담당 요청', desc: '담당 선생님의 출장으로 오늘 방송 장비 점검을 부탁한다는 메시지입니다.' },
      classBroadcastDay: { title: '2교시 정보 수업', desc: '수업을 마치고 점심시간 전에 방송실로 이동해야 합니다.' },
      equipmentCheck: { title: '방송 장비 점검', desc: '마이크 → 믹서 → 앰프 → 스피커의 신호 흐름을 확인하세요. 케이블 하나가 불안정합니다.' },
      messageAdmin: { title: '행정실 답변', desc: '교체 케이블은 방송실 예산으로 구매할 수 있습니다. 구매 요청 기안이 필요합니다.' },
      cableRepair: { title: '방송 장비 임시 복구', desc: '장비를 올바른 신호 순서로 연결해 오늘 방송을 복구하세요.' },
      edugreatPurchase: { title: '에듀그렛 구매 요청', desc: '교체 케이블 구매 목적, 수량, 예산 항목을 확인하고 기안을 제출하세요.' },
      messageHomeroom: { title: '담임교사 부재 안내', desc: '2학년 3반 담임 선생님이 오늘 출근하지 못합니다. 부담임인 플레이어에게 아침 조회와 출결 확인이 요청되었습니다.' },
      attendanceBasic: { title: '2학년 3반 출결 확인', desc: '학생 목록과 교실 상황을 대조하세요. 오늘은 사전에 전달된 현장체험학습 학생이 한 명 있습니다.' },
      classHomeroom: { title: '3교시 정보 수업', desc: '임시 담임 업무 중에도 정해진 교과 수업은 진행해야 합니다.' },
      messageApprovalReturn: { title: '에듀그렛 보완 요청', desc: '케이블 구매 기안에 가격 비교 근거를 첨부해 달라는 메시지가 도착했습니다.' },
      attendanceUnknown: { title: '사유 미확인 결석', desc: '김하늘 학생이 보이지 않고 보호자에게 아직 연락이 닿지 않습니다. 확인되지 않은 사유를 임의로 확정하면 안 됩니다.' },
      approvalRevision: { title: '구매 기안 보완', desc: '보완 요청 사유를 확인하고 비교 견적 자료를 첨부해 다시 제출하세요.' },
      attendanceFollowup: { title: '결석 사유 후속 반영', desc: '보호자 확인 결과 병원 진료 사실이 확인되었습니다. 어제의 확인 중 기록에 사유를 반영하세요.' },
      studentCounseling: { title: '방송반 학생 상담', desc: '방송 장비 문제로 실수한 것 같아 동아리 활동을 그만두고 싶다는 학생이 찾아왔습니다.' },
      classCounselingDay: { title: '4교시 정보 수업', desc: '상담 약속 전 정규 수업을 진행합니다.' },
      messageApprovalDone: { title: '구매 요청 승인', desc: '보완 제출한 방송실 케이블 구매 요청의 결재가 완료되었습니다.' },
      gradingReview: { title: '채점 기록 재확인', desc: '지난 채점표와 오늘 답안을 비교해 점수 입력 오류가 없는지 확인하세요.' },
      classAdminDay: { title: '2교시 정보 수업', desc: '행정 업무 사이에도 시간표에 맞춰 수업을 진행합니다.' },
      messageExamSchedule: { title: '시험 감독표 도착', desc: '다음 주 시험 감독 교실과 시간을 확인해 달라는 메시지입니다. 첨부: 시험감독표.pdf' },
      examPack: { title: '시험 자료 정리·봉입', desc: '2학년 정보 시험 봉투에 필요한 자료만 정확히 골라 넣으세요.' },
      checkSupervision: { title: '감독 일정 확인', desc: '월요일 1교시 2학년 3반, 화요일 2교시 2학년 1반 감독 일정을 확인하세요.' },
      examCount11: { title: '시험지 수량 확인', desc: '응시자 28명과 시험지 28부가 일치하는지 확인하세요.' },
      supervise11: { title: '시험 감독', desc: '가상의 학교 감독 지침을 확인하고 시험 시작과 종료 절차를 진행하세요.' },
      omrBasic: { title: '답안지 회수', desc: 'OMR 카드 28장과 응시자 수를 대조하세요.' },
      messageRoomChange: { title: '감독 교실 변경', desc: '오늘 2교시 감독 교실이 2학년 1반에서 2학년 4반으로 변경되었습니다.' },
      superviseQuestion: { title: '시험 중 학생 질문', desc: '학생이 시험지 문구의 의미를 묻습니다. 감독 교사가 임의로 해석해도 될까요?' },
      omrDay12: { title: 'OMR 기본 기재 확인', desc: '수량과 함께 성명 기재 여부를 확인하세요.' },
      supervise13: { title: '시험 감독 3일 차', desc: '마지막 시험도 같은 지침에 따라 감독하고 답안지를 회수하세요.' },
      omrMissing: { title: '학번 누락 OMR', desc: 'OMR 카드 한 장에 학번이 없습니다. 임의로 번호를 추정하지 말고 확인 필요로 분리하세요.' },
      examMaterialSort: { title: '시험 자료 정리', desc: '시험지와 답안지 수량을 대조하고 종류별로 정리하세요.' },
      gradingPostExam: { title: '시험 채점', desc: '부분점수 기준과 이전 오류 기록을 함께 확인하며 시험 답안을 채점하세요.' },
      counselingFollowup: { title: '학생 상담 후속 대화', desc: '방송반 학생이 다시 찾아왔습니다. 새 케이블로 방송을 무사히 마쳤다고 합니다.' },
      messageBudgetClose: { title: '구매 업무 완료', desc: '케이블 검수와 예산 집행이 완료되었다는 행정실 메시지입니다.' },
      attendanceFinal: { title: '마지막 아침 출결', desc: '2학년 3반 학생 목록과 오늘의 출결을 확인하세요.' },
      classFinal: { title: '마지막 정보 수업', desc: '첫날 질문했던 알고리즘을 학생들이 직접 설명하는 활동으로 마무리합니다.' },
      messageFinal: { title: '선배 교사의 메시지', desc: '“첫 3주 고생 많았어요. 이제 교무실이 조금 익숙해졌죠?”' },
    },
    actions: { read: '메시지 읽기', stamp: '확인 도장 찍기', example: '생활 속 예시로 설명', textbook: '교과서대로 설명', requestFix: '서명 보완 요청', practice: '간단한 실습 진행', score: '기준표대로 채점', accept: '요청 확인', partial: '과정 점수 2점', zero: '0점 처리', inspect: '신호 흐름 점검', repair: '연결 작업 시작', submit: '기안 작성', saveAttendance: '출결부 저장', pending: '확인 중으로 처리', revise: '자료 첨부 및 재제출', listen: '무슨 일이 있었는지 먼저 듣기', advise: '바로 해결책을 조언하기', seal: '봉투 봉인', confirmSchedule: '감독 일정 확인', count: '28부 확인', followGuide: '지침대로 감독', finishOmr: '수량 대조 완료', checkGuide: '안내문 확인 후 담당자 문의', guessAnswer: '문구를 추측해 설명', sort: '종류별 정리', close: '확인' },
    feedback: { messageRead: '첫날 일정이 업무 목록에 정리되었습니다.', noticeOk: '세 장 모두 확인했습니다.', classExample: '학생들이 고개를 끄덕입니다.', classTextbook: '수업은 끝났지만 몇몇 학생은 아직 궁금해 보입니다.', requestedFix: '학생에게 서명 보완을 요청했습니다. 오늘 업무는 절차대로 처리되었습니다.', missedSignature: '승인 후 누락을 발견했습니다. 선배 교사와 함께 사후 보완합니다.', classPractice: '직접 순서를 만들어 보며 이해도가 올랐습니다.', graded: '답안과 점수가 일치합니다.', accepted: '요청을 확인하고 업무 흐름에 반영했습니다.', partialCorrect: '채점 기준에 따라 과정 점수를 부여했습니다.', partialMissed: '재검토에서 부분점수를 발견해 정정했습니다. 업무는 처리되었지만 정확도에 영향이 있습니다.', broadcastAccepted: '방송반 업무가 오늘 일정에 연결되었습니다.', equipmentFound: '앰프와 스피커 사이 케이블 손상을 발견했습니다. 행정실 문의가 예약됩니다.', adminReply: '예산 항목과 기안 절차를 확인했습니다.', repaired: '마이크부터 스피커까지 신호가 정상적으로 흐릅니다.', submitted: '구매 요청이 제출되었습니다. 검토 결과는 다음 출근일에 핫메신저로 도착합니다.', homeroomAccepted: '임시 담임 업무가 오늘 일정에 추가되었습니다.', attendanceSaved: '출석 27명, 현장체험학습 1명으로 출결부를 저장했습니다.', approvalReturned: '보완 사유를 확인했습니다. 기안은 실패한 것이 아니라 수정 가능한 상태입니다.', attendancePending: '연락 시도 기록을 남기고 확인 중으로 처리했습니다. 확인 결과는 이후 반영할 수 있습니다.', approvalResubmitted: '비교 견적 자료를 첨부해 기안을 다시 제출했습니다.', attendanceConfirmed: '확인 중이던 기록에 병원 진료 사유를 반영했습니다.', counselingListened: '학생은 장비 고장이 자기 탓이 아니라는 설명을 듣고 다시 활동해 보기로 합니다.', counselingAdvised: '상담은 마쳤지만 학생은 조금 더 이야기하고 싶어 보입니다. 다음 상담 약속을 잡았습니다.', approvalDone: '케이블 구매가 승인되었습니다. 행정 흐름이 하나의 이야기로 마무리됩니다.', examScheduleRead: '감독 일정이 시간표에 연결되었습니다.', examPacked: '시험지, 답안지, 확인표의 수량을 맞춰 봉인했습니다.', supervisionChecked: '두 감독 일정을 개인 시간표에 표시했습니다.', examCounted: '응시자와 시험지 수량이 일치합니다.', supervised: '지침에 따라 시험을 마치고 답안지를 회수했습니다.', omrBasicDone: '응시자 수와 OMR 카드 수량이 일치합니다.', roomChanged: '변경된 감독 교실을 시간표에 반영했습니다.', questionHandled: '임의로 해석하지 않고 안내문과 담당자를 통해 확인했습니다.', questionEscalated: '추측한 설명을 중단하고 담당자에게 다시 확인했습니다. 절차상 조치가 완료되었습니다.', omrPending: '학번 누락 카드를 별도 표시하고 확인 필요로 인계했습니다.', examSorted: '시험 자료를 종류별로 분류하고 수량을 기록했습니다.', finalGrading: '부분점수와 재검토까지 반영해 채점을 마쳤습니다.', counselingFollowup: '학생은 방송반 활동을 계속하기로 했습니다.', budgetClosed: '장비 고장에서 시작한 행정 업무가 모두 종료되었습니다.', attendanceFinal: '마지막 아침 출결을 저장했습니다.', classFinal: '학생들이 자기만의 예시로 알고리즘을 설명합니다.', finalMessage: '선배 교사에게 답장을 보내고 책상을 정리합니다.' },
    status: { completed: '완료', resolved_with_issue: '절차 처리', available: '대기' },
    timetable: { title: '오늘의 시간표', free: '공강 · 업무 가능', class: '정보 수업', after: '방과 후 · 업무 정리' },
    messenger: { title: '핫메신저', from: '보낸 사람', sender: '김한결 선생님', empty: '새 메시지가 없습니다.', unread: '읽지 않음' },
    repair: { instruction: '장비를 눌러 올바른 신호 순서로 연결하세요.', reset: '다시 연결', success: '신호 정상', wrong: '연결 순서를 다시 확인하세요.' },
    approval: { title: '에듀그렛 · 물품 구매 요청', purpose: '구매 목적', purposeValue: '방송실 음향 신호 복구', item: '품목', itemValue: 'XLR 케이블 5m', quantity: '수량', budget: '예산 항목', budgetValue: '교육활동운영비 · 방송반', attachment: '첨부', attachmentValue: '장비점검표.pdf', line: '결재선', lineValue: '담당 → 행정실 → 교감', submit: '내용 확인 후 제출' },
    attendance: { title: '2학년 3반 출결부', present: '출석', fieldTrip: '현장체험학습', absent: '결석', unknown: '사유 미확인', pending: '확인 중', callLog: '08:34 보호자 연락 시도 · 응답 없음', hint: '사유가 확인되지 않았다면 “확인 중”으로 기록할 수 있습니다.' },
    examPack: { instruction: '봉투에 넣을 자료 3개를 선택하세요.', paper: '정보 시험지 28부', answers: '답안지 28부', checklist: '수량 확인표', wrongGrade: '1학년 국어 시험지', memo: '교무실 메모', selected: '선택됨', seal: '수량 확인 후 봉인', incomplete: '필요한 자료를 모두 선택하세요.' },
  }
};

const en = { translation: { ...ko.translation, app: { ...ko.translation.app, title: 'Teachers, Please!', subtitle: 'Suddenly, Homeroom', week: 'Week {{week}}', day: 'Day {{day}}', quit: 'Leave school', next: 'Start next day', restart: 'New game', resetConfirm: 'Reset saved progress?', allDone: 'All required work is handled.', pending: '{{count}} required tasks remain.', demoEnd: 'Three weeks complete!', demoEndBody: 'Your first 15 days as a teacher are complete. Not every day was perfect, but every required task found a valid resolution.', language: '한국어', saved: 'Autosaved' }, nav: { desk: 'Desk', messenger: 'Hot Messenger', timetable: 'Timetable' }, actions: { ...ko.translation.actions, read: 'Read message', stamp: 'Stamp approved', close: 'Close' }, status: { completed: 'Done', resolved_with_issue: 'Resolved', available: 'Pending' }, timetable: { title: "Today's timetable", free: 'Free period · Desk work', class: 'Informatics class', after: 'After school · Wrap up' }, messenger: { title: 'Hot Messenger', from: 'From', sender: 'Hangeul Kim', empty: 'No new messages.', unread: 'Unread' } } };

let savedLanguage = 'ko';
try { savedLanguage = localStorage.getItem('teachers-language') ?? 'ko'; } catch { /* Storage may be disabled. */ }
i18n.use(initReactI18next).init({ resources: { ko, en }, lng: savedLanguage, fallbackLng: 'ko', interpolation: { escapeValue: false } });
i18n.addResourceBundle('ko', 'translation', { flow: flow.ko, nav: { approval: '에듀그렛' } }, true, true);
i18n.addResourceBundle('en', 'translation', { flow: flow.en, nav: { approval: 'EduGreat' } }, true, true);
export default i18n;
i18n.addResourceBundle('ko', 'translation', { newTasks: { phoneTitle: '보호자 전화 연락', phoneDesc: '결석 사유를 확인하기 위해 보호자에게 연락하고, 통화 결과를 기록하세요.', documentTitle: '방송 장비 구매 공문 작성', documentDesc: '요청 내용을 문서에 옮기고 수신처·금액·첨부를 검토한 뒤 제출하세요.' } }, true, true);
i18n.addResourceBundle('en', 'translation', { newTasks: { phoneTitle: 'Call the guardian', phoneDesc: 'Contact the guardian about an absence and record the outcome.', documentTitle: 'Prepare an equipment purchase memo', documentDesc: 'Draft the requested memo and review its recipient, amount and attachment.' } }, true, true);

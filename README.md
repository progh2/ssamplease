# 선생님, 잠깐만요! — 어쩌다 담임

신규 고등학교 교사의 3주를 그린 픽셀아트 업무·스토리 시뮬레이션 프로토타입입니다. DAY 1~15 진행 데이터가 있으며, 첫 3일의 문서 확인·채점과 수업 이동, 방송 장비 및 구매 기안 흐름을 우선 보강하고 있습니다. 이후 날짜의 감독·상담 등은 아직 간단한 선택형 이벤트입니다.

## 실행

```bash
npm install
npm run dev
```

검증은 `npm test`와 `npm run build`로 수행합니다. 진행 상태와 언어는 브라우저 localStorage에 자동 저장됩니다.

브라우저 테스트:

```bash
npx playwright install chromium
npm run test:e2e
```

PC와 모바일 Chromium에서 첫 3일, 오류 재시도, 수업 이동, 저장 복원, 기안 예산·보완 처리를 검사합니다. 테스트는 로컬 서버를 자동 실행합니다. `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`로 기존 Chromium 경로를 지정할 수 있습니다.

저장 버전이 달라져도 알려진 업무 완료 기록을 복원합니다. 과거 버전이 이전 날짜 기록을 버린 경우, 해당 날짜를 통과했다는 사실로 필수 업무 처리 여부만 복원하며 대화 선택은 추정하지 않습니다. 저장소 접근 실패 시 경고를 표시하고 현재 세션은 메모리에서 계속 진행합니다. 미완료 문서 퍼즐의 중간 선택은 새로고침 시 다시 시작합니다.

## 현재 플레이 범위

업무 시작 버튼은 해당 업무만 표시하는 전용 화면을 엽니다. 교무실의 반투명 할 일 보드는 내부 스크롤과 접기를 지원하며, 장면 높이에 영향을 주지 않습니다. 교무실 배경은 실제 사진을 받기 전의 임시 도형 장면입니다.

- 수업: 입력·처리·출력 카드 배열 → 학생 질문에 설명 → 예시 실행과 이해 확인.
- 전화(DAY 7): 주소록 선택 → 연락 시도 → 응답 없음 기록 → 출결 확인 중 처리 연결.
- 공문(DAY 9): 요청서 대조 → 제목·수신처·금액·첨부 작성 → 미리보기 검토 → 결재 요청.
- OMR(DAY 11~13): 확인 대상 카드의 명부 대조 → 누락 카드 분리 → 전체 회수 수량 확인. 실제 OCR/OMR 판독 기능은 아닙니다.

서류 확인 순서, 채점 점수, 전화·공문 작성 입력, 장비 점검 결과는 작업 중에도 자동 저장되어 새로고침 후 업무를 다시 열면 복원됩니다. 수업·OMR·케이블 연결 등 나머지 퍼즐은 아직 새로고침 시 중간 입력이 초기화됩니다. 완료 기록과 기안 수량·비교 견적 첨부 여부도 자동 저장됩니다.

임시 책상 화면에는 컴퓨터부터 시작해 업무 진행에 따라 서류·빨간 펜·방송 장비·출석부·전화기가 고정 위치에 등장합니다. 물건을 누르면 진행 가능한 해당 업무가 열리고, 완료 후에도 물건은 남습니다. 사용 중인 SVG 물건과 책상 바탕은 기능 확인용 임시 에셋이며 최종 픽셀아트가 아닙니다.

- DAY 1: 핫메신저 확인, 가정통신문, 첫 수업
- DAY 2: 서명 누락 변칙, 수업, 기본 채점
- DAY 3: 업무 요청, 부분점수 채점, 수업
- DAY 4: 방송반 담당 요청, 장비 점검
- DAY 5: 신호 연결 퍼즐, 에듀그렛 구매 요청
- DAY 6: 담임 부재, 임시 담임 기본 출결
- DAY 7: 사유 미확인 결석의 확인 중 처리, 기안 보완 요청
- DAY 8: 출결 후속 반영과 방송반 학생 상담
- DAY 9: 구매 요청 승인과 반복 채점 검토
- DAY 10: 시험 감독표 확인과 시험 자료 봉입
- DAY 11~13: 시험 감독 반복, 교실 변경, 학생 질문, OMR 누락 변칙
- DAY 14~15: 시험 후 채점·상담·행정 마무리와 3주 완주 엔딩
- `completed`와 `resolved_with_issue`를 모두 처리 완료로 인정
- 한/영 전환 구조(기존 이야기 영어 번역은 일부 미완료), 반응형 레이아웃, Phaser 교무실·교실 장면
- 수업은 시간표의 다음 수업 교실로 이동해야 완료 가능
- 에듀그렛에서 기존 수량과 제출 → 보완 → 재제출 → 승인 → 집행 상태 확인
- 예산 초과 시 수량 수정, 보완 요청 시 비교 견적 첨부 후 재제출

## 콘텐츠 확장

날짜와 업무는 `src/content/days.ts`, 선행 조건은 `src/content/dependencies.json`, 수업 교시와 교실은 `src/content/timetables.json`, 문서·채점 자료는 `src/content/exercises.json`에 정의합니다. `npm run validate:content`는 스키마, 참조 ID, 의존성 순환, 미래 날짜 의존, 교시 충돌 등을 검사합니다. 기존 UI 문자열은 `src/i18n.ts`, 새 업무 흐름 번역은 `src/locales/flow.json`에 있습니다. 챕터 전체의 JSON 분리와 번역 키 완전성 검증은 후속 작업입니다.

## 프로젝트 진행

우선순위와 마일스톤은 [docs/ISSUES.md](docs/ISSUES.md)에 정리되어 있습니다. GitHub 인증과 저장소 생성 후 아래 명령으로 초기 이슈를 등록할 수 있습니다.

```bash
gh label create P0 --color B60205
gh label create P1 --color D93F0B
gh label create P2 --color FBCA04
gh label create feature --color 1D76DB
gh label create content --color 7057FF
bash scripts/create-issues.sh OWNER/REPO --dry-run
bash scripts/create-issues.sh OWNER/REPO
```

`main`에 push하면 `.github/workflows/deploy.yml`이 테스트와 빌드 후 GitHub Pages로 배포합니다. 저장소 Settings → Pages → Source는 **GitHub Actions**로 설정합니다.

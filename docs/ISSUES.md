# GitHub 이슈 백로그

등록할 본문은 `docs/issues/`에 저장한다. 먼저 `bash scripts/create-issues.sh OWNER/REPO --dry-run`으로 로컬 목록을 확인한다. GitHub 인증과 저장소 연결 후 `bash scripts/create-issues.sh OWNER/REPO`로 등록한다.

스크립트는 모든 페이지의 열린/닫힌 이슈 제목을 정확히 비교해 기존 이슈를 건너뛴다. 기존 이슈를 닫거나 수정하지 않으며, 필요한 라벨만 지정한 저장소에 생성한다. 본문은 `--body-file`로 전달해 줄바꿈을 보존한다. 동시 실행은 피한다.

## 현재 등록 대상

1. [GitHub Pages 배포와 배포 URL 검증](issues/pages.md)
2. [한국어·영어 전체 문자열과 언어 전환 검증](issues/localization.md)
3. [타이틀·이어하기·저장 복구 사용자 흐름](issues/save-flow.md)
4. [DAY 1~15 업무 판단과 변칙 품질 개선](issues/content-quality.md)
5. [브라우저 회귀 테스트 CI와 추가 날짜 검증](issues/browser-coverage.md)

아래는 최초 기획 분류다. 날짜 데이터의 존재를 해당 기능의 완성으로 판단하지 않는다. 현재 남은 작업은 위 본문의 완료 조건으로 관리한다.

## Milestone 1 — 첫 3일 플레이 (`P0`, 현재 구현)

1. `[P0] 프로젝트 기반과 Pages 배포` — Vite/React/TS/Phaser, CI, 정적 경로
2. `[P0] 데이터 기반 하루·업무 엔진` — 상태, 완료/절차 처리, 진행 불능 방지
3. `[P0] DAY 1 튜토리얼` — 메시지, 가정통신문, 첫 수업, 퇴근
4. `[P0] DAY 2~3 반복·변칙` — 서명 누락, 채점, 부분점수
5. `[P0] 반응형 UI·접근성·한영 전환` — 터치 조작, 저장 유지

## Milestone 2 — 방송반과 행정 (`P1`)

6. `[P1] DAY 4 방송반 기자재 점검`
7. `[P1] DAY 5 케이블 연결 퍼즐`
8. `[P1] 핫메신저 업무 연결 그래프`
9. `[P1] 에듀그렛 기안·예산·보완 요청`
10. `[P1] DAY 6~7 임시 담임 출결 처리`

## Milestone 3 — 15일 완성 (`P2`)

11. `[P2] DAY 8 학생 상담과 신뢰도`
12. `[P2] DAY 9 기안 재제출`
13. `[P2] DAY 10 시험지 정리·봉입`
14. `[P2] DAY 11~13 시험 감독·OMR 변칙`
15. `[P2] DAY 14~15 결산과 엔딩`
16. `[P2] Zod 콘텐츠 참조·번역·완료 가능성 검증기`

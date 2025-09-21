# CLAUDE.md

이 파일은 Claude Code (claude.ai/code)가 이 리포지토리에서 작업할 때 필요한 지침을 제공합니다.

## 개발 명령어

### 빠른 시작
- **전체 시스템 시작**: `./scripts/start.sh` (프론트엔드와 백엔드를 자동 설정으로 시작)
- **시스템 상태 확인**: `./scripts/status.sh` (종합 상태 점검)
- **모든 서비스 중지**: `./scripts/stop.sh` (정상 종료 및 정리)

### 프론트엔드 (React/Vite)
- **개발 서버**: `npm run dev` (포트 5173에서 실행)
- **프로덕션 빌드**: `npm run build`
- **개발용 빌드**: `npm run build:dev`
- **코드 린트**: `npm run lint`
- **빌드 미리보기**: `npm run preview`

### 백엔드 (Node.js/Express)
- **백엔드 서버 시작**: `npm run server` (포트 3001에서 실행)
- **메모리 최적화 시작**: `npm run server:memory` (4GB 최대 힙 크기와 GC 노출)
- **자동 재시작 개발**: `cd server && npm run dev` (nodemon)

### 프로덕션 배포
- **참고**: 프론트엔드 개발 서버는 포트 5173에서 실행되지만, 프로덕션은 포트 8080에서 서비스됨 (스크립트 통해)
- 프로덕션과 유사한 로컬 배포 테스트를 위해 셸 스크립트 사용

## 아키텍처 개요

AI 기반 전략 학습 기능을 갖춘 풀스택 한국 주식 포트폴리오 관리 시스템입니다. React SPA 프론트엔드와 MariaDB 데이터베이스 통합이 된 Node.js/Express 백엔드로 구성되어 있습니다.

### 시스템 아키텍처

**프론트엔드 (React SPA)**:
- Vite + TypeScript + shadcn/ui 컴포넌트 + Tailwind CSS
- 네비게이션을 위한 React Router, 서버 상태 관리를 위한 React Query
- 실시간 주가 업데이트 및 포트폴리오 분석
- 반응형 모바일 우선 디자인의 한국어 UI

**백엔드 (Node.js/Express API)**:
- CORS가 활성화된 RESTful API 서버
- 자동 업데이트가 포함된 실시간 주가 시뮬레이션
- 다양한 생성 방법을 가진 AI 전략 학습 시스템
- 문서 분석을 위한 Multer를 통한 파일 업로드 지원

**데이터베이스 (MariaDB)**:
- 포트폴리오 보유량, 거래 기록, 고객 데이터
- 자동 업데이트가 포함된 실시간 주가
- 전략 학습 및 리밸런싱 설정
- 약 200개 한국 주식의 포괄적인 모의 데이터

### 주요 백엔드 컴포넌트

**핵심 모듈**:
- `server/server.js`: API 라우팅이 포함된 메인 Express 서버
- `server/database.js`: 데이터베이스 연결 풀 및 쿼리 함수
- `server/priceUpdater.js`: 실시간 주가 시뮬레이션 엔진

**주가 업데이트 시스템**:
- 0.95-1.05배 변동으로 1000ms마다 자동 주가 업데이트
- 설정 가능한 임계값과 배치 처리를 통한 메모리 관리
- API 엔드포인트를 통한 시작/중지/재시작 지원

**전략 학습 시스템**:
4가지 AI 전략 생성 방법:
1. **사용자 입력 (USR)**: 텍스트 기반 전략 생성
2. **웹사이트 분석 (WEB)**: URL 내용 분석 
3. **문서 분석 (DOC)**: 파일 업로드 처리 (PDF, DOC, TXT, PPT)
4. **자동 생성 (AUTO)**: 시장 분석 기반 생성

각 방법은 현실적인 매개변수로 모의 전략을 생성하고 `strategy_learning` 테이블에 저장합니다.

### 데이터베이스 스키마

**핵심 테이블**:
- `customer_balance`: 수량 및 매수 금액이 포함된 포트폴리오 보유량
- `stock_current_price`: 실시간 주가 (~2500개 한국 주식)
- `trading_history`: 매수/매도 기록이 포함된 완전한 거래 기록
- `customer_strategy`: 사용자의 리밸런싱 전략 설정
- `rebalancing_master`: 사전 정의된 투자 전략 (15가지 유형)
- `strategy_learning`: 적용 상태가 포함된 AI 생성 전략

**주요 관계**:
- 실시간 평가를 위해 현재 가격과 연결된 고객 잔고
- 모든 거래에 대한 감사 추적을 유지하는 거래 기록
- 전략을 마스터 목록으로 승격시킬 수 있는 전략 학습 시스템

### API 아키텍처

**잔고 관리** (`/api/balance/*`):
- `/holdings`: 손익 계산이 포함된 포트폴리오 포지션
- `/deposit`: 고객 현금 예금
- `/rebalancing`: 전략 상태 및 설정
- `/all`: 완전한 포트폴리오 요약

**전략 학습** (`/api/strategy-learning/*`):
- `/generate/user-input`: 텍스트 기반 전략 생성
- `/generate/website`: 검증이 포함된 URL 분석
- `/generate/document`: 타입 검사가 포함된 다중 파일 업로드
- `/generate/auto`: 자동화된 시장 기반 생성
- `/apply/{code}`: 학습 전략을 마스터 목록으로 승격

**가격 관리** (`/api/price/*`):
- `/status`: 가격 업데이터 시스템 상태
- `/start`, `/stop`, `/restart`: 가격 업데이트 제어
- `/config`: 업데이트 간격 및 변동 설정

### 개발 패턴

**데이터베이스 작업**:
- mysql2/promise를 사용한 연결 풀링
- 전반적인 async/await 패턴
- 다중 테이블 작업을 위한 트랜잭션 지원
- 상세한 로깅을 통한 오류 처리

**파일 처리**:
- 멀티파트 폼 업로드를 위한 Multer 미들웨어
- 파일 타입 검증 및 크기 제한
- 임시 처리를 위한 메모리 저장

**API 디자인**:
- 성공/오류 상태가 포함된 일관된 JSON 응답 형식
- 디버깅을 위한 요청 로깅 미들웨어
- 크로스 오리진 프론트엔드 접근을 위한 CORS 설정

### 프론트엔드-백엔드 통합

**데이터 흐름**:
- 자동 캐싱으로 서버 상태를 관리하는 React Query
- 폴링을 통한 실시간 업데이트 (가격 데이터)
- React Hook Form + Zod 검증을 통한 폼 처리
- 문서 분석을 위한 FormData를 사용한 파일 업로드

**상태 관리**:
- 서버 상태: React Query (@tanstack/react-query)
- 로컬 상태: React 훅 (useState, useEffect)
- 폼 상태: Zod 스키마가 포함된 React Hook Form

### 환경 설정

**필수 환경 변수** (`.env`):
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_username  
DB_PASSWORD=your_password
DB_NAME=kpsdb
ACCOUNT_NUMBER=99911122222
```

**데이터베이스 설정**:
1. MariaDB 데이터베이스 생성: `CREATE DATABASE kpsdb;`
2. 스키마 실행: `source database/create_tables_only.sql`
3. 데이터 삽입: `source database/complete_database_setup.sql`
4. **데이터베이스 인증 정보**: 사용자명 `rebalance`, 비밀번호 `Kakaopay2025!` (스크립트에 하드코딩됨)

### 주요 페이지 및 기능

1. **포트폴리오 대시보드 (/)**: 실시간 보유량, 구성 차트, 손익 요약
2. **전략 생성 (/strategy-create)**: 리밸런싱이 포함된 인터랙티브 포트폴리오 빌더
3. **전략 비교 (/strategy-compare)**: 위험 평가 및 전략 분석
4. **관리자 페이지**:
   - **포트폴리오 관리** (`/admin/portfolio-management`): 보유량 및 예금 관리
   - **전략 학습** (`/admin/strategy-learning`): AI 전략 생성 인터페이스
   - **전략 상세** (`/admin/strategy-detail/{code}`): 개별 전략 분석

### 중요 개발 참고사항

**백엔드 개발**:
- 배포 전 항상 린트 검사 실행
- 가격 업데이터 시스템으로 메모리 사용량 모니터링  
- 파일 업로드는 multer 미들웨어 설정 필요
- 데이터베이스 쿼리는 보안을 위해 준비된 문 사용

**프론트엔드 개발**:
- 모든 임포트는 깨끗한 조직을 위해 `@/` 별칭 사용
- 컴포넌트는 shadcn/ui 패턴과 규칙을 따름
- Tailwind CSS를 사용한 모바일 우선 반응형 디자인
- UI 전반에 걸친 한국어 지원

**데이터베이스 관리**:
- 스키마 변경 전 가격 업데이터 중지 필수
- 외래 키 제약 조건으로 인해 신중한 데이터 삽입 순서 필요
- 모의 데이터에는 현실적인 한국 주식 심볼과 가격 포함
- 계좌번호 99911122222는 기본 테스트 계좌

**API 통합**:
- 백엔드는 포트 3001, 프론트엔드는 5173 (개발) / 8080 (프로덕션 스크립트)에서 실행
- 로컬 개발을 위한 CORS 설정
- 파일 업로드는 JSON이 아닌 FormData 필요
- 전략 이름은 사용자 정의이며 자동 생성되지 않음

## 프로덕션 운영

**배포 스크립트**:
- 시작 스크립트 (`./scripts/start.sh`)에는 데이터베이스 연결 테스트와 프로세스 관리 포함
- 프론트엔드 (포트 8080)와 백엔드 (포트 3001) 엔드포인트에 대한 상태 검사
- 자동 패키지 설치 및 로그 파일 관리
- 적절한 프로세스 제어를 위한 PID 파일 추적

**모니터링 및 로깅**:
- 자동 로테이션이 포함된 `logs/` 디렉토리에 로그 파일 저장
- 상태 스크립트는 다음을 포함한 종합적인 상태 모니터링 제공:
  - 프로세스 상태 (PID 추적)
  - 포트 가용성 (3001, 8080)
  - 서비스 응답 확인
  - 데이터베이스 연결성 및 레코드 수
  - 로그 파일에서 오류 감지

**프로세스 관리**:
- 타임아웃 처리를 통한 정상 종료
- 중지 시 자동 포트 정리
- 프로세스 고아 방지
- 응답하지 않는 서비스를 위한 강제 종료 대비책
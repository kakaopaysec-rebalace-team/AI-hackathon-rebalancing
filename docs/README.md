# 포트폴리오 관리 시스템 - 아키텍처 문서

이 디렉토리는 포트폴리오 관리 시스템의 아키텍처 설계 문서들을 포함하고 있습니다.

## 📋 문서 목록

### 1. [아키텍처 다이어그램](./architecture-diagram.md)
- 전체 시스템 아키텍처 개요
- 컴포넌트 구조 및 데이터 흐름
- 프론트엔드, 백엔드, 데이터베이스 관계
- 운영 환경 구성

### 2. [API 명세서](./api-specification.md)
- REST API 엔드포인트 상세 명세
- 요청/응답 형식 및 예제
- 에러 코드 및 처리 방법
- 파일 업로드 규칙

### 3. [ERD 다이어그램](./erd-diagram.md)
- 데이터베이스 테이블 구조
- 테이블 간 관계 및 제약조건
- 인덱스 및 성능 최적화
- 비즈니스 로직 쿼리 예제

### 4. [추가 아키텍처 도식](./additional-diagrams.md)
- 시퀀스 다이어그램 (포트폴리오 조회, AI 전략 학습)
- 데이터 플로우 다이어그램
- 배포 아키텍처
- 보안 아키텍처
- 성능 최적화 전략
- 에러 처리 흐름도

## 🎯 핵심 아키텍처 특징

### 시스템 구성
- **프론트엔드**: React SPA (Vite + TypeScript + Tailwind CSS)
- **백엔드**: Node.js + Express (REST API)
- **데이터베이스**: MariaDB (포트폴리오 및 실시간 주가 데이터)
- **실시간 처리**: 주가 업데이트 시뮬레이션 (1초 간격)

### AI 전략 학습 시스템
4가지 전략 생성 방법:
1. **USR**: 사용자 텍스트 입력 기반
2. **WEB**: 웹사이트 URL 분석 기반  
3. **DOC**: 문서 파일 분석 기반 (PDF, DOC, TXT, PPT)
4. **AUTO**: 자동 시장 분석 기반

### 운영 특징
- 스크립트 기반 배포 및 관리 (`start.sh`, `stop.sh`, `status.sh`)
- 실시간 모니터링 및 헬스체크
- 프로세스 관리 (PID 추적, 자동 재시작)
- 포괄적인 로깅 시스템

## 🔧 개발 환경 설정

### 필수 요구사항
- Node.js 14+
- MariaDB 10.3+
- npm 또는 yarn

### 빠른 시작
```bash
# 전체 시스템 시작
./scripts/start.sh

# 시스템 상태 확인
./scripts/status.sh

# 시스템 중지
./scripts/stop.sh
```

### 개별 서비스 시작
```bash
# 프론트엔드 (개발 모드)
npm run dev

# 백엔드
npm run server

# 백엔드 (메모리 최적화)
npm run server:memory
```

## 📊 주요 API 엔드포인트

### 잔고 관리
- `GET /api/balance/all` - 통합 잔고 데이터
- `GET /api/balance/holdings` - 보유종목
- `PUT /api/balance/rebalancing` - 리밸런싱 설정

### 전략 학습
- `POST /api/strategy-learning/generate/*` - 전략 생성
- `GET /api/strategy-learning/list` - 학습 전략 목록
- `POST /api/strategy-learning/apply/:code` - 전략 승격

### 가격 관리
- `GET /api/price/status` - 업데이터 상태
- `POST /api/price/start|stop|restart` - 업데이터 제어

## 🗃️ 데이터베이스 구조

### 핵심 테이블
- `customer_balance` - 고객 포트폴리오 보유량
- `stock_current_price` - 실시간 주가 (2500종목)
- `trading_history` - 거래 기록
- `strategy_learning` - AI 학습 전략
- `rebalancing_master` - 마스터 전략

### 특징
- 복합 기본키 설계 (계좌번호 + 종목코드)
- 성능 최적화 인덱스
- ENUM 타입 활용한 상태 관리
- JSON 타입 포트폴리오 구성 저장

## 🚀 성능 및 확장성

### 실시간 처리
- 1초 간격 주가 업데이트 (±5% 변동)
- 메모리 관리 및 배치 처리
- 연결 풀링 (최대 10개 연결)

### 캐싱 전략
- React Query 클라이언트 캐싱
- 실시간 데이터 TTL 관리
- 정적 데이터 장시간 캐싱

### 모니터링
- 프로세스 상태 추적
- 포트 가용성 확인
- 데이터베이스 연결 상태
- 에러 로그 자동 수집

## 🔒 보안 고려사항

### 현재 구현된 보안
- CORS 설정 (로컬 개발환경)
- SQL Prepared Statement
- 파일 업로드 타입 제한
- 요청 로깅

### 프로덕션 고려사항
- 인증/인가 시스템 구현 필요
- HTTPS 적용
- 데이터 암호화
- 보안 헤더 설정

---

## 📝 업데이트 이력

- **2025-01-13**: 초기 아키텍처 문서 작성
- 시스템 아키텍처 다이어그램 완성
- API 명세서 작성
- ERD 설계 문서화
- 운영 및 보안 아키텍처 추가

---

이 문서들은 시스템의 전체적인 구조를 이해하고, 개발 및 운영에 필요한 정보를 제공합니다. 각 문서는 독립적으로 참조 가능하며, 시스템 변경 시 함께 업데이트되어야 합니다.
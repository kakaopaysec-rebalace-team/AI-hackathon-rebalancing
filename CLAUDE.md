# CLAUDE.md

이 파일은 Claude Code (claude.ai/code)가 이 저장소에서 코드 작업을 할 때 참고할 가이드를 제공합니다.

## 개발 명령어

- **개발 서버 시작**: `npm run dev` (포트 8080에서 실행)
- **프로덕션 빌드**: `npm run build`
- **개발용 빌드**: `npm run build:dev`
- **코드 린트**: `npm run lint`
- **프로덕션 빌드 미리보기**: `npm run preview`

## 아키텍처 개요

Vite, TypeScript, shadcn/ui 컴포넌트로 구축된 React 기반 포트폴리오 관리 애플리케이션입니다. 한국 시장 중심의 포트폴리오 관리 및 전략 분석에 특화되어 있습니다.

### 핵심 구조

- **React SPA**: React Router를 사용한 네비게이션
- **상태 관리**: 서버 상태는 React Query (@tanstack/react-query), 로컬 상태는 React 훅 사용
- **UI 프레임워크**: Radix UI 기반의 shadcn/ui 컴포넌트와 Tailwind CSS
- **차트**: 데이터 시각화를 위한 Recharts 라이브러리
- **폼**: Zod 유효성 검사가 포함된 React Hook Form

### 주요 페이지 및 기능

1. **메인 페이지 (/)**: 보유 종목, 구성 차트, 요약을 보여주는 포트폴리오 대시보드
2. **전략 생성 (/strategy-create)**: 투자 전략 생성을 위한 편집 가능한 포트폴리오 구성 인터페이스
3. **전략 비교 (/strategy-compare)**: 고객 프로필과 포트폴리오 전략을 비교 분석하는 위험도 평가 페이지

### 컴포넌트 아키텍처

- **UI 컴포넌트**: `src/components/ui/`에 위치 - 재사용 가능한 shadcn/ui 컴포넌트
- **도메인 컴포넌트**: `src/components/`에 위치 - 포트폴리오 전용 컴포넌트:
  - `PortfolioSummary`: 총 가치 및 변동 표시
  - `PortfolioCard`: 개별 보유 종목 카드
  - `PortfolioComposition`: 자산 배분을 보여주는 파이 차트
  - `EditablePortfolioComposition`: 인터랙티브 구성 편집기
  - `BottomNavigation`: 모바일 우선 네비게이션

### 데이터 패턴

현재 앱에서 사용하는 목 데이터 구조:
- 한국 주식을 포함한 포트폴리오 보유 종목 (AAPL, TSLA, NVDA, AMZN, GOOGL)
- 최소 통화 단위로 저장된 가치 (예: 175000 = 1,750원)
- 고객 위험 프로필 및 전략 매칭 점수
- 포트폴리오 구성 비율 및 리밸런싱 데이터

### 스타일링 및 테마

- **Tailwind CSS**: 커스텀 설정 포함
- **CSS 변수**: next-themes를 통한 테마 지원
- **모바일 우선** 반응형 디자인
- UI 텍스트의 한국어 지원

### 경로 별칭

깔끔한 import를 위해 `src/` 디렉토리를 가리키는 `@/` 별칭 사용.

### 개발 참고사항

- TypeScript 지원 및 React hooks 규칙이 포함된 ESLint 설정
- 사용하지 않는 변수 경고 비활성화 (`@typescript-eslint/no-unused-vars: "off"`)
- 개발 모드에서 lovable-tagger를 통한 컴포넌트 태깅 활성화
- 포트 8080의 모든 인터페이스(`host: "::"`)에 바인딩되도록 서버 설정
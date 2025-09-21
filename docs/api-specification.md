# API 명세서

## 기본 정보

- **Base URL**: `http://localhost:3001`
- **Content-Type**: `application/json`
- **인증**: 없음 (개발 환경)

---

## 1. 헬스체크 API

### GET /health
시스템 상태를 확인합니다.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-01-13T10:30:00.000Z",
  "database": "Connected",
  "priceUpdater": {
    "running": true,
    "interval": "1000ms",
    "variation": "0.95~1.05x",
    "connected": true
  },
  "environment": "development"
}
```

---

## 2. 잔고 관리 API (/api/balance)

### GET /api/balance/holdings
고객의 보유종목 조회

**Response:**
```json
[
  {
    "stockCode": "005930",
    "stockName": "삼성전자",
    "quantity": 100,
    "purchaseAmount": 7500000,
    "currentPrice": 75000,
    "marketValue": 7500000,
    "profitLoss": 0,
    "profitLossRate": 0.0,
    "weight": 25.5
  }
]
```

### GET /api/balance/deposit
고객 예수금 조회

**Response:**
```json
{
  "accountNumber": "99911122222",
  "depositAmount": 1000000
}
```

### GET /api/balance/composition
포트폴리오 구성 조회

**Response:**
```json
[
  {
    "stockName": "삼성전자",
    "weight": 25.5,
    "value": 7500000
  }
]
```

### GET /api/balance/total-assets
총자산 조회

**Response:**
```json
{
  "totalStockValue": 15000000,
  "depositAmount": 1000000,
  "totalAssets": 16000000,
  "totalProfitLoss": 500000,
  "totalProfitLossRate": 3.33
}
```

### GET /api/balance/rebalancing
리밸런싱 상태 조회

**Response:**
```json
{
  "isEnabled": true,
  "period": "월간",
  "deviation": 5,
  "lastExecuted": "2025-01-01T00:00:00.000Z"
}
```

### PUT /api/balance/rebalancing
리밸런싱 상태 업데이트

**Request:**
```json
{
  "isEnabled": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "리밸런싱 상태가 업데이트되었습니다."
}
```

### GET /api/balance/all
모든 잔고 데이터 통합 조회

**Response:**
```json
{
  "holdingStocks": [...],
  "deposit": {...},
  "portfolioComposition": [...],
  "totalAssets": {...},
  "rebalancingStatus": {...},
  "errors": {
    "holdings": null,
    "deposit": null,
    "rebalancing": null
  }
}
```

### GET /api/balance/strategies/master
마스터 전략 목록 조회

**Response:**
```json
[
  {
    "strategyCode": "LOW_RISK_01",
    "strategyName": "안정형 포트폴리오",
    "riskLevel": "저위험",
    "expectedReturn": 5.5,
    "description": "안정적인 수익을 추구하는 전략"
  }
]
```

### POST /api/balance/strategies/save
고객 전략 저장

**Request:**
```json
{
  "strategyCode": "LOW_RISK_01",
  "customWeights": {
    "005930": 30,
    "000660": 25,
    "035420": 20
  }
}
```

### GET /api/balance/strategies/customer
고객 전략 조회

**Response:**
```json
{
  "strategyCode": "LOW_RISK_01",
  "customWeights": {...},
  "isActive": true
}
```

### POST /api/balance/current-prices
현재 시세 조회

**Request:**
```json
{
  "stockCodes": ["005930", "000660", "035420"]
}
```

**Response:**
```json
{
  "005930": {
    "currentPrice": 75000,
    "previousClose": 74000,
    "changeAmount": 1000,
    "changeRate": 1.35
  }
}
```

### POST /api/balance/simulate-portfolio
포트폴리오 시뮬레이션

**Request:**
```json
{
  "strategyCode": "MEDIUM_RISK_01"
}
```

**Response:**
```json
{
  "currentPortfolio": [...],
  "simulatedPortfolio": [...],
  "expectedReturn": 8.5,
  "risk": "중위험",
  "changes": [...]
}
```

---

## 3. 전략 학습 API (/api/strategy-learning)

### GET /api/strategy-learning/list
학습된 전략 목록 조회

**Query Parameters:**
- `status`: 전략 상태 (pending, approved, rejected)
- `method`: 생성 방법 (USR, WEB, DOC, AUTO)

**Response:**
```json
[
  {
    "strategyCode": "LEARN_001",
    "strategyName": "AI 생성 전략",
    "method": "AUTO",
    "status": "pending",
    "createdAt": "2025-01-13T10:00:00.000Z",
    "riskLevel": "중위험",
    "expectedReturn": 7.8
  }
]
```

### POST /api/strategy-learning/generate/user-input
사용자 입력 기반 전략 생성

**Request:**
```json
{
  "userInput": "보수적인 투자를 선호하며 배당주 중심의 포트폴리오를 원합니다.",
  "strategyName": "보수적 배당주 전략"
}
```

**Response:**
```json
{
  "success": true,
  "strategyCode": "USR_001",
  "message": "사용자 입력 기반 전략이 생성되었습니다."
}
```

### POST /api/strategy-learning/generate/website
웹사이트 분석 기반 전략 생성

**Request:**
```json
{
  "url": "https://example.com/investment-strategy",
  "strategyName": "웹 분석 전략"
}
```

**Response:**
```json
{
  "success": true,
  "strategyCode": "WEB_001",
  "message": "웹사이트 분석 기반 전략이 생성되었습니다."
}
```

### POST /api/strategy-learning/generate/document
문서 분석 기반 전략 생성

**Request:** `multipart/form-data`
- `files`: 업로드할 문서 파일들 (PDF, DOC, TXT, PPT)
- `strategyName`: 전략명

**Response:**
```json
{
  "success": true,
  "strategyCode": "DOC_001",
  "message": "문서 분석 기반 전략이 생성되었습니다.",
  "uploadedFiles": ["document1.pdf", "document2.docx"]
}
```

### POST /api/strategy-learning/generate/auto
자동 시장 분석 기반 전략 생성

**Request:**
```json
{
  "marketCondition": "상승장",
  "sector": "기술주",
  "strategyName": "자동 생성 전략"
}
```

**Response:**
```json
{
  "success": true,
  "strategyCode": "AUTO_001",
  "message": "자동 시장 분석 기반 전략이 생성되었습니다."
}
```

### POST /api/strategy-learning/apply/:strategyCode
학습 전략을 마스터 전략으로 승격

**Response:**
```json
{
  "success": true,
  "message": "전략이 마스터 전략으로 승격되었습니다."
}
```

### PUT /api/strategy-learning/:strategyCode/status
전략 상태 업데이트

**Request:**
```json
{
  "status": "approved",
  "notes": "승인 완료"
}
```

---

## 4. 가격 관리 API (/api/price)

### GET /api/price/status
가격 업데이터 상태 조회

**Response:**
```json
{
  "success": true,
  "data": {
    "isRunning": true,
    "interval": 1000,
    "variation": 0.05,
    "connected": true,
    "lastUpdate": "2025-01-13T10:30:00.000Z",
    "updatedCount": 2500
  },
  "message": "시세 업데이터가 실행 중입니다"
}
```

### POST /api/price/start
가격 업데이터 시작

**Response:**
```json
{
  "success": true,
  "message": "시세 업데이터가 시작되었습니다",
  "data": {...}
}
```

### POST /api/price/stop
가격 업데이터 중지

**Response:**
```json
{
  "success": true,
  "message": "시세 업데이터가 중지되었습니다",
  "data": {...}
}
```

### POST /api/price/restart
가격 업데이터 재시작

**Response:**
```json
{
  "success": true,
  "message": "시세 업데이터가 재시작되었습니다",
  "data": {...}
}
```

### PUT /api/price/config
가격 업데이터 설정 변경

**Request:**
```json
{
  "interval": 2000,
  "variation": 0.03
}
```

**Response:**
```json
{
  "success": true,
  "message": "시세 업데이터 설정이 변경되었습니다",
  "data": {...}
}
```

### POST /api/price/exclude
종목을 가격 업데이트에서 제외

**Request:**
```json
{
  "stockCode": "005930"
}
```

**Response:**
```json
{
  "success": true,
  "message": "종목 005930을 시세 업데이트에서 제외했습니다",
  "excludedStocks": ["005930"]
}
```

### POST /api/price/include
종목을 가격 업데이트에 다시 포함

**Request:**
```json
{
  "stockCode": "005930"
}
```

### GET /api/price/excluded
제외된 종목 목록 조회

**Response:**
```json
{
  "success": true,
  "data": ["005930", "000660"],
  "message": "제외된 종목 목록"
}
```

---

## 5. 포트폴리오 관리 API (/api/portfolio-management)

### GET /api/portfolio-management/stats
포트폴리오 관리 통계

**Response:**
```json
{
  "success": true,
  "data": {
    "totalStrategies": 15,
    "appliedCustomers": 3,
    "totalManagedAssets": 50000000
  }
}
```

---

## 공통 에러 응답

### 400 Bad Request
```json
{
  "success": false,
  "error": "잘못된 요청입니다.",
  "details": "필수 파라미터가 누락되었습니다."
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "서버 내부 오류가 발생했습니다.",
  "details": "Database connection failed"
}
```

---

## 파일 업로드 규칙

### 지원 파일 형식
- PDF: `.pdf`
- Word: `.doc`, `.docx`
- PowerPoint: `.ppt`, `.pptx`
- Text: `.txt`

### 업로드 제한
- 최대 파일 크기: 10MB
- 최대 파일 개수: 5개
- 저장 방식: 메모리 저장 (임시 처리)

---

## 실시간 데이터 업데이트

### 주가 업데이트 주기
- 간격: 1000ms (1초)
- 변동률: ±5% (0.95-1.05배)
- 대상: 약 2500개 한국 주식

### 폴링 권장사항
- 포트폴리오 데이터: 5초 간격
- 실시간 주가: 1-2초 간격
- 전략 목록: 필요시에만
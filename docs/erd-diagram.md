# ERD (Entity Relationship Diagram)

## 포트폴리오 관리 시스템 데이터베이스 설계

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                               포트폴리오 관리 시스템 ERD                                 │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────┐    ┌─────────────────────────────┐    ┌─────────────────────────────┐
│       stock_info            │    │    stock_current_price      │    │     customer_balance        │
├─────────────────────────────┤    ├─────────────────────────────┤    ├─────────────────────────────┤
│ stock_code (PK)    VARCHAR  │◄──►│ stock_code (PK)    VARCHAR  │    │ account_number (PK) VARCHAR │
│ stock_name         VARCHAR  │    │ current_price      DECIMAL  │    │ stock_code (PK)     VARCHAR │
│ market             VARCHAR  │    │ previous_close     DECIMAL  │    │ stock_name          VARCHAR │
│ sector             VARCHAR  │    │ change_amount      DECIMAL  │    │ quantity            INT     │
│ industry           VARCHAR  │    │ change_rate        DECIMAL  │    │ purchase_amount     DECIMAL │
│ listing_date       DATE     │    │ volume             BIGINT   │    │ purchase_date       DATE    │
│ description        TEXT     │    │ market_cap         BIGINT   │    └─────────────────────────────┘
└─────────────────────────────┘    │ last_updated       TIMESTAMP│                  │
                                   └─────────────────────────────┘                  │
                                                                                    │
┌─────────────────────────────┐    ┌─────────────────────────────┐                  │
│     customer_deposit        │    │      trading_history        │                  │
├─────────────────────────────┤    ├─────────────────────────────┤                  │
│ account_number (PK) VARCHAR │    │ trade_id (PK)       INT     │                  │
│ deposit_amount      DECIMAL │    │ account_number      VARCHAR │◄─────────────────┘
└─────────────────────────────┘    │ stock_code          VARCHAR │
                                   │ stock_name          VARCHAR │
                                   │ trade_type          ENUM    │
                                   │ quantity            INT     │
                                   │ trade_price         DECIMAL │
                                   │ trade_amount        DECIMAL │
                                   │ fee                 DECIMAL │
                                   │ tax                 DECIMAL │
                                   │ trade_date          DATETIME│
                                   │ created_at          TIMESTAMP│
                                   └─────────────────────────────┘

┌─────────────────────────────┐    ┌─────────────────────────────┐    ┌─────────────────────────────┐
│     strategy_settings       │    │      rebalancing            │    │    customer_strategy        │
├─────────────────────────────┤    ├─────────────────────────────┤    ├─────────────────────────────┤
│ strategy_id (PK)    INT     │◄──►│ rebalancing_id (PK)  INT    │    │ account_number (PK) VARCHAR │
│ account_number      VARCHAR │    │ account_number       VARCHAR│    │ strategy_code       VARCHAR │
│ strategy_name       VARCHAR │    │ strategy_id (FK)     INT    │    │ rebalancing_yn      ENUM    │
│ risk_level          ENUM    │    │ rebalancing_date     DATE   │    │ rebalancing_period  ENUM    │
│ target_return       DECIMAL │    │ status               ENUM   │    │ deviation_threshold DECIMAL │
│ rebalancing_period  ENUM    │    │ total_amount         DECIMAL│    │ created_at          TIMESTAMP│
│ is_active           BOOLEAN │    │ notes                TEXT   │    │ updated_at          TIMESTAMP│
│ created_at          TIMESTAMP│    │ created_at           TIMESTAMP│   └─────────────────────────────┘
│ updated_at          TIMESTAMP│    │ updated_at           TIMESTAMP│
└─────────────────────────────┘    └─────────────────────────────┘

┌─────────────────────────────┐    ┌─────────────────────────────┐
│    rebalancing_master       │    │     strategy_learning       │
├─────────────────────────────┤    ├─────────────────────────────┤
│ strategy_code (PK)  VARCHAR │    │ strategy_code (PK)  VARCHAR │
│ strategy_name       VARCHAR │    │ strategy_name       VARCHAR │
│ risk_level          ENUM    │    │ generation_method   ENUM    │
│ expected_return     DECIMAL │    │ input_source        TEXT    │
│ description         TEXT    │    │ risk_level          ENUM    │
│ portfolio_weights   JSON    │    │ expected_return     DECIMAL │
│ rebalancing_rule    TEXT    │    │ portfolio_composition JSON  │
│ is_active           BOOLEAN │    │ status              ENUM    │
│ created_at          TIMESTAMP│    │ created_at          TIMESTAMP│
│ updated_at          TIMESTAMP│    │ updated_at          TIMESTAMP│
└─────────────────────────────┘    │ applied_at          TIMESTAMP│
                                   │ notes               TEXT    │
                                   └─────────────────────────────┘
```

## 테이블별 상세 관계

### 1. 주식 정보 관련 테이블

#### stock_info ↔ stock_current_price (1:1)
- **관계**: `stock_info.stock_code = stock_current_price.stock_code`
- **설명**: 종목 기본정보와 실시간 가격 정보

#### stock_current_price ↔ customer_balance (1:N)
- **관계**: `stock_current_price.stock_code = customer_balance.stock_code`
- **설명**: 실시간 가격을 통한 포트폴리오 평가

### 2. 고객 관련 테이블

#### customer_balance ↔ trading_history (1:N)
- **관계**: `customer_balance.account_number = trading_history.account_number`
- **설명**: 고객 잔고와 거래 이력 연결

#### customer_balance ↔ customer_deposit (N:1)
- **관계**: `customer_balance.account_number = customer_deposit.account_number`
- **설명**: 고객별 예수금 관리

### 3. 전략 관련 테이블

#### strategy_settings ↔ rebalancing (1:N)
- **관계**: `strategy_settings.strategy_id = rebalancing.strategy_id`
- **설명**: 전략 설정에 따른 리밸런싱 실행 이력

#### customer_strategy (독립)
- **설명**: 고객별 전략 설정 및 리밸런싱 상태 관리

#### rebalancing_master (독립)
- **설명**: 시스템에서 제공하는 마스터 전략들

#### strategy_learning ↔ rebalancing_master (승격 관계)
- **관계**: AI 학습을 통해 생성된 전략이 승인되면 마스터 전략으로 승격
- **설명**: `strategy_learning.status = 'approved'` → `rebalancing_master`로 복사

## 주요 제약조건 및 인덱스

### Primary Keys
```sql
-- 복합 키
customer_balance: (account_number, stock_code)

-- 단일 키
stock_info: stock_code
stock_current_price: stock_code
customer_deposit: account_number
trading_history: trade_id (AUTO_INCREMENT)
strategy_settings: strategy_id (AUTO_INCREMENT)
rebalancing: rebalancing_id (AUTO_INCREMENT)
rebalancing_master: strategy_code
strategy_learning: strategy_code
customer_strategy: account_number
```

### Foreign Keys
```sql
rebalancing.strategy_id → strategy_settings.strategy_id
```

### 성능 최적화 인덱스
```sql
-- 조회 성능 개선을 위한 인덱스
CREATE INDEX idx_stock_current_price_updated ON stock_current_price(last_updated);
CREATE INDEX idx_stock_info_name ON stock_info(stock_name);
CREATE INDEX idx_customer_balance_account ON customer_balance(account_number);
CREATE INDEX idx_trading_history_account ON trading_history(account_number);
CREATE INDEX idx_trading_history_date ON trading_history(trade_date);
CREATE INDEX idx_strategy_settings_account ON strategy_settings(account_number);
CREATE INDEX idx_rebalancing_account ON rebalancing(account_number);
CREATE INDEX idx_rebalancing_date ON rebalancing(rebalancing_date);
```

## 데이터 타입 및 제약조건

### ENUM 타입 정의
```sql
-- 거래 구분
trade_type: ENUM('매수', '매도')

-- 위험 수준
risk_level: ENUM('저위험', '중위험', '고위험')

-- 리밸런싱 주기
rebalancing_period: ENUM('월간', '분기', '반기', '연간')

-- 리밸런싱 상태
status: ENUM('대기', '진행중', '완료', '실패')

-- 리밸런싱 여부
rebalancing_yn: ENUM('Y', 'N')

-- 전략 생성 방법
generation_method: ENUM('USR', 'WEB', 'DOC', 'AUTO')

-- 전략 상태
strategy_status: ENUM('pending', 'approved', 'rejected')
```

### 금액 관련 정밀도
```sql
-- 금액: DECIMAL(15,2) - 최대 999조원, 소수점 2자리
purchase_amount, trade_amount, total_amount, deposit_amount

-- 가격: DECIMAL(10,2) - 최대 9천9백만원, 소수점 2자리  
current_price, previous_close, change_amount, trade_price

-- 비율: DECIMAL(5,2) - ±999.99%, 소수점 2자리
change_rate, target_return, expected_return
```

## 비즈니스 로직

### 1. 포트폴리오 평가 로직
```sql
-- 실시간 포트폴리오 평가
SELECT 
  cb.stock_code,
  cb.stock_name,
  cb.quantity,
  cb.purchase_amount,
  scp.current_price,
  (cb.quantity * scp.current_price) as market_value,
  (cb.quantity * scp.current_price - cb.purchase_amount) as profit_loss,
  ((cb.quantity * scp.current_price - cb.purchase_amount) / cb.purchase_amount * 100) as profit_loss_rate
FROM customer_balance cb
JOIN stock_current_price scp ON cb.stock_code = scp.stock_code
WHERE cb.account_number = ?;
```

### 2. 전략 승격 프로세스
```sql
-- AI 학습 전략 → 마스터 전략 승격
INSERT INTO rebalancing_master (
  strategy_code, strategy_name, risk_level, expected_return, 
  description, portfolio_weights, is_active
)
SELECT 
  strategy_code, strategy_name, risk_level, expected_return,
  CONCAT('AI 학습 전략 (', generation_method, ')'), 
  portfolio_composition, TRUE
FROM strategy_learning 
WHERE strategy_code = ? AND status = 'approved';

-- 승격 완료 후 적용 일시 업데이트
UPDATE strategy_learning 
SET applied_at = NOW() 
WHERE strategy_code = ?;
```

### 3. 리밸런싱 실행 조건
```sql
-- 리밸런싱이 필요한 고객 조회
SELECT cs.account_number, cs.strategy_code, cs.deviation_threshold
FROM customer_strategy cs
WHERE cs.rebalancing_yn = 'Y'
  AND cs.account_number IN (
    SELECT DISTINCT account_number 
    FROM customer_balance
  );
```
# 데이터베이스 스키마 문서

포트폴리오 관리 시스템을 위한 MariaDB 데이터베이스 스키마 정의

## 테이블 구조

### 1. 고객잔고 (customer_balance)
고객의 현재 보유 종목과 수량 정보를 관리

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | BIGINT | PK, AUTO_INCREMENT | 고유ID |
| account_number | CHAR(12) | NOT NULL | 계좌번호 (12자리) |
| stock_code | VARCHAR(10) | NOT NULL, FK | 종목코드 |
| stock_name | VARCHAR(100) | NOT NULL | 종목명 |
| quantity | BIGINT | NOT NULL, DEFAULT 0 | 수량 |
| purchase_amount | DECIMAL(15,2) | NOT NULL, DEFAULT 0 | 매수금액 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 생성일시 |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | 수정일시 |

**Primary Key**: id
**Unique Key**: (account_number, stock_code)
**Foreign Key**: stock_code → stock_current_price.stock_code

### 2. 매매내역 (trading_history)
고객의 매매 거래 이력을 관리

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| account_number | CHAR(12) | PK, NOT NULL | 계좌번호 (12자리) |
| trading_date | CHAR(8) | PK, NOT NULL | 매매일자 (YYYYMMDD) |
| order_number | VARCHAR(20) | PK, NOT NULL | 주문번호 |
| execution_number | VARCHAR(20) | PK, NOT NULL | 체결번호 |
| stock_code | VARCHAR(10) | NOT NULL, FK | 종목코드 |
| buy_sell_code | CHAR(1) | NOT NULL, CHECK('1','2') | 매수매도구분 (1:매수, 2:매도) |
| order_quantity | BIGINT | NOT NULL, DEFAULT 0 | 주문수량 |
| order_amount | DECIMAL(15,2) | NOT NULL, DEFAULT 0 | 주문금액 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 생성일시 |

**Primary Key**: (account_number, trading_date, order_number, execution_number)
**Foreign Key**: stock_code → stock_current_price.stock_code
**Index**: stock_code, trading_date

### 3. 종목현재가 (stock_current_price)
종목별 현재가 정보를 관리

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| stock_code | VARCHAR(10) | PK, NOT NULL | 종목코드 |
| current_price | DECIMAL(15,2) | NOT NULL, DEFAULT 0 | 현재가 |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | 수정일시 |

**Primary Key**: stock_code

### 4. 고객전략 (customer_strategy)
고객별 리밸런싱 전략 설정 정보를 관리

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| account_number | CHAR(12) | PK, NOT NULL | 계좌번호 (12자리) |
| rebalancing_strategy_code | VARCHAR(20) | NOT NULL, FK | 리밸런싱전략코드 |
| rebalancing_cycle | INT | NOT NULL, DEFAULT 0 | 리밸런싱주기 (일) |
| allowed_deviation | DECIMAL(5,2) | NOT NULL, DEFAULT 0 | 허용편차 (%) |
| rebalancing_yn | CHAR(1) | NOT NULL, DEFAULT 'N', CHECK('Y','N') | 리밸런싱YN |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 생성일시 |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | 수정일시 |

**Primary Key**: account_number
**Foreign Key**: rebalancing_strategy_code → rebalancing_master.rebalancing_strategy_code
**Index**: rebalancing_strategy_code

### 5. 리밸런싱마스터 (rebalancing_master)
리밸런싱 전략의 기본 정보를 관리

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| rebalancing_strategy_code | VARCHAR(20) | PK, NOT NULL | 리밸런싱전략코드 |
| rebalancing_name | VARCHAR(100) | NOT NULL | 리밸런싱이름 |
| rebalancing_description | TEXT | NULL | 리밸런싱설명 |
| risk_level | ENUM | NOT NULL | 위험도 (초저위험, 저위험, 중위험, 고위험, 초고위험) |
| investment_style | ENUM | NOT NULL | 투자스타일 (가치투자, 성장투자, 배당투자, 지수추종, 단기/스윙, 퀀트/시스템트레이딩, 테마/모멘텀) |
| keyword1 | VARCHAR(50) | NULL | 키워드1 |
| keyword2 | VARCHAR(50) | NULL | 키워드2 |
| keyword3 | VARCHAR(50) | NULL | 키워드3 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 생성일시 |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | 수정일시 |

**Primary Key**: rebalancing_strategy_code

### 6. 리밸런싱분석 (rebalancing_analysis)
리밸런싱 전략의 분석 데이터를 관리

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| rebalancing_strategy_code | VARCHAR(20) | PK, NOT NULL, FK | 리밸런싱전략코드 |
| expected_return | DECIMAL(5,2) | NOT NULL, DEFAULT 0 | 예상수익률 (%) |
| volatility | DECIMAL(5,2) | NOT NULL, DEFAULT 0 | 변동성 (%) |
| max_drawdown | DECIMAL(5,2) | NOT NULL, DEFAULT 0 | 최대낙폭 (%) |
| investor_preference | INT | NOT NULL, DEFAULT 0 | 투자자선호도 (점수) |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 생성일시 |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | 수정일시 |

**Primary Key**: rebalancing_strategy_code
**Foreign Key**: rebalancing_strategy_code → rebalancing_master.rebalancing_strategy_code

## 테이블 관계도

```
rebalancing_master (1) ← (1) customer_strategy (N) → (1) customer_balance
       ↓ (1)                                              ↓ (N)
rebalancing_analysis                              stock_current_price
                                                         ↑ (1)
                                                  trading_history (N)
```

## 주요 비즈니스 규칙

1. **계좌번호**: 모든 계좌번호는 12자리 고정
2. **매매일자**: YYYYMMDD 형식의 8자리 문자열
3. **매수매도구분**: 1(매수), 2(매도)
4. **리밸런싱YN**: Y(사용), N(미사용)
5. **위험도**: 5단계 (초저위험 → 초고위험)
6. **투자스타일**: 7가지 스타일 중 선택

## 인덱스 전략

- **거래 조회 최적화**: trading_history 테이블의 stock_code, trading_date 인덱스
- **전략 검색 최적화**: customer_strategy 테이블의 rebalancing_strategy_code 인덱스

## 데이터 타입 선택 이유

- **DECIMAL**: 금융 데이터의 정확성을 위해 부동소수점 대신 사용
- **CHAR vs VARCHAR**: 고정 길이 데이터(계좌번호, 매매일자)는 CHAR 사용
- **ENUM**: 제한된 값 목록을 가진 컬럼에 사용하여 데이터 무결성 보장
- **TEXT**: 길이가 가변적인 설명 컬럼에 사용
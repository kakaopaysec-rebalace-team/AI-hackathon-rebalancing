# 데이터베이스 설정 및 Mock 데이터 생성 가이드

## 실행 순서

### 1. 테이블 생성
```sql
-- 새로운 데이터베이스인 경우
source create_tables.sql

-- 기존 테이블 구조 변경이 필요한 경우
source alter_customer_balance.sql
```

### 2. Mock 데이터 삽입
```sql
-- 기본 Mock 데이터 (종목현재가, 리밸런싱 전략, 고객잔고 등)
source insert_mock_data.sql

-- 추가 매매내역 (930건)
source insert_trading_history.sql
```

## 생성되는 데이터 현황

### 종목현재가 테이블 (~200개 종목)
- 대형주: 삼성전자, SK하이닉스, NAVER 등
- 중형주: 엔씨소프트, 넷마블, 카카오페이 등  
- 소형주 및 바이오/게임/IT 종목들
- 국내 주요 종목들을 망라하여 구성

### 고객잔고 (계좌번호: 99911122222)
| 종목코드 | 종목명 | 수량 | 매수금액 |
|---------|-------|------|---------|
| 005930 | 삼성전자 | 500주 | 72,000원 |
| 000660 | SK하이닉스 | 150주 | 138,000원 |
| 035420 | NAVER | 80주 | 178,000원 |
| ... | ... | ... | ... |
| **총 20개 종목** | | | |

### 매매내역 (약 100여건 + 추가 생성)
- 현재 잔고 형성을 위한 매수 거래들
- 청산된 종목들의 매수/매도 쌍
- 단타 매매 거래들
- 매매일자: 2025-08-01 ~ 2025-08-31

### 리밸런싱 전략 (15개)
1. **GROWTH_TECH_001**: 기술성장형 포트폴리오 (고위험, 성장투자)
2. **DIVIDEND_STABLE_002**: 안정배당형 포트폴리오 (저위험, 배당투자)
3. **VALUE_PICK_003**: 가치발굴형 포트폴리오 (중위험, 가치투자)
4. **ESG_SUSTAINABLE_004**: ESG 지속가능 포트폴리오 (중위험, 성장투자)
5. **KOSPI_INDEX_005**: KOSPI 추종형 포트폴리오 (중위험, 지수추종)
6. **MOMENTUM_SWING_006**: 모멘텀 스윙 포트폴리오 (고위험, 단기/스윙)
7. **QUANT_SYSTEM_007**: 퀀트 시스템 포트폴리오 (고위험, 퀀트/시스템트레이딩)
8. **CONSERVATIVE_008**: 보수적 안전자산 포트폴리오 (초저위험, 배당투자)
9. **BLUE_CHIP_009**: 우량주 중심 포트폴리오 (저위험, 가치투자)
10. **SMALL_CAP_010**: 중소형주 성장 포트폴리오 (초고위험, 성장투자)
11. **K_BATTERY_011**: K-배터리 테마 포트폴리오 (고위험, 테마/모멘텀)
12. **HEALTHCARE_012**: 헬스케어 특화 포트폴리오 (고위험, 성장투자)
13. **GLOBAL_EXPORT_013**: 글로벌 수출주 포트폴리오 (중위험, 성장투자)
14. **DEFENSIVE_014**: 방어적 포트폴리오 (저위험, 배당투자)
15. **AI_DIGITAL_015**: AI 디지털 혁신 포트폴리오 (초고위험, 성장투자)

### 고객전략
- 계좌번호 99911122222는 'GROWTH_TECH_001' 전략 사용
- 리밸런싱 주기: 30일
- 허용편차: 5%
- 리밸런싱 활성화: Y

## 데이터 검증 쿼리

### 1. 테이블별 데이터 건수 확인
```sql
SELECT 'stock_current_price' as table_name, COUNT(*) as count FROM stock_current_price
UNION ALL
SELECT 'rebalancing_master' as table_name, COUNT(*) as count FROM rebalancing_master
UNION ALL
SELECT 'rebalancing_analysis' as table_name, COUNT(*) as count FROM rebalancing_analysis
UNION ALL
SELECT 'customer_balance' as table_name, COUNT(*) as count FROM customer_balance
UNION ALL
SELECT 'customer_strategy' as table_name, COUNT(*) as count FROM customer_strategy
UNION ALL
SELECT 'trading_history' as table_name, COUNT(*) as count FROM trading_history;
```

### 2. 고객 포트폴리오 현황 (손익 포함)
```sql
SELECT 
    cb.stock_code,
    cb.stock_name,
    cb.quantity,
    cb.purchase_amount,
    scp.current_price,
    (cb.quantity * scp.current_price) as current_value,
    (cb.quantity * scp.current_price - cb.quantity * cb.purchase_amount) as unrealized_pnl,
    ROUND(((scp.current_price - cb.purchase_amount) / cb.purchase_amount * 100), 2) as pnl_rate
FROM customer_balance cb
JOIN stock_current_price scp ON cb.stock_code = scp.stock_code
WHERE cb.account_number = '99911122222'
ORDER BY current_value DESC;
```

### 3. 매매내역 요약
```sql
SELECT 
    stock_code,
    buy_sell_code,
    COUNT(*) as trade_count,
    SUM(order_quantity) as total_quantity,
    AVG(order_amount) as avg_price
FROM trading_history 
WHERE account_number = '99911122222'
GROUP BY stock_code, buy_sell_code
ORDER BY stock_code, buy_sell_code;
```

### 4. 리밸런싱 전략별 위험도 분포
```sql
SELECT 
    risk_level,
    COUNT(*) as strategy_count,
    GROUP_CONCAT(rebalancing_name SEPARATOR ', ') as strategies
FROM rebalancing_master
GROUP BY risk_level
ORDER BY 
    CASE risk_level 
        WHEN '초저위험' THEN 1
        WHEN '저위험' THEN 2
        WHEN '중위험' THEN 3
        WHEN '고위험' THEN 4
        WHEN '초고위험' THEN 5
    END;
```

## 주의사항

1. **외래키 제약조건**: 데이터 삽입 순서를 반드시 지켜야 함
   - stock_current_price → customer_balance
   - rebalancing_master → rebalancing_analysis, customer_strategy

2. **데이터 일관성**: 고객잔고와 매매내역의 수량이 일치하도록 설계됨

3. **재실행시**: TRUNCATE 문이 포함되어 있어 기존 데이터가 모두 삭제됨

4. **성능**: 대량 데이터 삽입시 시간이 소요될 수 있음
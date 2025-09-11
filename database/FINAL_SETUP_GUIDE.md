# 📊 포트폴리오 관리 시스템 데이터베이스 최종 설정 가이드

## 🎯 개요
MariaDB를 사용한 포트폴리오 관리 시스템의 완전한 Mock 데이터 세트업 가이드입니다.

## 📂 생성된 파일 목록

### 🔧 핵심 스크립트
- **`create_tables.sql`** - 6개 테이블 생성 (PK 수정 반영)
- **`alter_customer_balance.sql`** - 기존 테이블 PK 변경용 (필요시)
- **`insert_mock_data_fixed.sql`** - 메인 Mock 데이터 (중복 제거)
- **`insert_trading_930.sql`** - 매매내역 160건
- **`insert_remaining_trades.sql`** - 매매내역 나머지 770건 (자동생성)

### 📖 문서
- **`schema.md`** - 데이터베이스 스키마 문서
- **`README.md`** - 기본 실행 가이드
- **`FINAL_SETUP_GUIDE.md`** - 이 파일

### 🐍 유틸리티
- **`generate_final_trades.py`** - 매매내역 자동 생성 스크립트

## ⚡ 빠른 설정 (권장)

### 1️⃣ 새 데이터베이스 설정
```sql
-- 1. 테이블 생성
source /Users/todd.rsp/kps_hacker/port-tune-up/database/create_tables.sql

-- 2. 기본 데이터 삽입 (종목현재가, 리밸런싱 전략, 고객잔고)
source /Users/todd.rsp/kps_hacker/port-tune-up/database/insert_mock_data_fixed.sql

-- 3. 매매내역 삽입 (160건)
source /Users/todd.rsp/kps_hacker/port-tune-up/database/insert_trading_930.sql

-- 4. 매매내역 추가 (770건)
source /Users/todd.rsp/kps_hacker/port-tune-up/database/insert_remaining_trades.sql
```

### 2️⃣ 기존 테이블 수정이 필요한 경우
```sql
-- 고객잔고 테이블 PK 변경
source /Users/todd.rsp/kps_hacker/port-tune-up/database/alter_customer_balance.sql
```

## 📊 생성되는 데이터 현황

### 🏢 종목현재가 테이블
- **총 500개 종목**
  - 대형주 50개 (삼성전자, SK하이닉스 등)
  - 중형주 150개 (엔씨소프트, 카카오 등) 
  - 소형주 300개 (6자리 가상 코드)

### 👤 고객 데이터 (계좌: 99911122222)
- **잔고**: 20개 종목 보유
- **매매내역**: 정확히 930건
- **전략**: 기술성장형 포트폴리오 사용

### 🎯 리밸런싱 전략
- **15개 전략** 완전 세트
- 위험도별: 초저위험 → 초고위험
- 스타일별: 가치/성장/배당/지수추종/단기/퀀트/테마

## 🔍 데이터 검증 쿼리

### 전체 데이터 건수 확인
```sql
SELECT 'stock_current_price' as table_name, COUNT(*) as count FROM stock_current_price
UNION ALL
SELECT 'customer_balance' as table_name, COUNT(*) as count FROM customer_balance
UNION ALL
SELECT 'trading_history' as table_name, COUNT(*) as count FROM trading_history
UNION ALL
SELECT 'rebalancing_master' as table_name, COUNT(*) as count FROM rebalancing_master
UNION ALL
SELECT 'rebalancing_analysis' as table_name, COUNT(*) as count FROM rebalancing_analysis
UNION ALL
SELECT 'customer_strategy' as table_name, COUNT(*) as count FROM customer_strategy;
```

### 매매내역 검증
```sql
-- 정확히 930건인지 확인
SELECT COUNT(*) as total_trades 
FROM trading_history 
WHERE account_number = '99911122222';

-- 매수/매도 비율 확인
SELECT 
    buy_sell_code,
    CASE 
        WHEN buy_sell_code = '1' THEN '매수'
        WHEN buy_sell_code = '2' THEN '매도'
    END as trade_type,
    COUNT(*) as count
FROM trading_history 
WHERE account_number = '99911122222'
GROUP BY buy_sell_code;
```

### 포트폴리오 손익 현황
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

## 🎯 예상 결과값

### 테이블별 데이터 건수
| 테이블명 | 예상 건수 | 설명 |
|---------|----------|------|
| stock_current_price | 500건 | 국내주식 종목 |
| customer_balance | 20건 | 고객 보유종목 |
| trading_history | 930건 | 매매내역 |
| rebalancing_master | 15건 | 리밸런싱 전략 |
| rebalancing_analysis | 15건 | 전략 분석데이터 |
| customer_strategy | 1건 | 고객 전략설정 |

### 매매내역 분포
- **현재 잔고 형성**: 40건 (실제 보유종목 매수)
- **청산 완료 종목**: 60건 (매수→매도 완료)
- **단타 매매**: 830건 (다양한 종목 단기거래)

## ⚠️ 주의사항

### 1. 실행 순서 준수
반드시 외래키 제약조건을 고려하여 순서대로 실행:
1. 종목현재가 → 고객잔고, 매매내역
2. 리밸런싱마스터 → 리밸런싱분석, 고객전략

### 2. PK 중복 방지
- 모든 스크립트에서 PK 중복이 없도록 설계됨
- 재실행시 TRUNCATE로 기존 데이터 초기화

### 3. 데이터 일관성
- 고객잔고와 매매내역의 수량이 논리적으로 일치
- 매매일자는 2025-08-01 ~ 2025-08-31 범위

### 4. 성능 고려사항
- 대량 INSERT로 인해 시간 소요 가능 (특히 매매내역)
- 필요시 배치 단위로 나누어 실행 권장

## 🔧 트러블슈팅

### Q: 외래키 오류 발생시
```sql
SET FOREIGN_KEY_CHECKS = 0;
-- 데이터 삽입
SET FOREIGN_KEY_CHECKS = 1;
```

### Q: 데이터 재생성이 필요한 경우
```sql
-- 전체 데이터 삭제 후 재실행
TRUNCATE TABLE rebalancing_analysis;
TRUNCATE TABLE customer_strategy;
TRUNCATE TABLE rebalancing_master;
TRUNCATE TABLE trading_history;
TRUNCATE TABLE customer_balance;
TRUNCATE TABLE stock_current_price;
```

### Q: 매매내역 추가 생성이 필요한 경우
```bash
cd /Users/todd.rsp/kps_hacker/port-tune-up/database
python3 generate_final_trades.py
```

## ✅ 완료 체크리스트

- [ ] 환경변수 설정 (.env)
- [ ] 테이블 생성 완료
- [ ] 종목현재가 500건 확인
- [ ] 고객잔고 20건 확인  
- [ ] 매매내역 930건 확인
- [ ] 리밸런싱 전략 15건 확인
- [ ] 외래키 제약조건 정상 작동 확인
- [ ] 포트폴리오 손익 계산 정상 확인

---

🎉 **모든 설정이 완료되면 포트폴리오 관리 시스템의 완전한 Mock 환경이 구축됩니다!**
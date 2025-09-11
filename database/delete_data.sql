-- 6개 테이블 데이터 전체 삭제 스크립트
-- 외래키 의존성을 고려한 안전한 삭제 순서

USE kpsdb;

-- 외래키 제약조건 임시 해제 (안전한 삭제를 위해)
SET FOREIGN_KEY_CHECKS = 0;

-- 의존성 순서에 맞춰 데이터 삭제
-- 1. 자식 테이블부터 삭제
DELETE FROM rebalancing_analysis;
DELETE FROM customer_strategy; 
DELETE FROM customer_balance;
DELETE FROM trading_history;

-- 2. 부모 테이블 삭제
DELETE FROM rebalancing_master;
DELETE FROM stock_current_price;

-- 외래키 제약조건 복원
SET FOREIGN_KEY_CHECKS = 1;

-- 삭제 결과 확인
SELECT 'stock_current_price' as table_name, COUNT(*) as remaining_rows FROM stock_current_price
UNION ALL
SELECT 'customer_balance' as table_name, COUNT(*) as remaining_rows FROM customer_balance
UNION ALL
SELECT 'trading_history' as table_name, COUNT(*) as remaining_rows FROM trading_history
UNION ALL
SELECT 'rebalancing_master' as table_name, COUNT(*) as remaining_rows FROM rebalancing_master
UNION ALL
SELECT 'rebalancing_analysis' as table_name, COUNT(*) as remaining_rows FROM rebalancing_analysis
UNION ALL
SELECT 'customer_strategy' as table_name, COUNT(*) as remaining_rows FROM customer_strategy;

-- 확인 메시지
SELECT '✅ 모든 테이블 데이터가 성공적으로 삭제되었습니다.' as result;
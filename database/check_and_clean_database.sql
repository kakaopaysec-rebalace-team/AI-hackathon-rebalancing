-- 데이터베이스 기존 데이터 확인 및 정리 스크립트

USE kpsdb;

-- 1. 현재 테이블별 데이터 건수 확인
SELECT 'stock_current_price' as table_name, COUNT(*) as row_count FROM stock_current_price
UNION ALL
SELECT 'customer_balance' as table_name, COUNT(*) as row_count FROM customer_balance
UNION ALL
SELECT 'trading_history' as table_name, COUNT(*) as row_count FROM trading_history
UNION ALL
SELECT 'rebalancing_master' as table_name, COUNT(*) as row_count FROM rebalancing_master
UNION ALL
SELECT 'rebalancing_analysis' as table_name, COUNT(*) as row_count FROM rebalancing_analysis
UNION ALL
SELECT 'customer_strategy' as table_name, COUNT(*) as row_count FROM customer_strategy;

-- 2. 종목현재가에서 000263이 이미 있는지 확인
SELECT * FROM stock_current_price WHERE stock_code = '000263';

-- 3. 종목현재가 테이블의 첫 10개와 마지막 10개 확인
(SELECT stock_code, current_price FROM stock_current_price ORDER BY stock_code LIMIT 10)
UNION ALL
(SELECT stock_code, current_price FROM stock_current_price ORDER BY stock_code DESC LIMIT 10);
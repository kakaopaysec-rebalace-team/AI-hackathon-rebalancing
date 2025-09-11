-- 고객잔고 테이블에서 예수금 컬럼 제거 스크립트

USE kpsdb;

-- 1. 제거 전 현재 테이블 구조 확인
DESCRIBE customer_balance;

-- 2. 예수금 컬럼 제거 전 데이터 확인 (참고용)
SELECT 
    account_number,
    stock_code,
    stock_name,
    quantity,
    purchase_amount,
    deposit_amount,
    created_at
FROM customer_balance 
WHERE account_number = '99911122222'
ORDER BY stock_code
LIMIT 3;

-- 3. 예수금 컬럼 제거
ALTER TABLE customer_balance 
DROP COLUMN deposit_amount;

-- 4. 제거 후 테이블 구조 확인
DESCRIBE customer_balance;

-- 5. 제거 후 데이터 확인
SELECT 
    account_number,
    stock_code,
    stock_name,
    quantity,
    purchase_amount,
    created_at
FROM customer_balance 
WHERE account_number = '99911122222'
ORDER BY stock_code
LIMIT 3;

-- 완료 메시지
SELECT '✅ deposit_amount 컬럼이 성공적으로 제거되었습니다.' as result;
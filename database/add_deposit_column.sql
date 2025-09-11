-- 고객잔고 테이블에 예수금 컬럼 추가 스크립트

USE kpsdb;

-- 1. 예수금 컬럼 추가
ALTER TABLE customer_balance 
ADD COLUMN deposit_amount DECIMAL(15,2) NOT NULL DEFAULT 0 COMMENT '예수금' 
AFTER purchase_amount;

-- 2. 기존 고객에게 예수금 데이터 추가
UPDATE customer_balance 
SET deposit_amount = 10000000.00 
WHERE account_number = '99911122222';

-- 3. 변경 결과 확인
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
LIMIT 5;

-- 4. 테이블 구조 확인
DESCRIBE customer_balance;
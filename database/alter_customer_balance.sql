-- 고객잔고 테이블 PK 수정 스크립트
-- 기존 PK: (account_number, stock_code) → 변경 PK: (account_number, stock_code) + id 컬럼 추가

USE kpsdb;

-- 1. 외래키 제약조건 임시 제거 (있는 경우)
SET FOREIGN_KEY_CHECKS = 0;

-- 2. 기존 PK 제거
ALTER TABLE customer_balance DROP PRIMARY KEY;

-- 3. AUTO_INCREMENT ID 컬럼 추가 (PK로 설정)
ALTER TABLE customer_balance 
ADD COLUMN id BIGINT AUTO_INCREMENT PRIMARY KEY FIRST;

-- 4. 기존 컬럼들에 UNIQUE 제약조건 추가 (비즈니스 로직 보장)
ALTER TABLE customer_balance 
ADD CONSTRAINT uk_customer_balance_account_stock 
UNIQUE KEY (account_number, stock_code);

-- 5. 외래키 제약조건 복원
SET FOREIGN_KEY_CHECKS = 1;

-- 6. 테이블 구조 확인
DESCRIBE customer_balance;
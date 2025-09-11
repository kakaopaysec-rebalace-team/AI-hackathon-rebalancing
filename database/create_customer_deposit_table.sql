-- 7번째 테이블: 고객예수금 테이블 생성 스크립트

USE kpsdb;

-- 고객예수금 테이블 생성
CREATE TABLE customer_deposit (
    account_number CHAR(12) NOT NULL COMMENT '계좌번호 (12자리)',
    deposit_amount DECIMAL(15,2) NOT NULL DEFAULT 0 COMMENT '예수금',
    available_amount DECIMAL(15,2) NOT NULL DEFAULT 0 COMMENT '인출가능금액',
    frozen_amount DECIMAL(15,2) NOT NULL DEFAULT 0 COMMENT '동결금액',
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '최종업데이트일시',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
    PRIMARY KEY (account_number),
    CHECK (deposit_amount >= 0),
    CHECK (available_amount >= 0),
    CHECK (frozen_amount >= 0),
    CHECK (deposit_amount = available_amount + frozen_amount)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='고객예수금';

-- 고객예수금 테이블에 외래키 제약조건 추가
-- customer_balance, customer_strategy 테이블과 연관
ALTER TABLE customer_deposit
ADD CONSTRAINT fk_customer_deposit_account
FOREIGN KEY (account_number) REFERENCES customer_balance(account_number)
ON DELETE CASCADE ON UPDATE CASCADE;

-- 테이블 생성 확인
DESCRIBE customer_deposit;

-- 완료 메시지
SELECT '✅ 고객예수금 테이블이 성공적으로 생성되었습니다!' as result;
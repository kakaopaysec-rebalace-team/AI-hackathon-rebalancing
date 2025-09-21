-- customer_balance 테이블에 리밸런싱전략비중 컬럼 추가
-- 실행일: 2025-01-13

USE kpsdb;

-- 리밸런싱전략비중 컬럼 추가
ALTER TABLE customer_balance 
ADD COLUMN rebalancing_target_weight DECIMAL(5,2) DEFAULT 0.00 
COMMENT '리밸런싱전략비중(%)';

-- 추가된 컬럼 확인
DESCRIBE customer_balance;

-- 변경 완료 메시지
SELECT '리밸런싱전략비중 컬럼이 성공적으로 추가되었습니다.' AS message;
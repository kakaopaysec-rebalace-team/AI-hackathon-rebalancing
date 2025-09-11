-- 리밸런싱 전략 관련 테이블 생성
-- 작성일: 2025-01-13

USE kpsdb;

-- 1. 리밸런싱 마스터 테이블 (회사에서 관리하는 미리 정의된 전략)
DROP TABLE IF EXISTS rebalancing_master;
CREATE TABLE rebalancing_master (
    strategy_code VARCHAR(20) PRIMARY KEY COMMENT '전략코드',
    strategy_name VARCHAR(100) NOT NULL COMMENT '전략명',
    description TEXT COMMENT '전략설명',
    risk_level ENUM('저위험', '중위험', '고위험') NOT NULL COMMENT '위험수준',
    default_cycle ENUM('월간', '분기', '반기', '연간') DEFAULT '분기' COMMENT '기본리밸런싱주기',
    default_deviation DECIMAL(5,2) DEFAULT 5.00 COMMENT '기본허용편차(%)',
    is_active BOOLEAN DEFAULT TRUE COMMENT '활성화여부',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시'
) COMMENT = '리밸런싱 마스터 전략';

-- 2. 고객 전략 테이블
DROP TABLE IF EXISTS customer_strategy;
CREATE TABLE customer_strategy (
    account_number VARCHAR(12) PRIMARY KEY COMMENT '계좌번호',
    strategy_code VARCHAR(20) COMMENT '전략코드 (마스터 전략 또는 CUSTOM_전략)',
    rebalancing_cycle ENUM('월간', '분기', '반기', '연간') DEFAULT '분기' COMMENT '리밸런싱주기',
    allowed_deviation DECIMAL(5,2) DEFAULT 5.00 COMMENT '허용편차(%)',
    is_active BOOLEAN DEFAULT FALSE COMMENT '리밸런싱활성화여부',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시'
) COMMENT = '고객 리밸런싱 전략';

-- 샘플 마스터 전략 데이터 삽입
INSERT INTO rebalancing_master VALUES
('EQUAL_WEIGHT', '균등 분산 전략', '모든 종목에 동일한 비중(20%)으로 투자하는 안정적인 전략', '저위험', '분기', 3.00, TRUE, NOW(), NOW()),
('MARKET_CAP', '시가총액 가중 전략', '시가총액에 따른 비중으로 시장 평균 수익을 추구하는 전략', '중위험', '분기', 5.00, TRUE, NOW(), NOW()),
('CONSERVATIVE', '안정형 전략', '안정적인 대형주 위주로 구성된 보수적 투자 전략', '저위험', '반기', 2.00, TRUE, NOW(), NOW()),
('GROWTH', '성장형 전략', '성장 잠재력이 높은 종목 위주의 적극적 투자 전략', '고위험', '월간', 8.00, TRUE, NOW(), NOW()),
('VALUE', '가치형 전략', '저평가된 우량주 중심의 가치 투자 전략', '중위험', '분기', 4.00, TRUE, NOW(), NOW()),
('TECH_FOCUS', '테크 집중 전략', 'IT 및 기술주 중심의 미래 성장 전략', '고위험', '월간', 10.00, TRUE, NOW(), NOW());

-- 인덱스 생성
CREATE INDEX idx_rebalancing_master_active ON rebalancing_master(is_active);
CREATE INDEX idx_customer_strategy_active ON customer_strategy(is_active);

-- 테이블 생성 확인
SELECT '리밸런싱 전략 테이블들이 성공적으로 생성되었습니다.' AS message;
SHOW TABLES LIKE '%strategy%';
SHOW TABLES LIKE '%rebalancing%';
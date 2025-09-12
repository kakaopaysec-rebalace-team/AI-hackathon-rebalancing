-- 전략학습 테이블 생성 스크립트
-- rebalancing_master 테이블을 복사하여 전략적용여부 컬럼만 추가

USE kpsdb;

-- 전략학습 테이블 (rebalancing_master + 전략적용여부 컬럼)
CREATE TABLE strategy_learning (
    rebalancing_strategy_code VARCHAR(20) NOT NULL COMMENT '리밸런싱전략코드',
    rebalancing_name VARCHAR(100) NOT NULL COMMENT '리밸런싱이름',
    rebalancing_description TEXT COMMENT '리밸런싱설명',
    risk_level ENUM('초저위험', '저위험', '중위험', '고위험', '초고위험') NOT NULL COMMENT '위험도',
    investment_style ENUM('가치투자', '성장투자', '배당투자', '지수추종', '단기/스윙', '퀀트/시스템트레이딩', '테마/모멘텀') NOT NULL COMMENT '투자스타일',
    keyword1 VARCHAR(50) COMMENT '키워드1',
    keyword2 VARCHAR(50) COMMENT '키워드2',
    keyword3 VARCHAR(50) COMMENT '키워드3',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
    
    -- 추가된 컬럼: 전략적용여부
    is_applied CHAR(1) NOT NULL DEFAULT 'N' COMMENT '전략적용여부 (Y: 적용됨, N: 미적용)',
    
    PRIMARY KEY (rebalancing_strategy_code),
    INDEX idx_is_applied (is_applied),
    CONSTRAINT chk_is_applied CHECK (is_applied IN ('Y', 'N'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='전략학습';

-- 샘플 데이터 삽입 (개발용)
INSERT INTO strategy_learning (
    rebalancing_strategy_code, 
    rebalancing_name, 
    rebalancing_description, 
    risk_level, 
    investment_style, 
    keyword1, 
    keyword2, 
    keyword3,
    is_applied
) VALUES 
('LEARN_001', 'AI 성장형 전략', 'AI가 분석한 성장주 중심의 포트폴리오 전략', '고위험', '성장투자', 'AI생성', '성장주', '고수익', 'N'),
('LEARN_002', 'AI 안정형 전략', 'AI가 추천하는 배당주 중심의 안정적인 포트폴리오', '저위험', '배당투자', 'AI생성', '배당', '안정성', 'N'),
('LEARN_003', 'AI 균형형 전략', 'AI가 제안하는 성장과 안정의 균형잡힌 포트폴리오', '중위험', '지수추종', 'AI생성', '균형', '분산투자', 'Y');
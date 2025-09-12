-- 전략학습 시스템 테이블 생성
-- 파일명: create_str.sql  
-- 작성일: 2025-09-11
-- 설명: AI가 생성한 전략을 관리하는 테이블 (rebalancing_master와 동일한 구조에 추가 컬럼)

USE kpsdb;

-- 1. 전략학습 마스터 테이블 생성
DROP TABLE IF EXISTS strategy_learning_master;
CREATE TABLE strategy_learning_master (
    strategy_code VARCHAR(20) NOT NULL COMMENT '전략코드 (CST001, FAI001, WEB001, DOC001 형태)',
    strategy_name VARCHAR(150) NOT NULL COMMENT '전략명 (네이밍 룰: CST_Technology_Focus_20250911_001)',
    description TEXT COMMENT '전략설명',
    risk_level ENUM('초저위험', '저위험', '중위험', '고위험', '초고위험') NOT NULL COMMENT '위험도',
    investment_style ENUM('가치투자', '성장투자', '배당투자', '지수추종', '단기/스윙', '퀀트/시스템트레이딩', '테마/모멘텀') NOT NULL COMMENT '투자스타일',
    keyword1 VARCHAR(50) COMMENT '키워드1',
    keyword2 VARCHAR(50) COMMENT '키워드2',
    keyword3 VARCHAR(50) COMMENT '키워드3',
    
    -- 전략학습 전용 컬럼들
    generation_type ENUM('CST', 'FAI', 'WEB', 'DOC') NOT NULL COMMENT '생성타입 (CST:사용자입력, FAI:자동생성, WEB:웹분석, DOC:문서분석)',
    generation_source TEXT COMMENT '생성 소스 (사용자 입력 텍스트, URL, 파일명 등)',
    ai_analysis_result JSON COMMENT 'AI 분석 결과 (strengths, weaknesses, recommendations 등)',
    portfolio_composition JSON COMMENT '포트폴리오 구성 정보 (종목별 비중)',
    performance_metrics JSON COMMENT '성과 지표 (기대수익률, 변동성, 샤프비율 등)',
    
    -- 상태 관리 컬럼들
    generation_status ENUM('생성중', '완료', '실패', '검토중') DEFAULT '생성중' COMMENT '생성 상태',
    is_applied BOOLEAN DEFAULT FALSE COMMENT '실제 전략 적용 여부 (rebalancing_master 등록 여부)',
    applied_at TIMESTAMP NULL COMMENT '적용 일시',
    applied_strategy_code VARCHAR(20) NULL COMMENT '적용시 생성된 rebalancing_master의 전략코드',
    
    -- 공통 컬럼들
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
    created_by VARCHAR(50) DEFAULT 'AI_SYSTEM' COMMENT '생성자',
    
    PRIMARY KEY (strategy_code),
    INDEX idx_generation_type (generation_type),
    INDEX idx_generation_status (generation_status),
    INDEX idx_is_applied (is_applied),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI 생성 전략 마스터 테이블';

-- 2. 전략학습 세부 분석 테이블 (선택사항)
DROP TABLE IF EXISTS strategy_learning_analysis;
CREATE TABLE strategy_learning_analysis (
    strategy_code VARCHAR(20) NOT NULL COMMENT '전략코드',
    
    -- 백테스트 성과 정보
    expected_return DECIMAL(5,2) DEFAULT 0 COMMENT '기대수익률 (%)',
    expected_volatility DECIMAL(5,2) DEFAULT 0 COMMENT '기대변동성 (%)',
    sharpe_ratio DECIMAL(5,3) DEFAULT 0 COMMENT '샤프비율',
    max_drawdown DECIMAL(5,2) DEFAULT 0 COMMENT '최대손실 (%)',
    
    -- 위험 지표
    var_95 DECIMAL(5,2) DEFAULT 0 COMMENT 'VaR 95% (%)',
    beta DECIMAL(5,3) DEFAULT 0 COMMENT '베타',
    correlation_kospi DECIMAL(5,3) DEFAULT 0 COMMENT '코스피 상관계수',
    
    -- 포트폴리오 특성
    rebalancing_frequency ENUM('일간', '주간', '월간', '분기', '반기', '연간') DEFAULT '월간' COMMENT '리밸런싱 주기',
    sector_allocation JSON COMMENT '섹터별 배분 정보',
    
    -- 백테스트 성과 (기간별)
    backtest_1year JSON COMMENT '1년 백테스트 결과',
    backtest_2year JSON COMMENT '2년 백테스트 결과', 
    backtest_3year JSON COMMENT '3년 백테스트 결과',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
    
    PRIMARY KEY (strategy_code),
    FOREIGN KEY (strategy_code) REFERENCES strategy_learning_master(strategy_code) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='전략학습 상세 분석 테이블';

-- 3. 샘플 데이터 삽입 (테스트용)
INSERT INTO strategy_learning_master (
    strategy_code, strategy_name, description, risk_level, investment_style,
    keyword1, keyword2, keyword3, generation_type, generation_source,
    ai_analysis_result, portfolio_composition, performance_metrics,
    generation_status, created_by
) VALUES (
    'CST001', 
    'CST_Technology_Focus_20250911_001',
    'AI 및 반도체 중심의 기술주 포트폴리오로 높은 성장성을 추구하는 전략',
    '고위험',
    '성장투자',
    '기술주',
    '반도체', 
    'AI',
    'CST',
    '국내 대형주 중심으로 IT, 바이오, 화학 섹터에 분산투자하는 안정적인 성장 전략을 원합니다.',
    JSON_OBJECT(
        'strengths', JSON_ARRAY('기술주 중심의 높은 성장 잠재력', '4차 산업혁명 테마 집중 투자'),
        'weaknesses', JSON_ARRAY('기술주 집중으로 인한 섹터 편중 위험', '금리 상승에 민감한 성장주 위주 구성'),
        'recommendations', JSON_ARRAY('시장 변동성이 큰 시기에는 비중 조절 고려', '정기적인 리밸런싱으로 목표 비중 유지')
    ),
    JSON_OBJECT(
        'stocks', JSON_ARRAY(
            JSON_OBJECT('stock_code', '005930', 'stock_name', '삼성전자', 'weight', 25.0, 'sector', 'IT'),
            JSON_OBJECT('stock_code', '000660', 'stock_name', 'SK하이닉스', 'weight', 20.0, 'sector', 'IT'),
            JSON_OBJECT('stock_code', '035420', 'stock_name', 'NAVER', 'weight', 15.0, 'sector', 'IT서비스')
        )
    ),
    JSON_OBJECT(
        'expected_return', 18.5,
        'expected_volatility', 24.2,
        'sharpe_ratio', 0.76,
        'max_drawdown', -32.1
    ),
    '완료',
    'ADMIN'
);

-- 4. 인덱스 최적화를 위한 추가 인덱스
CREATE INDEX idx_strategy_learning_type_status ON strategy_learning_master(generation_type, generation_status);
CREATE INDEX idx_strategy_learning_applied ON strategy_learning_master(is_applied, applied_at);

-- 5. 테이블 생성 확인
SELECT 'strategy_learning_master 테이블이 성공적으로 생성되었습니다.' AS message;

-- 테이블 구조 확인
DESCRIBE strategy_learning_master;

-- 생성된 테이블 목록 확인
SHOW TABLES LIKE '%strategy_learning%';

-- 샘플 데이터 확인
SELECT 
    strategy_code,
    strategy_name,
    generation_type,
    generation_status,
    is_applied,
    created_at
FROM strategy_learning_master;
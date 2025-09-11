-- MariaDB 테이블 생성 스크립트
-- 포트폴리오 관리 시스템을 위한 6개 테이블

-- 데이터베이스 사용
USE kpsdb;

-- 1. 고객잔고 테이블
CREATE TABLE customer_balance (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '고유ID',
    account_number CHAR(12) NOT NULL COMMENT '계좌번호 (12자리)',
    stock_code VARCHAR(10) NOT NULL COMMENT '종목코드',
    stock_name VARCHAR(100) NOT NULL COMMENT '종목명',
    quantity BIGINT NOT NULL DEFAULT 0 COMMENT '수량',
    purchase_amount DECIMAL(15,2) NOT NULL DEFAULT 0 COMMENT '매수금액',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
    UNIQUE KEY uk_customer_balance_account_stock (account_number, stock_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='고객잔고';

-- 2. 매매내역 테이블
CREATE TABLE trading_history (
    account_number CHAR(12) NOT NULL COMMENT '계좌번호 (12자리)',
    trading_date CHAR(8) NOT NULL COMMENT '매매일자 (YYYYMMDD)',
    order_number VARCHAR(20) NOT NULL COMMENT '주문번호',
    execution_number VARCHAR(20) NOT NULL COMMENT '체결번호',
    stock_code VARCHAR(10) NOT NULL COMMENT '종목코드',
    buy_sell_code CHAR(1) NOT NULL COMMENT '매수매도구분코드 (1:매수, 2:매도)',
    order_quantity BIGINT NOT NULL DEFAULT 0 COMMENT '주문수량',
    order_amount DECIMAL(15,2) NOT NULL DEFAULT 0 COMMENT '주문금액',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    PRIMARY KEY (account_number, trading_date, order_number, execution_number),
    INDEX idx_stock_code (stock_code),
    INDEX idx_trading_date (trading_date),
    CHECK (buy_sell_code IN ('1', '2'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='매매내역';

-- 3. 종목현재가 테이블
CREATE TABLE stock_current_price (
    stock_code VARCHAR(10) NOT NULL COMMENT '종목코드',
    current_price DECIMAL(15,2) NOT NULL DEFAULT 0 COMMENT '현재가',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
    PRIMARY KEY (stock_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='종목현재가';

-- 4. 고객전략 테이블
CREATE TABLE customer_strategy (
    account_number CHAR(12) NOT NULL COMMENT '계좌번호 (12자리)',
    rebalancing_strategy_code VARCHAR(20) NOT NULL COMMENT '리밸런싱전략코드',
    rebalancing_cycle INT NOT NULL DEFAULT 0 COMMENT '리밸런싱주기 (일)',
    allowed_deviation DECIMAL(5,2) NOT NULL DEFAULT 0 COMMENT '허용편차 (%)',
    rebalancing_yn CHAR(1) NOT NULL DEFAULT 'N' COMMENT '리밸런싱YN (Y/N)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
    PRIMARY KEY (account_number),
    INDEX idx_rebalancing_strategy_code (rebalancing_strategy_code),
    CHECK (rebalancing_yn IN ('Y', 'N'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='고객전략';

-- 5. 리밸런싱마스터 테이블
CREATE TABLE rebalancing_master (
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
    PRIMARY KEY (rebalancing_strategy_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='리밸런싱마스터';

-- 6. 리밸런싱분석 테이블
CREATE TABLE rebalancing_analysis (
    rebalancing_strategy_code VARCHAR(20) NOT NULL COMMENT '리밸런싱전략코드',
    expected_return DECIMAL(5,2) NOT NULL DEFAULT 0 COMMENT '예상수익률 (%)',
    volatility DECIMAL(5,2) NOT NULL DEFAULT 0 COMMENT '변동성 (%)',
    max_drawdown DECIMAL(5,2) NOT NULL DEFAULT 0 COMMENT '최대낙폭 (%)',
    investor_preference INT NOT NULL DEFAULT 0 COMMENT '투자자선호도 (점수)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
    PRIMARY KEY (rebalancing_strategy_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='리밸런싱분석';

-- 외래키 제약조건 추가
ALTER TABLE customer_balance 
ADD CONSTRAINT fk_customer_balance_stock_code 
FOREIGN KEY (stock_code) REFERENCES stock_current_price(stock_code);

ALTER TABLE trading_history 
ADD CONSTRAINT fk_trading_history_stock_code 
FOREIGN KEY (stock_code) REFERENCES stock_current_price(stock_code);

ALTER TABLE customer_strategy 
ADD CONSTRAINT fk_customer_strategy_rebalancing_code 
FOREIGN KEY (rebalancing_strategy_code) REFERENCES rebalancing_master(rebalancing_strategy_code);

ALTER TABLE rebalancing_analysis 
ADD CONSTRAINT fk_rebalancing_analysis_rebalancing_code 
FOREIGN KEY (rebalancing_strategy_code) REFERENCES rebalancing_master(rebalancing_strategy_code);

-- 초기 데이터 삽입을 위한 예시 (필요시 사용)
-- INSERT INTO stock_current_price (stock_code, current_price) VALUES 
-- ('005930', 75000),  -- 삼성전자
-- ('000660', 120000), -- SK하이닉스
-- ('035420', 45000),  -- NAVER
-- ('051910', 950000), -- LG화학
-- ('207940', 85000);  -- 삼성바이오로직스
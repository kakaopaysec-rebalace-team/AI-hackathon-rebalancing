-- 포트폴리오 관리 시스템 데이터베이스 테이블 생성 스크립트 (데이터 제외)
-- 데이터베이스: kpsdb
-- 작성일: 2025-01-13

USE kpsdb;

-- 1. 종목현재가 테이블
DROP TABLE IF EXISTS stock_current_price;
CREATE TABLE stock_current_price (
    stock_code VARCHAR(10) PRIMARY KEY COMMENT '종목코드',
    current_price DECIMAL(10, 2) NOT NULL COMMENT '현재가',
    previous_close DECIMAL(10, 2) NOT NULL COMMENT '전일종가',
    change_amount DECIMAL(10, 2) NOT NULL COMMENT '전일대비',
    change_rate DECIMAL(5, 2) NOT NULL COMMENT '등락률(%)',
    volume BIGINT NOT NULL COMMENT '거래량',
    market_cap BIGINT NOT NULL COMMENT '시가총액',
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '최종업데이트'
) COMMENT = '종목현재가 정보';

-- 2. 종목기본정보 테이블
DROP TABLE IF EXISTS stock_info;
CREATE TABLE stock_info (
    stock_code VARCHAR(10) PRIMARY KEY COMMENT '종목코드',
    stock_name VARCHAR(100) NOT NULL COMMENT '종목명',
    market VARCHAR(20) NOT NULL COMMENT '시장구분',
    sector VARCHAR(100) COMMENT '업종',
    industry VARCHAR(100) COMMENT '산업분류',
    listing_date DATE COMMENT '상장일',
    description TEXT COMMENT '기업개요'
) COMMENT = '종목기본정보';

-- 3. 고객잔고 테이블
DROP TABLE IF EXISTS customer_balance;
CREATE TABLE customer_balance (
    account_number VARCHAR(12) NOT NULL COMMENT '계좌번호',
    stock_code VARCHAR(10) NOT NULL COMMENT '종목코드',
    stock_name VARCHAR(100) NOT NULL COMMENT '종목명',
    quantity INT NOT NULL COMMENT '보유수량',
    purchase_amount DECIMAL(15, 2) NOT NULL COMMENT '매입금액',
    purchase_date DATE NOT NULL COMMENT '매입일',
    PRIMARY KEY (account_number, stock_code)
) COMMENT = '고객잔고 정보';

-- 4. 매매내역 테이블
DROP TABLE IF EXISTS trading_history;
CREATE TABLE trading_history (
    trade_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '거래ID',
    account_number VARCHAR(12) NOT NULL COMMENT '계좌번호',
    stock_code VARCHAR(10) NOT NULL COMMENT '종목코드',
    stock_name VARCHAR(100) NOT NULL COMMENT '종목명',
    trade_type ENUM('매수', '매도') NOT NULL COMMENT '거래구분',
    quantity INT NOT NULL COMMENT '거래수량',
    trade_price DECIMAL(10, 2) NOT NULL COMMENT '거래단가',
    trade_amount DECIMAL(15, 2) NOT NULL COMMENT '거래금액',
    fee DECIMAL(10, 2) DEFAULT 0 COMMENT '수수료',
    tax DECIMAL(10, 2) DEFAULT 0 COMMENT '세금',
    trade_date DATETIME NOT NULL COMMENT '거래일시',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '등록일시'
) COMMENT = '매매내역';

-- 5. 전략설정 테이블
DROP TABLE IF EXISTS strategy_settings;
CREATE TABLE strategy_settings (
    strategy_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '전략ID',
    account_number VARCHAR(12) NOT NULL COMMENT '계좌번호',
    strategy_name VARCHAR(100) NOT NULL COMMENT '전략명',
    risk_level ENUM('저위험', '중위험', '고위험') NOT NULL COMMENT '위험수준',
    target_return DECIMAL(5, 2) NOT NULL COMMENT '목표수익률(%)',
    rebalancing_period ENUM('월간', '분기', '반기', '연간') NOT NULL COMMENT '리밸런싱주기',
    is_active BOOLEAN DEFAULT TRUE COMMENT '활성화여부',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시'
) COMMENT = '전략설정';

-- 6. 리밸런싱 테이블
DROP TABLE IF EXISTS rebalancing;
CREATE TABLE rebalancing (
    rebalancing_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '리밸런싱ID',
    account_number VARCHAR(12) NOT NULL COMMENT '계좌번호',
    strategy_id INT NOT NULL COMMENT '전략ID',
    rebalancing_date DATE NOT NULL COMMENT '리밸런싱일',
    status ENUM('대기', '진행중', '완료', '실패') DEFAULT '대기' COMMENT '상태',
    total_amount DECIMAL(15, 2) NOT NULL COMMENT '총투자금액',
    notes TEXT COMMENT '비고',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
    FOREIGN KEY (strategy_id) REFERENCES strategy_settings(strategy_id)
) COMMENT = '리밸런싱 실행내역';

-- 7. 고객예수금 테이블
DROP TABLE IF EXISTS customer_deposit;
CREATE TABLE customer_deposit (
    account_number VARCHAR(12) PRIMARY KEY COMMENT '계좌번호',
    deposit_amount DECIMAL(15, 2) NOT NULL DEFAULT 0 COMMENT '예수금'
) COMMENT = '고객예수금 정보';

-- 인덱스 생성
-- 성능 최적화를 위한 인덱스들
CREATE INDEX idx_stock_current_price_updated ON stock_current_price(last_updated);
CREATE INDEX idx_stock_info_name ON stock_info(stock_name);
CREATE INDEX idx_customer_balance_account ON customer_balance(account_number);
CREATE INDEX idx_trading_history_account ON trading_history(account_number);
CREATE INDEX idx_trading_history_date ON trading_history(trade_date);
CREATE INDEX idx_strategy_settings_account ON strategy_settings(account_number);
CREATE INDEX idx_rebalancing_account ON rebalancing(account_number);
CREATE INDEX idx_rebalancing_date ON rebalancing(rebalancing_date);

-- 테이블 생성 완료 메시지
SELECT '포트폴리오 관리 시스템 테이블 생성이 완료되었습니다.' AS message;

-- 생성된 테이블 확인
SHOW TABLES;
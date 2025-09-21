DROP TABLE customer_balance;
DROP TABLE customer_deposit;
DROP TABLE customer_strategy;
DROP TABLE rebalancing;
DROP TABLE rebalancing_analysis;
DROP TABLE rebalancing_master;
DROP TABLE stock_current_price;;
DROP TABLE stock_info;
DROP TABLE strategy_settings;
DROP TABLE strategy_learning;
DROP TABLE strategy_learning_analysis;
DROP TABLE strategy_learning_master;
DROP TABLE trading_history;

-- 고객잔고
CREATE TABLE `customer_balance` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '고유ID',
  `account_number` char(12) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '계좌번호 (12자리)',
  `stock_code` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '종목코드',
  `stock_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '종목명',
  `quantity` bigint NOT NULL DEFAULT '0' COMMENT '수량',
  `purchase_amount` decimal(15,2) NOT NULL DEFAULT '0.00' COMMENT '매수금액',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_customer_balance_account_stock` (`account_number`,`stock_code`)
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='고객잔고';

-- 고객예수금 정보
CREATE TABLE `customer_deposit` (
  `account_number` varchar(12) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '계좌번호',
  `deposit_amount` decimal(15,2) NOT NULL DEFAULT '0.00' COMMENT '예수금',
  PRIMARY KEY (`account_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='고객예수금 정보';

-- 고객전략
CREATE TABLE `customer_strategy` (
  `account_number` char(12) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '계좌번호 (12자리)',
  `rebalancing_strategy_code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '리밸런싱전략코드',
  `rebalancing_cycle` int NOT NULL DEFAULT '0' COMMENT '리밸런싱주기 (일)',
  `allowed_deviation` decimal(5,2) NOT NULL DEFAULT '0.00' COMMENT '허용편차 (%)',
  `rebalancing_yn` char(1) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'N' COMMENT '리밸런싱YN (Y/N)',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
  PRIMARY KEY (`account_number`),
  KEY `idx_rebalancing_strategy_code` (`rebalancing_strategy_code`),
  CONSTRAINT `customer_strategy_chk_1` CHECK ((`rebalancing_yn` in (_utf8mb4'Y',_utf8mb4'N')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='고객전략';

-- 전략설정
CREATE TABLE `strategy_settings` (
  `strategy_id` int NOT NULL AUTO_INCREMENT COMMENT '전략ID',
  `account_number` varchar(12) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '계좌번호',
  `strategy_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '전략명',
  `risk_level` enum('저위험','중위험','고위험') COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '위험수준',
  `target_return` decimal(5,2) NOT NULL COMMENT '목표수익률(%)',
  `rebalancing_period` enum('월간','분기','반기','연간') COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '리밸런싱주기',
  `is_active` tinyint(1) DEFAULT '1' COMMENT '활성화여부',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
  PRIMARY KEY (`strategy_id`),
  KEY `idx_strategy_settings_account` (`account_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='전략설정';


-- 리밸런싱 실행내역
CREATE TABLE `rebalancing` (
  `rebalancing_id` int NOT NULL AUTO_INCREMENT COMMENT '리밸런싱ID',
  `account_number` varchar(12) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '계좌번호',
  `strategy_id` int NOT NULL COMMENT '전략ID',
  `rebalancing_date` date NOT NULL COMMENT '리밸런싱일',
  `status` enum('대기','진행중','완료','실패') COLLATE utf8mb4_unicode_ci DEFAULT '대기' COMMENT '상태',
  `total_amount` decimal(15,2) NOT NULL COMMENT '총투자금액',
  `notes` text COLLATE utf8mb4_unicode_ci COMMENT '비고',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
  PRIMARY KEY (`rebalancing_id`),
  KEY `strategy_id` (`strategy_id`),
  KEY `idx_rebalancing_account` (`account_number`),
  KEY `idx_rebalancing_date` (`rebalancing_date`),
  CONSTRAINT `rebalancing_ibfk_1` FOREIGN KEY (`strategy_id`) REFERENCES `strategy_settings` (`strategy_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='리밸런싱 실행내역';

-- 리밸런싱분석
CREATE TABLE `rebalancing_analysis` (
  `rebalancing_strategy_code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '리밸런싱전략코드',
  `expected_return` decimal(5,2) NOT NULL DEFAULT '0.00' COMMENT '예상수익률 (%)',
  `volatility` decimal(5,2) NOT NULL DEFAULT '0.00' COMMENT '변동성 (%)',
  `max_drawdown` decimal(5,2) NOT NULL DEFAULT '0.00' COMMENT '최대낙폭 (%)',
  `investor_preference` int NOT NULL DEFAULT '0' COMMENT '투자자선호도 (점수)',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
  PRIMARY KEY (`rebalancing_strategy_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='리밸런싱분석';

-- 리밸런싱마스터
CREATE TABLE `rebalancing_master` (
  `rebalancing_strategy_code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '리밸런싱전략코드',
  `rebalancing_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '리밸런싱이름',
  `rebalancing_description` text COLLATE utf8mb4_unicode_ci COMMENT '리밸런싱설명',
  `risk_level` enum('초저위험','저위험','중위험','고위험','초고위험') COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '위험도',
  `investment_style` enum('가치투자','성장투자','배당투자','지수추종','단기/스윙','퀀트/시스템트레이딩','테마/모멘텀') COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '투자스타일',
  `keyword1` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '키워드1',
  `keyword2` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '키워드2',
  `keyword3` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '키워드3',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
  PRIMARY KEY (`rebalancing_strategy_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='리밸런싱마스터';

-- 종목현재가
CREATE TABLE `stock_current_price` (
  `stock_code` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '종목코드',
  `current_price` decimal(15,2) NOT NULL DEFAULT '0.00' COMMENT '현재가',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
  PRIMARY KEY (`stock_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='종목현재가';

-- 종목기본정보
CREATE TABLE `stock_info` (
  `stock_code` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '종목코드',
  `stock_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '종목명',
  `market` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '시장구분',
  `sector` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '업종',
  `industry` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '산업분류',
  `listing_date` date DEFAULT NULL COMMENT '상장일',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT '기업개요',
  PRIMARY KEY (`stock_code`),
  KEY `idx_stock_info_name` (`stock_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='종목기본정보';


-- 전략학습
CREATE TABLE `strategy_learning` (
  `rebalancing_strategy_code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '리밸런싱전략코드',
  `rebalancing_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '리밸런싱이름',
  `rebalancing_description` text COLLATE utf8mb4_unicode_ci COMMENT '리밸런싱설명',
  `risk_level` enum('초저위험','저위험','중위험','고위험','초고위험') COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '위험도',
  `investment_style` enum('가치투자','성장투자','배당투자','지수추종','단기/스윙','퀀트/시스템트레이딩','테마/모멘텀') COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '투자스타일',
  `keyword1` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '키워드1',
  `keyword2` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '키워드2',
  `keyword3` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '키워드3',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
  `is_applied` char(1) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'N' COMMENT '전략적용여부 (Y: 적용됨, N: 미적용)',
  PRIMARY KEY (`rebalancing_strategy_code`),
  KEY `idx_is_applied` (`is_applied`),
  CONSTRAINT `chk_is_applied` CHECK ((`is_applied` in (_utf8mb4'Y',_utf8mb4'N')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='전략학습';

-- AI 전략 마스터 테이블
CREATE TABLE `strategy_learning_master` (
  `strategy_code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '전략코드 (CST001, FAI001, WEB001, DOC001 형태)',
  `strategy_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '전략명 (네이밍 룰: CST_Technology_Focus_20250911_001)',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT '전략설명',
  `risk_level` enum('초저위험','저위험','중위험','고위험','초고위험') COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '위험도',
  `investment_style` enum('가치투자','성장투자','배당투자','지수추종','단기/스윙','퀀트/시스템트레이딩','테마/모멘텀') COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '투자스타일',
  `keyword1` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '키워드1',
  `keyword2` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '키워드2',
  `keyword3` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '키워드3',
  `generation_type` enum('CST','FAI','WEB','DOC') COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '생성타입 (CST:사용자입력, FAI:자동생성, WEB:웹분석, DOC:문서분석)',
  `generation_source` text COLLATE utf8mb4_unicode_ci COMMENT '생성 소스 (사용자 입력 텍스트, URL, 파일명 등)',
  `ai_analysis_result` json DEFAULT NULL COMMENT 'AI 분석 결과 (strengths, weaknesses, recommendations 등)',
  `portfolio_composition` json DEFAULT NULL COMMENT '포트폴리오 구성 정보 (종목별 비중)',
  `performance_metrics` json DEFAULT NULL COMMENT '성과 지표 (기대수익률, 변동성, 샤프비율 등)',
  `generation_status` enum('생성중','완료','실패','검토중') COLLATE utf8mb4_unicode_ci DEFAULT '생성중' COMMENT '생성 상태',
  `is_applied` tinyint(1) DEFAULT '0' COMMENT '실제 전략 적용 여부 (rebalancing_master 등록 여부)',
  `applied_at` timestamp NULL DEFAULT NULL COMMENT '적용 일시',
  `applied_strategy_code` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '적용시 생성된 rebalancing_master의 전략코드',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
  `created_by` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'AI_SYSTEM' COMMENT '생성자',
  PRIMARY KEY (`strategy_code`),
  KEY `idx_generation_type` (`generation_type`),
  KEY `idx_generation_status` (`generation_status`),
  KEY `idx_is_applied` (`is_applied`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_strategy_learning_type_status` (`generation_type`,`generation_status`),
  KEY `idx_strategy_learning_applied` (`is_applied`,`applied_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI 생성 전략 마스터 테이블';


-- 전략학습 상세 분석 테이블
CREATE TABLE `strategy_learning_analysis` (
  `strategy_code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '전략코드',
  `expected_return` decimal(5,2) DEFAULT '0.00' COMMENT '기대수익률 (%)',
  `expected_volatility` decimal(5,2) DEFAULT '0.00' COMMENT '기대변동성 (%)',
  `sharpe_ratio` decimal(5,3) DEFAULT '0.000' COMMENT '샤프비율',
  `max_drawdown` decimal(5,2) DEFAULT '0.00' COMMENT '최대손실 (%)',
  `var_95` decimal(5,2) DEFAULT '0.00' COMMENT 'VaR 95% (%)',
  `beta` decimal(5,3) DEFAULT '0.000' COMMENT '베타',
  `correlation_kospi` decimal(5,3) DEFAULT '0.000' COMMENT '코스피 상관계수',
  `rebalancing_frequency` enum('일간','주간','월간','분기','반기','연간') COLLATE utf8mb4_unicode_ci DEFAULT '월간' COMMENT '리밸런싱 주기',
  `sector_allocation` json DEFAULT NULL COMMENT '섹터별 배분 정보',
  `backtest_1year` json DEFAULT NULL COMMENT '1년 백테스트 결과',
  `backtest_2year` json DEFAULT NULL COMMENT '2년 백테스트 결과',
  `backtest_3year` json DEFAULT NULL COMMENT '3년 백테스트 결과',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
  PRIMARY KEY (`strategy_code`),
  CONSTRAINT `strategy_learning_analysis_ibfk_1` FOREIGN KEY (`strategy_code`) REFERENCES `strategy_learning_master` (`strategy_code`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='전략학습 상세 분석 테이블';

-- 매매내역
CREATE TABLE `trading_history` (
  `account_number` char(12) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '계좌번호 (12자리)',
  `trading_date` char(8) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '매매일자 (YYYYMMDD)',
  `order_number` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '주문번호',
  `execution_number` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '체결번호',
  `stock_code` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '종목코드',
  `buy_sell_code` char(1) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '매수매도구분코드 (1:매수, 2:매도)',
  `order_quantity` bigint NOT NULL DEFAULT '0' COMMENT '주문수량',
  `order_amount` decimal(15,2) NOT NULL DEFAULT '0.00' COMMENT '주문금액',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
  PRIMARY KEY (`account_number`,`trading_date`,`order_number`,`execution_number`),
  KEY `idx_stock_code` (`stock_code`),
  KEY `idx_trading_date` (`trading_date`),
  CONSTRAINT `trading_history_chk_1` CHECK ((`buy_sell_code` in (_utf8mb4'1',_utf8mb4'2')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='매매내역';

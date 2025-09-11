#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
7번째 테이블(고객예수금) 포함한 완전한 데이터베이스 스키마 업데이트
"""

import random
from datetime import datetime, timedelta

def create_complete_7table_setup():
    """7개 테이블 포함한 완전한 데이터베이스 설정 스크립트 생성"""
    
    print("🔄 7개 테이블 포함 완전한 설정 스크립트 생성 중...")
    
    sql_content = """-- 7개 테이블 포함 완전한 데이터베이스 설정 스크립트
-- 생성일시: """ + datetime.now().strftime('%Y-%m-%d %H:%M:%S') + """

USE kpsdb;

-- ========================================
-- 1단계: 기존 데이터 완전 삭제
-- ========================================

-- 외래키 제약조건 임시 해제
SET FOREIGN_KEY_CHECKS = 0;

-- 기존 데이터 모두 삭제 (의존성 순서 고려)
DELETE FROM customer_deposit;
DELETE FROM rebalancing_analysis;
DELETE FROM customer_strategy; 
DELETE FROM customer_balance;
DELETE FROM trading_history;
DELETE FROM rebalancing_master;
DELETE FROM stock_current_price;

-- 외래키 제약조건 복원
SET FOREIGN_KEY_CHECKS = 1;

-- ========================================
-- 2단계: 7번째 테이블 생성 (없을 경우)
-- ========================================

-- 고객예수금 테이블 생성
CREATE TABLE IF NOT EXISTS customer_deposit (
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

-- ========================================
-- 3단계: 새 데이터 입력 (7개 테이블)
-- ========================================

-- 1. 종목현재가 (2,500개)
INSERT INTO stock_current_price (stock_code, current_price) VALUES
"""
    
    # 순차적 종목코드 생성 (000001 ~ 002500)
    stock_lines = []
    for i in range(1, 2501):
        code = f"{i:06d}"
        current_price = random.randint(1000, 900000)
        stock_lines.append(f"('{code}', {current_price})")
    
    sql_content += ',\n'.join(stock_lines) + ';\n\n'
    
    # 2. 고객잔고 (20개 종목)
    sql_content += """-- 2. 고객잔고 (20개 종목)
INSERT INTO customer_balance (account_number, stock_code, stock_name, quantity, purchase_amount) VALUES
"""
    
    customer_names = [
        '삼성전자', 'SK하이닉스', 'NAVER', 'LG화학', '삼성바이오로직스',
        'POSCO홀딩스', '기아', '카카오', 'KB금융', '신한지주',
        'SK이노베이션', 'SK텔레콤', 'LG전자', '삼성전기', '엔씨소프트',
        '카카오뱅크', '하나금융지주', '셀트리온', 'LG에너지솔루션', '에코프로비엠'
    ]
    quantities = [500, 150, 80, 45, 25, 120, 200, 180, 220, 300, 
                  85, 160, 90, 130, 75, 400, 110, 95, 60, 140]
    
    balance_lines = []
    for i in range(20):
        code = f"{i+1:06d}"  # 000001 ~ 000020
        purchase_amount = random.randint(1000000, 80000000)
        balance_lines.append(f"('99911122222', '{code}', '{customer_names[i]}', {quantities[i]}, {purchase_amount}.00)")
    
    sql_content += ',\n'.join(balance_lines) + ';\n\n'
    
    # 3. 고객예수금 (새로운 7번째 테이블)
    sql_content += """-- 3. 고객예수금 (1개 계좌)
INSERT INTO customer_deposit (account_number, deposit_amount, available_amount, frozen_amount) VALUES
('99911122222', 50000000.00, 45000000.00, 5000000.00);

"""
    
    # 4. 매매내역
    sql_content += """-- 4. 매매내역 (930건)
INSERT INTO trading_history (account_number, trading_date, order_number, execution_number, stock_code, buy_sell_code, order_quantity, order_amount) VALUES
"""
    
    trading_lines = []
    base_date = datetime(2024, 1, 1)
    customer_stocks = [f"{i:06d}" for i in range(1, 21)]  # 000001 ~ 000020
    
    for i in range(930):
        trading_date = (base_date + timedelta(days=random.randint(0, 300))).strftime('%Y%m%d')
        order_number = f"ORD{i+1:06d}"
        execution_number = f"EXE{i+1:06d}"
        stock_code = customer_stocks[i % 20]
        buy_sell_code = random.choice(['1', '2'])
        order_quantity = random.randint(1, 100)
        order_amount = random.randint(100000, 50000000)
        
        trading_lines.append(f"('99911122222', '{trading_date}', '{order_number}', '{execution_number}', '{stock_code}', '{buy_sell_code}', {order_quantity}, {order_amount}.00)")
    
    sql_content += ',\n'.join(trading_lines) + ';\n\n'
    
    # 5. 리밸런싱마스터
    sql_content += """-- 5. 리밸런싱마스터 (15개)
INSERT INTO rebalancing_master (rebalancing_strategy_code, rebalancing_name, rebalancing_description, risk_level, investment_style, keyword1, keyword2, keyword3) VALUES
"""
    
    strategies = [
        ('CONSERVATIVE_01', '안정형 포트폴리오', '안전자산 중심의 보수적 투자 전략', '저위험', '지수추종', '안정성', '보수적', '저위험'),
        ('BALANCED_01', '균형형 포트폴리오', '주식과 채권의 균형잡힌 분산투자', '중위험', '지수추종', '균형', '분산투자', '중위험'),
        ('GROWTH_01', '성장형 포트폴리오', '성장주 중심의 적극적 투자 전략', '고위험', '성장투자', '성장성', '적극적', '고수익'),
        ('DIVIDEND_01', '배당형 포트폴리오', '배당수익을 중시하는 안정적 수익 추구', '저위험', '배당투자', '배당', '수익', '안정적'),
        ('TECH_01', 'IT기술주 포트폴리오', 'IT 기술주에 집중 투자하는 전략', '고위험', '테마/모멘텀', '기술주', 'IT', '혁신'),
        ('GLOBAL_01', '글로벌 포트폴리오', '해외 주식 분산투자를 통한 글로벌 전략', '중위험', '지수추종', '글로벌', '해외투자', '분산'),
        ('ESG_01', 'ESG 포트폴리오', '지속가능경영 기업 중심 투자', '중위험', '가치투자', '지속가능', '친환경', 'ESG'),
        ('SMALL_CAP_01', '중소형주 포트폴리오', '중소형 성장주 중심 투자 전략', '고위험', '성장투자', '중소형주', '성장', '고성장'),
        ('VALUE_01', '가치투자 포트폴리오', '저평가된 우량주 중심 투자', '중위험', '가치투자', '가치투자', '저평가', '우량주'),
        ('SECTOR_01', '섹터별 포트폴리오', '업종별 분산투자 전략', '중위험', '테마/모멘텀', '섹터', '업종분산', '다양화'),
        ('MOMENTUM_01', '모멘텀 포트폴리오', '상승 추세 종목 중심 투자', '초고위험', '테마/모멘텀', '모멘텀', '추세', '상승세'),
        ('DEFENSIVE_01', '방어형 포트폴리오', '경기방어주 중심의 안정적 투자', '초저위험', '배당투자', '방어', '경기방어주', '안정'),
        ('INCOME_01', '수익형 포트폴리오', '정기적 수익창출을 목적으로 하는 전략', '저위험', '배당투자', '수익창출', '정기수익', '안정수익'),
        ('EMERGING_01', '이머징 포트폴리오', '신흥시장 투자를 통한 고성장 추구', '초고위험', '성장투자', '신흥시장', '고성장', '이머징'),
        ('HYBRID_01', '하이브리드 포트폴리오', '여러 전략을 혼합한 복합 투자 전략', '중위험', '퀀트/시스템트레이딩', '복합전략', '하이브리드', '다전략')
    ]
    
    master_lines = []
    for strategy in strategies:
        master_lines.append(f"('{strategy[0]}', '{strategy[1]}', '{strategy[2]}', '{strategy[3]}', '{strategy[4]}', '{strategy[5]}', '{strategy[6]}', '{strategy[7]}')")
    
    sql_content += ',\n'.join(master_lines) + ';\n\n'
    
    # 6. 리밸런싱분석
    sql_content += """-- 6. 리밸런싱분석 (15개)
INSERT INTO rebalancing_analysis (rebalancing_strategy_code, expected_return, volatility, max_drawdown, investor_preference) VALUES
"""
    
    analysis_lines = []
    for strategy in strategies:
        expected_return = round(random.uniform(3.5, 18.5), 2)
        volatility = round(random.uniform(5.0, 25.0), 2)
        max_drawdown = round(random.uniform(3.0, 35.0), 2)
        investor_preference = random.randint(1, 5)
        
        analysis_lines.append(f"('{strategy[0]}', {expected_return}, {volatility}, {max_drawdown}, {investor_preference})")
    
    sql_content += ',\n'.join(analysis_lines) + ';\n\n'
    
    # 7. 고객전략
    sql_content += """-- 7. 고객전략 (1개)
INSERT INTO customer_strategy (account_number, rebalancing_strategy_code, rebalancing_cycle, allowed_deviation, rebalancing_yn) VALUES
('99911122222', 'BALANCED_01', 30, 5.00, 'Y');

-- ========================================
-- 4단계: 외래키 제약조건 추가
-- ========================================

-- 고객예수금 → 고객잔고 연결
ALTER TABLE customer_deposit
ADD CONSTRAINT IF NOT EXISTS fk_customer_deposit_account
FOREIGN KEY (account_number) REFERENCES customer_balance(account_number)
ON DELETE CASCADE ON UPDATE CASCADE;

-- ========================================
-- 5단계: 완료 확인
-- ========================================

-- 7개 테이블 데이터 건수 확인
SELECT 'stock_current_price' as table_name, COUNT(*) as row_count FROM stock_current_price
UNION ALL
SELECT 'customer_balance' as table_name, COUNT(*) as row_count FROM customer_balance
UNION ALL
SELECT 'customer_deposit' as table_name, COUNT(*) as row_count FROM customer_deposit
UNION ALL
SELECT 'trading_history' as table_name, COUNT(*) as row_count FROM trading_history
UNION ALL
SELECT 'rebalancing_master' as table_name, COUNT(*) as row_count FROM rebalancing_master
UNION ALL
SELECT 'rebalancing_analysis' as table_name, COUNT(*) as row_count FROM rebalancing_analysis
UNION ALL
SELECT 'customer_strategy' as table_name, COUNT(*) as row_count FROM customer_strategy;

-- 고객 종합 정보 확인
SELECT 
    cd.account_number,
    cd.deposit_amount,
    cd.available_amount,
    cd.frozen_amount,
    COUNT(cb.stock_code) as stock_count,
    SUM(cb.purchase_amount) as total_purchase
FROM customer_deposit cd
LEFT JOIN customer_balance cb ON cd.account_number = cb.account_number
WHERE cd.account_number = '99911122222'
GROUP BY cd.account_number, cd.deposit_amount, cd.available_amount, cd.frozen_amount;

-- 테이블 구조 확인
DESCRIBE customer_deposit;

-- 완료 메시지
SELECT '🎉 7개 테이블 포함 완전한 포트폴리오 관리 시스템이 구축되었습니다!' as result;

"""
    
    # 파일 저장
    with open('complete_7table_database_setup.sql', 'w', encoding='utf-8') as f:
        f.write(sql_content)
    
    print("✅ 7개 테이블 완전한 데이터베이스 설정 스크립트 생성 완료!")
    print("📁 파일: complete_7table_database_setup.sql")
    print("🔧 7개 테이블 구성:")
    print("   1. 종목현재가: 2,500개")
    print("   2. 고객잔고: 20개 종목")
    print("   3. 고객예수금: 1개 계좌 (NEW!)")
    print("   4. 매매내역: 930건")
    print("   5. 리밸런싱마스터: 15개")
    print("   6. 리밸런싱분석: 15개")
    print("   7. 고객전략: 1개")
    print("💰 예수금 구성: 총 5천만원 (인출가능 4천5백만원 + 동결 5백만원)")

if __name__ == "__main__":
    create_complete_7table_setup()
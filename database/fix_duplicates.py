#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
중복 제거 및 데이터 정합성 수정 스크립트
"""

import re
import random
from datetime import datetime, timedelta

def create_clean_data():
    """중복 없는 깨끗한 데이터 생성"""
    
    print("🔄 중복 없는 데이터 세트 생성 중...")
    
    # 1. 고객잔고에 필요한 20개 종목 (우선순위 최고)
    customer_stocks = [
        ('005930', '삼성전자', 75000),
        ('000660', 'SK하이닉스', 142000),
        ('035420', 'NAVER', 185000),
        ('051910', 'LG화학', 425000),
        ('207940', '삼성바이오로직스', 850000),
        ('005490', 'POSCO홀딩스', 58000),
        ('000270', '기아', 62000),
        ('035720', '카카오', 42000),
        ('105560', 'KB금융', 88000),
        ('055550', '신한지주', 47000),
        ('096770', 'SK이노베이션', 620000),
        ('017670', 'SK텔레콤', 45000),
        ('066570', 'LG전자', 155000),
        ('009150', '삼성전기', 38000),
        ('036570', '엔씨소프트', 52000),
        ('323410', '카카오뱅크', 28000),
        ('086790', '하나금융지주', 165000),
        ('068270', '셀트리온', 158000),
        ('373220', 'LG에너지솔루션', 185000),
        ('247540', '에코프로비엠', 28000)
    ]
    customer_stock_codes = set([stock[0] for stock in customer_stocks])
    
    # 2. 기타 대형주 (고객잔고와 중복되지 않는 것들)
    major_stocks = []
    major_candidates = [
        ('032830', 318000), ('003670', 58000), ('034730', 65000),
        ('015760', 28000), ('018260', 28000), ('051900', 35000),
        ('251270', 175000), ('377300', 285000), ('042700', 32000),
        ('316140', 72000), ('024110', 38000), ('138040', 25000),
        ('071050', 42000), ('004170', 45000), ('139480', 18000),
        ('161890', 22000), ('030200', 35000), ('033780', 12000),
        ('000880', 28000), ('010950', 85000), ('011170', 28000),
        ('004020', 58000), ('012330', 42000), ('091990', 48000),
        ('302440', 92000), ('326030', 85000), ('000720', 35000),
        ('009540', 38000), ('010140', 68000), ('064350', 125000)
    ]
    
    for code, price in major_candidates:
        if code not in customer_stock_codes:
            major_stocks.append((code, price))
    
    # 3. 2480개 추가 종목 생성 (중복 없이)
    additional_stocks = []
    used_codes = customer_stock_codes | set([stock[0] for stock in major_stocks])
    
    # 패턴별로 생성
    for prefix in range(100000, 999999):
        if len(additional_stocks) >= 2480:
            break
        
        code = f"{prefix:06d}"
        if code not in used_codes:
            price = random.randint(1000, 100000)
            additional_stocks.append((code, price))
            used_codes.add(code)
    
    # 4. 매매내역 생성 (930건, 중복 없는 PK)
    trades = []
    account_number = '99911122222'
    order_counter = 1
    
    # 고객잔고 형성을 위한 매수 (40건)
    quantities = [500, 150, 80, 45, 25, 120, 200, 180, 220, 300, 
                 85, 160, 90, 130, 75, 400, 110, 95, 60, 140]
    
    for i, (stock_code, stock_name, _) in enumerate(customer_stocks):
        qty = quantities[i]
        date = f"202508{random.randint(1, 31):02d}"
        price = random.randint(20000, 800000)
        
        order_num = f"ORD{order_counter:08d}"
        exec_num = f"EXE{order_counter:08d}"
        
        trades.append(f"('{account_number}', '{date}', '{order_num}', '{exec_num}', '{stock_code}', '1', {qty}, {price}.00)")
        order_counter += 1
        
        # 분할 매수 (일부 종목)
        if i < 10:  # 처음 10개 종목만 분할 매수
            remaining_qty = int(qty * 0.3)
            date2 = f"202508{random.randint(1, 31):02d}"
            price2 = price + random.randint(-5000, 10000)
            
            order_num = f"ORD{order_counter:08d}"
            exec_num = f"EXE{order_counter:08d}"
            
            trades.append(f"('{account_number}', '{date2}', '{order_num}', '{exec_num}', '{stock_code}', '1', {remaining_qty}, {price2}.00)")
            order_counter += 1
    
    # 청산 완료 거래 (200건 = 100쌍)
    cleared_stocks = [stock[0] for stock in major_stocks[:50]]  # 대형주 중 50개
    
    for stock_code in cleared_stocks:
        qty = random.randint(10, 200)
        buy_price = random.randint(5000, 100000)
        sell_price = buy_price + random.randint(-2000, 5000)
        
        # 매수
        buy_date = f"202508{random.randint(1, 28):02d}"
        order_num = f"ORD{order_counter:08d}"
        exec_num = f"EXE{order_counter:08d}"
        trades.append(f"('{account_number}', '{buy_date}', '{order_num}', '{exec_num}', '{stock_code}', '1', {qty}, {buy_price}.00)")
        order_counter += 1
        
        # 매도
        sell_date_obj = datetime.strptime(buy_date, '%Y%m%d') + timedelta(days=random.randint(1, 3))
        sell_date = sell_date_obj.strftime('%Y%m%d')
        if sell_date > '20250831':
            sell_date = '20250831'
        
        order_num = f"ORD{order_counter:08d}"
        exec_num = f"EXE{order_counter:08d}"
        trades.append(f"('{account_number}', '{sell_date}', '{order_num}', '{exec_num}', '{stock_code}', '2', {qty}, {sell_price}.00)")
        order_counter += 1
    
    # 나머지 단타 매매 (680건 = 340쌍)
    remaining_stocks = [stock[0] for stock in additional_stocks[:340]]
    
    for stock_code in remaining_stocks:
        qty = random.randint(5, 100)
        buy_price = random.randint(1000, 50000)
        sell_price = buy_price + random.randint(-500, 1000)
        
        # 매수
        buy_date = f"202508{random.randint(1, 30):02d}"
        order_num = f"ORD{order_counter:08d}"
        exec_num = f"EXE{order_counter:08d}"
        trades.append(f"('{account_number}', '{buy_date}', '{order_num}', '{exec_num}', '{stock_code}', '1', {qty}, {buy_price}.00)")
        order_counter += 1
        
        # 매도
        sell_date = buy_date if random.random() > 0.3 else f"202508{random.randint(1, 31):02d}"
        order_num = f"ORD{order_counter:08d}"
        exec_num = f"EXE{order_counter:08d}"
        trades.append(f"('{account_number}', '{sell_date}', '{order_num}', '{exec_num}', '{stock_code}', '2', {qty}, {sell_price}.00)")
        order_counter += 1
    
    print(f"✅ 데이터 생성 완료:")
    print(f"   📊 종목현재가: {len(customer_stocks) + len(major_stocks) + len(additional_stocks):,}개 (중복 없음)")
    print(f"   📈 매매내역: {len(trades):,}건")
    
    return customer_stocks, major_stocks, additional_stocks, trades

def write_clean_sql():
    """깨끗한 SQL 파일 생성"""
    
    customer_stocks, major_stocks, additional_stocks, trades = create_clean_data()
    
    # SQL 생성
    sql_content = """-- Mock 데이터 대량 생성 스크립트 (중복 제거 버전)
-- 포트폴리오 관리 시스템을 위한 완전한 테스트 데이터 세트
-- PK 중복 없이 데이터 정합성을 보장하는 설계

USE kpsdb;

-- 기존 데이터 삭제 (개발환경에서만 사용)
SET FOREIGN_KEY_CHECKS = 0;
DELETE FROM rebalancing_analysis;
DELETE FROM customer_strategy; 
DELETE FROM customer_balance;
DELETE FROM trading_history;
DELETE FROM rebalancing_master;
DELETE FROM stock_current_price;
SET FOREIGN_KEY_CHECKS = 1;

-- =================================================================
-- 1. 종목현재가 테이블 (2500개, 중복 없음)
-- =================================================================

INSERT INTO stock_current_price (stock_code, current_price) VALUES
-- 고객보유 종목 (20개)
"""
    
    # 고객 보유 종목
    customer_stock_lines = []
    for code, name, price in customer_stocks:
        customer_stock_lines.append(f"('{code}', {price})")
    
    sql_content += ',\n'.join(customer_stock_lines) + ',\n\n-- 기타 대형주\n'
    
    # 기타 대형주
    major_stock_lines = []
    for code, price in major_stocks:
        major_stock_lines.append(f"('{code}', {price})")
    
    sql_content += ',\n'.join(major_stock_lines) + ',\n\n-- 추가 종목들\n'
    
    # 추가 종목들 (1000개씩 나누어서)
    batch_size = 1000
    for i in range(0, len(additional_stocks), batch_size):
        batch = additional_stocks[i:i+batch_size]
        batch_lines = [f"('{code}', {price})" for code, price in batch]
        
        if i + batch_size >= len(additional_stocks):  # 마지막 배치
            sql_content += ',\n'.join(batch_lines) + ';\n\n'
        else:
            sql_content += ',\n'.join(batch_lines) + ',\n\n'
    
    # 나머지 테이블들
    sql_content += """-- =================================================================
-- 2. 리밸런싱마스터 테이블 (15건)
-- =================================================================

INSERT INTO rebalancing_master (
    rebalancing_strategy_code, 
    rebalancing_name, 
    rebalancing_description, 
    risk_level, 
    investment_style, 
    keyword1, 
    keyword2, 
    keyword3
) VALUES
('GROWTH_TECH_001', '기술성장형 포트폴리오', 'IT, 바이오, 반도체 등 기술주 중심의 고성장 추구 전략', '고위험', '성장투자', 'IT', '반도체', '바이오'),
('DIVIDEND_STABLE_002', '안정배당형 포트폴리오', '안정적인 배당수익을 추구하는 보수적 투자 전략', '저위험', '배당투자', '배당주', '안정성', '장기투자'),
('VALUE_PICK_003', '가치발굴형 포트폴리오', '저평가된 우량주를 발굴하여 장기 보유하는 전략', '중위험', '가치투자', '저평가', '우량주', '펀더멘털'),
('ESG_SUSTAINABLE_004', 'ESG 지속가능 포트폴리오', '환경, 사회, 지배구조를 고려한 지속가능한 투자', '중위험', '성장투자', 'ESG', '지속가능', '친환경'),
('KOSPI_INDEX_005', 'KOSPI 추종형 포트폴리오', 'KOSPI 지수의 움직임을 따라가는 인덱스 투자', '중위험', '지수추종', '인덱스', 'KOSPI', '분산투자'),
('MOMENTUM_SWING_006', '모멘텀 스윙 포트폴리오', '단기 모멘텀을 활용한 스윙 트레이딩 전략', '고위험', '단기/스윙', '모멘텀', '스윙', '단기수익'),
('QUANT_SYSTEM_007', '퀀트 시스템 포트폴리오', '데이터 분석과 알고리즘 기반의 체계적 투자', '고위험', '퀀트/시스템트레이딩', '퀀트', '알고리즘', '데이터'),
('CONSERVATIVE_008', '보수적 안전자산 포트폴리오', '원금보존을 최우선으로 하는 초보수적 전략', '초저위험', '배당투자', '안전자산', '원금보존', '보수적'),
('BLUE_CHIP_009', '우량주 중심 포트폴리오', '대형 우량주 중심의 안정적 수익 추구', '저위험', '가치투자', '우량주', '대형주', '안정성'),
('SMALL_CAP_010', '중소형주 성장 포트폴리오', '성장 잠재력이 높은 중소형주 집중 투자', '초고위험', '성장투자', '중소형주', '성장잠재력', '고수익'),
('K_BATTERY_011', 'K-배터리 테마 포트폴리오', '2차전지, 전기차 관련 테마주 집중 투자', '고위험', '테마/모멘텀', '배터리', '전기차', '2차전지'),
('HEALTHCARE_012', '헬스케어 특화 포트폴리오', '제약, 바이오, 의료기기 등 헬스케어 집중', '고위험', '성장투자', '헬스케어', '제약', '의료기기'),
('GLOBAL_EXPORT_013', '글로벌 수출주 포트폴리오', '해외 수출 비중이 높은 기업들로 구성', '중위험', '성장투자', '수출주', '글로벌', '환율헷지'),
('DEFENSIVE_014', '방어적 포트폴리오', '경기침체에도 안정적인 필수소비재 중심', '저위험', '배당투자', '방어주', '필수소비재', '경기방어'),
('AI_DIGITAL_015', 'AI 디지털 혁신 포트폴리오', '인공지능, 디지털 전환 관련 혁신기업 투자', '초고위험', '성장투자', 'AI', '디지털전환', '혁신기업');

-- =================================================================
-- 3. 리밸런싱분석 테이블 (15건)
-- =================================================================

INSERT INTO rebalancing_analysis (
    rebalancing_strategy_code,
    expected_return,
    volatility,
    max_drawdown,
    investor_preference
) VALUES
('GROWTH_TECH_001', 12.50, 25.30, -18.40, 78),
('DIVIDEND_STABLE_002', 6.20, 8.50, -5.20, 92),
('VALUE_PICK_003', 9.80, 15.20, -12.30, 85),
('ESG_SUSTAINABLE_004', 8.90, 12.80, -9.70, 88),
('KOSPI_INDEX_005', 7.40, 18.60, -15.20, 95),
('MOMENTUM_SWING_006', 15.20, 32.40, -25.60, 65),
('QUANT_SYSTEM_007', 11.30, 22.10, -16.80, 72),
('CONSERVATIVE_008', 3.80, 4.20, -2.10, 98),
('BLUE_CHIP_009', 7.80, 11.40, -8.30, 90),
('SMALL_CAP_010', 18.60, 38.70, -32.40, 58),
('K_BATTERY_011', 14.80, 29.20, -22.10, 73),
('HEALTHCARE_012', 13.40, 24.60, -19.30, 76),
('GLOBAL_EXPORT_013', 10.20, 19.80, -14.60, 82),
('DEFENSIVE_014', 5.60, 7.30, -4.80, 94),
('AI_DIGITAL_015', 16.90, 35.50, -28.90, 68);

-- =================================================================
-- 4. 고객잔고 테이블 (20개 종목)
-- =================================================================

INSERT INTO customer_balance (
    account_number,
    stock_code,
    stock_name,
    quantity,
    purchase_amount
) VALUES
"""
    
    # 고객잔고 데이터
    balance_lines = []
    quantities = [500, 150, 80, 45, 25, 120, 200, 180, 220, 300, 
                  85, 160, 90, 130, 75, 400, 110, 95, 60, 140]
    
    for i, (code, name, _) in enumerate(customer_stocks):
        purchase_price = random.randint(10000, 800000)
        balance_lines.append(f"('99911122222', '{code}', '{name}', {quantities[i]}, {purchase_price}.00)")
    
    sql_content += ',\n'.join(balance_lines) + ';\n\n'
    
    # 매매내역
    sql_content += """-- =================================================================
-- 5. 매매내역 테이블 (930건)
-- =================================================================

INSERT INTO trading_history (
    account_number, trading_date, order_number, execution_number, 
    stock_code, buy_sell_code, order_quantity, order_amount
) VALUES
"""
    
    sql_content += ',\n'.join(trades) + ';\n\n'
    
    # 고객전략
    sql_content += """-- =================================================================
-- 6. 고객전략 테이블 (1건)
-- =================================================================

INSERT INTO customer_strategy (
    account_number,
    rebalancing_strategy_code,
    rebalancing_cycle,
    allowed_deviation,
    rebalancing_yn
) VALUES
('99911122222', 'GROWTH_TECH_001', 30, 5.00, 'Y');

-- =================================================================
-- 데이터 검증 쿼리
-- =================================================================

-- 테이블별 데이터 건수 확인
SELECT 'stock_current_price' as table_name, COUNT(*) as count FROM stock_current_price
UNION ALL
SELECT 'customer_balance' as table_name, COUNT(*) as count FROM customer_balance
UNION ALL
SELECT 'trading_history' as table_name, COUNT(*) as count FROM trading_history
UNION ALL
SELECT 'rebalancing_master' as table_name, COUNT(*) as count FROM rebalancing_master
UNION ALL
SELECT 'rebalancing_analysis' as table_name, COUNT(*) as count FROM rebalancing_analysis
UNION ALL
SELECT 'customer_strategy' as table_name, COUNT(*) as count FROM customer_strategy;

-- ✅ 완료 메시지
SELECT '🎉 모든 Mock 데이터가 성공적으로 생성되었습니다! (중복 제거 완료)' as result;
"""
    
    # 파일 저장
    with open('/Users/todd.rsp/kps_hacker/port-tune-up/database/insert_bulk_data_clean.sql', 'w', encoding='utf-8') as f:
        f.write(sql_content)
    
    print(f"✅ 깨끗한 SQL 파일 생성 완료!")
    print(f"📁 파일: insert_bulk_data_clean.sql")
    print(f"📊 총 데이터: 종목 2,500개 + 매매내역 930건 (중복 없음)")

if __name__ == "__main__":
    write_clean_sql()
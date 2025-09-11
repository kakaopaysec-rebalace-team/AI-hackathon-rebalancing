#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
대량 종목 및 매매내역 생성 스크립트
2500개 종목과 930건 매매내역을 생성
"""

import random
from datetime import datetime, timedelta

def generate_remaining_stocks():
    """나머지 2000개 종목 생성 (4XXXXX~9XXXXX)"""
    stocks = []
    
    # 4XXXXX~9XXXXX 패턴으로 2000개 생성 (각 패턴별 333개씩)
    for prefix in ['4', '5', '6', '7', '8', '9']:
        for i in range(333):  # 각 패턴별 333개 (총 1998개)
            stock_code = f"{prefix}{i:05d}"
            # 가격 범위를 패턴별로 다르게 설정
            if prefix == '4':
                price = random.randint(5000, 15000)
            elif prefix == '5':
                price = random.randint(10000, 25000)
            elif prefix == '6':
                price = random.randint(15000, 35000)
            elif prefix == '7':
                price = random.randint(20000, 45000)
            elif prefix == '8':
                price = random.randint(25000, 55000)
            else:  # prefix == '9'
                price = random.randint(30000, 65000)
            
            stocks.append(f"('{stock_code}', {price})")
    
    # 마지막 2개 추가해서 정확히 2000개
    stocks.append("('999998', 98000)")
    stocks.append("('999999', 99000)")
    
    return stocks

def generate_trading_history():
    """930건의 매매내역 생성"""
    
    account_number = '99911122222'
    
    # 고객잔고에 있는 20개 종목 (현재 보유)
    balance_stocks = [
        '005930', '000660', '035420', '051910', '207940',  # 5개
        '005490', '000270', '035720', '105560', '055550',  # 5개
        '096770', '017670', '066570', '009150', '036570',  # 5개
        '323410', '086790', '068270', '373220', '247540'   # 5개
    ]
    
    # 매매내역 생성
    trades = []
    order_counter = 1
    
    # 1. 현재 잔고 형성을 위한 매수 거래 (50건)
    quantities = [500, 150, 80, 45, 25, 120, 200, 180, 220, 300, 
                 85, 160, 90, 130, 75, 400, 110, 95, 60, 140]
    
    for i, stock_code in enumerate(balance_stocks):
        # 각 종목당 2-3번의 매수로 분할
        total_qty = quantities[i]
        
        # 첫 번째 매수 (60%)
        qty1 = int(total_qty * 0.6)
        date1 = f"202508{random.randint(1, 15):02d}"
        price1 = random.randint(20000, 200000)
        
        order_num = f"ORD{date1}{order_counter:03d}"
        exec_num = f"EXE{date1}{order_counter:03d}"
        trades.append(f"('{account_number}', '{date1}', '{order_num}', '{exec_num}', '{stock_code}', '1', {qty1}, {price1}.00)")
        order_counter += 1
        
        # 두 번째 매수 (나머지)
        qty2 = total_qty - qty1
        if qty2 > 0:
            date2 = f"202508{random.randint(16, 31):02d}"
            price2 = price1 + random.randint(-5000, 10000)
            
            order_num = f"ORD{date2}{order_counter:03d}"
            exec_num = f"EXE{date2}{order_counter:03d}"
            trades.append(f"('{account_number}', '{date2}', '{order_num}', '{exec_num}', '{stock_code}', '1', {qty2}, {price2}.00)")
            order_counter += 1
    
    # 2. 청산된 종목들의 매수/매도 거래 (100건)
    other_stocks = ['100001', '100002', '100003', '100004', '100005',
                    '200001', '200002', '200003', '200004', '200005',
                    '300001', '300002', '300003', '300004', '300005',
                    '400001', '400002', '400003', '400004', '400005',
                    '500001', '500002', '500003', '500004', '500005',
                    '600001', '600002', '600003', '600004', '600005',
                    '700001', '700002', '700003', '700004', '700005',
                    '800001', '800002', '800003', '800004', '800005',
                    '900001', '900002', '900003', '900004', '900005',
                    '001040', '002790', '003230', '004370', '007310',
                    '026960', '005180', '003920', '005690', '002700']
    
    for i, stock_code in enumerate(other_stocks):
        quantity = random.randint(10, 200)
        buy_price = random.randint(5000, 50000)
        sell_price = buy_price + random.randint(-1000, 3000)
        
        # 매수
        buy_date = f"202508{random.randint(1, 28):02d}"
        order_num = f"ORD{buy_date}{order_counter:03d}"
        exec_num = f"EXE{buy_date}{order_counter:03d}"
        trades.append(f"('{account_number}', '{buy_date}', '{order_num}', '{exec_num}', '{stock_code}', '1', {quantity}, {buy_price}.00)")
        order_counter += 1
        
        # 매도 (1-5일 후)
        sell_date_obj = datetime.strptime(buy_date, '%Y%m%d') + timedelta(days=random.randint(1, 5))
        sell_date = sell_date_obj.strftime('%Y%m%d')
        if sell_date > '20250831':
            sell_date = '20250831'
        
        order_num = f"ORD{sell_date}{order_counter:03d}"
        exec_num = f"EXE{sell_date}{order_counter:03d}"
        trades.append(f"('{account_number}', '{sell_date}', '{order_num}', '{exec_num}', '{stock_code}', '2', {quantity}, {sell_price}.00)")
        order_counter += 1
    
    # 3. 나머지 780건의 단타 매매 (390쌍)
    all_stocks = balance_stocks + other_stocks + [f'4{i:05d}' for i in range(100)] + [f'5{i:05d}' for i in range(100)]
    
    for i in range(390):
        stock_code = random.choice(all_stocks)
        quantity = random.randint(5, 100)
        buy_price = random.randint(3000, 80000)
        sell_price = buy_price + random.randint(-500, 1500)
        
        # 매수
        buy_date = f"202508{random.randint(1, 30):02d}"
        order_num = f"ORD{buy_date}{order_counter:03d}"
        exec_num = f"EXE{buy_date}{order_counter:03d}"
        trades.append(f"('{account_number}', '{buy_date}', '{order_num}', '{exec_num}', '{stock_code}', '1', {quantity}, {buy_price}.00)")
        order_counter += 1
        
        # 매도 (같은 날 또는 다음 날)
        if random.random() > 0.7:  # 30% 확률로 다음 날
            sell_date_obj = datetime.strptime(buy_date, '%Y%m%d') + timedelta(days=1)
            sell_date = sell_date_obj.strftime('%Y%m%d')
            if sell_date > '20250831':
                sell_date = '20250831'
        else:
            sell_date = buy_date
        
        order_num = f"ORD{sell_date}{order_counter:03d}"
        exec_num = f"EXE{sell_date}{order_counter:03d}"
        trades.append(f"('{account_number}', '{sell_date}', '{order_num}', '{exec_num}', '{stock_code}', '2', {quantity}, {sell_price}.00)")
        order_counter += 1
    
    return trades

def write_completion_sql():
    """완성된 SQL 파일 작성"""
    
    print("🔄 대량 종목 데이터 생성 중...")
    stocks = generate_remaining_stocks()
    
    print("🔄 매매내역 930건 생성 중...")
    trades = generate_trading_history()
    
    # 기존 파일에 추가할 내용 작성
    completion_sql = f"""
-- 나머지 2000개 소형주 (4XXXXX~9XXXXX)
{',\n'.join(stocks[:1000])},
{',\n'.join(stocks[1000:])};

-- =================================================================
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
('99911122222', '005930', '삼성전자', 500, 72000.00),
('99911122222', '000660', 'SK하이닉스', 150, 138000.00),
('99911122222', '035420', 'NAVER', 80, 178000.00),
('99911122222', '051910', 'LG화학', 45, 410000.00),
('99911122222', '207940', '삼성바이오로직스', 25, 820000.00),
('99911122222', '005490', 'POSCO홀딩스', 120, 56000.00),
('99911122222', '000270', '기아', 200, 59000.00),
('99911122222', '035720', '카카오', 180, 45000.00),
('99911122222', '105560', 'KB금융', 220, 85000.00),
('99911122222', '055550', '신한지주', 300, 45000.00),
('99911122222', '096770', 'SK이노베이션', 85, 600000.00),
('99911122222', '017670', 'SK텔레콤', 160, 43000.00),
('99911122222', '066570', 'LG전자', 90, 150000.00),
('99911122222', '009150', '삼성전기', 130, 36000.00),
('99911122222', '036570', '엔씨소프트', 75, 48000.00),
('99911122222', '323410', '카카오뱅크', 400, 26000.00),
('99911122222', '086790', '하나금융지주', 110, 158000.00),
('99911122222', '068270', '셀트리온', 95, 152000.00),
('99911122222', '373220', 'LG에너지솔루션', 60, 180000.00),
('99911122222', '247540', '에코프로비엠', 140, 25000.00);

-- =================================================================
-- 5. 매매내역 테이블 (930건)
-- =================================================================

INSERT INTO trading_history (
    account_number, trading_date, order_number, execution_number, 
    stock_code, buy_sell_code, order_quantity, order_amount
) VALUES
{',\n'.join(trades)};

-- =================================================================
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

-- 매매내역 매수/매도 건수 확인
SELECT 
    buy_sell_code,
    CASE 
        WHEN buy_sell_code = '1' THEN '매수'
        WHEN buy_sell_code = '2' THEN '매도'
    END as trade_type,
    COUNT(*) as count
FROM trading_history 
WHERE account_number = '99911122222'
GROUP BY buy_sell_code;

-- 고객 포트폴리오 현황 확인
SELECT 
    cb.stock_code,
    cb.stock_name,
    cb.quantity,
    cb.purchase_amount,
    scp.current_price,
    (cb.quantity * scp.current_price) as current_value,
    (cb.quantity * scp.current_price - cb.quantity * cb.purchase_amount) as unrealized_pnl,
    ROUND(((scp.current_price - cb.purchase_amount) / cb.purchase_amount * 100), 2) as pnl_rate
FROM customer_balance cb
JOIN stock_current_price scp ON cb.stock_code = scp.stock_code
WHERE cb.account_number = '99911122222'
ORDER BY current_value DESC;

-- ✅ 완료 메시지
SELECT '🎉 모든 Mock 데이터가 성공적으로 생성되었습니다!' as result,
       '📊 종목현재가: ~2500개, 매매내역: 930건, 고객잔고: 20개 종목' as summary;
"""
    
    # 파일에 추가
    with open('/Users/todd.rsp/kps_hacker/port-tune-up/database/insert_bulk_data.sql', 'a', encoding='utf-8') as f:
        f.write(completion_sql)
    
    print(f"✅ 완료!")
    print(f"📊 종목현재가: {len(stocks):,}개 추가 생성")
    print(f"📈 매매내역: {len(trades):,}건 생성")
    print(f"📁 파일: insert_bulk_data.sql 업데이트 완료")

if __name__ == "__main__":
    write_completion_sql()
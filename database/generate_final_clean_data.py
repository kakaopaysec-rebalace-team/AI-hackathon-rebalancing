#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
완전히 중복 없는 대량 데이터 생성 스크립트
"""

import random
from datetime import datetime, timedelta

def generate_unique_stock_codes(count=2500):
    """중복 없는 고유한 종목코드 생성"""
    codes = set()
    
    # 고객잔고에 필요한 20개 종목 (필수)
    customer_stocks = [
        '005930', '000660', '035420', '051910', '207940',
        '005490', '000270', '035720', '105560', '055550',
        '096770', '017670', '066570', '009150', '036570',
        '323410', '086790', '068270', '373220', '247540'
    ]
    
    # 고객잔고 종목들을 먼저 추가
    for code in customer_stocks:
        codes.add(code)
    
    # 나머지 종목코드 생성 (중복 없이)
    while len(codes) < count:
        # 6자리 숫자 생성 (000001-999999)
        code = f"{random.randint(1, 999999):06d}"
        codes.add(code)
    
    return sorted(list(codes))

def generate_stock_names():
    """다양한 회사명 생성"""
    companies = [
        '삼성전자', 'SK하이닉스', 'NAVER', 'LG화학', '삼성바이오로직스',
        'POSCO홀딩스', '기아', '카카오', 'KB금융', '신한지주',
        'SK이노베이션', 'SK텔레콤', 'LG전자', '삼성전기', '엔씨소프트',
        '카카오뱅크', '하나금융지주', '셀트리온', 'LG에너지솔루션', '에코프로비엠'
    ]
    
    # 추가 회사명 패턴
    prefixes = ['한국', '대한', '동양', '서울', '부산', '대구', '인천', '광주', '대전', '울산']
    suffixes = ['전자', '화학', '건설', '제약', '금속', '섬유', '식품', '통신', '보험', '증권', 
                '운수', '유통', '에너지', '바이오', '소프트', '테크', '시스템', '솔루션', '그룹', '홀딩스']
    
    for prefix in prefixes:
        for suffix in suffixes:
            companies.append(f"{prefix}{suffix}")
    
    # 영문 회사명도 추가
    english_companies = [
        'KOREA TECH', 'ASIA HOLDINGS', 'GLOBAL SYSTEMS', 'SMART SOLUTIONS',
        'NEW ENERGY', 'BIO PHARMA', 'DIGITAL WORKS', 'GREEN POWER'
    ]
    companies.extend(english_companies)
    
    return companies

def create_final_clean_sql():
    """완전히 중복 없는 최종 SQL 파일 생성"""
    
    print("🔄 최종 중복 없는 데이터 생성 중...")
    
    # 2500개 고유 종목코드 생성
    stock_codes = generate_unique_stock_codes(2500)
    company_names = generate_stock_names()
    
    print(f"✅ 고유 종목코드 {len(stock_codes)}개 생성 완료")
    
    sql_content = """-- 완전히 중복 없는 대량 Mock 데이터 (최종 버전)
-- 생성일시: """ + datetime.now().strftime('%Y-%m-%d %H:%M:%S') + """

USE kpsdb;

-- 1. 종목현재가 (2,500개 - 중복 없음 보장)
INSERT INTO stock_current_price (stock_code, stock_name, current_price, previous_close, change_amount, change_rate, volume, market_cap) VALUES
"""
    
    # 종목현재가 데이터 생성
    stock_lines = []
    for i, code in enumerate(stock_codes):
        name = company_names[i % len(company_names)]
        if i < 20:  # 첫 20개는 고객잔고 종목들
            customer_names = ['삼성전자', 'SK하이닉스', 'NAVER', 'LG화학', '삼성바이오로직스',
                            'POSCO홀딩스', '기아', '카카오', 'KB금융', '신한지주',
                            'SK이노베이션', 'SK텔레콤', 'LG전자', '삼성전기', '엔씨소프트',
                            '카카오뱅크', '하나금융지주', '셀트리온', 'LG에너지솔루션', '에코프로비엠']
            name = customer_names[i]
        
        current_price = random.randint(1000, 900000)
        previous_close = current_price + random.randint(-50000, 50000)
        change_amount = current_price - previous_close
        change_rate = round((change_amount / previous_close) * 100, 2) if previous_close > 0 else 0.0
        volume = random.randint(10000, 50000000)
        market_cap = random.randint(100000000000, 500000000000000)
        
        stock_lines.append(f"('{code}', '{name}', {current_price}, {previous_close}, {change_amount}, {change_rate}, {volume}, {market_cap})")
    
    sql_content += ',\n'.join(stock_lines) + ';\n\n'
    
    # 2. 고객잔고 (20개)
    sql_content += """-- 2. 고객잔고 (20개 종목)
INSERT INTO customer_balance (account_number, stock_code, stock_name, quantity, purchase_price) VALUES
"""
    
    balance_lines = []
    customer_stock_codes = stock_codes[:20]  # 처음 20개 종목
    customer_names = ['삼성전자', 'SK하이닉스', 'NAVER', 'LG화학', '삼성바이오로직스',
                     'POSCO홀딩스', '기아', '카카오', 'KB금융', '신한지주',
                     'SK이노베이션', 'SK텔레콤', 'LG전자', '삼성전기', '엔씨소프트',
                     '카카오뱅크', '하나금융지주', '셀트리온', 'LG에너지솔루션', '에코프로비엠']
    quantities = [500, 150, 80, 45, 25, 120, 200, 180, 220, 300, 
                  85, 160, 90, 130, 75, 400, 110, 95, 60, 140]
    
    for i, code in enumerate(customer_stock_codes):
        purchase_price = random.randint(10000, 800000)
        balance_lines.append(f"('99911122222', '{code}', '{customer_names[i]}', {quantities[i]}, {purchase_price}.00)")
    
    sql_content += ',\n'.join(balance_lines) + ';\n\n'
    
    # 3. 매매내역 (930건, PK 고유성 보장)
    sql_content += """-- 3. 매매내역 (930건, PK 중복 없음)
INSERT INTO trading_history (account_number, trading_date, order_number, execution_number, stock_code, stock_name, trade_type, quantity, price, amount, fee, tax) VALUES
"""
    
    trading_lines = []
    base_date = datetime(2024, 1, 1)
    
    for i in range(930):
        trading_date = (base_date + timedelta(days=random.randint(0, 300))).strftime('%Y%m%d')
        order_number = f"ORD{i+1:06d}"
        execution_number = f"EXE{i+1:06d}"
        
        # 고객잔고 종목들 중에서 선택
        stock_idx = random.randint(0, 19)
        stock_code = customer_stock_codes[stock_idx]
        stock_name = customer_names[stock_idx]
        
        trade_type = random.choice(['BUY', 'SELL'])
        quantity = random.randint(1, 100)
        price = random.randint(10000, 800000)
        amount = quantity * price
        fee = int(amount * 0.00015)
        tax = int(amount * 0.0025) if trade_type == 'SELL' else 0
        
        trading_lines.append(f"('99911122222', '{trading_date}', '{order_number}', '{execution_number}', '{stock_code}', '{stock_name}', '{trade_type}', {quantity}, {price}, {amount}, {fee}, {tax})")
    
    sql_content += ',\n'.join(trading_lines) + ';\n\n'
    
    # 4. 리밸런싱마스터 (15개)
    sql_content += """-- 4. 리밸런싱마스터 (15개)
INSERT INTO rebalancing_master (strategy_code, strategy_name, description, risk_level, expected_return, rebalancing_cycle, created_by, status) VALUES
"""
    
    strategies = [
        ('CONSERVATIVE_01', '안정형 포트폴리오', '안전자산 중심 포트폴리오', 'LOW', 'STABLE', 'QUARTERLY', 'SYSTEM', 'ACTIVE'),
        ('BALANCED_01', '균형형 포트폴리오', '주식과 채권의 균형', 'MEDIUM', 'MODERATE', 'MONTHLY', 'SYSTEM', 'ACTIVE'),
        ('GROWTH_01', '성장형 포트폴리오', '성장주 중심 포트폴리오', 'HIGH', 'AGGRESSIVE', 'WEEKLY', 'SYSTEM', 'ACTIVE'),
        ('DIVIDEND_01', '배당형 포트폴리오', '배당수익 극대화', 'LOW', 'STABLE', 'QUARTERLY', 'SYSTEM', 'ACTIVE'),
        ('TECH_01', 'IT기술주 포트폴리오', '기술주 집중 투자', 'HIGH', 'AGGRESSIVE', 'WEEKLY', 'SYSTEM', 'ACTIVE'),
        ('GLOBAL_01', '글로벌 포트폴리오', '해외주식 분산투자', 'MEDIUM', 'MODERATE', 'MONTHLY', 'SYSTEM', 'ACTIVE'),
        ('ESG_01', 'ESG 포트폴리오', '지속가능경영 기업', 'MEDIUM', 'MODERATE', 'MONTHLY', 'SYSTEM', 'ACTIVE'),
        ('SMALL_CAP_01', '중소형주 포트폴리오', '중소형주 성장 투자', 'HIGH', 'AGGRESSIVE', 'WEEKLY', 'SYSTEM', 'ACTIVE'),
        ('VALUE_01', '가치투자 포트폴리오', '저평가 우량주', 'MEDIUM', 'MODERATE', 'MONTHLY', 'SYSTEM', 'ACTIVE'),
        ('SECTOR_01', '섹터별 포트폴리오', '업종 분산 투자', 'MEDIUM', 'MODERATE', 'MONTHLY', 'SYSTEM', 'ACTIVE'),
        ('MOMENTUM_01', '모멘텀 포트폴리오', '상승 추세 종목', 'HIGH', 'AGGRESSIVE', 'WEEKLY', 'SYSTEM', 'ACTIVE'),
        ('DEFENSIVE_01', '방어형 포트폴리오', '경기방어주 중심', 'LOW', 'STABLE', 'QUARTERLY', 'SYSTEM', 'ACTIVE'),
        ('INCOME_01', '수익형 포트폴리오', '정기수익 중시', 'LOW', 'STABLE', 'QUARTERLY', 'SYSTEM', 'ACTIVE'),
        ('EMERGING_01', '이머징 포트폴리오', '신흥시장 투자', 'HIGH', 'AGGRESSIVE', 'WEEKLY', 'SYSTEM', 'ACTIVE'),
        ('HYBRID_01', '하이브리드 포트폴리오', '복합 투자 전략', 'MEDIUM', 'MODERATE', 'MONTHLY', 'SYSTEM', 'ACTIVE')
    ]
    
    strategy_lines = []
    for strategy in strategies:
        strategy_lines.append(f"('{strategy[0]}', '{strategy[1]}', '{strategy[2]}', '{strategy[3]}', '{strategy[4]}', '{strategy[5]}', '{strategy[6]}', '{strategy[7]}')")
    
    sql_content += ',\n'.join(strategy_lines) + ';\n\n'
    
    # 5. 리밸런싱분석 (15개, 전략별 1개씩)
    sql_content += """-- 5. 리밸런싱분석 (15개, 전략별 분석)
INSERT INTO rebalancing_analysis (strategy_code, expected_return, risk_score, sharpe_ratio, max_drawdown) VALUES
"""
    
    analysis_lines = []
    for strategy in strategies:
        expected_return = round(random.uniform(3.5, 18.5), 2)
        risk_score = round(random.uniform(1.2, 9.8), 2)
        sharpe_ratio = round(random.uniform(0.8, 2.8), 2)
        max_drawdown = random.randint(5, 35)
        
        analysis_lines.append(f"('{strategy[0]}', {expected_return}, {risk_score}, {sharpe_ratio}, {max_drawdown})")
    
    sql_content += ',\n'.join(analysis_lines) + ';\n\n'
    
    # 6. 고객전략 (1개)
    sql_content += """-- 6. 고객전략 (1개)
INSERT INTO customer_strategy (account_number, strategy_code, allocation_amount, start_date, status) VALUES
('99911122222', 'BALANCED_01', 50000000.00, '20241001', 'ACTIVE');

"""
    
    # 파일 저장
    with open('insert_bulk_data_final.sql', 'w', encoding='utf-8') as f:
        f.write(sql_content)
    
    print("✅ 최종 중복 없는 SQL 파일 생성 완료!")
    print("📁 파일: insert_bulk_data_final.sql")
    print(f"📊 종목현재가: {len(stock_codes):,}개 (완전 중복 없음)")
    print(f"📈 매매내역: 930건 (PK 고유성 보장)")
    print(f"📊 리밸런싱 전략: 15개")

if __name__ == "__main__":
    create_final_clean_sql()
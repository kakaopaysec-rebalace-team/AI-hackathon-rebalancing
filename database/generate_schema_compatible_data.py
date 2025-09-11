#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
실제 테이블 스키마와 완전히 호환되는 데이터 생성 스크립트
"""

import random
from datetime import datetime, timedelta

def create_schema_compatible_sql():
    """실제 테이블 스키마와 완벽하게 호환되는 SQL 생성"""
    
    print("🔄 스키마 호환 데이터 생성 중...")
    
    sql_content = """-- 실제 테이블 스키마와 완벽 호환 Mock 데이터
-- 생성일시: """ + datetime.now().strftime('%Y-%m-%d %H:%M:%S') + """

USE kpsdb;

"""
    
    # 1. 종목현재가 (스키마: stock_code, current_price, updated_at)
    sql_content += """-- 1. 종목현재가 (2,500개)
INSERT INTO stock_current_price (stock_code, current_price) VALUES
"""
    
    # 고유한 종목코드 2500개 생성
    stock_codes = set()
    while len(stock_codes) < 2500:
        code = f"{random.randint(1, 999999):06d}"
        stock_codes.add(code)
    
    stock_codes = sorted(list(stock_codes))
    
    stock_lines = []
    for code in stock_codes:
        current_price = random.randint(1000, 900000)
        stock_lines.append(f"('{code}', {current_price})")
    
    sql_content += ',\n'.join(stock_lines) + ';\n\n'
    
    # 2. 고객잔고 (스키마: account_number, stock_code, stock_name, quantity, purchase_amount)
    sql_content += """-- 2. 고객잔고 (20개 종목)
INSERT INTO customer_balance (account_number, stock_code, stock_name, quantity, purchase_amount) VALUES
"""
    
    customer_stocks = stock_codes[:20]  # 처음 20개 종목
    customer_names = [
        '삼성전자', 'SK하이닉스', 'NAVER', 'LG화학', '삼성바이오로직스',
        'POSCO홀딩스', '기아', '카카오', 'KB금융', '신한지주',
        'SK이노베이션', 'SK텔레콤', 'LG전자', '삼성전기', '엔씨소프트',
        '카카오뱅크', '하나금융지주', '셀트리온', 'LG에너지솔루션', '에코프로비엠'
    ]
    quantities = [500, 150, 80, 45, 25, 120, 200, 180, 220, 300, 
                  85, 160, 90, 130, 75, 400, 110, 95, 60, 140]
    
    balance_lines = []
    for i, code in enumerate(customer_stocks):
        purchase_amount = random.randint(1000000, 80000000)
        balance_lines.append(f"('99911122222', '{code}', '{customer_names[i]}', {quantities[i]}, {purchase_amount}.00)")
    
    sql_content += ',\n'.join(balance_lines) + ';\n\n'
    
    # 3. 매매내역 (스키마: account_number, trading_date, order_number, execution_number, stock_code, buy_sell_code, order_quantity, order_amount)
    sql_content += """-- 3. 매매내역 (930건)
INSERT INTO trading_history (account_number, trading_date, order_number, execution_number, stock_code, buy_sell_code, order_quantity, order_amount) VALUES
"""
    
    trading_lines = []
    base_date = datetime(2024, 1, 1)
    
    for i in range(930):
        trading_date = (base_date + timedelta(days=random.randint(0, 300))).strftime('%Y%m%d')
        order_number = f"ORD{i+1:06d}"
        execution_number = f"EXE{i+1:06d}"
        
        # 고객잔고 종목들 중에서 선택
        stock_code = random.choice(customer_stocks)
        
        buy_sell_code = random.choice(['1', '2'])  # 1:매수, 2:매도
        order_quantity = random.randint(1, 100)
        order_amount = random.randint(100000, 50000000)
        
        trading_lines.append(f"('99911122222', '{trading_date}', '{order_number}', '{execution_number}', '{stock_code}', '{buy_sell_code}', {order_quantity}, {order_amount}.00)")
    
    sql_content += ',\n'.join(trading_lines) + ';\n\n'
    
    # 4. 리밸런싱마스터 (스키마: rebalancing_strategy_code, rebalancing_name, rebalancing_description, risk_level, investment_style, keyword1, keyword2, keyword3)
    sql_content += """-- 4. 리밸런싱마스터 (15개)
INSERT INTO rebalancing_master (rebalancing_strategy_code, rebalancing_name, rebalancing_description, risk_level, investment_style, keyword1, keyword2, keyword3) VALUES
"""
    
    # 실제 ENUM 값에 맞춤 
    # risk_level: '초저위험', '저위험', '중위험', '고위험', '초고위험'
    # investment_style: '가치투자', '성장투자', '배당투자', '지수추종', '단기/스윙', '퀀트/시스템트레이딩', '테마/모멘텀'
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
    
    # 5. 리밸런싱분석 (스키마: rebalancing_strategy_code, expected_return, volatility, max_drawdown, investor_preference)
    sql_content += """-- 5. 리밸런싱분석 (15개)
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
    
    # 6. 고객전략 (스키마: account_number, rebalancing_strategy_code, rebalancing_cycle, allowed_deviation, rebalancing_yn)
    sql_content += """-- 6. 고객전략 (1개)
INSERT INTO customer_strategy (account_number, rebalancing_strategy_code, rebalancing_cycle, allowed_deviation, rebalancing_yn) VALUES
('99911122222', 'BALANCED_01', 30, 5.00, 'Y');

"""
    
    # 파일 저장
    with open('insert_bulk_data_schema_compatible.sql', 'w', encoding='utf-8') as f:
        f.write(sql_content)
    
    print("✅ 스키마 호환 SQL 파일 생성 완료!")
    print("📁 파일: insert_bulk_data_schema_compatible.sql")
    print(f"📊 종목현재가: {len(stock_codes):,}개")
    print(f"📈 고객잔고: 20개 종목")
    print(f"📈 매매내역: 930건")
    print(f"📊 리밸런싱 전략: 15개")
    print("✅ 모든 컬럼이 실제 테이블 스키마와 완벽 호환")

if __name__ == "__main__":
    create_schema_compatible_sql()
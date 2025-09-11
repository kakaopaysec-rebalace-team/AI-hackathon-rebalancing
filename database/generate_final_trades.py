#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
매매내역 930건 자동 생성 스크립트
현재까지 약 160건이 생성되었으므로 나머지 770건을 생성
"""

import random
from datetime import datetime, timedelta

def generate_trading_data():
    """매매내역 770건 생성"""
    
    # 기본 설정
    account_number = '99911122222'
    start_date = datetime(2025, 8, 3)  # 8월 3일부터
    
    # 종목코드 리스트 (6자리 가상 종목들)
    stock_codes = []
    for prefix in ['100', '200', '300', '400', '500', '600']:
        for i in range(10, 100):  # 각 prefix별로 90개씩
            stock_codes.append(f"{prefix}{i:03d}")
    
    trades = []
    order_counter = 1
    
    # 8월 3일부터 31일까지 (29일간)
    for day_offset in range(0, 29):
        current_date = start_date + timedelta(days=day_offset)
        date_str = current_date.strftime('%Y%m%d')
        
        # 하루에 약 26-27건씩 생성 (총 770건)
        trades_per_day = 27 if day_offset < 14 else 26
        
        for i in range(trades_per_day):
            # 매수/매도 쌍으로 생성 (단타)
            stock_code = random.choice(stock_codes)
            quantity = random.randint(10, 500)
            buy_price = random.randint(1000, 50000)
            sell_price = buy_price + random.randint(-200, 500)  # 약간의 손익
            
            # 매수 주문
            order_num = f"ORD{date_str}{order_counter:03d}"
            exec_num = f"EXE{date_str}{order_counter:03d}"
            trades.append(f"('{account_number}', '{date_str}', '{order_num}', '{exec_num}', '{stock_code}', '1', {quantity}, {buy_price}.00)")
            order_counter += 1
            
            # 매도 주문 (같은 날 또는 다른 날)
            if random.random() > 0.3:  # 70% 확률로 같은 날 매도
                sell_date = date_str
            else:  # 30% 확률로 다른 날 매도
                future_date = current_date + timedelta(days=random.randint(1, 5))
                sell_date = future_date.strftime('%Y%m%d')
                if future_date > datetime(2025, 8, 31):
                    sell_date = '20250831'
            
            order_num = f"ORD{sell_date}{order_counter:03d}"
            exec_num = f"EXE{sell_date}{order_counter:03d}"
            trades.append(f"('{account_number}', '{sell_date}', '{order_num}', '{exec_num}', '{stock_code}', '2', {quantity}, {sell_price}.00)")
            order_counter += 1
            
            if len(trades) >= 770:
                break
        
        if len(trades) >= 770:
            break
    
    return trades[:770]  # 정확히 770건

def write_sql_file():
    """SQL 파일 생성"""
    trades = generate_trading_data()
    
    sql_content = """-- 매매내역 나머지 770건 자동 생성
-- Python 스크립트로 생성된 추가 매매내역

USE kpsdb;

INSERT INTO trading_history (
    account_number, trading_date, order_number, execution_number, 
    stock_code, buy_sell_code, order_quantity, order_amount
) VALUES
"""
    
    # 770건의 거래 데이터 추가
    sql_content += ',\n'.join(trades) + ';'
    
    # 데이터 확인 쿼리 추가
    sql_content += """

-- 데이터 확인
SELECT COUNT(*) as total_trades FROM trading_history WHERE account_number = '99911122222';

-- 일별 거래 건수 확인
SELECT 
    trading_date,
    COUNT(*) as daily_trades
FROM trading_history 
WHERE account_number = '99911122222'
GROUP BY trading_date
ORDER BY trading_date;

-- 매수/매도 건수 확인
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
"""
    
    # 파일 저장
    with open('/Users/todd.rsp/kps_hacker/port-tune-up/database/insert_remaining_trades.sql', 'w', encoding='utf-8') as f:
        f.write(sql_content)
    
    print(f"✅ 매매내역 770건이 포함된 SQL 파일이 생성되었습니다.")
    print(f"📁 파일: /Users/todd.rsp/kps_hacker/port-tune-up/database/insert_remaining_trades.sql")
    print(f"📊 총 거래 건수: {len(trades)}건")

if __name__ == "__main__":
    write_sql_file()
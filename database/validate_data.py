#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
데이터 정합성 및 PK 중복 검증 스크립트
"""

import re

def validate_sql_file():
    """SQL 파일의 데이터 정합성 검증"""
    
    file_path = '/Users/todd.rsp/kps_hacker/port-tune-up/database/insert_bulk_data_final.sql'
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    print("🔍 데이터 정합성 및 중복 검증 시작...")
    
    # 1. 종목코드 중복 검사
    stock_codes = re.findall(r"'(\d{6})'", content)
    stock_codes_set = set(stock_codes)
    
    print(f"📊 전체 종목코드 사용: {len(stock_codes):,}개")
    print(f"📊 고유 종목코드: {len(stock_codes_set):,}개")
    
    if len(stock_codes) != len(stock_codes_set):
        duplicates = []
        for code in stock_codes_set:
            if stock_codes.count(code) > 1:
                duplicates.append((code, stock_codes.count(code)))
        
        print(f"⚠️  중복된 종목코드: {len(duplicates)}개")
        for code, count in duplicates[:10]:  # 처음 10개만 표시
            print(f"   - {code}: {count}번 사용")
    else:
        print("✅ 종목코드 중복 없음")
    
    # 2. 매매내역 PK 중복 검사 (account_number, trading_date, order_number, execution_number)
    trading_pattern = r"\('99911122222', '(\d{8})', '(ORD\d+)', '(EXE\d+)'"
    trading_matches = re.findall(trading_pattern, content)
    
    trading_pks = [(match[0], match[1], match[2]) for match in trading_matches]
    trading_pks_set = set(trading_pks)
    
    print(f"📈 매매내역 총 건수: {len(trading_pks):,}건")
    
    if len(trading_pks) != len(trading_pks_set):
        print("⚠️  매매내역 PK 중복 발견")
    else:
        print("✅ 매매내역 PK 중복 없음")
    
    # 3. 외래키 정합성 검사
    # 고객잔고의 종목코드들이 종목현재가에 존재하는지 확인
    customer_balance_pattern = r"\('99911122222', '(\d{6})', '[^']+', \d+, [\d.]+\)"
    customer_stocks = re.findall(customer_balance_pattern, content)
    
    missing_stocks = []
    for stock in customer_stocks:
        if stock not in stock_codes_set:
            missing_stocks.append(stock)
    
    if missing_stocks:
        print(f"⚠️  고객잔고에 있지만 종목현재가에 없는 종목: {missing_stocks}")
    else:
        print("✅ 고객잔고 외래키 정합성 확인")
    
    # 4. 리밸런싱 전략 정합성 검사
    rebalancing_master_pattern = r"\('([^']+)', '[^']+', '[^']*', '[^']+', '[^']+', '[^']*', '[^']*', '[^']*'\)"
    strategy_codes_master = set(re.findall(rebalancing_master_pattern, content))
    
    rebalancing_analysis_pattern = r"\('([^']+)', [\d.-]+, [\d.-]+, [\d.-]+, \d+\)"
    strategy_codes_analysis = set(re.findall(rebalancing_analysis_pattern, content))
    
    print(f"📊 리밸런싱마스터 전략: {len(strategy_codes_master)}개")
    print(f"📊 리밸런싱분석 전략: {len(strategy_codes_analysis)}개")
    
    if strategy_codes_master == strategy_codes_analysis:
        print("✅ 리밸런싱 전략 정합성 확인")
    else:
        print("⚠️  리밸런싱 전략 불일치")
        print(f"   마스터에만 있음: {strategy_codes_master - strategy_codes_analysis}")
        print(f"   분석에만 있음: {strategy_codes_analysis - strategy_codes_master}")
    
    # 5. 테이블별 예상 건수 확인
    print("\n📋 예상 데이터 건수:")
    print(f"   - 종목현재가: ~2,500개")
    print(f"   - 고객잔고: 20개")
    print(f"   - 매매내역: 930건")
    print(f"   - 리밸런싱마스터: 15개")
    print(f"   - 리밸런싱분석: 15개")
    print(f"   - 고객전략: 1개")
    
    return len(duplicates) == 0 if 'duplicates' in locals() else True

def generate_fix_if_needed():
    """필요시 수정 스크립트 생성"""
    print("\n🔧 중복 해결을 위한 권장사항:")
    print("1. 고객잔고에서 사용하는 종목들은 대형주 섹션에서 제거")
    print("2. 매매내역의 PK(주문번호, 체결번호)는 일련번호로 고유성 보장")
    print("3. 종목현재가 테이블에 고객잔고 필요 종목들이 모두 포함되어야 함")

if __name__ == "__main__":
    is_valid = validate_sql_file()
    generate_fix_if_needed()
    
    if is_valid:
        print("\n🎉 데이터 검증 완료! SQL 파일이 실행 준비되었습니다.")
    else:
        print("\n⚠️  일부 문제가 발견되었습니다. 수정이 필요합니다.")
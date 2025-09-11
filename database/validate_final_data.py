#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
최종 데이터 정합성 검증 스크립트 (테이블별 검증)
"""

import re

def validate_final_data():
    """최종 SQL 파일의 테이블별 데이터 정합성 검증"""
    
    file_path = '/Users/todd.rsp/kps_hacker/port-tune-up/database/insert_bulk_data_no_duplicate.sql'
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    print("🔍 최종 데이터 정합성 검증 시작...")
    print("=" * 60)
    
    # 1. 종목현재가 테이블 중복 검사 (가장 중요)
    stock_price_pattern = r"INSERT INTO stock_current_price.*?VALUES\s*(.*?);\s*\n\n"
    stock_price_match = re.search(stock_price_pattern, content, re.DOTALL)
    
    if stock_price_match:
        stock_entries = stock_price_match.group(1)
        stock_codes = re.findall(r"\('(\d{6})',", stock_entries)
        
        print(f"📊 종목현재가 총 등록 건수: {len(stock_codes):,}개")
        print(f"📊 종목현재가 고유 종목: {len(set(stock_codes)):,}개")
        
        if len(stock_codes) == len(set(stock_codes)):
            print("✅ 종목현재가 테이블: 중복 없음 (완벽)")
        else:
            duplicates = {}
            for code in stock_codes:
                if stock_codes.count(code) > 1:
                    duplicates[code] = stock_codes.count(code)
            
            print(f"❌ 종목현재가 테이블 중복: {len(duplicates)}개")
            for code, count in list(duplicates.items())[:5]:
                print(f"   - {code}: {count}번 중복")
            return False
    
    # 2. 고객잔고 외래키 정합성
    balance_pattern = r"INSERT INTO customer_balance.*?VALUES\s*(.*?);\s*\n\n"
    balance_match = re.search(balance_pattern, content, re.DOTALL)
    
    if balance_match:
        balance_entries = balance_match.group(1)
        balance_stock_codes = set(re.findall(r"'99911122222', '(\d{6})'", balance_entries))
        stock_codes_set = set(stock_codes)
        
        print(f"📈 고객잔고 종목 수: {len(balance_stock_codes)}개")
        
        missing_stocks = balance_stock_codes - stock_codes_set
        if not missing_stocks:
            print("✅ 고객잔고 외래키: 정합성 완벽")
        else:
            print(f"❌ 고객잔고에 있지만 종목현재가에 없는 종목: {missing_stocks}")
            return False
    
    # 3. 매매내역 PK 및 외래키 검사
    trading_pattern = r"INSERT INTO trading_history.*?VALUES\s*(.*?);\s*\n\n"
    trading_match = re.search(trading_pattern, content, re.DOTALL)
    
    if trading_match:
        trading_entries = trading_match.group(1)
        
        # PK 검사 (계좌번호, 거래일, 주문번호, 체결번호)
        pk_pattern = r"\('99911122222', '(\d{8})', '(ORD\d+)', '(EXE\d+)'"
        pk_matches = re.findall(pk_pattern, trading_entries)
        
        print(f"📈 매매내역 총 건수: {len(pk_matches):,}건")
        
        if len(pk_matches) == len(set(pk_matches)):
            print("✅ 매매내역 PK: 중복 없음 (완벽)")
        else:
            print("❌ 매매내역 PK 중복 발견")
            return False
        
        # 외래키 검사
        trading_stock_codes = set(re.findall(r"'(ORD\d+)', '(EXE\d+)', '(\d{6})'", trading_entries))
        trading_stock_codes = set([match[2] for match in re.findall(r"'(ORD\d+)', '(EXE\d+)', '(\d{6})'", trading_entries)])
        
        missing_trading_stocks = trading_stock_codes - stock_codes_set
        if not missing_trading_stocks:
            print("✅ 매매내역 외래키: 정합성 완벽")
        else:
            print(f"❌ 매매내역에 있지만 종목현재가에 없는 종목: {missing_trading_stocks}")
            return False
    
    # 4. 리밸런싱 전략 정합성
    master_pattern = r"INSERT INTO rebalancing_master.*?VALUES\s*(.*?);\s*\n\n"
    analysis_pattern = r"INSERT INTO rebalancing_analysis.*?VALUES\s*(.*?);\s*\n\n"
    
    master_match = re.search(master_pattern, content, re.DOTALL)
    analysis_match = re.search(analysis_pattern, content, re.DOTALL)
    
    if master_match and analysis_match:
        master_entries = master_match.group(1)
        analysis_entries = analysis_match.group(1)
        
        master_codes = set(re.findall(r"\('([^']+)',", master_entries))
        analysis_codes = set(re.findall(r"\('([^']+)',", analysis_entries))
        
        print(f"📊 리밸런싱마스터: {len(master_codes)}개")
        print(f"📊 리밸런싱분석: {len(analysis_codes)}개")
        
        if master_codes == analysis_codes:
            print("✅ 리밸런싱 전략: 정합성 완벽")
        else:
            print("❌ 리밸런싱 전략 불일치")
            print(f"   마스터에만 있음: {master_codes - analysis_codes}")
            print(f"   분석에만 있음: {analysis_codes - master_codes}")
            return False
    
    # 5. 고객전략 외래키 검사
    customer_strategy_pattern = r"INSERT INTO customer_strategy.*?VALUES\s*\('99911122222', '([^']+)'"
    customer_strategy_match = re.search(customer_strategy_pattern, content)
    
    if customer_strategy_match:
        customer_strategy_code = customer_strategy_match.group(1)
        if customer_strategy_code in master_codes:
            print("✅ 고객전략 외래키: 정합성 완벽")
        else:
            print(f"❌ 고객전략에서 참조하는 전략코드가 마스터에 없음: {customer_strategy_code}")
            return False
    
    print("=" * 60)
    print("🎉 모든 데이터 정합성 검증 완료!")
    print("✨ 데이터베이스 실행 준비 완료!")
    
    # 최종 요약 통계
    print("\n📋 최종 데이터 요약:")
    print(f"   - 종목현재가: {len(stock_codes):,}개 (중복 없음)")
    print(f"   - 고객잔고: {len(balance_stock_codes)}개 종목")
    print(f"   - 매매내역: {len(pk_matches):,}건 (PK 고유)")
    print(f"   - 리밸런싱마스터: {len(master_codes)}개 전략")
    print(f"   - 리밸런싱분석: {len(analysis_codes)}개 분석")
    print(f"   - 고객전략: 1개")
    
    return True

if __name__ == "__main__":
    is_valid = validate_final_data()
    
    if is_valid:
        print("\n🚀 insert_bulk_data_final.sql 파일이 실행 준비되었습니다!")
        print("💡 사용법: mysql -u kps -p kpsdb < insert_bulk_data_final.sql")
    else:
        print("\n⚠️  데이터 오류가 발견되었습니다. 재생성이 필요합니다.")
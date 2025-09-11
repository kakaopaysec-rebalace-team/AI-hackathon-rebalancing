#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
ENUM 값 유효성 검증 스크립트
"""

import re

def validate_enum_values():
    """SQL 파일의 ENUM 값들이 스키마에 정의된 값과 일치하는지 검증"""
    
    print("🔍 ENUM 값 유효성 검증 시작...")
    
    # 스키마에서 정의된 ENUM 값들
    valid_risk_levels = {'초저위험', '저위험', '중위험', '고위험', '초고위험'}
    valid_investment_styles = {'가치투자', '성장투자', '배당투자', '지수추종', '단기/스윙', '퀀트/시스템트레이딩', '테마/모멘텀'}
    
    # SQL 파일에서 사용된 값들 추출
    with open('/Users/todd.rsp/kps_hacker/port-tune-up/database/insert_bulk_data_schema_compatible.sql', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 리밸런싱마스터 INSERT 구문 찾기
    master_pattern = r"INSERT INTO rebalancing_master.*?VALUES\s*(.*?);\s*\n\n"
    master_match = re.search(master_pattern, content, re.DOTALL)
    
    if master_match:
        master_data = master_match.group(1)
        
        # 각 행에서 risk_level(4번째), investment_style(5번째) 추출
        rows = re.findall(r"\('([^']+)', '([^']+)', '([^']+)', '([^']+)', '([^']+)', '([^']+)', '([^']+)', '([^']+)'\)", master_data)
        
        print(f"📊 리밸런싱마스터 데이터 검증: {len(rows)}건")
        
        invalid_risk_levels = set()
        invalid_investment_styles = set()
        
        for row in rows:
            strategy_code = row[0]
            risk_level = row[3]
            investment_style = row[4]
            
            if risk_level not in valid_risk_levels:
                invalid_risk_levels.add(risk_level)
                print(f"❌ {strategy_code}: 잘못된 risk_level '{risk_level}'")
            
            if investment_style not in valid_investment_styles:
                invalid_investment_styles.add(investment_style)
                print(f"❌ {strategy_code}: 잘못된 investment_style '{investment_style}'")
        
        if not invalid_risk_levels and not invalid_investment_styles:
            print("✅ 모든 ENUM 값이 유효합니다!")
            print(f"✅ 사용된 위험도: {set(row[3] for row in rows)}")
            print(f"✅ 사용된 투자스타일: {set(row[4] for row in rows)}")
            return True
        else:
            if invalid_risk_levels:
                print(f"❌ 잘못된 위험도 값: {invalid_risk_levels}")
                print(f"   유효한 값: {valid_risk_levels}")
            
            if invalid_investment_styles:
                print(f"❌ 잘못된 투자스타일 값: {invalid_investment_styles}")
                print(f"   유효한 값: {valid_investment_styles}")
            return False
    
    else:
        print("❌ 리밸런싱마스터 INSERT 구문을 찾을 수 없습니다.")
        return False

if __name__ == "__main__":
    is_valid = validate_enum_values()
    
    if is_valid:
        print("\n🎉 ENUM 값 검증 완료! SQL 파일 실행 준비됨")
    else:
        print("\n⚠️  ENUM 값 오류 발견, 수정 필요")
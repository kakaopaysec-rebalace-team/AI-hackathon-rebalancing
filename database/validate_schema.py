#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
테이블 스키마와 INSERT 문 컬럼명 일치성 검증 스크립트
"""

import re

def extract_schema_columns():
    """create_tables.sql에서 테이블별 컬럼 정보 추출"""
    
    with open('/Users/todd.rsp/kps_hacker/port-tune-up/database/create_tables.sql', 'r', encoding='utf-8') as f:
        schema_content = f.read()
    
    tables = {}
    
    # 각 테이블의 CREATE TABLE 구문 찾기
    table_patterns = [
        ('customer_balance', r'CREATE TABLE customer_balance \((.*?)\) ENGINE'),
        ('trading_history', r'CREATE TABLE trading_history \((.*?)\) ENGINE'),
        ('stock_current_price', r'CREATE TABLE stock_current_price \((.*?)\) ENGINE'),
        ('customer_strategy', r'CREATE TABLE customer_strategy \((.*?)\) ENGINE'),
        ('rebalancing_master', r'CREATE TABLE rebalancing_master \((.*?)\) ENGINE'),
        ('rebalancing_analysis', r'CREATE TABLE rebalancing_analysis \((.*?)\) ENGINE')
    ]
    
    for table_name, pattern in table_patterns:
        match = re.search(pattern, schema_content, re.DOTALL)
        if match:
            table_def = match.group(1)
            
            # 컬럼명 추출 (첫 번째 단어가 컬럼명)
            columns = []
            lines = table_def.split('\n')
            for line in lines:
                line = line.strip()
                if line and not line.startswith('PRIMARY') and not line.startswith('UNIQUE') and not line.startswith('INDEX') and not line.startswith('CHECK'):
                    column_name = line.split()[0]
                    if column_name and not column_name.startswith('--'):
                        columns.append(column_name)
            
            tables[table_name] = columns
            print(f"📋 {table_name}: {columns}")
    
    return tables

def extract_sql_columns(sql_file):
    """SQL 파일에서 INSERT 문의 컬럼명 추출"""
    
    with open(sql_file, 'r', encoding='utf-8') as f:
        sql_content = f.read()
    
    insert_columns = {}
    
    # INSERT INTO 패턴들
    patterns = [
        ('stock_current_price', r'INSERT INTO stock_current_price \((.*?)\) VALUES'),
        ('customer_balance', r'INSERT INTO customer_balance \((.*?)\) VALUES'),
        ('trading_history', r'INSERT INTO trading_history \((.*?)\) VALUES'),
        ('rebalancing_master', r'INSERT INTO rebalancing_master \((.*?)\) VALUES'),
        ('rebalancing_analysis', r'INSERT INTO rebalancing_analysis \((.*?)\) VALUES'),
        ('customer_strategy', r'INSERT INTO customer_strategy \((.*?)\) VALUES')
    ]
    
    for table_name, pattern in patterns:
        match = re.search(pattern, sql_content, re.DOTALL)
        if match:
            columns_str = match.group(1)
            columns = [col.strip() for col in columns_str.split(',')]
            insert_columns[table_name] = columns
            print(f"📝 {table_name} INSERT: {columns}")
    
    return insert_columns

def validate_schema_compatibility():
    """스키마와 SQL 파일의 호환성 검증"""
    
    print("🔍 테이블 스키마 vs SQL 컬럼명 검증 시작...")
    print("=" * 70)
    
    schema_columns = extract_schema_columns()
    print("\n" + "=" * 70)
    
    sql_columns = extract_sql_columns('/Users/todd.rsp/kps_hacker/port-tune-up/database/insert_bulk_data_schema_compatible.sql')
    print("\n" + "=" * 70)
    
    all_compatible = True
    
    for table_name in schema_columns.keys():
        if table_name in sql_columns:
            schema_cols = set(schema_columns[table_name])
            sql_cols = set(sql_columns[table_name])
            
            print(f"\n🔍 {table_name} 테이블 검증:")
            
            # SQL에 있지만 스키마에 없는 컬럼
            missing_in_schema = sql_cols - schema_cols
            if missing_in_schema:
                print(f"  ❌ 스키마에 없는 컬럼: {missing_in_schema}")
                all_compatible = False
            
            # 스키마에 있지만 SQL에 없는 컬럼 (자동 생성 컬럼은 제외)
            auto_columns = {'id', 'created_at', 'updated_at'}
            missing_in_sql = (schema_cols - sql_cols) - auto_columns
            if missing_in_sql:
                print(f"  ⚠️  SQL에 없는 컬럼: {missing_in_sql}")
            
            if not missing_in_schema and not missing_in_sql:
                print(f"  ✅ 완벽 호환")
        else:
            print(f"\n❌ {table_name}: SQL 파일에 INSERT 문이 없음")
            all_compatible = False
    
    print("\n" + "=" * 70)
    if all_compatible:
        print("🎉 모든 테이블이 스키마와 호환됩니다!")
    else:
        print("⚠️  스키마 불일치 문제가 발견되었습니다!")
        print("\n🔧 수정 권장사항:")
        print("1. stock_current_price 테이블에 stock_name 컬럼 추가 필요")
        print("2. customer_balance INSERT문에서 purchase_price → purchase_amount 수정")
        print("3. trading_history INSERT문 컬럼 구조 전면 수정 필요")
    
    return all_compatible

if __name__ == "__main__":
    validate_schema_compatibility()
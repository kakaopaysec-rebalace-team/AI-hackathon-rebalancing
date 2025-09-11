#!/bin/bash

# 포트폴리오 관리 시스템 상태 확인 스크립트

echo "📊 포트폴리오 관리 시스템 상태 확인"
echo "=================================================="

# 현재 디렉토리 확인
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "📁 프로젝트 디렉토리: $PROJECT_ROOT"
echo "🕐 확인 시간: $(date)"

# 1. 프로세스 상태 확인
echo ""
echo "🔍 프로세스 상태:"

BACKEND_PID_FILE="$PROJECT_ROOT/logs/backend.pid"
FRONTEND_PID_FILE="$PROJECT_ROOT/logs/frontend.pid"

# 백엔드 프로세스 확인
if [ -f "$BACKEND_PID_FILE" ]; then
    BACKEND_PID=$(cat "$BACKEND_PID_FILE")
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        echo "  🖥️  백엔드:     ✅ 실행 중 (PID: $BACKEND_PID)"
        BACKEND_STATUS="running"
    else
        echo "  🖥️  백엔드:     ❌ 중지됨 (PID 파일 존재하지만 프로세스 없음)"
        BACKEND_STATUS="stopped"
    fi
else
    echo "  🖥️  백엔드:     ❌ 중지됨 (PID 파일 없음)"
    BACKEND_STATUS="stopped"
fi

# 프론트엔드 프로세스 확인
if [ -f "$FRONTEND_PID_FILE" ]; then
    FRONTEND_PID=$(cat "$FRONTEND_PID_FILE")
    if ps -p $FRONTEND_PID > /dev/null 2>&1; then
        echo "  🌐 프론트엔드:  ✅ 실행 중 (PID: $FRONTEND_PID)"
        FRONTEND_STATUS="running"
    else
        echo "  🌐 프론트엔드:  ❌ 중지됨 (PID 파일 존재하지만 프로세스 없음)"
        FRONTEND_STATUS="stopped"
    fi
else
    echo "  🌐 프론트엔드:  ❌ 중지됨 (PID 파일 없음)"
    FRONTEND_STATUS="stopped"
fi

# 2. 포트 상태 확인
echo ""
echo "🔌 포트 상태:"

# 3001 포트 (백엔드) 확인
if lsof -ti:3001 > /dev/null 2>&1; then
    BACKEND_PORT_PID=$(lsof -ti:3001)
    echo "  📡 포트 3001:   ✅ 사용 중 (PID: $BACKEND_PORT_PID)"
else
    echo "  📡 포트 3001:   ❌ 비어있음"
fi

# 8080 포트 (프론트엔드) 확인
if lsof -ti:8080 > /dev/null 2>&1; then
    FRONTEND_PORT_PID=$(lsof -ti:8080)
    echo "  🌐 포트 8080:   ✅ 사용 중 (PID: $FRONTEND_PORT_PID)"
else
    echo "  🌐 포트 8080:   ❌ 비어있음"
fi

# 3. 서비스 응답 확인
echo ""
echo "🌐 서비스 응답 확인:"

# 백엔드 헬스체크
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo "  🖥️  백엔드 API:   ✅ 응답 정상"
    
    # API 세부 정보 확인
    HEALTH_RESPONSE=$(curl -s http://localhost:3001/health 2>/dev/null)
    if [ ! -z "$HEALTH_RESPONSE" ]; then
        echo "      💡 상태: $(echo $HEALTH_RESPONSE | grep -o '"status":"[^"]*"' | cut -d'"' -f4)"
        echo "      💡 DB: $(echo $HEALTH_RESPONSE | grep -o '"database":"[^"]*"' | cut -d'"' -f4)"
    fi
else
    echo "  🖥️  백엔드 API:   ❌ 응답 없음"
fi

# 프론트엔드 응답 확인
if curl -s http://localhost:8080 > /dev/null 2>&1; then
    echo "  🌐 프론트엔드:   ✅ 응답 정상"
else
    echo "  🌐 프론트엔드:   ❌ 응답 없음"
fi

# 4. 로그 파일 상태
echo ""
echo "📄 로그 파일 상태:"

if [ -f "$PROJECT_ROOT/logs/backend.log" ]; then
    BACKEND_LOG_SIZE=$(wc -c < "$PROJECT_ROOT/logs/backend.log" 2>/dev/null || echo "0")
    BACKEND_LOG_LINES=$(wc -l < "$PROJECT_ROOT/logs/backend.log" 2>/dev/null || echo "0")
    echo "  📡 백엔드 로그:   ${BACKEND_LOG_SIZE} bytes, ${BACKEND_LOG_LINES} lines"
    
    # 최근 오류 확인
    if grep -i "error\|fail\|exception" "$PROJECT_ROOT/logs/backend.log" > /dev/null 2>&1; then
        ERROR_COUNT=$(grep -ci "error\|fail\|exception" "$PROJECT_ROOT/logs/backend.log")
        echo "      ⚠️  오류 발견: ${ERROR_COUNT}개"
    fi
else
    echo "  📡 백엔드 로그:   없음"
fi

if [ -f "$PROJECT_ROOT/logs/frontend.log" ]; then
    FRONTEND_LOG_SIZE=$(wc -c < "$PROJECT_ROOT/logs/frontend.log" 2>/dev/null || echo "0")
    FRONTEND_LOG_LINES=$(wc -l < "$PROJECT_ROOT/logs/frontend.log" 2>/dev/null || echo "0")
    echo "  🌐 프론트엔드 로그: ${FRONTEND_LOG_SIZE} bytes, ${FRONTEND_LOG_LINES} lines"
    
    # 최근 오류 확인
    if grep -i "error\|fail\|exception" "$PROJECT_ROOT/logs/frontend.log" > /dev/null 2>&1; then
        ERROR_COUNT=$(grep -ci "error\|fail\|exception" "$PROJECT_ROOT/logs/frontend.log")
        echo "      ⚠️  오류 발견: ${ERROR_COUNT}개"
    fi
else
    echo "  🌐 프론트엔드 로그: 없음"
fi

# 5. 데이터베이스 연결 테스트
echo ""
echo "🗄️  데이터베이스 상태:"

if command -v mysql &> /dev/null; then
    if mysql -h 127.0.0.1 -u rebalance -p'Kakaopay2025!' -e "USE kpsdb; SELECT COUNT(*) as stock_count FROM stock_current_price;" 2>/dev/null | tail -1 | grep -q '^[0-9]'; then
        STOCK_COUNT=$(mysql -h 127.0.0.1 -u rebalance -p'Kakaopay2025!' -e "USE kpsdb; SELECT COUNT(*) FROM stock_current_price;" 2>/dev/null | tail -1)
        BALANCE_COUNT=$(mysql -h 127.0.0.1 -u rebalance -p'Kakaopay2025!' -e "USE kpsdb; SELECT COUNT(*) FROM customer_balance;" 2>/dev/null | tail -1)
        echo "  💾 MariaDB:     ✅ 연결 정상"
        echo "      📊 종목현재가: ${STOCK_COUNT}건"
        echo "      📈 고객잔고: ${BALANCE_COUNT}건"
    else
        echo "  💾 MariaDB:     ❌ 연결 실패"
    fi
else
    echo "  💾 MariaDB:     ⚠️  mysql 클라이언트 없음"
fi

# 6. 전체 상태 요약
echo ""
echo "📋 전체 상태 요약:"

if [[ "$BACKEND_STATUS" == "running" && "$FRONTEND_STATUS" == "running" ]]; then
    echo "  🎉 시스템 상태: 모든 서비스 정상 실행 중"
    echo ""
    echo "  🔗 접속 주소:"
    echo "     🖥️  백엔드:     http://localhost:3001"
    echo "     🌐 프론트엔드:  http://localhost:8080"
elif [[ "$BACKEND_STATUS" == "running" ]]; then
    echo "  ⚠️  시스템 상태: 백엔드만 실행 중"
elif [[ "$FRONTEND_STATUS" == "running" ]]; then
    echo "  ⚠️  시스템 상태: 프론트엔드만 실행 중"
else
    echo "  ❌ 시스템 상태: 모든 서비스 중지됨"
fi

echo ""
echo "🛠️  관리 명령어:"
echo "   🚀 시작: ./scripts/start.sh"
echo "   🛑 중지: ./scripts/stop.sh"
echo "   📄 로그: tail -f $PROJECT_ROOT/logs/backend.log"
echo "   📄 로그: tail -f $PROJECT_ROOT/logs/frontend.log"
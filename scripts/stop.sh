#!/bin/bash

# 포트폴리오 관리 시스템 전체 중지 스크립트

set -e  # 오류 발생 시 스크립트 중단

echo "🛑 포트폴리오 관리 시스템 중지 중..."
echo "=================================================="

# 현재 디렉토리 확인
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "📁 프로젝트 디렉토리: $PROJECT_ROOT"

# PID 파일들 확인
BACKEND_PID_FILE="$PROJECT_ROOT/logs/backend.pid"
FRONTEND_PID_FILE="$PROJECT_ROOT/logs/frontend.pid"

# 1. 백엔드 서버 중지
echo ""
echo "🖥️  백엔드 서버 중지 중..."

if [ -f "$BACKEND_PID_FILE" ]; then
    BACKEND_PID=$(cat "$BACKEND_PID_FILE")
    
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        echo "🔄 백엔드 프로세스 종료 중... (PID: $BACKEND_PID)"
        kill $BACKEND_PID
        
        # 프로세스 종료 대기
        for i in {1..10}; do
            if ! ps -p $BACKEND_PID > /dev/null 2>&1; then
                echo "✅ 백엔드 서버가 정상적으로 중지되었습니다"
                break
            fi
            sleep 1
        done
        
        # 강제 종료가 필요한 경우
        if ps -p $BACKEND_PID > /dev/null 2>&1; then
            echo "⚠️  강제 종료 중..."
            kill -9 $BACKEND_PID 2>/dev/null || true
            echo "✅ 백엔드 서버가 강제로 중지되었습니다"
        fi
    else
        echo "ℹ️  백엔드 프로세스가 이미 중지되었습니다"
    fi
    
    rm -f "$BACKEND_PID_FILE"
else
    echo "ℹ️  백엔드 PID 파일을 찾을 수 없습니다"
fi

# 백엔드 포트 확인 및 정리
if lsof -ti:3001 > /dev/null 2>&1; then
    echo "🔄 3001 포트를 사용 중인 프로세스 정리 중..."
    lsof -ti:3001 | xargs kill -9 2>/dev/null || true
    echo "✅ 3001 포트가 정리되었습니다"
fi

# 2. 프론트엔드 서버 중지
echo ""
echo "🌐 프론트엔드 서버 중지 중..."

if [ -f "$FRONTEND_PID_FILE" ]; then
    FRONTEND_PID=$(cat "$FRONTEND_PID_FILE")
    
    if ps -p $FRONTEND_PID > /dev/null 2>&1; then
        echo "🔄 프론트엔드 프로세스 종료 중... (PID: $FRONTEND_PID)"
        kill $FRONTEND_PID
        
        # 프로세스 종료 대기
        for i in {1..10}; do
            if ! ps -p $FRONTEND_PID > /dev/null 2>&1; then
                echo "✅ 프론트엔드 서버가 정상적으로 중지되었습니다"
                break
            fi
            sleep 1
        done
        
        # 강제 종료가 필요한 경우
        if ps -p $FRONTEND_PID > /dev/null 2>&1; then
            echo "⚠️  강제 종료 중..."
            kill -9 $FRONTEND_PID 2>/dev/null || true
            echo "✅ 프론트엔드 서버가 강제로 중지되었습니다"
        fi
    else
        echo "ℹ️  프론트엔드 프로세스가 이미 중지되었습니다"
    fi
    
    rm -f "$FRONTEND_PID_FILE"
else
    echo "ℹ️  프론트엔드 PID 파일을 찾을 수 없습니다"
fi

# 프론트엔드 포트 확인 및 정리
if lsof -ti:8080 > /dev/null 2>&1; then
    echo "🔄 8080 포트를 사용 중인 프로세스 정리 중..."
    lsof -ti:8080 | xargs kill -9 2>/dev/null || true
    echo "✅ 8080 포트가 정리되었습니다"
fi

# 3. Node.js 관련 프로세스 정리 (추가 안전장치)
echo ""
echo "🧹 관련 프로세스 정리 중..."

# 포트폴리오 관련 Node.js 프로세스 찾기
PORTFOLIO_PROCESSES=$(ps aux | grep -E "(portfolio|server\.js|vite)" | grep -v grep | awk '{print $2}' || true)

if [ ! -z "$PORTFOLIO_PROCESSES" ]; then
    echo "🔄 관련 프로세스 정리 중..."
    echo "$PORTFOLIO_PROCESSES" | xargs kill 2>/dev/null || true
    sleep 2
    
    # 여전히 실행 중인 프로세스가 있다면 강제 종료
    REMAINING_PROCESSES=$(ps aux | grep -E "(portfolio|server\.js|vite)" | grep -v grep | awk '{print $2}' || true)
    if [ ! -z "$REMAINING_PROCESSES" ]; then
        echo "$REMAINING_PROCESSES" | xargs kill -9 2>/dev/null || true
    fi
fi

# 4. 로그 파일 압축 (선택사항)
echo ""
echo "📄 로그 정리 중..."

if [ -f "$PROJECT_ROOT/logs/backend.log" ]; then
    if [ -s "$PROJECT_ROOT/logs/backend.log" ]; then
        mv "$PROJECT_ROOT/logs/backend.log" "$PROJECT_ROOT/logs/backend_$(date +%Y%m%d_%H%M%S).log"
        echo "📁 백엔드 로그가 보관되었습니다"
    else
        rm -f "$PROJECT_ROOT/logs/backend.log"
    fi
fi

if [ -f "$PROJECT_ROOT/logs/frontend.log" ]; then
    if [ -s "$PROJECT_ROOT/logs/frontend.log" ]; then
        mv "$PROJECT_ROOT/logs/frontend.log" "$PROJECT_ROOT/logs/frontend_$(date +%Y%m%d_%H%M%S).log"
        echo "📁 프론트엔드 로그가 보관되었습니다"
    else
        rm -f "$PROJECT_ROOT/logs/frontend.log"
    fi
fi

# 완료 메시지
echo ""
echo "✅ 포트폴리오 관리 시스템이 완전히 중지되었습니다!"
echo "=================================================="
echo "🔍 포트 상태 확인:"
echo "   - 백엔드 포트 (3001): $(lsof -ti:3001 > /dev/null 2>&1 && echo '사용 중' || echo '비어있음')"
echo "   - 프론트엔드 포트 (8080): $(lsof -ti:8080 > /dev/null 2>&1 && echo '사용 중' || echo '비어있음')"
echo ""
echo "🚀 다시 시작하려면: ./scripts/start.sh"
echo "📊 상태 확인하려면: ./scripts/status.sh"
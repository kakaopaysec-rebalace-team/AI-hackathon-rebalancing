#!/bin/bash

# 포트폴리오 관리 시스템 전체 시작 스크립트

set -e  # 오류 발생 시 스크립트 중단

./stop.sh


#mysql -u rebalance -p kpsdb < /Users/todd.rsp/tmp/price.sql

echo "🚀 포트폴리오 관리 시스템 시작 중..."
echo "=================================================="

# 현재 디렉토리 확인
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "📁 프로젝트 디렉토리: $PROJECT_ROOT"

# 로그 디렉토리 생성
mkdir -p "$PROJECT_ROOT/logs"

# 1. 데이터베이스 연결 테스트
echo ""
echo "🔍 데이터베이스 연결 테스트 중..."
if command -v mysql &> /dev/null; then
    if mysql -h 127.0.0.1 -u rebalance -p'Kakaopay2025!' -e "USE kpsdb; SELECT 'DB 연결 성공' as status;" 2>/dev/null; then
        echo "✅ 데이터베이스 연결 성공"
    else
        echo "⚠️  데이터베이스 연결 실패 - 계속 진행합니다"
    fi
else
    echo "⚠️  mysql 클라이언트를 찾을 수 없습니다 - 계속 진행합니다"
fi

# 2. 백엔드 패키지 설치 및 시작
echo ""
echo "🔧 백엔드 설정 중..."
cd "$PROJECT_ROOT/server"

if [ ! -d "node_modules" ]; then
    echo "📦 백엔드 패키지 설치 중..."
    npm install
else
    echo "📦 백엔드 패키지 이미 설치됨"
fi

echo "🖥️  백엔드 서버 시작 중..."
npm start > "$PROJECT_ROOT/logs/backend.log" 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > "$PROJECT_ROOT/logs/backend.pid"

# 백엔드 서버 시작 대기
echo "⏳ 백엔드 서버 시작 대기 중..."
sleep 5

# 백엔드 헬스체크
if curl -s http://localhost:3001/health > /dev/null; then
    echo "✅ 백엔드 서버 정상 시작됨 (PID: $BACKEND_PID)"
else
    echo "❌ 백엔드 서버 시작 실패"
    echo "📄 로그를 확인하세요: $PROJECT_ROOT/logs/backend.log"
    exit 1
fi

# 3. 프론트엔드 설정 및 시작
echo ""
echo "🎨 프론트엔드 설정 중..."
cd "$PROJECT_ROOT"

if [ ! -d "node_modules" ]; then
    echo "📦 프론트엔드 패키지 설치 중..."
    npm install
else
    echo "📦 프론트엔드 패키지 이미 설치됨"
fi

echo "🌐 프론트엔드 서버 시작 중..."
npm run dev > "$PROJECT_ROOT/logs/frontend.log" 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > "$PROJECT_ROOT/logs/frontend.pid"

# 프론트엔드 서버 시작 대기
echo "⏳ 프론트엔드 서버 시작 대기 중..."
sleep 8

# 프론트엔드 헬스체크
if curl -s http://localhost:8080 > /dev/null; then
    echo "✅ 프론트엔드 서버 정상 시작됨 (PID: $FRONTEND_PID)"
else
    echo "❌ 프론트엔드 서버 시작 실패"
    echo "📄 로그를 확인하세요: $PROJECT_ROOT/logs/frontend.log"
fi

# 시작 완료 메시지
echo ""
echo "🎉 포트폴리오 관리 시스템이 성공적으로 시작되었습니다!"
echo "=================================================="
echo "🖥️  백엔드:     http://localhost:3001"
echo "   📋 API 문서: http://localhost:3001/health"
echo ""
echo "🌐 프론트엔드:  http://localhost:8080"
echo "   📱 잔고 탭:   http://localhost:8080"
echo ""
echo "📄 로그 파일:"
echo "   📡 백엔드:    $PROJECT_ROOT/logs/backend.log"
echo "   🎨 프론트엔드: $PROJECT_ROOT/logs/frontend.log"
echo ""
echo "🛑 중지하려면: ./scripts/stop.sh"
echo "📊 상태 확인:  ./scripts/status.sh"
echo ""
echo "💡 브라우저에서 http://localhost:8080 을 열어 테스트하세요!"

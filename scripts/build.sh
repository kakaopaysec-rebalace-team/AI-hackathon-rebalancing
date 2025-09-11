#!/bin/bash

# 포트폴리오 관리 시스템 빌드 스크립트

set -e  # 오류 발생 시 스크립트 중단

echo "🔨 포트폴리오 관리 시스템 빌드 시작"
echo "=================================================="

# 현재 디렉토리 확인
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "📁 프로젝트 디렉토리: $PROJECT_ROOT"
echo "🕐 빌드 시간: $(date)"

# 빌드 로그 디렉토리 생성
mkdir -p "$PROJECT_ROOT/logs"

# 1. 환경 확인
echo ""
echo "🔍 환경 확인 중..."

echo "  Node.js: $(node --version 2>/dev/null || echo '❌ 설치되지 않음')"
echo "  npm: $(npm --version 2>/dev/null || echo '❌ 설치되지 않음')"

if ! command -v node &> /dev/null; then
    echo "❌ Node.js가 설치되지 않았습니다."
    echo "💡 Node.js를 설치하고 다시 시도하세요: https://nodejs.org/"
    exit 1
fi

# 2. 백엔드 빌드
echo ""
echo "🖥️  백엔드 빌드 중..."
cd "$PROJECT_ROOT/server"

echo "  📦 백엔드 패키지 설치 중..."
if npm install > "$PROJECT_ROOT/logs/backend-build.log" 2>&1; then
    echo "  ✅ 백엔드 패키지 설치 완료"
else
    echo "  ❌ 백엔드 패키지 설치 실패"
    echo "  📄 로그 확인: $PROJECT_ROOT/logs/backend-build.log"
    exit 1
fi

echo "  🔨 백엔드 빌드 실행 중..."
if npm run build >> "$PROJECT_ROOT/logs/backend-build.log" 2>&1; then
    echo "  ✅ 백엔드 빌드 완료"
else
    echo "  ❌ 백엔드 빌드 실패"
    echo "  📄 로그 확인: $PROJECT_ROOT/logs/backend-build.log"
    exit 1
fi

# 백엔드 설정 파일 확인
if [ ! -f ".env" ]; then
    echo "  ⚠️  .env 파일이 없습니다. 기본 설정으로 생성합니다..."
    cat > .env << EOF
# 데이터베이스 설정
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=kps
DB_PASSWORD=Kakaopay2025!
DB_NAME=kpsdb

# 서버 설정
PORT=3001
NODE_ENV=development

# 고정 계좌번호
ACCOUNT_NUMBER=99911122222
EOF
    echo "  ✅ .env 파일이 생성되었습니다"
fi

# 3. 프론트엔드 빌드
echo ""
echo "🌐 프론트엔드 빌드 중..."
cd "$PROJECT_ROOT"

echo "  📦 프론트엔드 패키지 설치 중..."
if npm install > "$PROJECT_ROOT/logs/frontend-build.log" 2>&1; then
    echo "  ✅ 프론트엔드 패키지 설치 완료"
else
    echo "  ❌ 프론트엔드 패키지 설치 실패"
    echo "  📄 로그 확인: $PROJECT_ROOT/logs/frontend-build.log"
    exit 1
fi

echo "  🔨 프론트엔드 빌드 실행 중..."
if npm run build >> "$PROJECT_ROOT/logs/frontend-build.log" 2>&1; then
    echo "  ✅ 프론트엔드 빌드 완료"
    
    # 빌드 결과 확인
    if [ -d "dist" ]; then
        BUILD_SIZE=$(du -sh dist 2>/dev/null | cut -f1)
        echo "  📦 빌드 크기: $BUILD_SIZE"
    fi
else
    echo "  ⚠️  프론트엔드 빌드 실패 (개발 모드로 실행 가능)"
    echo "  📄 로그 확인: $PROJECT_ROOT/logs/frontend-build.log"
fi

# 4. 데이터베이스 연결 테스트
echo ""
echo "🗄️  데이터베이스 연결 테스트 중..."

if command -v mysql &> /dev/null; then
    if mysql -h 127.0.0.1 -u rebalance -p'Kakaopay2025!' -e "USE kpsdb; SELECT 'DB 연결 성공' as status;" 2>/dev/null; then
        echo "  ✅ 데이터베이스 연결 성공"
        
        # 테이블 존재 확인
        TABLE_COUNT=$(mysql -h 127.0.0.1 -u rebalance -p'Kakaopay2025!' -e "USE kpsdb; SHOW TABLES;" 2>/dev/null | wc -l)
        echo "  📊 테이블 개수: $((TABLE_COUNT - 1))개"
        
        # 데이터 확인
        STOCK_COUNT=$(mysql -h 127.0.0.1 -u rebalance -p'Kakaopay2025!' -e "USE kpsdb; SELECT COUNT(*) FROM stock_current_price;" 2>/dev/null | tail -1)
        BALANCE_COUNT=$(mysql -h 127.0.0.1 -u rebalance -p'Kakaopay2025!' -e "USE kpsdb; SELECT COUNT(*) FROM customer_balance;" 2>/dev/null | tail -1)
        echo "  📈 종목현재가: ${STOCK_COUNT}건"
        echo "  💼 고객잔고: ${BALANCE_COUNT}건"
    else
        echo "  ❌ 데이터베이스 연결 실패"
        echo "  💡 데이터베이스가 없다면 다음 명령어로 생성하세요:"
        echo "     mysql -u rebalance -p kpsdb < database/complete_7table_database_setup.sql"
    fi
else
    echo "  ⚠️  mysql 클라이언트를 찾을 수 없습니다"
fi

# 5. 권한 설정
echo ""
echo "🔐 실행 권한 설정 중..."
chmod +x "$PROJECT_ROOT/scripts/start.sh"
chmod +x "$PROJECT_ROOT/scripts/stop.sh"
chmod +x "$PROJECT_ROOT/scripts/status.sh"
echo "  ✅ 스크립트 실행 권한 설정 완료"

# 6. 빌드 결과 요약
echo ""
echo "✅ 포트폴리오 관리 시스템 빌드 완료!"
echo "=================================================="

# 패키지 정보 출력
echo "📦 설치된 패키지 정보:"
echo "  🖥️  백엔드:"
if [ -f "$PROJECT_ROOT/server/package.json" ]; then
    BACKEND_DEPS=$(grep -c '".*":' "$PROJECT_ROOT/server/package.json" 2>/dev/null || echo "0")
    echo "     📋 의존성: $BACKEND_DEPS개"
fi

echo "  🌐 프론트엔드:"
if [ -f "$PROJECT_ROOT/package.json" ]; then
    FRONTEND_DEPS=$(grep -c '".*":' "$PROJECT_ROOT/package.json" 2>/dev/null || echo "0")
    echo "     📋 의존성: $FRONTEND_DEPS개"
fi

echo ""
echo "📁 생성된 파일:"
echo "  📄 로그 파일: $PROJECT_ROOT/logs/"
echo "  🖥️  백엔드: $PROJECT_ROOT/server/"
echo "  🌐 프론트엔드: $PROJECT_ROOT/dist/ (빌드 성공 시)"

echo ""
echo "🚀 다음 단계:"
echo "  1. 시스템 시작: ./scripts/start.sh"
echo "  2. 상태 확인: ./scripts/status.sh"
echo "  3. 브라우저에서 http://localhost:5173 접속"
echo "  4. 중지: ./scripts/stop.sh"

echo ""
echo "💡 문제가 발생하면 다음 로그를 확인하세요:"
echo "  🖥️  백엔드 빌드: $PROJECT_ROOT/logs/backend-build.log"
echo "  🌐 프론트엔드 빌드: $PROJECT_ROOT/logs/frontend-build.log"
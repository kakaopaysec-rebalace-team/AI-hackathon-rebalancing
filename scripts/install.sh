#!/bin/bash

# 포트폴리오 관리 시스템 설치 스크립트

set -e  # 오류 발생 시 스크립트 중단

echo "📦 포트폴리오 관리 시스템 설치 시작"
echo "=================================================="

# 현재 디렉토리 확인
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "📁 프로젝트 디렉토리: $PROJECT_ROOT"
echo "🕐 설치 시간: $(date)"

# 필요한 디렉토리 생성
mkdir -p "$PROJECT_ROOT/logs"
mkdir -p "$PROJECT_ROOT/server/node_modules"

# 1. 시스템 요구사항 확인
echo ""
echo "🔍 시스템 요구사항 확인 중..."

# Node.js 확인
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "  ✅ Node.js: $NODE_VERSION"
    
    # 버전 확인 (v14 이상 필요)
    NODE_MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
    if [ "$NODE_MAJOR_VERSION" -lt 14 ]; then
        echo "  ⚠️  Node.js 버전이 낮습니다. v14 이상이 필요합니다."
    fi
else
    echo "  ❌ Node.js가 설치되지 않았습니다."
    echo ""
    echo "📥 Node.js 설치 가이드:"
    echo "  🌐 공식 사이트: https://nodejs.org/"
    echo "  🍺 Homebrew (macOS): brew install node"
    echo "  📦 Ubuntu/Debian: sudo apt install nodejs npm"
    echo "  🔴 CentOS/RHEL: sudo yum install nodejs npm"
    exit 1
fi

# npm 확인
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo "  ✅ npm: v$NPM_VERSION"
else
    echo "  ❌ npm이 설치되지 않았습니다."
    exit 1
fi

# MySQL 클라이언트 확인 (선택사항)
if command -v mysql &> /dev/null; then
    MYSQL_VERSION=$(mysql --version | cut -d' ' -f6 | cut -d',' -f1)
    echo "  ✅ MySQL 클라이언트: $MYSQL_VERSION"
else
    echo "  ⚠️  MySQL 클라이언트가 설치되지 않았습니다 (선택사항)"
    echo "     데이터베이스 테스트 기능이 제한됩니다."
fi

# curl 확인
if command -v curl &> /dev/null; then
    echo "  ✅ curl: 설치됨"
else
    echo "  ❌ curl이 설치되지 않았습니다."
    echo "     헬스체크 기능이 작동하지 않을 수 있습니다."
fi

# 2. 백엔드 설치
echo ""
echo "🖥️  백엔드 설치 중..."
cd "$PROJECT_ROOT/server"

# package.json 확인
if [ ! -f "package.json" ]; then
    echo "  ❌ server/package.json이 없습니다."
    exit 1
fi

echo "  📦 백엔드 패키지 설치 중..."
if npm install > "$PROJECT_ROOT/logs/backend-install.log" 2>&1; then
    echo "  ✅ 백엔드 패키지 설치 완료"
    
    # 설치된 패키지 수 확인
    if [ -d "node_modules" ]; then
        BACKEND_PACKAGES=$(find node_modules -maxdepth 1 -type d | wc -l)
        echo "     📊 설치된 패키지: $((BACKEND_PACKAGES - 1))개"
    fi
else
    echo "  ❌ 백엔드 패키지 설치 실패"
    echo "  📄 로그 확인: $PROJECT_ROOT/logs/backend-install.log"
    exit 1
fi

# .env 파일 생성
if [ ! -f ".env" ]; then
    echo "  📝 백엔드 환경 설정 파일 생성 중..."
    cat > .env << EOF
# 데이터베이스 설정
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=rebalance
DB_PASSWORD=Kakaopay2025!
DB_NAME=kpsdb

# 서버 설정
PORT=3001
NODE_ENV=development

# 고정 계좌번호
ACCOUNT_NUMBER=99911122222
EOF
    echo "  ✅ .env 파일이 생성되었습니다"
else
    echo "  ✅ .env 파일이 이미 존재합니다"
fi

# 3. 프론트엔드 설치
echo ""
echo "🌐 프론트엔드 설치 중..."
cd "$PROJECT_ROOT"

# package.json 확인
if [ ! -f "package.json" ]; then
    echo "  ❌ package.json이 없습니다."
    exit 1
fi

echo "  📦 프론트엔드 패키지 설치 중..."
if npm install > "$PROJECT_ROOT/logs/frontend-install.log" 2>&1; then
    echo "  ✅ 프론트엔드 패키지 설치 완료"
    
    # 설치된 패키지 수 확인
    if [ -d "node_modules" ]; then
        FRONTEND_PACKAGES=$(find node_modules -maxdepth 1 -type d | wc -l)
        echo "     📊 설치된 패키지: $((FRONTEND_PACKAGES - 1))개"
    fi
else
    echo "  ❌ 프론트엔드 패키지 설치 실패"
    echo "  📄 로그 확인: $PROJECT_ROOT/logs/frontend-install.log"
    exit 1
fi

# 4. 데이터베이스 설정 확인
echo ""
echo "🗄️  데이터베이스 설정 확인 중..."

if command -v mysql &> /dev/null; then
    echo "  🔍 데이터베이스 연결 테스트 중..."
    if mysql -h 127.0.0.1 -u rebalance -p'Kakaopay2025!' -e "SELECT 1;" 2>/dev/null; then
        echo "  ✅ 데이터베이스 서버 연결 성공"
        
        # 데이터베이스 존재 확인
        if mysql -h 127.0.0.1 -u rebalance -p'Kakaopay2025!' -e "USE kpsdb; SELECT 1;" 2>/dev/null; then
            echo "  ✅ kpsdb 데이터베이스 존재 확인"
            
            # 테이블 존재 확인
            TABLE_COUNT=$(mysql -h 127.0.0.1 -u rebalance -p'Kakaopay2025!' -e "USE kpsdb; SHOW TABLES;" 2>/dev/null | wc -l)
            if [ "$TABLE_COUNT" -gt 1 ]; then
                echo "  ✅ 데이터베이스 테이블: $((TABLE_COUNT - 1))개 존재"
                
                # 데이터 확인
                STOCK_COUNT=$(mysql -h 127.0.0.1 -u rebalance -p'Kakaopay2025!' -e "USE kpsdb; SELECT COUNT(*) FROM stock_current_price;" 2>/dev/null | tail -1)
                BALANCE_COUNT=$(mysql -h 127.0.0.1 -u rebalance -p'Kakaopay2025!' -e "USE kpsdb; SELECT COUNT(*) FROM customer_balance;" 2>/dev/null | tail -1)
                echo "     📊 종목현재가: ${STOCK_COUNT}건"
                echo "     💼 고객잔고: ${BALANCE_COUNT}건"
            else
                echo "  ⚠️  데이터베이스 테이블이 없습니다."
                echo "     💡 다음 명령어로 테이블을 생성하세요:"
                echo "        mysql -h 127.0.0.1 -u rebalance -p'Kakaopay2025!' kpsdb < database/complete_7table_database_setup.sql"
            fi
        else
            echo "  ⚠️  kpsdb 데이터베이스가 존재하지 않습니다."
            echo "     💡 데이터베이스를 생성하세요."
        fi
    else
        echo "  ❌ 데이터베이스 서버 연결 실패"
        echo "     💡 연결 정보를 확인하세요: 127.0.0.1:3306"
    fi
else
    echo "  ⚠️  MySQL 클라이언트가 없어 데이터베이스 테스트를 건너뜁니다."
fi

# 5. 권한 설정
echo ""
echo "🔐 실행 권한 설정 중..."
chmod +x "$PROJECT_ROOT/scripts"/*.sh
echo "  ✅ 모든 스크립트 실행 권한 설정 완료"

# 6. 설치 완료 확인
echo ""
echo "✅ 포트폴리오 관리 시스템 설치 완료!"
echo "=================================================="

# 설치 요약 정보
echo "📋 설치 요약:"
echo "  🖥️  백엔드: 설치됨 (Node.js + Express)"
echo "  🌐 프론트엔드: 설치됨 (React + Vite)"
echo "  📄 로그 디렉토리: $PROJECT_ROOT/logs/"
echo "  🔧 관리 스크립트: $PROJECT_ROOT/scripts/"

echo ""
echo "🗂️  생성된 파일:"
echo "  📝 $PROJECT_ROOT/server/.env"
echo "  📁 $PROJECT_ROOT/server/node_modules/"
echo "  📁 $PROJECT_ROOT/node_modules/"
echo "  📄 $PROJECT_ROOT/logs/backend-install.log"
echo "  📄 $PROJECT_ROOT/logs/frontend-install.log"

echo ""
echo "🚀 다음 단계:"
echo "  1. 빌드 실행: ./scripts/build.sh"
echo "  2. 시스템 시작: ./scripts/start.sh"
echo "  3. 상태 확인: ./scripts/status.sh"
echo "  4. 브라우저 접속: http://localhost:5173"

echo ""
echo "💡 유용한 명령어:"
echo "  📊 상태 확인: ./scripts/status.sh"
echo "  🛑 시스템 중지: ./scripts/stop.sh"
echo "  📄 로그 확인: tail -f logs/backend.log"
echo "  📄 로그 확인: tail -f logs/frontend.log"

# 데이터베이스 설정 안내
if ! mysql -h 127.0.0.1 -u rebalance -p'Kakaopay2025!' -e "USE kpsdb; SELECT COUNT(*) FROM stock_current_price;" 2>/dev/null | tail -1 | grep -q '^[0-9][0-9][0-9]'; then
    echo ""
    echo "⚠️  중요: 데이터베이스 초기 설정이 필요합니다!"
    echo "   다음 명령어를 실행하여 테이블과 데이터를 생성하세요:"
    echo "   mysql -h 127.0.0.1 -u rebalance -p'Kakaopay2025!' kpsdb < database/complete_7table_database_setup.sql"
fi
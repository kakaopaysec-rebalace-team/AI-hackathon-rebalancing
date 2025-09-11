# 록키 리눅스에서 포트폴리오 리밸런싱 시스템 구동 가이드

이 문서는 록키 리눅스(Rocky Linux) 환경에서 포트폴리오 리밸런싱 시스템을 구동하기 위한 완전한 설치 및 실행 가이드입니다.

## 목차
1. [시스템 요구사항](#시스템-요구사항)
2. [사전 준비](#사전-준비)
3. [Node.js 설치](#nodejs-설치)
4. [MariaDB 설치 및 설정](#mariadb-설치-및-설정)
5. [프로젝트 설치](#프로젝트-설치)
6. [데이터베이스 설정](#데이터베이스-설정)
7. [애플리케이션 실행](#애플리케이션-실행)
8. [방화벽 설정](#방화벽-설정)
9. [서비스 등록](#서비스-등록)
10. [트러블슈팅](#트러블슈팅)

## 시스템 요구사항

- **운영체제**: Rocky Linux 8.x 또는 9.x
- **메모리**: 최소 2GB RAM (권장 4GB 이상)
- **디스크**: 최소 10GB 여유 공간
- **네트워크**: 인터넷 연결 (패키지 설치용)

## 사전 준비

### 1. 시스템 업데이트
```bash
sudo dnf update -y
```

### 2. 개발 도구 설치
```bash
sudo dnf groupinstall "Development Tools" -y
sudo dnf install curl wget git -y
```

## Node.js 설치

### 1. NodeSource 저장소 추가
```bash
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
```

### 2. Node.js 설치
```bash
sudo dnf install nodejs -y
```

### 3. 설치 확인
```bash
node --version
npm --version
```

## MariaDB 설치 및 설정

### 1. MariaDB 설치
```bash
sudo dnf install mariadb-server mariadb -y
```

### 2. MariaDB 서비스 시작 및 부팅시 자동 시작 설정
```bash
sudo systemctl start mariadb
sudo systemctl enable mariadb
```

### 3. MariaDB 보안 설정
```bash
sudo mysql_secure_installation
```
다음과 같이 설정하세요:
- Enter current password for root: (Enter 키)
- Switch to unix_socket authentication: n
- Change the root password: y
- New password: `your_root_password`
- Remove anonymous users: y
- Disallow root login remotely: y
- Remove test database: y
- Reload privilege tables: y

### 4. 데이터베이스 및 사용자 생성
```bash
sudo mysql -u root -p
```

MariaDB 프롬프트에서:
```sql
CREATE DATABASE port_tune_up CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'portfolio_user'@'localhost' IDENTIFIED BY 'portfolio_password123!';
GRANT ALL PRIVILEGES ON port_tune_up.* TO 'portfolio_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

## 프로젝트 설치

### 1. 프로젝트 클론
```bash
cd /home/$USER
git clone https://github.com/kakaopaysec-rebalace-team/port-tune-up.git
cd port-tune-up
```

### 2. 프론트엔드 의존성 설치
```bash
npm install
```

### 3. 백엔드 의존성 설치
```bash
cd server
npm install
cd ..
```

## 데이터베이스 설정

### 1. 환경변수 설정
프로젝트 루트에 `.env` 파일 생성:
```bash
cat > .env << 'EOF'
VITE_API_URL=http://localhost:3001
EOF
```

서버 디렉토리에 `.env` 파일 생성:
```bash
cat > server/.env << 'EOF'
DB_HOST=localhost
DB_USER=portfolio_user
DB_PASSWORD=portfolio_password123!
DB_NAME=port_tune_up
PORT=3001
EOF
```

### 2. 데이터베이스 스키마 및 데이터 생성
```bash
mysql -u portfolio_user -p port_tune_up < database/complete_7table_database_setup.sql
```

패스워드 입력: `portfolio_password123!`

### 3. 데이터베이스 설정 확인
```bash
mysql -u portfolio_user -p port_tune_up -e "SHOW TABLES;"
```

다음 7개 테이블이 표시되어야 합니다:
- customer_balance
- customer_trading_history
- rebalancing_execution_history
- rebalancing_master
- stock_current_price
- customer_deposit
- rebalancing_strategy_config

## 애플리케이션 실행

### 1. 스크립트 실행 권한 부여
```bash
chmod +x scripts/*.sh
```

### 2. 프론트엔드 빌드
```bash
npm run build
```

### 3. 백엔드 서버 시작
```bash
cd server
node server.js &
cd ..
```

### 4. 프론트엔드 서버 시작 (개발 모드)
```bash
npm run dev &
```

### 5. 서비스 상태 확인
```bash
# 백엔드 API 확인 (3001 포트)
curl http://localhost:3001/balance/total-assets

# 프론트엔드 확인 (5173 포트)
curl http://localhost:5173
```

## 방화벽 설정

### 1. 방화벽에서 필요한 포트 열기
```bash
sudo firewall-cmd --permanent --add-port=3001/tcp  # 백엔드 API
sudo firewall-cmd --permanent --add-port=5173/tcp  # 프론트엔드 (개발모드)
sudo firewall-cmd --permanent --add-port=8080/tcp  # 프론트엔드 (프로덕션)
sudo firewall-cmd --reload
```

### 2. 방화벽 설정 확인
```bash
sudo firewall-cmd --list-ports
```

## 서비스 등록

### 1. 백엔드 서비스 파일 생성
```bash
sudo tee /etc/systemd/system/portfolio-backend.service > /dev/null << 'EOF'
[Unit]
Description=Portfolio Backend API
After=network.target mariadb.service

[Service]
Type=simple
User=root
WorkingDirectory=/home/$USER/port-tune-up/server
Environment=NODE_ENV=production
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
```

### 2. 서비스 시작 및 부팅시 자동 시작 설정
```bash
sudo systemctl daemon-reload
sudo systemctl start portfolio-backend
sudo systemctl enable portfolio-backend
```

### 3. 서비스 상태 확인
```bash
sudo systemctl status portfolio-backend
```

## 프로덕션 배포 (Nginx + PM2)

### 1. Nginx 설치
```bash
sudo dnf install nginx -y
```

### 2. PM2 설치 (프로세스 매니저)
```bash
sudo npm install -g pm2
```

### 3. PM2로 백엔드 실행
```bash
cd /home/$USER/port-tune-up/server
pm2 start server.js --name "portfolio-backend"
pm2 startup
pm2 save
```

### 4. Nginx 설정
```bash
sudo tee /etc/nginx/conf.d/portfolio.conf > /dev/null << 'EOF'
server {
    listen 80;
    server_name localhost;

    # 프론트엔드 정적 파일
    location / {
        root /home/$USER/port-tune-up/dist;
        try_files $uri $uri/ /index.html;
    }

    # 백엔드 API 프록시
    location /balance/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF
```

### 5. Nginx 시작
```bash
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 6. 방화벽에서 HTTP 포트 열기
```bash
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --reload
```

## 접속 확인

### 개발 모드 접속
- **프론트엔드**: http://SERVER_IP:5173
- **백엔드 API**: http://SERVER_IP:3001

### 프로덕션 모드 접속 (Nginx 사용시)
- **웹 애플리케이션**: http://SERVER_IP

## 트러블슈팅

### 1. 포트 충돌 확인
```bash
sudo netstat -tlnp | grep :3001
sudo netstat -tlnp | grep :5173
```

### 2. 프로세스 확인
```bash
ps aux | grep node
ps aux | grep nginx
```

### 3. 로그 확인
```bash
# 백엔드 로그
sudo journalctl -u portfolio-backend -f

# Nginx 로그
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# MariaDB 로그
sudo tail -f /var/log/mariadb/mariadb.log
```

### 4. 데이터베이스 연결 테스트
```bash
mysql -u portfolio_user -p port_tune_up -e "SELECT COUNT(*) FROM customer_balance;"
```

### 5. 일반적인 문제 해결

#### 데이터베이스 연결 실패
```bash
# MariaDB 서비스 상태 확인
sudo systemctl status mariadb

# MariaDB 재시작
sudo systemctl restart mariadb
```

#### Node.js 모듈 문제
```bash
# node_modules 재설치
rm -rf node_modules package-lock.json
npm install

# 서버 디렉토리도 동일하게
cd server
rm -rf node_modules package-lock.json
npm install
```

#### 권한 문제
```bash
# 프로젝트 디렉토리 권한 설정
sudo chown -R $USER:$USER /home/$USER/port-tune-up
chmod -R 755 /home/$USER/port-tune-up
```

## 성능 최적화

### 1. 프로덕션 빌드 최적화
```bash
npm run build
```

### 2. Nginx Gzip 압축 활성화
`/etc/nginx/nginx.conf`에 추가:
```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss;
```

### 3. 로그 로테이션 설정
```bash
sudo tee /etc/logrotate.d/portfolio > /dev/null << 'EOF'
/var/log/nginx/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 nginx nginx
    postrotate
        if [ -f /var/run/nginx.pid ]; then
            kill -USR1 `cat /var/run/nginx.pid`
        fi
    endscript
}
EOF
```

## 보안 강화

### 1. SELinux 설정 (필요시)
```bash
# SELinux 상태 확인
getenforce

# 필요시 포트에 대한 SELinux 정책 설정
sudo setsebool -P httpd_can_network_connect 1
```

### 2. 데이터베이스 보안
```bash
# MariaDB 사용자 권한 최소화 (이미 위에서 설정됨)
mysql -u root -p -e "SHOW GRANTS FOR 'portfolio_user'@'localhost';"
```

이제 록키 리눅스에서 포트폴리오 리밸런싱 시스템을 성공적으로 구동할 수 있습니다. 추가 문의사항이나 문제가 발생하면 로그를 확인하고 트러블슈팅 섹션을 참조하세요.
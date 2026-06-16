#!/usr/bin/env bash
set -e

# Private 서버에서 실행합니다.
# 실행 전 DB 환경변수와 NCP Object Storage 환경변수를 입력해야 합니다.

required_vars=(
  DB_HOST
  DB_USER
  DB_PASSWORD
  DB_NAME
  NCP_ACCESS_KEY
  NCP_SECRET_KEY
  NCP_BUCKET
)

for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    echo "ERROR: $var 값을 입력하세요."
    exit 1
  fi
done

docker build -t my-diary-backend:latest .

docker rm -f my-diary-backend 2>/dev/null || true

docker run -d \
  --name my-diary-backend \
  -p 3000:3000 \
  -e PORT=3000 \
  -e DB_HOST="$DB_HOST" \
  -e DB_PORT="${DB_PORT:-3307}" \
  -e DB_USER="$DB_USER" \
  -e DB_PASSWORD="$DB_PASSWORD" \
  -e DB_NAME="$DB_NAME" \
  -e NCP_ACCESS_KEY="$NCP_ACCESS_KEY" \
  -e NCP_SECRET_KEY="$NCP_SECRET_KEY" \
  -e NCP_REGION="${NCP_REGION:-kr-standard}" \
  -e NCP_ENDPOINT="${NCP_ENDPOINT:-https://kr.object.ncloudstorage.com}" \
  -e NCP_BUCKET="$NCP_BUCKET" \
  --restart unless-stopped \
  my-diary-backend:latest

docker ps --filter "name=my-diary-backend"

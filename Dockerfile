FROM node:24-slim

WORKDIR /app

COPY package*.json ./

RUN npm install -y

# src폴더, uploads폴더, deploy폴더 등을 도커 컨테이너의 /app폴더로 복사 
COPY . .

EXPOSE 3000

CMD ["npm","start"]
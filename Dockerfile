FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:1.27-alpine

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY docker/40-generate-app-config.sh /docker-entrypoint.d/40-generate-app-config.sh

COPY --from=builder /app/index.html /usr/share/nginx/html/index.html
COPY --from=builder /app/bin /usr/share/nginx/html/bin
COPY --from=builder /app/css /usr/share/nginx/html/css
COPY --from=builder /app/lib /usr/share/nginx/html/lib
COPY --from=builder /app/img /usr/share/nginx/html/img

RUN chmod +x /docker-entrypoint.d/40-generate-app-config.sh

EXPOSE 80

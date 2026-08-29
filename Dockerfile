# syntax=docker/dockerfile:1

FROM golang:1.25-alpine AS apibuild
WORKDIR /src
COPY backend/go.mod ./
COPY backend/cmd ./cmd
COPY backend/internal ./internal
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /out/api ./cmd/api

FROM node:22-alpine AS webbuild
WORKDIR /app
COPY web/package.json web/package-lock.json ./
RUN npm ci
COPY web/ ./
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_API_URL=
RUN npm run build

FROM node:22-alpine
RUN apk add --no-cache caddy ca-certificates wget \
	&& adduser -D -H -u 65532 app
WORKDIR /app
COPY --from=apibuild /out/api /usr/local/bin/api
COPY --from=webbuild /app/.next/standalone ./
COPY --from=webbuild /app/.next/static ./.next/static
COPY --from=webbuild /app/public ./public
COPY deploy/Caddyfile /etc/caddy/Caddyfile
COPY deploy/start.sh /start.sh
RUN sed -i 's/\r$//' /start.sh && chmod 755 /start.sh && chown -R app:app /app
USER 65532:65532
ENV ADDR=:9000
ENV PORT=8080
ENV HOME=/tmp
ENV XDG_DATA_HOME=/tmp
ENV XDG_CONFIG_HOME=/tmp
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
	CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1
ENTRYPOINT ["/start.sh"]

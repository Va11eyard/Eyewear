# syntax=docker/dockerfile:1

FROM golang:1.25-alpine AS build
WORKDIR /src
COPY go.mod ./
COPY cmd ./cmd
COPY internal ./internal
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /out/api ./cmd/api

FROM alpine:3.21
RUN apk add --no-cache ca-certificates wget \
	&& adduser -D -H -u 65532 app
COPY --from=build /out/api /usr/local/bin/api
USER 65532:65532
EXPOSE 9000
ENV ADDR=:9000
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
	CMD wget -qO- http://127.0.0.1:9000/healthz || exit 1
ENTRYPOINT ["/usr/local/bin/api"]

# FRAME

Live camera fit for eyewear. Next.js talks to a Go API that scores real frame geometry and looks up nearby `shop=optician` nodes on OpenStreetMap.

## Stack

- Go API (`backend/`) — tested on Go 1.25; 1.27 is the current stable if your toolchain can download it
- Next.js 16.3.3 + React 19 (`web/`)

## Run

API in Docker:

```
docker compose up --build api
```

Or locally:

```
cd backend
go run ./cmd/api
```

Terminal 2:

```
cd web
npm install
npm run dev
```

Open http://localhost:3200 — allow camera and location. There are no stock portraits and no invented shop rows.

## Tests

```
cd backend && go test ./internal/... -cover
cd web && npm test
```

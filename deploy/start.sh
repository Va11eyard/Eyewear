#!/bin/sh
set -eu
/usr/local/bin/api &
HOSTNAME=0.0.0.0 PORT=3000 node /app/server.js &
exec caddy run --config /etc/caddy/Caddyfile --adapter caddyfile

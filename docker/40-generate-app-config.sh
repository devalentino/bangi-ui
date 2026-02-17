#!/bin/sh
set -eu

cat > /usr/share/nginx/html/app-config.js <<EOF
window.APP_CONFIG = window.APP_CONFIG || {
  BACKEND_API_BASE_URL: "${BACKEND_API_BASE_URL:-http://localhost:8080}"
};
EOF

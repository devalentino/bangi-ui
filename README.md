# Bangi UI

Frontend dashboard application of Bangi CPA tracker. Built with Mithril and bundled with esbuild.

## Project Overview

- Entry point: `index.html` + `index.js`
- Source code: `src/`
- Production bundle output: `bin/main.js`
- API base URL is configurable at runtime via `app-config.js`

## Local Development

### Prerequisites

- Node.js 20+
- npm

### Install

```bash
npm ci
```

### Build

```bash
npm run build
```

### Watch Mode

```bash
npm run start
```

## Configuration

### Runtime API URL (post-deploy configurable)

The app reads:

- `window.APP_CONFIG.BACKEND_API_BASE_URL` from `app-config.js`

Example:

```js
window.APP_CONFIG = window.APP_CONFIG || {
  BACKEND_API_BASE_URL: "http://localhost:8080",
};
```

## Docker

The repo includes a multi-stage Docker build:

- Build stage: Node + esbuild
- Runtime stage: Nginx serving static assets
- Container startup script generates `/usr/share/nginx/html/app-config.js` from `BACKEND_API_BASE_URL`

### Build Image

```bash
docker build -f infra/Dockerfile -t ghcr.io/devalentino/bangi-ui:$(git describe --tags --exact-match) .
```

### Deploy Image
```bash
docker push ghcr.io/devalentino/bangi-ui:$(git describe --tags --exact-match)
```

## Deploy Notes

- `app-config.js` is runtime-generated in Docker, so you can change API URL per environment without rebuilding image.
- For non-Docker deployments, edit `app-config.js` on the server and reload the page.

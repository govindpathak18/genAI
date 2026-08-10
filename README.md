## Orbit ##

A modular AI-first web platform composed of small microservices (agents, auth, billing, chat) and a Vite + React frontend. Designed for local development with Docker Compose and easy extension with new agents and integrations.

## Highlights

- Microservice backend: gateway, agent runtime, auth, billing, chat, and shared Redis utilities.
- Multiple agent types: chat, coding, image generation, RAG, vision, PPT/PDF assistants.
- React + Vite frontend with Redux-powered conversation and message slices.
- S3-compatible uploads and vector-store helpers for embeddings and retrieval.

## Repository layout

- `backend/` – all backend services and `docker-compose.yml`.
	- `gateway/` – API gateway and proxy utilities.
	- `agent/` – agent runtime, agent implementations, rate limiting and vector-store helpers.
	- `auth/` – authentication service (Firebase integration and `user.model.js`).
	- `billing/` – payments, plans, credits and Razorpay integration.
	- `chat/` – chat service and related controllers.
	- `shared/redis/` – Redis client configuration.
- `frontend/` – Vite + React application.
	- `src/components/` – UI components (chat, sidebar, billing drawer, etc.).
	- `src/features/` – frontend API wrappers.
	- `src/redux/` – slices and store configuration.

## Quickstart — Local (Docker)

Prerequisites:

- Docker & Docker Compose
- Node 18+ (for running frontend locally)
- Optional: S3-compatible storage credentials if you plan to test uploads

Start backend services with Docker Compose:

```bash
cd backend
docker-compose up --build
```

By default the Compose file at [backend/docker-compose.yml](backend/docker-compose.yml) defines the service set and ports. Check it for mapped ports and service names.

Frontend (local development, without Docker):

```bash
cd frontend
npm install
npm run dev
# open http://localhost:5173
```

To run the frontend from Docker, inspect the Compose services and add/enable the frontend service if needed.

## Environment variables (common)

Below are the most important environment variables used across services. Exact variable names live in each service `config/` folder.

- `PORT` — HTTP port for the service
- `NODE_ENV` — `development` or `production`
- `REDIS_URL` — Redis connection URL
- `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY`, `S3_SECRET_KEY` — S3-compatible storage
- `FIREBASE_*` or a `serviceAccountKey.json` — for the `auth` service
- `OPENAI_API_KEY` (or other model provider keys) — model provider credentials used by agents
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` — billing (if used)

Create a `.env` for local development or supply env vars via your shell or Docker secrets.

## Run a single service locally

Most backend services are simple Node apps — change into the service folder and run:

```bash
cd backend/agent
npm install
npm run start
```

Common service entrypoints:

- [backend/agent/index.js](backend/agent/index.js)
- [backend/auth/index.js](backend/auth/index.js)
- [backend/gateway/index.js](backend/gateway/index.js)

## Development notes

- Agents are implemented under `backend/agent/agents/`. Add or modify agents there.
- The gateway uses `utils/proxyWithHeaders.js` to forward requests and headers.
- Rate limiting and agent configuration live under `backend/agent/config/`.
- Vector store and embedding helpers are in `backend/agent/utils/`.

## Testing

- Each service may include its own `package.json` test scripts. Run tests from the service folder.

Example:

```bash
cd backend/agent
npm test
```

## Troubleshooting

- Ports conflict: verify ports in [backend/docker-compose.yml](backend/docker-compose.yml).
- Redis connectivity: confirm `REDIS_URL` and that Redis is reachable from containers.
- Credentials: ensure API keys and service account files are provided via environment variables or secrets.
- View logs:

```bash
docker-compose logs -f <service>
```

## Security

- Never commit secrets or `serviceAccountKey.json` to source control.
- Use scoped API keys and rotate them regularly.
- Validate and sanitize inputs to agent endpoints; consider rate-limiting per-IP and per-user.

## Deployment

- Each service has a `Dockerfile` and can be containerized independently.
- For production, run behind a secure reverse proxy, use managed Redis and object storage, and configure health checks.

## Where to look

- Backend service entrypoints: `backend/*/index.js`
- Agents: `backend/agent/agents/`
- Gateway & proxy helpers: `backend/gateway/`
- Frontend app: [frontend/src/](frontend/src/)

## Contributing

- Follow existing project patterns.
- Add tests for new behavior and run the service-specific test suites.
- Open a PR with a clear description and any necessary setup steps.



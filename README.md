# chatapp

Monorepo for the full-stack microservices chat application.

## Services

- `user-service`
- `chat-service`
- `notification-service`
- `frontend`

## Infrastructure

- `keycloak`
- `postgres`
- `kafka`
- `prometheus`
- `grafana`
- `jenkins`
- `kubernetes`

## Current State

The repository now contains:

- a finished first `user-service` slice
- production-oriented local Docker runtime for:
  - `postgres`
  - `keycloak`
  - `kafka`
  - `user-service`
  - `chat-service`
  - `notification-service`
  - `prometheus`
  - `grafana`
- a Jenkins pipeline baseline for:
  - jar packaging
  - Docker image builds
  - Docker Hub pushes

## Local Startup

1. Copy `.env.example` to `.env` if you want to override defaults.
2. Build service jars:

```bash
cd user-service && ./mvnw -DskipTests package && cd ..
cd chat-service && ./mvnw -DskipTests package && cd ..
cd notification-service && ./mvnw -DskipTests package && cd ..
```

3. Start the stack:

```bash
docker compose up -d --build
```

## Local Endpoints

- Keycloak: `http://localhost:8080`
- User service health: `http://localhost:8081/actuator/health`
- Chat service health: `http://localhost:8082/actuator/health`
- Notification service health: `http://localhost:8083/actuator/health`
- Prometheus: `http://localhost:9090`
- Grafana: `http://localhost:3001`

## Local Keycloak Bootstrap

- Realm: `chatapp`
- Admin username: `admin`
- Admin password: `admin`
- Bootstrap user: `sileshi`
- Bootstrap user password: `ChangeMe123!`

## Delivery Flow

The intended pipeline is:

`GitHub -> Jenkins -> Maven package -> Docker build -> Docker Hub push -> Kubernetes deploy`

#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [[ "$(uname -s)" != "Darwin" ]]; then
  printf 'This provisioning script currently supports macOS only.\n' >&2
  exit 1
fi

if [[ ! -f .env ]]; then
  cp .env.example .env
  printf 'Created .env from .env.example.\n'
else
  printf 'Keeping existing .env.\n'
fi

if ! command -v brew >/dev/null 2>&1; then
  printf 'Homebrew is required to install Colima and Docker.\n' >&2
  exit 1
fi

if ! command -v colima >/dev/null 2>&1; then
  brew install colima
fi

if ! command -v docker >/dev/null 2>&1; then
  brew install docker
fi

if ! colima status >/dev/null 2>&1; then
  colima start
fi
docker context use colima >/dev/null

if docker container inspect docker-postgres >/dev/null 2>&1; then
  if [[ "$(docker inspect --format '{{.State.Running}}' docker-postgres)" != "true" ]]; then
    docker start docker-postgres
  fi
else
  docker run --name docker-postgres \
    -e POSTGRES_USER=postgres \
    -e POSTGRES_PASSWORD=postgres \
    -e POSTGRES_DB=alimshare_lms_db \
    -p 5432:5432 \
    -v pg_data:/var/lib/postgresql \
    -d postgres:latest
fi

printf 'Waiting for PostgreSQL to accept connections...\n'
for ((attempt = 1; attempt <= 60; attempt++)); do
  if docker exec docker-postgres pg_isready -U postgres -d alimshare_lms_db >/dev/null 2>&1; then
    break
  fi
  if ((attempt == 60)); then
    printf 'PostgreSQL did not become ready within 60 seconds.\n' >&2
    exit 1
  fi
  sleep 1
done

npx prisma migrate dev --name init
npx prisma generate
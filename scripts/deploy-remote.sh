#!/usr/bin/env bash

set -Eeuo pipefail

compose() {
  if docker compose version >/dev/null 2>&1; then
    docker compose "$@"
    return
  fi

  docker-compose "$@"
}

load_image_archive() {
  local archive_path="$1"

  if [[ ! -f "$archive_path" ]]; then
    printf 'Image archive not found: %s\n' "$archive_path" >&2
    return 1
  fi

  if [[ "$archive_path" == *.gz ]]; then
    gzip -dc "$archive_path" | docker load
    return
  fi

  docker load -i "$archive_path"
}

upsert_env() {
  local key="$1"
  local value="$2"

  if grep -qE "^${key}=" .env; then
    sed -i.bak "s|^${key}=.*|${key}=${value}|" .env
    rm -f .env.bak
    return
  fi

  printf '%s=%s\n' "$key" "$value" >> .env
}

main() {
  local workdir="${1:-$(pwd)}"

  cd "$workdir"

  if [[ ! -f .env ]]; then
    cp .env.example .env
  fi

  : "${DEPLOY_IMAGE:?DEPLOY_IMAGE is required}"
  : "${DEPLOY_IMAGE_TAG:?DEPLOY_IMAGE_TAG is required}"

  if [[ -n "${DEPLOY_IMAGE_ARCHIVE:-}" ]]; then
    load_image_archive "$DEPLOY_IMAGE_ARCHIVE"
  fi

  upsert_env IMAGE_NAME "$DEPLOY_IMAGE"
  upsert_env IMAGE_TAG "$DEPLOY_IMAGE_TAG"
  docker image inspect "${DEPLOY_IMAGE}:${DEPLOY_IMAGE_TAG}" >/dev/null
  compose up -d --remove-orphans
}

main "$@"

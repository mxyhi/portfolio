#!/usr/bin/env bash

set -Eeuo pipefail

compose() {
  if docker compose version >/dev/null 2>&1; then
    docker compose "$@"
    return
  fi

  docker-compose "$@"
}

is_non_negative_integer() {
  [[ "$1" =~ ^[0-9]+$ ]]
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

list_project_image_refs() {
  docker image ls "$DEPLOY_IMAGE" --format '{{.Repository}}:{{.Tag}}' | grep -E "^${DEPLOY_IMAGE}:sha-" || true
}

list_project_container_ids() {
  docker ps -aq --filter "ancestor=$DEPLOY_IMAGE"
}

list_project_in_use_image_ids() {
  local container_ids
  container_ids="$(list_project_container_ids)"

  if [[ -z "$container_ids" ]]; then
    return 0
  fi

  docker inspect --format '{{.Image}}' $container_ids | sort -u
}

# Keep the current image plus a small rollback window for this project only.
cleanup_old_images() {
  local keep_previous_count="$1"
  local current_ref="${DEPLOY_IMAGE}:${DEPLOY_IMAGE_TAG}"
  local in_use_image_ids
  in_use_image_ids="$(list_project_in_use_image_ids)"

  local kept_previous=0
  local image_ref
  while IFS= read -r image_ref; do
    [[ -z "$image_ref" ]] && continue

    if [[ "$image_ref" == "$current_ref" ]]; then
      continue
    fi

    local image_id
    if ! image_id="$(docker image inspect -f '{{.Id}}' "$image_ref" 2>/dev/null)"; then
      continue
    fi

    local image_in_use=0
    if [[ -n "$in_use_image_ids" ]] && grep -Fqx "$image_id" <<< "$in_use_image_ids"; then
      image_in_use=1
    fi

    if ((kept_previous < keep_previous_count)); then
      ((kept_previous += 1))
      continue
    fi

    if ((image_in_use == 1)); then
      continue
    fi

    printf 'Removing old image: %s\n' "$image_ref"
    docker image rm "$image_ref" >/dev/null
  done < <(list_project_image_refs)
}

cleanup_release_archives() {
  local release_dir="$1"
  local keep_archive_count="$2"
  local current_archive_path="${3:-}"

  if [[ ! -d "$release_dir" ]]; then
    return 0
  fi

  local archives=()
  shopt -s nullglob
  archives=("$release_dir"/"${DEPLOY_IMAGE}-sha-"*.tar.gz)
  shopt -u nullglob

  if ((${#archives[@]} == 0)); then
    return 0
  fi

  IFS=$'\n' archives=($(ls -1t "${archives[@]}"))
  unset IFS

  local keep_additional_count="$keep_archive_count"
  if [[ -n "$current_archive_path" && -f "$current_archive_path" && $keep_additional_count -gt 0 ]]; then
    ((keep_additional_count -= 1))
  fi

  local kept_archives=0
  local archive_path
  for archive_path in "${archives[@]}"; do
    if [[ -n "$current_archive_path" && "$archive_path" == "$current_archive_path" ]]; then
      continue
    fi

    if ((kept_archives < keep_additional_count)); then
      ((kept_archives += 1))
      continue
    fi

    printf 'Removing old release archive: %s\n' "$archive_path"
    rm -f -- "$archive_path"
  done
}

main() {
  local workdir="${1:-$(pwd)}"

  cd "$workdir"

  if [[ ! -f .env ]]; then
    cp .env.example .env
  fi

  : "${DEPLOY_IMAGE:?DEPLOY_IMAGE is required}"
  : "${DEPLOY_IMAGE_TAG:?DEPLOY_IMAGE_TAG is required}"

  local keep_previous_images="${DEPLOY_KEEP_PREVIOUS_IMAGES:-2}"
  local keep_release_archives="${DEPLOY_KEEP_RELEASE_ARCHIVES:-3}"

  if ! is_non_negative_integer "$keep_previous_images"; then
    printf 'DEPLOY_KEEP_PREVIOUS_IMAGES must be a non-negative integer: %s\n' "$keep_previous_images" >&2
    return 1
  fi

  if ! is_non_negative_integer "$keep_release_archives"; then
    printf 'DEPLOY_KEEP_RELEASE_ARCHIVES must be a non-negative integer: %s\n' "$keep_release_archives" >&2
    return 1
  fi

  if [[ -n "${DEPLOY_IMAGE_ARCHIVE:-}" ]]; then
    load_image_archive "$DEPLOY_IMAGE_ARCHIVE"
  fi

  upsert_env IMAGE_NAME "$DEPLOY_IMAGE"
  upsert_env IMAGE_TAG "$DEPLOY_IMAGE_TAG"
  docker image inspect "${DEPLOY_IMAGE}:${DEPLOY_IMAGE_TAG}" >/dev/null
  compose up -d --remove-orphans
  cleanup_old_images "$keep_previous_images"
  cleanup_release_archives "$workdir/releases" "$keep_release_archives" "${DEPLOY_IMAGE_ARCHIVE:-}"
}

main "$@"

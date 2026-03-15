#!/usr/bin/env bash

set -Eeuo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
script_path="$repo_root/scripts/deploy-remote.sh"
tmpdir="$(mktemp -d)"

cleanup() {
  rm -rf "$tmpdir"
}

trap cleanup EXIT

workdir="$tmpdir/workdir"
state_dir="$tmpdir/state"
bin_dir="$tmpdir/bin"

mkdir -p "$workdir/releases" "$state_dir" "$bin_dir"

cat > "$workdir/.env.example" <<'EOF'
IMAGE_NAME=placeholder
IMAGE_TAG=placeholder
EOF

cat > "$state_dir/images.tsv" <<'EOF'
portfolio:sha-current|img-current
portfolio:sha-prev1|img-prev1
portfolio:sha-prev2|img-prev2
portfolio:sha-prev3|img-prev3
otherapp:sha-1|img-other
EOF

cat > "$state_dir/containers.tsv" <<'EOF'
portfolio-current|portfolio|img-current
portfolio-rollback|portfolio|img-prev1
otherapp-main|otherapp|img-other
EOF

touch -t 202603151500 "$workdir/releases/portfolio-sha-current.tar.gz"
touch -t 202603151400 "$workdir/releases/portfolio-sha-prev1.tar.gz"
touch -t 202603151300 "$workdir/releases/portfolio-sha-prev2.tar.gz"
touch -t 202603151200 "$workdir/releases/portfolio-sha-prev3.tar.gz"
touch -t 202603151100 "$workdir/releases/otherapp-sha-1.tar.gz"

cat > "$bin_dir/docker" <<'EOF'
#!/usr/bin/env bash

set -Eeuo pipefail

state_dir="${FAKE_DOCKER_STATE:?}"
images_file="$state_dir/images.tsv"
containers_file="$state_dir/containers.tsv"
log_file="$state_dir/docker.log"

find_image_id() {
  local ref="$1"
  awk -F'|' -v ref="$ref" '$1 == ref { print $2; found = 1; exit } END { if (!found) exit 1 }' "$images_file"
}

remove_image_ref() {
  local ref="$1"
  awk -F'|' -v ref="$ref" '$1 != ref' "$images_file" > "$images_file.next"
  mv "$images_file.next" "$images_file"
}

find_container_image_id() {
  local container_id="$1"
  awk -F'|' -v cid="$container_id" '$1 == cid { print $3; found = 1; exit } END { if (!found) exit 1 }' "$containers_file"
}

subcommand="${1:-}"
shift || true

case "$subcommand" in
  compose)
    case "${1:-}" in
      version)
        exit 0
        ;;
      up)
        printf 'compose %s\n' "$*" >> "$log_file"
        exit 0
        ;;
    esac
    ;;
  load)
    printf 'load %s\n' "$*" >> "$log_file"
    cat >/dev/null || true
    exit 0
    ;;
  image)
    case "${1:-}" in
      inspect)
        shift
        format=""
        if [[ "${1:-}" == "-f" ]]; then
          format="$2"
          shift 2
        fi
        ref="$1"
        image_id="$(find_image_id "$ref")"
        if [[ "$format" == "{{.Id}}" ]]; then
          printf '%s\n' "$image_id"
          exit 0
        fi
        printf '%s\n' "$ref"
        exit 0
        ;;
      ls)
        shift
        repo="${1:-}"
        shift || true
        format=""
        while (($#)); do
          if [[ "$1" == "--format" ]]; then
            format="$2"
            shift 2
            continue
          fi
          shift
        done
        while IFS='|' read -r ref image_id; do
          [[ "$ref" == "$repo:"* ]] || continue
          case "$format" in
            "{{.Repository}}:{{.Tag}}")
              printf '%s\n' "$ref"
              ;;
            "{{.Repository}}:{{.Tag}} {{.ID}}")
              printf '%s %s\n' "$ref" "$image_id"
              ;;
            *)
              printf '%s %s\n' "$ref" "$image_id"
              ;;
          esac
        done < "$images_file"
        exit 0
        ;;
      rm)
        shift
        for ref in "$@"; do
          printf 'image rm %s\n' "$ref" >> "$log_file"
          remove_image_ref "$ref"
        done
        exit 0
        ;;
    esac
    ;;
  ps)
    ancestor=""
    while (($#)); do
      case "$1" in
        --filter)
          if [[ "$2" == ancestor=* ]]; then
            ancestor="${2#ancestor=}"
          fi
          shift 2
          ;;
        *)
          shift
          ;;
      esac
    done
    while IFS='|' read -r container_id repo_name _image_id; do
      [[ -n "$ancestor" && "$repo_name" != "$ancestor" ]] && continue
      printf '%s\n' "$container_id"
    done < "$containers_file"
    exit 0
    ;;
  inspect)
    format=""
    if [[ "${1:-}" == "--format" ]]; then
      format="$2"
      shift 2
    fi
    for container_id in "$@"; do
      image_id="$(find_container_image_id "$container_id")"
      if [[ "$format" == "{{.Image}}" ]]; then
        printf '%s\n' "$image_id"
        continue
      fi
      printf '%s\n' "$image_id"
    done
    exit 0
    ;;
esac

printf 'Unsupported docker invocation: %s %s\n' "$subcommand" "$*" >&2
exit 1
EOF

chmod +x "$bin_dir/docker"

PATH="$bin_dir:$PATH" \
FAKE_DOCKER_STATE="$state_dir" \
DEPLOY_IMAGE="portfolio" \
DEPLOY_IMAGE_TAG="sha-current" \
DEPLOY_KEEP_RELEASE_ARCHIVES="3" \
bash "$script_path" "$workdir"

assert_contains() {
  local file="$1"
  local needle="$2"

  grep -Fqx "$needle" "$file"
}

assert_not_contains() {
  local file="$1"
  local needle="$2"

  if grep -Fqx "$needle" "$file"; then
    printf 'Unexpected line in %s: %s\n' "$file" "$needle" >&2
    exit 1
  fi
}

assert_contains "$workdir/.env" "IMAGE_NAME=portfolio"
assert_contains "$workdir/.env" "IMAGE_TAG=sha-current"
assert_contains "$state_dir/images.tsv" "portfolio:sha-current|img-current"
assert_contains "$state_dir/images.tsv" "portfolio:sha-prev1|img-prev1"
assert_contains "$state_dir/images.tsv" "portfolio:sha-prev2|img-prev2"
assert_not_contains "$state_dir/images.tsv" "portfolio:sha-prev3|img-prev3"
assert_contains "$state_dir/images.tsv" "otherapp:sha-1|img-other"
assert_contains "$state_dir/docker.log" "compose up -d --remove-orphans"

test -f "$workdir/releases/portfolio-sha-current.tar.gz"
test -f "$workdir/releases/portfolio-sha-prev1.tar.gz"
test -f "$workdir/releases/portfolio-sha-prev2.tar.gz"
test ! -f "$workdir/releases/portfolio-sha-prev3.tar.gz"
test -f "$workdir/releases/otherapp-sha-1.tar.gz"

printf 'deploy-remote cleanup test passed\n'

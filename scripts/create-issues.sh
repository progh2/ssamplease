#!/usr/bin/env bash
set -euo pipefail
usage() { printf 'Usage: bash scripts/create-issues.sh OWNER/REPO [--dry-run]\n' >&2; }
if [[ $# -lt 1 || $# -gt 2 || ! "$1" =~ ^[A-Za-z0-9][A-Za-z0-9-]*/[A-Za-z0-9_.-]+$ || "$1" == */. || "$1" == */.. ]]; then
  usage
  exit 2
fi
repo="$1"
mode="${2:-apply}"
if [[ "$mode" != apply && "$mode" != --dry-run ]]; then usage; exit 2; fi
script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
issue_dir="$script_dir/../docs/issues"
catalog="$issue_dir/catalog.txt"

# Preview is fully local: no authentication, GitHub reads, or writes.
if [[ "$mode" == --dry-run ]]; then
  while IFS='|' read -r title labels body; do
    [[ -n "$title" ]] || continue
    [[ -f "$issue_dir/$body" ]] || { printf 'Missing body: %s\n' "$body" >&2; exit 1; }
    printf '%s [%s]\n  %s\n' "$title" "$labels" "$issue_dir/$body"
  done < "$catalog"
  exit 0
fi

command -v gh >/dev/null
command -v node >/dev/null
gh repo view "$repo" --json nameWithOwner >/dev/null
task_tmp="$(mktemp -d)"
cleanup() { rm -f -- "$task_tmp/titles.json" "$task_tmp/labels.json"; rmdir -- "$task_tmp"; }
trap cleanup EXIT

# Include closed issues and all pages so rerunning does not recreate completed work.
gh api --paginate --slurp "repos/$repo/issues?state=all&per_page=100" \
  --jq '[.[][] | select(.pull_request == null) | .title]' > "$task_tmp/titles.json"
gh api --paginate --slurp "repos/$repo/labels?per_page=100" \
  --jq '[.[][] | .name]' > "$task_tmp/labels.json"
contains() {
  node -e 'const fs = require("fs"); process.exit(JSON.parse(fs.readFileSync(process.argv[1], "utf8")).includes(process.argv[2]) ? 0 : 1)' "$1" "$2"
}
ensure_label() {
  if ! contains "$task_tmp/labels.json" "$1"; then
    gh label create "$1" --repo "$repo" --color "$2"
  fi
}
ensure_label P0 B60205
ensure_label P1 D93F0B
ensure_label P2 FBCA04
ensure_label feature 1D76DB
ensure_label content 7057FF
ensure_label quality 0E8A16

while IFS='|' read -r title labels body; do
  [[ -n "$title" ]] || continue
  if contains "$task_tmp/titles.json" "$title"; then
    printf 'Already exists (open or closed): %s\n' "$title"
    continue
  fi
  gh issue create --repo "$repo" --title "$title" --label "$labels" --body-file "$issue_dir/$body"
done < "$catalog"

#!/usr/bin/env bash
# -----------------------------------------------------------------------------
# deploy.sh — deploy the static site to Cloudflare Pages
#
# Usage:
#   ./scripts/deploy.sh                # deploy current folder as production
#   ./scripts/deploy.sh preview        # deploy as a preview (branch) build
#
# One-time setup:
#   npm install -g wrangler
#   wrangler login
#   wrangler pages project create <PLACEHOLDER_CF_PROJECT_NAME> --production-branch=main
#
# Optional env vars you can override:
#   CF_PROJECT_NAME    Cloudflare Pages project name        (default: classcost)
#   CF_ACCOUNT_ID      Cloudflare account id (if multiple)  (default: unset)
#   DEPLOY_DIR         Folder to upload                     (default: .)
# -----------------------------------------------------------------------------
set -euo pipefail

cd "$(dirname "$0")/.."

CF_PROJECT_NAME="${CF_PROJECT_NAME:-classcost}"
DEPLOY_DIR="${DEPLOY_DIR:-.}"
MODE="${1:-production}"

# --- Pre-flight --------------------------------------------------------------
if ! command -v wrangler >/dev/null 2>&1; then
  echo "ERROR: wrangler is not installed. Run: npm i -g wrangler" >&2
  exit 1
fi

# Confirm the user is logged in (wrangler whoami exits non-zero if not)
if ! wrangler whoami >/dev/null 2>&1; then
  echo "ERROR: not logged in to Cloudflare. Run: wrangler login" >&2
  exit 1
fi

# --- Build step (none — static site) -----------------------------------------
# If you add a build tool later, run it here. For now, the repo is
# deploy-ready as-is.

# --- Deploy ------------------------------------------------------------------
EXTRA_ARGS=()
if [ -n "${CF_ACCOUNT_ID:-}" ]; then
  EXTRA_ARGS+=(--account-id="$CF_ACCOUNT_ID")
fi

if [ "$MODE" = "preview" ]; then
  # Current git branch becomes the preview environment
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo preview)"
  echo "Deploying preview to project '$CF_PROJECT_NAME' on branch '$BRANCH'…"
  wrangler pages deploy "$DEPLOY_DIR" \
    --project-name="$CF_PROJECT_NAME" \
    --branch="$BRANCH" \
    --commit-dirty=true \
    "${EXTRA_ARGS[@]}"
else
  echo "Deploying production to project '$CF_PROJECT_NAME'…"
  wrangler pages deploy "$DEPLOY_DIR" \
    --project-name="$CF_PROJECT_NAME" \
    --branch=main \
    --commit-dirty=true \
    "${EXTRA_ARGS[@]}"
fi

cat <<EOF

Deploy finished. You can:
  • View deployments:   https://dash.cloudflare.com/?to=/:account/pages/view/$CF_PROJECT_NAME
  • Tail logs:          wrangler pages deployment tail --project-name=$CF_PROJECT_NAME
  • Open project live:  https://$CF_PROJECT_NAME.pages.dev

If you configured a custom domain, that URL will also serve this build.
EOF

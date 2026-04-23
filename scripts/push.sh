#!/usr/bin/env bash
# -----------------------------------------------------------------------------
# push.sh — commit + push to GitHub
#
# Usage:
#   ./scripts/push.sh "commit message"
#   ./scripts/push.sh                    # prompts for a message
#
# One-time setup (replace <PLACEHOLDER_GITHUB_USER> and <PLACEHOLDER_REPO_NAME>
# with your values):
#
#   git remote add origin git@github.com:<PLACEHOLDER_GITHUB_USER>/<PLACEHOLDER_REPO_NAME>.git
#   git branch -M main
#   git push -u origin main
# -----------------------------------------------------------------------------
set -euo pipefail

# Run from repo root no matter where the script is invoked
cd "$(dirname "$0")/.."

# --- Config (edit these, or set them in your shell env) ----------------------
REMOTE="${REMOTE:-origin}"
BRANCH="${BRANCH:-main}"
GITHUB_USER="${GITHUB_USER:-<PLACEHOLDER_GITHUB_USER>}"
REPO_NAME="${REPO_NAME:-<PLACEHOLDER_REPO_NAME>}"
REMOTE_URL_DEFAULT="git@github.com:${GITHUB_USER}/${REPO_NAME}.git"

# --- Pre-flight --------------------------------------------------------------
if ! command -v git >/dev/null 2>&1; then
  echo "ERROR: git is not installed." >&2
  exit 1
fi

if [ ! -d .git ]; then
  echo "No git repo found in $(pwd). Initializing…"
  git init -q
  git branch -M "$BRANCH"
fi

# Make sure we have a remote
if ! git remote get-url "$REMOTE" >/dev/null 2>&1; then
  echo "No '$REMOTE' remote found. Adding: $REMOTE_URL_DEFAULT"
  git remote add "$REMOTE" "$REMOTE_URL_DEFAULT"
fi

# --- Commit ------------------------------------------------------------------
MSG="${1:-}"
if [ -z "$MSG" ]; then
  read -r -p "Commit message: " MSG
  if [ -z "$MSG" ]; then
    echo "ERROR: empty commit message." >&2
    exit 1
  fi
fi

git add -A

if git diff --cached --quiet; then
  echo "Nothing to commit — tree is clean."
else
  git commit -m "$MSG"
fi

# --- Push --------------------------------------------------------------------
echo "Pushing to $REMOTE/$BRANCH…"
git push -u "$REMOTE" "$BRANCH"

echo "Done. Current commit:"
git log -1 --oneline

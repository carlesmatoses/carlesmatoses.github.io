#!/bin/bash
# Build the site locally (in Docker) and publish it to the gh-pages branch.
# Fallback for when GitHub Actions can't run. Requires GitHub Pages to be set to
# "Deploy from a branch: gh-pages / (root)" in the repo settings.
#
# Builds from the last commit (HEAD), not the working tree, so uncommitted or
# untracked posts are never published by accident.
#
# Usage: ./deploy-local.sh           build + commit to gh-pages + push
#        ./deploy-local.sh --no-push build + commit, push yourself later
set -euo pipefail

cd "$(dirname "$0")"
ROOT="$PWD"
WORK="$ROOT/.deploy"
SHA="$(git rev-parse --short HEAD)"

if docker compose version &>/dev/null; then DC="docker compose"; else DC="docker-compose"; fi

echo "==> Exporting HEAD ($SHA) to a clean directory"
rm -rf "$WORK/src" "$WORK/site"
git worktree remove --force "$WORK/pages" 2>/dev/null || true
mkdir -p "$WORK/src"
git archive HEAD | tar -x -C "$WORK/src"
# git archive skips submodule contents; export each submodule at its pinned commit
git submodule foreach --quiet 'mkdir -p "'"$WORK"'/src/$sm_path" && git archive HEAD | tar -x -C "'"$WORK"'/src/$sm_path"'

echo "==> Building with Jekyll (production) in Docker"
$DC run --rm -T -v "$WORK:/deploy" -e JEKYLL_ENV=production jekyll sh -c "
  cd /deploy/src && bundle install --quiet && bundle exec jekyll build -d /deploy/site
  status=\$?; chown -R $(id -u):$(id -g) /deploy; exit \$status"

echo "==> Committing build to gh-pages"
git fetch -q origin gh-pages 2>/dev/null || true
if git rev-parse -q --verify origin/gh-pages >/dev/null; then
  git worktree add -q -B gh-pages "$WORK/pages" origin/gh-pages
else
  git worktree add -q --orphan -b gh-pages "$WORK/pages"
fi
rsync -a --delete --exclude .git "$WORK/site/" "$WORK/pages/"
touch "$WORK/pages/.nojekyll"   # serve files as-is, don't let Pages run Jekyll again
git -C "$WORK/pages" add -A
if git -C "$WORK/pages" diff --cached --quiet; then
  echo "    No changes since the last deploy."
else
  git -C "$WORK/pages" commit -q -m "deploy: $(git rev-parse HEAD)"
  echo "    Committed: $(git -C "$WORK/pages" log --oneline -1)"
fi
git worktree remove --force "$WORK/pages"
rm -rf "$WORK"   # temp build dir only; the result now lives in the gh-pages branch

if [[ "${1:-}" == "--no-push" ]]; then
  echo "==> Done. Push with: git push origin gh-pages"
else
  echo "==> Pushing gh-pages"
  git push origin gh-pages
fi

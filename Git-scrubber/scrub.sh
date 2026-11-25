#!/usr/bin/env bash
# scrub.sh - replace a personal email in the git history of GitHub repos.
# See README.md for setup and instructions.
set -euo pipefail

# CONFIG: fill these in before the first run
GH_USER="your-github-username"
OLD_EMAIL="old.personal@example.com"
NEW_EMAIL="00000000+your-github-username@users.noreply.github.com"
NEW_NAME="Your Name"
REPOS=(repo-one repo-two)

# Arguments: optional --check flag, optional repo names to replace REPOS
CHECK_ONLY=0
if [ "${1:-}" = "--check" ]; then CHECK_ONLY=1; shift; fi
if [ "$#" -gt 0 ]; then REPOS=("$@"); fi

# Stop if the config still has placeholder values
if [[ "$GH_USER" == "your-github-username" || "$OLD_EMAIL" == *example.com || "$NEW_EMAIL" == 00000000+* ]]; then
  echo "Fill in the config section at the top of scrub.sh first."
  exit 1
fi

# Helper: count commits in the current repo that still use OLD_EMAIL
count_old() {
  git log --all --format='%ae %ce' | grep -c -F "$OLD_EMAIL" || true
}

# Check mode: report the old-email count for each repo without changing anything
if [ "$CHECK_ONLY" -eq 1 ]; then
  tmp=$(mktemp -d)
  for r in "${REPOS[@]}"; do
    if git clone -q --mirror --filter=blob:none "https://github.com/$GH_USER/$r.git" "$tmp/$r" 2>/dev/null; then
      printf '%-30s %s\n' "$r" "$(cd "$tmp/$r" && count_old)"
    else
      printf '%-30s %s\n' "$r" "could not clone"
    fi
  done
  rm -rf -- "$tmp"
  exit 0
fi

# Find a working git-filter-repo command (Windows usually needs py -m)
if git filter-repo --version >/dev/null 2>&1; then
  FR=(git filter-repo)
elif py -m git_filter_repo --version >/dev/null 2>&1; then
  FR=(py -m git_filter_repo)
elif python3 -m git_filter_repo --version >/dev/null 2>&1; then
  FR=(python3 -m git_filter_repo)
elif python -m git_filter_repo --version >/dev/null 2>&1; then
  FR=(python -m git_filter_repo)
else
  echo "git-filter-repo not found. Install it:  py -m pip install git-filter-repo"
  exit 1
fi

# Write the mailmap that maps OLD_EMAIL to the new name and email
printf '%s <%s> <%s>\n' "$NEW_NAME" "$NEW_EMAIL" "$OLD_EMAIL" > mailmap.txt

# Rewrite mode: process each repo
for r in "${REPOS[@]}"; do
  url="https://github.com/$GH_USER/$r.git"
  echo
  echo "=================== $r"

  # Stop if any branch or tag name has characters Windows doesn't allow
  bad=$(git ls-remote --heads --tags "$url" | awk '{print $2}' | grep -E '[<>:"|?*\\]' || true)
  if [ -n "$bad" ]; then
    echo "STOPPING: these refs have characters Windows does not allow:"
    echo "$bad"
    echo "Rename them on GitHub, then run again. Nothing was pushed for $r."
    exit 1
  fi

  # Make a fresh mirror clone and rewrite its history
  rm -rf -- "./$r.git"
  git clone --mirror "$url" "$r.git"
  cd "$r.git"
  "${FR[@]}" --mailmap ../mailmap.txt --force

  # Check that the old email is gone, and stop before pushing if it isn't
  left=$(count_old)
  echo "commits still containing old email: $left"
  if [ "$left" -ne 0 ]; then
    echo "STOPPING: $r still has the old email. Nothing was pushed for it."
    exit 1
  fi

  # Add the remote back (filter-repo removes it) and force-push branches and tags
  git remote add origin "$url"
  git push --force --all origin
  git push --force --tags origin
  cd ..
done

# Clean up and print next steps
rm -f mailmap.txt
echo
echo "ALL DONE - every repo cleaned and pushed."
echo "Next: re-enable workflows, delete the *.git folders here, run"
echo "'bash scrub.sh --check', and reclone your local copies. See README.txt."

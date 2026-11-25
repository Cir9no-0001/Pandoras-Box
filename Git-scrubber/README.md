# Git Scrubber

> A script that replaces a personal email in the git history of your GitHub repos with your GitHub noreply address, then verifies and force-pushes the clean history.

---

## Table of Contents

- [What is this?](#what-is-this)
- [Why was this built?](#why-was-this-built)
- [How to use it](#how-to-use-it)

---

## What is this?

Every git commit stores the author's name and email. On a public repo, anyone can read them by cloning the repo or opening a commit's `.patch` URL, even when the email isn't shown anywhere on your GitHub profile.

Git Scrubber cleans this up across as many repos as you want in one run. For each repo, it:

- Makes a fresh mirror clone
- Rewrites every commit that uses your old email to your GitHub noreply address
- Confirms the old email is gone before pushing anything
- Force-pushes all branches and tags back to GitHub

Your commits, messages, dates, and code stay the same. Only the name and email on the commits change.

It also has a `--check` mode that reports how many commits in each repo still use the old email, without changing anything.

---

## Why was this built?

A suspicious recruitment email showed up in my personal inbox, referencing one of my GitHub projects by name. My email wasn't on my profile anywhere, so I dug into where they found it: the author field of my commits, across every public repo I had.

Fixing it by hand meant installing `git-filter-repo`, writing a mailmap, mirror-cloning, rewriting, verifying, and force-pushing, repo by repo. Along the way I also ran into a branch name Windows couldn't create, a CI bot that pushes on a schedule, and old local clones that would quietly put the email back on the next pull.

This script turns all of that into one command, so the next repo I make public takes a minute instead of an evening.

I also wanted to play with/learn Bash scripts after a year without doing any Bash. **ADVICE: Claude >> GPT at teaching bash, GPT IS HORRID AT BASH**

---

## How to use it

### Requirements

- Git (on Windows, Git Bash)
- Python 3 with `git-filter-repo`:

  ```bash
  py -m pip install git-filter-repo        # Windows
  python3 -m pip install git-filter-repo   # macOS / Linux
  ```

### One-Time Setup

1. On GitHub, go to **Settings -> Emails**:
   - Turn on **Keep my email addresses private**
   - Turn on **Block command line pushes that expose my email**
   - Copy your noreply address (`<digits>+<username>@users.noreply.github.com`)

2. Use it for all future commits:

   ```bash
   git config --global user.email "<your noreply address>"
   ```

3. Fill in the config section at the top of `scrub.sh`:

   ```bash
   GH_USER="your-github-username"
   OLD_EMAIL="old.personal@example.com"
   NEW_EMAIL="00000000+your-github-username@users.noreply.github.com"
   NEW_NAME="Your Name"
   REPOS=(repo-one repo-two)
   ```

### Running It

Before you run it, push any local work in the target repos, and disable any GitHub Actions workflow that pushes to them.

```bash
bash scrub.sh                  # rewrite every repo in REPOS
bash scrub.sh repoA repoB      # rewrite only the repos you name
bash scrub.sh --check          # report only, nothing is changed
```

Each repo should print `commits still containing old email: 0`, and the run ends with `ALL DONE`.

### Afterwards

- Re-enable any workflows you disabled
- Delete the `*.git` folders the script created
- Run `bash scrub.sh --check` and confirm every repo shows `0`
- **Reclone your local copies.** Old clones still have the old history, and pulling from one will merge it back in.

See `README.txt` for the full walkthrough, including how to check that a local folder is safe to delete, plus known issues and their fixes.
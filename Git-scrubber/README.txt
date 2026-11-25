INSTRUCTIONS in full detail by Claude :3

Follow the parts in order. Each part tells you what to do and what you should
see. If you see something different, stop and fix it before moving on.
 
  PART 1  One-time setup               (only the first time you use this)
  PART 2  Get ready                    (every time)
  PART 3  Run the script               (every time)
  PART 4  Check it worked              (every time)
  PART 5  Fix your local folders       (every time)
  PART 6  If something goes wrong
 
 
-------------------------------------------------------------------------------
  PART 1 - ONE-TIME SETUP
-------------------------------------------------------------------------------
 
[ ] 1. Hide your email on GitHub
       - Go to github.com -> your profile picture -> Settings -> Emails
       - Turn ON  "Keep my email addresses private"
       - Turn ON  "Block command line pushes that expose my email"
       - Under the first setting you'll see an address that looks like
         this. Copy it, you'll need it twice:
             12345678+yourname@users.noreply.github.com
 
[ ] 2. Open Git Bash
       - Press the Windows key, type "Git Bash", press Enter.
         (On a Mac, open Terminal instead.)
 
[ ] 3. Make future commits use the hidden address
       Paste this into Git Bash, with your own address, and press Enter:
 
           git config --global user.email "12345678+yourname@users.noreply.github.com"
 
       Tip: in Git Bash, paste with Shift+Insert or right-click -> Paste.
       Ctrl+V doesn't work.
 
[ ] 4. Install the tool the script needs
       Paste this and press Enter:
 
           py -m pip install git-filter-repo
 
       If it says "py: command not found", try:
 
           python -m pip install git-filter-repo
 
       (On a Mac:  python3 -m pip install git-filter-repo)
 
[ ] 5. Fill in the script's settings
       - Right-click scrub.sh -> Open with -> Notepad
       - Near the top, change these five lines:
 
           GH_USER="your-github-username"        <- your GitHub username
           OLD_EMAIL="old.personal@example.com"  <- the email to remove
           NEW_EMAIL="00000000+your-github..."   <- the address from step 1
           NEW_NAME="Your Name"                  <- name to show on commits
           REPOS=(repo-one repo-two)             <- your repo names
 
         Separate repo names with spaces. Don't use commas.
         Example:   REPOS=(my-website my-app school-project)
 
       - Save and close Notepad.
 
       WARNING: once filled in, scrub.sh contains your real email.
       Don't upload this copy to GitHub.
 
 
-------------------------------------------------------------------------------
  PART 2 - GET READY (every time)
-------------------------------------------------------------------------------
 
[ ] 1. Push your work
       In every repo you're about to scrub, commit and push anything that
       isn't on GitHub yet. Anything not pushed will be lost in Part 5.
 
[ ] 2. Pause any bots
       If a repo has a GitHub Actions workflow that pushes commits (an
       auto-sync bot, for example):
         - Open the repo on GitHub -> Actions tab
         - Click the workflow on the left
         - Click "..." (top right) -> Disable workflow
 
[ ] 3. Close open pull requests
       If any pull request comes FROM one of these repos, merge or close
       it first.
 
 
-------------------------------------------------------------------------------
  PART 3 - RUN THE SCRIPT
-------------------------------------------------------------------------------
 
[ ] 1. Open Git Bash in the script's folder
       - Open the folder with scrub.sh in File Explorer
       - Right-click an empty spot -> "Open Git Bash here"
         (On Windows 11, click "Show more options" first.)
 
[ ] 2. Run it
       Paste this and press Enter:
 
           bash scrub.sh
 
       To do only certain repos, name them at the end:
 
           bash scrub.sh my-website my-app
 
[ ] 3. Sign in if asked
       The first time, a browser window may pop up asking you to sign in
       to GitHub. Sign in and the script carries on by itself.
 
[ ] 4. Watch for these lines
       For EACH repo you should see:
 
           commits still containing old email: 0
 
       At the very end you should see:
 
           ALL DONE - every repo cleaned and pushed.
 
       Seeing "STOPPING" instead? Go to PART 6. Nothing was pushed for
       that repo, so nothing is broken.
 
 
-------------------------------------------------------------------------------
  PART 4 - CHECK IT WORKED
-------------------------------------------------------------------------------
 
[ ] 1. In the same Git Bash window, run:
 
           bash scrub.sh --check
 
       This only looks, it changes nothing. Every repo should show 0:
 
           my-website                     0
           my-app                         0
 
[ ] 2. Turn back on any workflows you disabled in Part 2.
       (Same menu: "..." -> Enable workflow)
 
[ ] 3. Delete the leftover folders
       The script made a folder ending in ".git" for each repo, next to
       scrub.sh (for example "my-website.git"). Delete them. They still
       contain the old history.
 
 
-------------------------------------------------------------------------------
  PART 5 - FIX YOUR LOCAL FOLDERS
-------------------------------------------------------------------------------
 
IMPORTANT: any copy of these repos already on your computer still has the old
history. Do NOT pull or push from it. A pull mixes the old history back in,
and your next push puts your email back on GitHub.
 
The fix is to delete each old folder and download it fresh. Do this for every
scrubbed repo you have on your computer.
 
[ ] 1. Open a terminal inside the old repo folder
       (Git Bash: right-click inside the folder -> "Open Git Bash here".
        Or use the terminal in VS Code.)
 
       If a Python venv is active (you'll see "(.venv)" at the start of the
       line), type  deactivate  and press Enter first.
 
[ ] 2. Run these four commands, one at a time:
 
           git fetch origin --prune --force
           git status --short --ignored
           git log --branches --not --remotes --oneline
           git stash list
 
       What they tell you:
 
       - "git status" lists files that AREN'T on GitHub.
           Lines starting with !! or ?? are those files.
           SAVE a copy somewhere else of anything you need, especially:
               .env   and   config files
           You can SKIP (they rebuild themselves):
               node_modules/   .venv/   __pycache__/   .pytest_cache/
 
       - "git log --branches..." should print NOTHING.
           If it lists commits, don't panic. They usually just have old IDs.
           Run this to be sure:
 
               git diff main origin/main --stat
 
           Prints nothing                    -> safe, carry on.
           Lists files                       -> those are changes that are
                                                ON GITHUB but not in this
                                                folder. Still safe.
           Not sure what you're looking at   -> stop and ask someone.
 
           (If your main branch isn't called "main", use its real name.)
 
       - "git stash list" should print NOTHING.
           If it prints something, those are saved changes. Run
           "git stash pop" and commit and push them before going on.
 
[ ] 3. Delete the old folder
       Close any editor that has it open, then delete the folder in
       File Explorer (or run these in the parent folder):
 
           cd ..
           rm -rf REPO-NAME
 
[ ] 4. Download it fresh
       In the same place, run:
 
           git clone https://github.com/YOUR-USERNAME/REPO-NAME.git
 
[ ] 5. Put back what you saved
       Copy your saved .env and config files back into the new folder.
 
[ ] 6. Rebuild what the project needs
       Python project:   python -m venv .venv
                         source .venv/Scripts/activate   (Git Bash)
                         pip install -r requirements.txt
       Node project:     npm install
       Chrome extension: go to chrome://extensions and click reload on it.
 
[ ] 7. Confirm the folder is clean
       Inside the new folder, run (with your old email):
 
           git log --all --format='%ae %ce' | grep -c old.personal@example.com
 
       It should print 0. Done!
 
 
-------------------------------------------------------------------------------
  PART 6 - IF SOMETHING GOES WRONG
-------------------------------------------------------------------------------
 
"Fill in the config section at the top of scrub.sh first."
    You haven't changed the five settings yet. Go back to Part 1, step 5.
 
"git-filter-repo not found"
    Part 1, step 4 didn't work. Try the other install command. If neither
    works, install Python from python.org (tick "Add Python to PATH"
    during install), then try again.
 
"STOPPING: these refs have characters Windows does not allow"
    A branch name has a character Windows can't use in file names, such as
    >  <  :  "  |  ?  *
    Fix it:
      - Open the repo on GitHub -> click "Branches"
      - Click the pencil icon next to the branch it named
      - Remove the bad character (for example, change  ->  to  -to- )
      - Run  bash scrub.sh  again.
 
"STOPPING: ... still has the old email"
    The email in the settings doesn't exactly match the one in your commits.
    Check OLD_EMAIL for typos, then run again.
 
"cannot lock ref ... Invalid argument"
    Same problem as the branch-name one above. Rename the branch on GitHub.
 
The script asks for a username or password in the terminal
    Close it, run it again, and sign in with the browser window instead.
 
"Permission denied" or "Repository not found"
    Check the repo name in REPOS (it's case-sensitive), and that you're
    signed in to the GitHub account that owns it.
 
Deleting a folder says it's "in use"
    Close VS Code (or anything else using the folder), type  deactivate
    if a venv is active, then try again.
 
 
-------------------------------------------------------------------------------
  GOOD TO KNOW
-------------------------------------------------------------------------------
 
- Nothing is lost. Your commits, messages, dates and code all stay. Only the
  email on the commits changes. Commit IDs change too, so old links to one
  specific commit will stop working.
 
- Your contribution graph is fine. GitHub knows the noreply address is you.
 
- Private repos: nobody else can see their history, so you can skip them.
  Just scrub one BEFORE you make it public:   bash scrub.sh that-repo
 
- Forked repos: only your commits change. The original authors' commits
  are left alone.
 
- The "Verified" badge disappears from commits you made on the GitHub
  website. That's only cosmetic.
 
- What this can't undo: anyone who already copied your email still has it,
  and other people's forks or clones keep the old history. To clear GitHub's
  cached copies of the old commits, contact GitHub Support
  (support.github.com).
 
- This only cleans the email on commits. If your email, name, student
  number or API keys are written INSIDE your files, this script doesn't
  remove them. Check your files before making a repo public.
 
Claude finished the response
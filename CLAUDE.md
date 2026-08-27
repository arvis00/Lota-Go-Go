# Lota Go Go!

The repo root is a Unity 6 HDRP project created from the `hdrp-blank` template. The game
itself is **not** built in it — `web/` holds "Lota Go", a self-contained HTML5/Canvas game
with no libraries and no image assets. See `web/README.md`. Don't port the game into Unity
unless asked.

## Environment

`git-lfs` is installed at `/opt/homebrew/bin/git-lfs` but is not always on the shell's
PATH. Without it every git command that touches the two LFS-tracked PNGs under
`Assets/TutorialInfo/Icons/` fails with `git-lfs: command not found`. Run
`export PATH="/opt/homebrew/bin:$PATH"` before git work rather than bypassing the filters.

## Git

**Commit straight to `main`** — don't branch, and don't ask first. Commit automatically
whenever a substantial change is finished and the game still loads without console errors.
Match the existing message style: lowercase, plain description of what changed, several
comma-separated clauses when the change touched several things.

**A small tweak stays uncommitted** until a real change carries it. Work in progress, a
one-line fix, a config or docs touch-up — leave those sitting in the working tree and fold
them into the next substantial commit. Pushing is the point of no return for folding: an
unpushed commit can still absorb a revision, but once it has left this machine it stays as
it is.

**Revisions fold into the commit they revise.** While a commit is unpushed and the
session is still the one that made it, a follow-up change to that same work goes in with
`git commit --amend`, not a new commit — history should read as one decision per commit,
not the path I took to reach it. A change that reverses an earlier one after you've seen
it running, or in a later session, is a real decision and gets its own commit. Once
pushed, a commit is frozen: always a new one. Say in the response when I amend and what I
folded in, so nothing I already showed you changes silently.

**Changes I didn't make ride along too.** Unstaged edits already in the working tree when
I start — yours, or Unity's own churn in `ProjectSettings/` and `Assets/` — get folded
into the commit for the work they relate to rather than left behind. Stage everything,
name what came along as its own clause in the message, and say in the response what I
carried, so nothing is committed under my name without you seeing it named.

**Ask before pushing.** Pushing is never automatic — when commits are waiting on `main`,
say so and ask whether to push, then run `git push origin main` only on a yes. Git
authenticates over HTTPS through the macOS keychain (`credential.helper=osxkeychain`).
Remote is `origin` → github.com/arvis00/Lota-Go-Go. Never force-push, and never rewrite a
commit that has already been pushed. If a push is rejected as non-fast-forward, stop and
tell me rather than rebasing or resolving it unasked.

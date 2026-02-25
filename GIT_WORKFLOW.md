# Git Workflow Guide

This guide explains how to save your changes and push them to GitHub.

## standard Workflow

1.  **Check Status** (Optional but recommended)
    See which files have changed.
    ```powershell
    git status
    ```

2.  **Stage Changes**
    Prepare all changed files for commit.
    ```powershell
    git add .
    ```

3.  **Commit Changes**
    Save the staged changes with a descriptive message.
    ```powershell
    git commit -m "Your message describing the changes"
    ```
    *Example: `git commit -m "Update login page design"`*

4.  **Push to GitHub**
    Upload your commits to the remote repository.
    ```powershell
    git push
    ```

---

## Troubleshooting

### "Unable to create '.git/index.lock': File exists."

If you see this error, it means a previous git command didn't finish correctly. To fix it:

1.  **Remove the lock file:**
    ```powershell
    Remove-Item -Path .git\index.lock -Force
    ```
2.  **Retry the command** (e.g., `git add .` or `git commit`).

# Skill: Safety Guardian

## Purpose
Prevent destructive actions, secret leaks, unsafe shell commands, unauthorized publishing, and uncontrolled automation.

## Activation Triggers
- Any action involving file deletion
- Any shell command with side effects
- Any git push, publish, or external communication
- Any package installation
- Any migration or schema change
- Any action touching protected paths

## When to Use
- ALWAYS active passively — any risky action should trigger safety review
- Explicitly activated when checking a plan for safety

## When NOT to Use
- Read-only operations (readFile, grep, glob, npm run check)

## Required Inputs
- The action being considered
- The files or systems affected
- The reversibility of the action

## Protected Paths Checklist
Before any write/delete, check if the path matches:
```
.env, .env.*, .env.local, .env.production
secrets/, credentials/, keys/
auth/, payments/, billing/
migrations/ (without approval)
node_modules/, .git/
private/, production/, backups/
customer-data/, personal-data/
```
If match: BLOCK and request explicit approval.

## Destructive Command Detection
Scan any shell command for:
- `rm`, `rmdir`, `del`, `unlink`
- `DROP TABLE`, `TRUNCATE`, `DELETE FROM` (without WHERE)
- `git push --force`, `git reset --hard`
- `chmod 777`, `sudo`
- `curl | bash`, `wget | sh`, `npx <unknown>`
- `npm publish`, `npx publish`

If detected: STOP, explain what the command does, request Level 3 approval.

## Secret Detection
Before writing any file, scan content for patterns:
- `sk-` (OpenAI key)
- `xoxb-` (Slack token)
- `ghp_` (GitHub token)
- `AIza` (Google API key)
- Anything matching `[A-Za-z0-9]{32,}` in an assignment context

If detected: STOP, do not include in output, warn user.

## Approval Level Enforcement

| Action | Required Level | Behavior |
|---|---|---|
| Read any file | 0 | Proceed |
| Create new file | 1 | Inform |
| Overwrite file | 1–2 | Show diff, confirm |
| Delete file | 3 | STOP, explicit approval |
| Install package | 2 | Confirm |
| Run migration | 2 | Confirm + show SQL |
| Git push | 3 | STOP, explicit approval |
| Shell command with side effects | 2–3 | Confirm or STOP |
| Publish/deploy | 3 | STOP, explicit approval |

## Step-by-Step Safety Review

1. Identify the action category (read, write, delete, execute, publish).
2. Identify the target (file path, table, service).
3. Check if target is a protected path.
4. Check if action is destructive.
5. Check for secrets in content.
6. Determine approval level.
7. If Level 0–1: proceed or inform.
8. If Level 2: show what will happen, ask "Confirm? (yes/no)".
9. If Level 3: STOP. Write exactly: "This action requires explicit approval: [description]. Please confirm with 'yes, proceed' before I continue."

## Output Format
- For safe actions: proceed silently
- For Level 2: summary of action + confirmation request
- For Level 3: STOP message with full description

## Failure Handling
- If unsure about safety level: treat as Level 3
- If the user previously approved a similar action: Level 3 still requires re-confirmation (approval doesn't carry over)
- If an accident happens: immediately log in `docs/SELF_IMPROVEMENT_LOG.md`, identify gap, improve this skill

## Registry Update Requirements
- Update this skill after any safety incident
- Log incident in `docs/SELF_IMPROVEMENT_LOG.md`
- Update `docs/SAFETY_POLICY.md` with new rules

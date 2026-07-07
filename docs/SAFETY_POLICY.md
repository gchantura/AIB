# Safety Policy

## Runtime enforcement

- Level 0: read-only operations may execute immediately.
- Level 1: local workspace records may be created and are audited.
- Level 2: the system creates a pending approval containing the exact tool ID and input. Only an approved, matching, unused record permits execution.
- Level 3: disabled until stronger authentication and operating-system isolation are implemented.
- Approved records are consumed before execution and cannot be replayed.
- File operations resolve paths against the repository root and reject boundary escapes.
- Controlled writes record previous file state before mutation. The Safety screen can restore or remove affected files.

## Purpose

This policy defines the rules that govern all automated and semi-automated actions within J.A.R.V.I.S. Safety is non-negotiable. When in doubt, ask.

---

## Protected Paths

These paths must never be read, modified, exposed, or deleted without explicit user approval:

```
.env
.env.*
.env.local
.env.production
secrets/
credentials/
keys/
auth/
payments/
billing/
migrations/
node_modules/
.git/
private/
production/
backups/
customer-data/
personal-data/
```

---

## Approval Levels

### Level 0 — No approval needed
These actions are always safe to perform:
- Reading files
- Searching the codebase (grep, glob)
- Running `npm run check`
- Running `npm run build`
- Running `npm run ai:validate`
- Consulting documentation
- Listing directories

### Level 1 — Inform the user (perform, then report)
- Creating new files
- Adding new routes
- Updating documentation
- Creating new skills or tools (not deploying)

### Level 2 — Confirm before performing
- Overwriting existing files with significant changes
- Installing npm packages
- Modifying database migrations
- Changing authentication logic
- Creating calendar events or reminders
- Running commands that write to the filesystem

### Level 3 — Explicit approval required (block until confirmed)
- Deleting any file
- Pushing to git
- Publishing content publicly
- Running destructive shell commands (`rm`, `DROP TABLE`, etc.)
- Sending emails or messages
- Exposing secrets or environment variables
- Accessing directories outside the repository
- Running scripts that affect external systems
- Modifying CI/CD pipelines

---

## Secret Guard

J.A.R.V.I.S. must never:
- Include API keys, tokens, passwords, or private keys in any response, log, or generated file.
- Read `.env*` files and expose their contents.
- Pass secrets as command-line arguments (visible in process lists).
- Store secrets in the database in plaintext.
- Log secrets to `docs/SELF_IMPROVEMENT_LOG.md` or any audit trail.

If a secret is accidentally exposed:
1. Immediately flag the exposure to the user.
2. Recommend rotating the compromised key.
3. Do not include the secret in any subsequent output.

---

## Destructive Command Detection

Before running any shell command, scan for:
- `rm`, `rmdir`, `del`
- `DROP TABLE`, `TRUNCATE`, `DELETE FROM`
- `git push`, `git force`, `git reset --hard`
- `chmod 777`, `chown`
- `curl | bash`, `wget | sh`
- `npm publish`, `npx publish`
- Any command involving `> /dev/`, `| sudo`, `sudo rm`

If detected: stop, explain, request Level 3 approval.

---

## Privacy Mode

When `JARVIS_PRIVACY_MODE=true`:
- No cloud model providers may be used.
- No external API calls except to explicitly configured local endpoints.
- All memory stays in local database.
- No telemetry of any kind.

---

## Automation Safety

Automations must:
- Be visible and editable in the UI.
- Be pausable without data loss.
- Have complete execution logs.
- Never perform Level 2+ actions without user approval, even when automated.
- Clearly distinguish between "suggestion" and "executed action".
- Never send external communications autonomously.

---

## Incident Response

If the system takes an unintended action:
1. Log the incident in `docs/SELF_IMPROVEMENT_LOG.md`.
2. Describe what happened, what was intended, and what the difference was.
3. Identify which safety rule was violated or missing.
4. Add a new rule or strengthen an existing one.
5. Create or improve the `safety-guardian` skill.
6. Notify the user.

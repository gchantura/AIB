# Tool Registry

## Schema

Every tool registered in J.A.R.V.I.S. must conform to this manifest:

```typescript
interface ToolManifest {
  id: string;                   // kebab-case unique id, e.g. "list-directory"
  name: string;                 // Human-readable name
  description: string;          // What it does
  category: ToolCategory;
  safetyLevel: 0 | 1 | 2 | 3; // 0=safe, 1=inform, 2=confirm, 3=explicit-approval
  permissions: Permission[];
  inputs: ZodSchema;
  outputs: ZodSchema;
  uiRoute?: string;             // e.g. "/tools/list-directory"
  storageRequirements?: string;
  modelRequirements?: string;
  examples: ToolExample[];
  ownerSkill?: string;
  testStatus: 'untested' | 'passing' | 'failing';
  version: string;
  createdAt: string;
  updatedAt: string;
}
```

---

## Tool Categories

- `productivity` — tasks, notes, reminders
- `calendar` — events, scheduling
- `research` — web search, summarization
- `coding` — project scanner, refactor, test gen
- `file-operations` — read, write, list (with approval for writes)
- `git-operations` — status, diff, log (no push without Level 3)
- `database` — memory queries
- `learning` — roadmap, exercises
- `automation` — schedulers, recurring jobs
- `system` — health checks, config
- `meta` — skill creation, tool creation, registry management

---

## Safety Levels

| Level | Approval Required | Examples |
|---|---|---|
| 0 | None | readFile, listDirectory, searchMemory |
| 1 | Inform user | createTask, createNote, saveMemory |
| 2 | Confirm before | writeFile, createCalendarEvent, installPackage |
| 3 | Explicit approval | deleteFile, gitPush, runShellCommand, sendEmail |

---

## Registered Tools

### Runtime tools

| ID | Name | Category | Safety | Status |
|---|---|---|---|---|
| `list-directory` | List Directory | file-operations | 0 | IMPLEMENTED |
| `read-file` | Read File | file-operations | 0 | IMPLEMENTED |
| `write-file` | Write File (with approval) | file-operations | 2 | IMPLEMENTED |
| `safe-command-runner` | Safe Command Runner | system | 2 | PLANNED |
| `summarize-project` | Summarize Project | coding | 0 | IMPLEMENTED |
| `create-task` | Create Task | productivity | 1 | IMPLEMENTED |
| `create-calendar-event` | Create Calendar Event | calendar | 2 | PLANNED |
| `create-reminder` | Create Reminder | productivity | 1 | PLANNED |
| `create-note` | Create Note | productivity | 1 | IMPLEMENTED |
| `search-memory` | Search Memory | database | 0 | PLANNED |
| `save-memory` | Save Memory | database | 1 | PLANNED |
| `register-tool` | Register Tool | meta | 1 | IMPLEMENTED |
| `validate-tool` | Validate Tool | meta | 0 | PLANNED |
| `create-skill` | Create Skill | meta | 1 | IMPLEMENTED |
| `improve-skill` | Improve Skill | meta | 1 | PLANNED |
| `create-app` | Create Local Svelte App | meta | 2 | IMPLEMENTED |

### Dangerous Tools (Level 3 — require explicit approval)

| ID | Name | Category |
|---|---|---|
| `delete-file` | Delete File | file-operations |
| `overwrite-file` | Overwrite File | file-operations |
| `run-shell-command` | Run Shell Command | system |
| `install-package` | Install Package | system |
| `git-push` | Git Push | git-operations |
| `external-publish` | External Publish | system |
| `send-email` | Send Email | automation |
| `access-external-directory` | Access External Directory | file-operations |

---

## Implementation Plan (Phase 6)

1. Create `src/lib/jarvis/tools/types.ts`.
2. Create `src/lib/jarvis/tools/schema.ts` with Zod manifest schema.
3. Create `src/lib/jarvis/tools/registry.ts`.
4. Implement initial Level 0 safe tools.
5. Create `src/routes/api/tools/+server.ts`.
6. Create Tool Registry UI at `src/routes/(jarvis)/tools/`.

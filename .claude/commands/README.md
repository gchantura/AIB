# .claude/commands/ — NOT SUPPORTED

## Status

The `.claude/commands/` directory is **not supported** in the current Claude Code environment (Bolt).

This environment uses the **Skill tool** (via the `available_skills` catalog in the system prompt) as the equivalent of slash commands.

## Equivalent Capability

| Slash command (if supported) | Skill equivalent |
|---|---|
| `/skill:svelte-architect` | Activate `svelte-architect` skill via Skill tool |
| `/skill:tool-factory` | Activate `tool-factory-engineer` skill via Skill tool |
| `/validate` | Run `npm run ai:validate` |
| `/repo-map` | Read `docs/REPOSITORY_MAP.md` |
| `/self-improve` | Write entry to `docs/SELF_IMPROVEMENT_LOG.md` |
| `/safety-check` | Activate `safety-guardian` skill |

## Future Support

If slash command support is added to this environment in the future, create one `.md` file per command in this directory following the pattern:

```
.claude/commands/
  validate.md          # /validate — runs npm run ai:validate and reports
  repo-map.md          # /repo-map — reads and summarizes repository map
  self-improve.md      # /self-improve — runs self-improvement protocol
  safety-check.md      # /safety-check — reviews pending action for safety
  next-phase.md        # /next-phase — reports current phase and next steps
```

Each file should contain the command description and the exact behavior Claude must follow when the command is invoked.

#!/usr/bin/env node
/**
 * SessionEnd manual fallback script.
 *
 * Native SessionEnd hooks are NOT supported in the current Claude Code (Bolt)
 * environment. This script is the MANUAL FALLBACK — it prints the session-end
 * protocol that Claude must follow at the conclusion of every significant
 * work session.
 *
 * Usage:
 *   node .claude/hooks/session-end-protocol.js
 *
 * Claude should run this at the end of every task and fill in the template
 * before writing the entry to docs/SELF_IMPROVEMENT_LOG.md.
 */

const today = new Date().toISOString().split('T')[0];

const template = `
[JARVIS SESSION-END PROTOCOL]
Date: ${today}

1. Write a new entry to docs/SELF_IMPROVEMENT_LOG.md using this template:

## ${today} — [Task Summary]

**Requested:** [what the user asked for]
**Created/Changed:**
- [list all files created or modified]
**Skills Used:** [list skills activated]
**Graph Consulted:** [Yes / No / DEGRADED_GRAPH_MODE]
**Validation Result:** [pass/fail — include exact command output]
**Repeated Pattern:** [any pattern that appeared more than once]
**New Skill Needed:** [Yes/No — name if yes]
**Skill Improvement Needed:** [which skill and why]
**New Tool Needed:** [Yes/No — name if yes]
**Docs Updated:** [list docs updated]
**Next Best Step:** [specific, concrete action for next session]

2. Update docs/VALIDATION_REPORT.md with the latest validation results.

3. If repository structure changed: update docs/REPOSITORY_MAP.md.

4. If CLAUDE.md phase status changed: update the phase table in CLAUDE.md.

---
Native SessionEnd hooks are not supported. This workflow is enforced via
the documentation-engineer skill.
`;

console.log(template);

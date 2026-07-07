# Skill: Coding Agent Engineer

## Purpose
Build safe coding-agent workflows: project scanning, architecture summaries, dependency analysis, refactor planning, test generation, code review, and documentation generation.

## Activation Triggers
- User asks to scan or analyze the project
- User asks for a refactor plan
- User wants test generation
- User wants code review
- User wants architecture documentation generated from code

## When to Use
- Any code intelligence or code generation task that affects multiple files
- Project-level analysis

## When NOT to Use
- Single-file bug fixes (no need for full scan)
- UI-only changes (use svelte-ui-engineer)

## Required Inputs
- Scope of analysis (full project, one module, one file)
- Desired output (scan report, refactor plan, tests, docs)

## Coding Agent Safety Rules
1. Read graph/map first.
2. Inspect relevant files.
3. Plan before editing.
4. Make small changes.
5. Validate after each change.
6. Summarize the diff.
7. Update docs if architecture changes.
8. Never delete without confirmation.
9. Never run scripts without showing what they do first.

## Step-by-Step Workflow

### Project Scan
1. Read `docs/REPOSITORY_MAP.md`.
2. List all routes: `src/routes/`.
3. List all lib modules: `src/lib/`.
4. Identify: framework version, adapter, styling, DB, auth.
5. Count: routes, components, API endpoints.
6. Identify: missing features, tech debt, inconsistencies.
7. Output: project scan report.

### Refactor Planning
1. Read `docs/ARCHITECTURE.md`.
2. Identify the code to refactor.
3. Understand its dependencies (imports, callers).
4. Plan the smallest safe refactor.
5. List files to change.
6. List validation steps.
7. Present plan — do NOT execute without user confirmation.

### Test Generation
1. Identify the function or module to test.
2. Identify edge cases (empty input, invalid input, boundary values).
3. Generate test file following existing test patterns.
4. Run `npm run check`.

### Code Review
1. Read the file(s) to review.
2. Check for: type safety, error handling, security, performance, accessibility.
3. Report findings with line numbers.
4. Suggest fixes — do NOT auto-apply without user confirmation.

## Output Format
- Scan: markdown report
- Refactor: step-by-step plan with file list
- Tests: test file(s)
- Review: findings + suggestions with line references

## Validation Checklist
- [ ] Repository map consulted before file search
- [ ] No changes made without plan
- [ ] Validation run after changes
- [ ] Diff summarized

## Registry Update Requirements
- Update `docs/ARCHITECTURE.md` if architecture insight found
- Log in `docs/SELF_IMPROVEMENT_LOG.md`

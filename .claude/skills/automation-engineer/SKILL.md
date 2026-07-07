# Skill: Automation Engineer

## Purpose
Create schedulers, reminders, background jobs, recurring tasks, and safe automation flows that are visible, pausable, logged, and user-controllable.

## Activation Triggers
- User requests a recurring task ("remind me every day", "run this every morning")
- A workflow should be automated
- Building the Automation Dashboard
- Creating the daily AI digest feature

## When to Use
- Any automation, scheduler, or background job work

## When NOT to Use
- One-time operations (use tool-factory-engineer)
- Real-time features (use SvelteKit server-sent events)

## Required Inputs
- What the automation should do
- When it should run (cron expression or interval)
- Whether it needs user approval before execution
- Where its output should go (memory, notification, UI)

## Automation Safety Rules (Non-Negotiable)
1. Every automation MUST be visible in the UI.
2. Every automation MUST be pausable without data loss.
3. Every automation MUST be editable (change schedule, content).
4. Every automation MUST have execution logs.
5. Automations MUST NOT perform Level 2+ actions without user approval.
6. Automations MUST clearly separate "suggestion" from "executed action".
7. Automations MUST NOT send external communications autonomously.

## Step-by-Step Workflow

1. Define the automation:
   - id, name, description
   - trigger: cron expression or interval
   - action: what to do
   - safetyLevel: 0 or 1 only (automations cannot be Level 2+)
   - output target: memory / notification / UI widget
2. Create Supabase table `automation_jobs` if not exists.
3. Implement the automation function in `src/lib/jarvis/automation/`.
4. Create a SvelteKit scheduled endpoint or use Supabase Edge Functions for timing.
5. Store each run result in `memory_automation` table.
6. Add the automation to the Automation Dashboard UI.
7. Add pause/resume toggle.
8. Add edit form for schedule.
9. Add execution log view.

## Planned Automations
1. Daily planning (morning summary)
2. AI research digest (daily)
3. Learning task reminders
4. Weekly review
5. Memory summaries
6. Tool health checks
7. Skill improvement suggestions

## Output Format
- Automation implementation file
- Supabase migration (if new tables)
- UI in Automation Dashboard
- Updated `docs/ROADMAP.md`

## Validation Checklist
- [ ] Automation is visible in UI
- [ ] Automation is pausable
- [ ] Execution logs stored
- [ ] Safety level is 0 or 1 only
- [ ] No external communications without approval
- [ ] `npm run check` passes

## Registry Update Requirements
- Log in `docs/SELF_IMPROVEMENT_LOG.md`
- Update `docs/ROADMAP.md` if new automation added

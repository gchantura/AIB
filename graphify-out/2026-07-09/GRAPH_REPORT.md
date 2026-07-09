# Graph Report - AIB  (2026-07-08)

## Corpus Check
- 120 files · ~37,798 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 816 nodes · 1039 edges · 79 communities (72 shown, 7 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5e338c02`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- types.ts
- router.ts
- Safety Policy
- Super J.A.R.V.I.S. — Claude Code Operating Manual
- Skill: Senior AI Engineer Coach
- lucide-svelte
- Skill: Coding Agent Engineer
- Skill: Graphify Navigator
- snapshot
- Skill: Svelte UI Engineer
- Skill: Model Provider Engineer
- Skill: Safety Guardian
- Skill: Tool Factory Engineer
- Skill: Validation Engineer
- Skill: AI Researcher
- Skill: Documentation Engineer
- Skill: Memory Engineer
- Skill: Skill Generator
- Skill: Svelte Architect
- Core Values
- package.json
- validate.js
- Skill: App Factory Engineer
- Skill: Automation Engineer
- J.A.R.V.I.S. Subagent Definitions
- Self-Improvement Log
- Model Providers
- compilerOptions
- Memory System
- Repository Map
- Validation Report
- Repository Intelligence
- Available Svelte MCP Tools:
- Roadmap
- Skill Registry
- Available Svelte MCP Tools:
- +server.ts
- pre-command-guard.js
- svelte
- .claude/commands/ — NOT SUPPORTED
- +server.ts
- pre-search-reminder.js
- svelte
- svelte
- +server.ts
- +server.ts
- +server.ts
- +layout.svelte
- opencode.json
- +server.ts
- post-edit-checklist.js
- @sveltejs/kit
- svelte.json

## God Nodes (most connected - your core abstractions)
1. `transaction()` - 38 edges
2. `snapshot()` - 28 edges
3. `record()` - 26 edges
4. `Super J.A.R.V.I.S. — Claude Code Operating Manual` - 21 edges
5. `LLMProvider` - 16 edges
6. `scripts` - 15 edges
7. `Skill: Svelte UI Engineer` - 15 edges
8. `offline()` - 14 edges
9. `LLMRouter` - 14 edges
10. `Skill: Model Provider Engineer` - 14 edges

## Surprising Connections (you probably didn't know these)
- `deleteConversation()` --calls--> `transaction()`  [EXTRACTED]
  src/lib/jarvis/intelligence/runtime.ts → src/lib/jarvis/core/store.ts
- `updateMemory()` --calls--> `transaction()`  [EXTRACTED]
  src/lib/jarvis/memory/api.ts → src/lib/jarvis/core/store.ts
- `listUpgradePlans()` --calls--> `snapshot()`  [EXTRACTED]
  src/lib/jarvis/evaluation/upgrades.ts → src/lib/jarvis/core/store.ts
- `listConversations()` --calls--> `snapshot()`  [EXTRACTED]
  src/lib/jarvis/intelligence/runtime.ts → src/lib/jarvis/core/store.ts
- `countMemory()` --calls--> `snapshot()`  [EXTRACTED]
  src/lib/jarvis/memory/api.ts → src/lib/jarvis/core/store.ts

## Import Cycles
- None detected.

## Communities (79 total, 7 thin omitted)

### Community 0 - "types.ts"
Cohesion: 0.13
Nodes (20): Approval, Automation, BaseEntity, Briefing, CalendarEvent, Conversation, ExecutionMetric, ImprovementProposal (+12 more)

### Community 1 - "router.ts"
Cohesion: 0.08
Nodes (17): getLLMConfig(), authFailed(), LLMError, offline(), rateLimited(), AnthropicProvider, OllamaProvider, OpenAICompatibleProvider (+9 more)

### Community 2 - "Safety Policy"
Cohesion: 0.04
Nodes (43): Architecture, Current State, Decision 1: SvelteKit as the sole UI framework, Decision 2: Atomic local JSON as the default persistence layer, Decision 3: Provider abstraction before first model call, Decision 4: Skills stored as SKILL.md files in .claude/skills/, Decision 5: Lucide icons, no colorful buttons, Directory Structure (+35 more)

### Community 4 - "Super J.A.R.V.I.S. — Claude Code Operating Manual"
Cohesion: 0.04
Nodes (44): Active Hooks, API Routes (at inspection time), Auth Usage (at inspection time), Claude Code Capability Support (as detected), Commands System, Core Philosophy, Current Dependencies (at inspection time), Current Phase Status (+36 more)

### Community 5 - "Skill: Senior AI Engineer Coach"
Cohesion: 0.10
Nodes (20): Activation Triggers, Advanced, AI Engineering Skill Map, Daily (30 min), Engineering, Foundation, Intermediate, Interview Prep Topics (+12 more)

### Community 6 - "lucide-svelte"
Cohesion: 0.06
Nodes (23): devDependencies, lucide-svelte, @playwright/test, publint, svelte, svelte-check, @sveltejs/adapter-node, @sveltejs/kit (+15 more)

### Community 7 - "Skill: Coding Agent Engineer"
Cohesion: 0.12
Nodes (15): Activation Triggers, Code Review, Coding Agent Safety Rules, Output Format, Project Scan, Purpose, Refactor Planning, Registry Update Requirements (+7 more)

### Community 8 - "Skill: Graphify Navigator"
Cohesion: 0.12
Nodes (15): Activation Triggers, Examples, Failure Handling, If DEGRADED_GRAPH_MODE (current):, If Graphify is available:, Output Format, Purpose, Registry Update Requirements (+7 more)

### Community 9 - "snapshot"
Cohesion: 0.06
Nodes (75): checkCalendarReminders(), nextRun(), notify(), runAutomation(), schedulerTick(), startScheduler(), generateBriefing(), createEntity() (+67 more)

### Community 10 - "Skill: Svelte UI Engineer"
Cohesion: 0.12
Nodes (15): Activation Triggers, Component Checklist, Design Rules (Non-Negotiable), Examples, Failure Handling, Output Format, Purpose, Registry Update Requirements (+7 more)

### Community 11 - "Skill: Model Provider Engineer"
Cohesion: 0.13
Nodes (14): Activation Triggers, Examples, Failure Handling, Local-First Rule, Output Format, Provider Interface, Purpose, Registry Update Requirements (+6 more)

### Community 12 - "Skill: Safety Guardian"
Cohesion: 0.13
Nodes (14): Activation Triggers, Approval Level Enforcement, Destructive Command Detection, Failure Handling, Output Format, Protected Paths Checklist, Purpose, Registry Update Requirements (+6 more)

### Community 14 - "Skill: Tool Factory Engineer"
Cohesion: 0.13
Nodes (14): Activation Triggers, Dangerous Tool Rule, Examples, Failure Handling, Output Format, Purpose, Registry Update Requirements, Required Inputs (+6 more)

### Community 16 - "Skill: Validation Engineer"
Cohesion: 0.13
Nodes (14): Activation Triggers, ai:validate Checks, Available Validation Commands, Common Failure Patterns, Failure Handling, Output Format, Purpose, Registry Update Requirements (+6 more)

### Community 17 - "Skill: AI Researcher"
Cohesion: 0.14
Nodes (13): Activation Triggers, Failure Handling, Output Format, Purpose, Registry Update Requirements, Required Inputs, Research Categories, Research Quality Rules (+5 more)

### Community 18 - "Skill: Documentation Engineer"
Cohesion: 0.14
Nodes (13): Activation Triggers, Documentation Quality Rules, Documents to Maintain, Output Format, Purpose, Registry Update Requirements, Required Inputs, Self-Improvement Log Entry Template (+5 more)

### Community 19 - "Skill: Memory Engineer"
Cohesion: 0.14
Nodes (13): Activation Triggers, Failure Handling, Memory Entry Required Columns, Output Format, Purpose, Registry Update Requirements, Required Inputs, RLS Pattern (No-Auth App) (+5 more)

### Community 20 - "Skill: Skill Generator"
Cohesion: 0.14
Nodes (13): Activation Triggers, Examples, Failure Handling, Output Format, Purpose, Registry Update Requirements, Required Inputs, SKILL.md Required Sections (+5 more)

### Community 21 - "Skill: Svelte Architect"
Cohesion: 0.14
Nodes (13): Activation Triggers, Examples, Failure Handling, Output Format, Purpose, Registry Update Requirements, Required Inputs, Skill: Svelte Architect (+5 more)

### Community 22 - "Core Values"
Cohesion: 0.14
Nodes (13): 1. Local First, 2. Model Agnostic, 3. Safety Over Speed, 4. Build, Don't Accumulate, 5. Continuous Self-Improvement, 6. Transparency, 7. Data Sovereignty, Core Values (+5 more)

### Community 23 - "package.json"
Cohesion: 0.07
Nodes (28): dependencies, @supabase/supabase-js, exports, files, keywords, name, peerDependencies, svelte (+20 more)

### Community 24 - "validate.js"
Cohesion: 0.15
Nodes (10): check(), __dirname, failures, logContent, protectedPaths, ROOT, scanDirForSecrets(), SECRET_PATTERNS (+2 more)

### Community 25 - "Skill: App Factory Engineer"
Cohesion: 0.15
Nodes (12): Activation Triggers, App Template Checklist, Output Format, Planned Apps (from ROADMAP.md), Purpose, Registry Update Requirements, Required Inputs, Skill: App Factory Engineer (+4 more)

### Community 26 - "Skill: Automation Engineer"
Cohesion: 0.15
Nodes (12): Activation Triggers, Automation Safety Rules (Non-Negotiable), Output Format, Planned Automations, Purpose, Registry Update Requirements, Required Inputs, Skill: Automation Engineer (+4 more)

### Community 28 - "J.A.R.V.I.S. Subagent Definitions"
Cohesion: 0.18
Nodes (10): Architect, J.A.R.V.I.S. Subagent Definitions, Memory Engineer, Model Engineer, Product Designer, Researcher, Safety Reviewer, Svelte Engineer (+2 more)

### Community 29 - "Self-Improvement Log"
Cohesion: 0.18
Nodes (10): 2026-07-07 — Evaluation and capability governance, 2026-07-07 — Functional local-first runtime, 2026-07-07 — Persistent intelligence, 2026-07-07 — Phase 0/1 Compliance Review, 2026-07-07 — Phase 0 + Phase 1 Bootstrap, 2026-07-07 — Proactive operations, 2026-07-07 — Safe autonomy and app factory, Entry Format (+2 more)

### Community 32 - "Model Providers"
Cohesion: 0.20
Nodes (9): Cloud (Optional, Opt-In), Implemented Phase 4 Components, Local (Privacy-First), Model Configuration (Environment Variables), Model Providers, Model Router Logic, Provider Abstraction, Provider Interface (TypeScript concept) (+1 more)

### Community 33 - "compilerOptions"
Cohesion: 0.20
Nodes (9): compilerOptions, forceConsistentCasingInFileNames, module, moduleResolution, resolveJsonModule, skipLibCheck, sourceMap, types (+1 more)

### Community 34 - "Memory System"
Cohesion: 0.22
Nodes (8): Core Memory API (Planned), Implementation Plan (Phase 5), Memory Categories, Memory Entry Schema, Memory Rules, Memory System, Philosophy, Vector Memory (Future — Phase 5+)

### Community 35 - "Repository Map"
Cohesion: 0.22
Nodes (8): APIs, Core modules, Generated and private state, Known limitations, Repository Map, Runtime, User interface, Validation

### Community 36 - "Validation Report"
Cohesion: 0.22
Nodes (8): Command: `npm run ai:validate`, Command: `npm run ai:validate`, Command: `npm run build`, Command: `npm run build`, Known Gaps in Validation Coverage, Run: 2026-07-07 — Compliance Fix (Phase 0/1 Review), Run: 2026-07-07 — Phase 0 + Phase 1 Bootstrap (Initial), Validation Report

### Community 37 - "Repository Intelligence"
Cohesion: 0.25
Nodes (7): Graph-First Workflow (Manual Fallback), Graphify (Not Installed), Recommended Graph-First Triggers, Repository Intelligence, Repository Map Location, Status: DEGRADED_GRAPH_MODE, To Enable Full Graph Intelligence

### Community 39 - "Available Svelte MCP Tools:"
Cohesion: 0.29
Nodes (6): 1. list-sections, 2. get-documentation, 3. svelte-autofixer, 4. playground-link, Available Svelte MCP Tools:, Project Configuration

### Community 40 - "Roadmap"
Cohesion: 0.29
Nodes (6): Current milestone, Evaluation and capability governance — complete MVP, Later milestones, Next milestone: evaluated upgrade execution, Non-goals until safety prerequisites exist, Roadmap

### Community 41 - "Skill Registry"
Cohesion: 0.29
Nodes (6): Registered Skills, Skill Improvement Rules, Skill Registry, Skill Schema, Skill Usage Log, What is a Skill?

### Community 42 - "Available Svelte MCP Tools:"
Cohesion: 0.29
Nodes (6): 1. list-sections, 2. get-documentation, 3. svelte-autofixer, 4. playground-link, Available Svelte MCP Tools:, Project Configuration

### Community 43 - "+server.ts"
Cohesion: 0.48
Nodes (6): DELETE(), GET(), kind(), kinds, PATCH(), POST()

### Community 44 - "pre-command-guard.js"
Cohesion: 0.33
Nodes (5): command, DESTRUCTIVE_PATTERNS, INSTALL_PATTERNS, isDestructive, isInstall

### Community 45 - "svelte"
Cohesion: 0.33
Nodes (5): mcpServers, svelte, $schema, args, command

### Community 46 - ".claude/commands/ — NOT SUPPORTED"
Cohesion: 0.40
Nodes (4): .claude/commands/ — NOT SUPPORTED, Equivalent Capability, Future Support, Status

### Community 47 - "+server.ts"
Cohesion: 0.50
Nodes (4): CodingBody, POST(), root, safe()

### Community 48 - "pre-search-reminder.js"
Cohesion: 0.50
Nodes (3): args, isSearchTool, searchTools

### Community 49 - "svelte"
Cohesion: 0.50
Nodes (3): npx, @sveltejs/mcp, svelte

### Community 50 - "svelte"
Cohesion: 0.50
Nodes (3): npx, @sveltejs/mcp, svelte

### Community 51 - "+server.ts"
Cohesion: 0.83
Nodes (3): buildConfig(), buildProjectContext(), POST()

### Community 55 - "+server.ts"
Cohesion: 0.67
Nodes (3): GET(), ignored, walk()

## Knowledge Gaps
- **442 isolated node(s):** `checks`, `command`, `DESTRUCTIVE_PATTERNS`, `INSTALL_PATTERNS`, `isDestructive` (+437 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What connects `checks`, `command`, `DESTRUCTIVE_PATTERNS` to the rest of the system?**
  _442 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `types.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.12857142857142856 - nodes in this community are weakly interconnected._
- **Should `router.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08413461538461539 - nodes in this community are weakly interconnected._
- **Should `Safety Policy` be split into smaller, more focused modules?**
  _Cohesion score 0.0425531914893617 - nodes in this community are weakly interconnected._
- **Should `Super J.A.R.V.I.S. — Claude Code Operating Manual` be split into smaller, more focused modules?**
  _Cohesion score 0.044444444444444446 - nodes in this community are weakly interconnected._
- **Should `Skill: Senior AI Engineer Coach` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._
- **Should `lucide-svelte` be split into smaller, more focused modules?**
  _Cohesion score 0.06090808416389812 - nodes in this community are weakly interconnected._
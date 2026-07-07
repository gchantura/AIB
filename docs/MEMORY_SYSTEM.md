# Memory System

## Philosophy

Memory is what separates a chatbot from an AI operating system. J.A.R.V.I.S. must remember context across sessions, projects, conversations, and time.

All memory is local by default, stored in Supabase (PostgreSQL). Memory never leaves the machine without explicit user consent.

---

## Memory Categories

| Category | Description | Table |
|---|---|---|
| User Profile | Preferences, background, goals | `memory_user_profile` |
| Project Memory | Per-project facts, decisions, code context | `memory_projects` |
| Skill Memory | Skill usage history, effectiveness | `memory_skills` |
| Tool Memory | Tool usage, outputs, registry | `memory_tools` |
| Task Memory | Tasks, todos, status | `memory_tasks` |
| Calendar Memory | Events, reminders, prep notes | `memory_calendar` |
| Research Memory | Saved digests, source summaries | `memory_research` |
| Learning Memory | Progress, completed topics, weak areas | `memory_learning` |
| Decision Memory | Key decisions with rationale | `memory_decisions` |
| Daily Logs | Daily activity summaries | `memory_daily_logs` |
| Conversation Summaries | Compressed chat history | `memory_conversations` |
| Codebase Facts | File-level knowledge about this repo | `memory_codebase` |
| Contacts | People, collaborators | `memory_contacts` |
| Automation History | Automation run logs | `memory_automation` |

---

## Memory Rules

- Never store secrets (API keys, passwords, tokens).
- Never store sensitive personal data without explicit purpose.
- Separate factual memory from inferred memory (`is_inferred` boolean column).
- Mark uncertain memory as uncertain (`confidence` float 0–1).
- Support full-text search on all memory categories.
- Support deletion by user, by category, by source.
- Support export to JSON.
- Support source tracking (which tool/chat created this memory).
- Support memory linking (memory → project, memory → tool).

---

## Core Memory API (Planned)

```typescript
interface MemoryAPI {
  createMemory(entry: MemoryEntry): Promise<string>;         // returns id
  searchMemory(query: string, options?: SearchOptions): Promise<MemoryEntry[]>;
  updateMemory(id: string, patch: Partial<MemoryEntry>): Promise<void>;
  deleteMemory(id: string): Promise<void>;
  summarizeMemory(category: MemoryCategory): Promise<string>;
  linkMemoryToTool(memoryId: string, toolId: string): Promise<void>;
  linkMemoryToProject(memoryId: string, projectId: string): Promise<void>;
  retrieveRelevantContext(prompt: string, limit?: number): Promise<MemoryEntry[]>;
  exportMemory(category?: MemoryCategory): Promise<object>;
  auditMemory(): Promise<MemoryAuditReport>;
}
```

---

## Memory Entry Schema

```typescript
interface MemoryEntry {
  id: string;
  category: MemoryCategory;
  content: string;
  summary?: string;
  source: string;           // 'chat' | 'tool:listDirectory' | 'automation:daily' | ...
  is_inferred: boolean;
  confidence: number;       // 0.0 – 1.0
  tags: string[];
  project_id?: string;
  tool_id?: string;
  created_at: Date;
  updated_at: Date;
  expires_at?: Date;
}
```

---

## Vector Memory (Future — Phase 5+)

When semantic search is needed:
- Use `pgvector` extension in Supabase.
- Embed memory entries with the configured embedding model.
- Retrieve top-K similar entries for context injection.

This is NOT implemented in Phase 5. The API is designed to support it as a future upgrade.

---

## Implementation Plan (Phase 5)

1. Create Supabase migration: all `memory_*` tables.
2. Enable RLS on all memory tables.
3. Create `src/lib/jarvis/memory/schema.ts`.
4. Create `src/lib/jarvis/memory/types.ts`.
5. Create `src/lib/jarvis/memory/api.ts`.
6. Create `src/lib/jarvis/memory/search.ts`.
7. Create `src/routes/api/memory/+server.ts`.
8. Create Memory Explorer UI at `src/routes/(jarvis)/memory/`.

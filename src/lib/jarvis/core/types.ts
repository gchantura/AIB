export type EntityKind = 'tasks' | 'notes' | 'projects' | 'events' | 'research' | 'automations' | 'learning';

export interface BaseEntity { id: string; createdAt: string; updatedAt: string }
export type ReminderRepeat = 'none' | 'hourly' | 'every2h' | 'every4h' | 'every6h' | 'every12h' | 'daily' | 'weekly' | 'biweekly' | 'monthly';
export interface Task extends BaseEntity { title: string; description: string; status: 'todo' | 'doing' | 'done'; priority: 'low' | 'medium' | 'high'; dueAt?: string; notified?: boolean; reminderMinutes?: number; reminderRepeat?: ReminderRepeat; nextNotifyAt?: string; emailReminder?: string; emailCc?: string; emailSubject?: string }
export interface Note extends BaseEntity { title: string; content: string; tags: string[]; projectId?: string }
export interface Project extends BaseEntity { name: string; description: string; status: 'active' | 'paused' | 'complete'; path?: string }
export interface CalendarEvent extends BaseEntity { title: string; description: string; startsAt: string; endsAt?: string; reminderMinutes?: number; reminderRepeat?: ReminderRepeat; nextNotifyAt?: string; notified?: boolean; emailReminder?: string; emailCc?: string }
export interface ResearchItem extends BaseEntity { title: string; query: string; summary: string; sources: { title: string; url: string }[]; status: 'draft' | 'complete' }
export interface Automation extends BaseEntity { name: string; action: string; schedule: string; enabled: boolean; lastRunAt?: string; nextRunAt?: string }
export interface LearningItem extends BaseEntity { topic: string; area: string; status: 'planned' | 'learning' | 'complete'; notes: string }
export interface AuditEvent { id: string; at: string; action: string; entity?: EntityKind | 'tool' | 'skill' | 'system'; entityId?: string; outcome: 'success' | 'denied' | 'failed'; detail: string }
export interface ToolManifest { id: string; name: string; description: string; category: string; safetyLevel: 0 | 1 | 2 | 3; generated?: boolean }
export interface SkillManifest { id: string; name: string; description: string; path: string; generated?: boolean }
export interface LocalMemory { id: string; category: string; content: string; summary?: string | null; source: string; is_inferred: boolean; confidence: number; tags: string[]; project_id?: string | null; tool_id?: string | null; created_at: string; updated_at: string; expires_at?: string | null }
export interface Approval { id: string; toolId: string; input: Record<string, unknown>; reason: string; status: 'pending' | 'approved' | 'denied' | 'consumed'; createdAt: string; decidedAt?: string; consumedAt?: string }
export interface RollbackRecord { id: string; approvalId: string; toolId: string; createdAt: string; status: 'available' | 'rolled-back'; files: { path: string; existed: boolean; previousContent?: string }[]; rolledBackAt?: string }
export interface Conversation { id: string; title: string; createdAt: string; updatedAt: string; messages: { id: string; role: 'user' | 'assistant' | 'system'; content: string; at: string; model?: string }[] }
export interface ModelRun { id: string; kind: 'chat' | 'research' | 'coding'; prompt: string; model?: string; status: 'complete' | 'failed'; createdAt: string; output?: string; error?: string }
export interface Notification { id: string; title: string; message: string; level: 'info' | 'success' | 'warning' | 'error'; createdAt: string; readAt?: string; source: string }
export interface Briefing { id: string; date: string; createdAt: string; summary: string; taskIds: string[]; eventIds: string[]; recommendations: string[] }
export interface ExecutionMetric { id: string; capability: string; kind: 'tool' | 'model' | 'automation'; startedAt: string; durationMs: number; ok: boolean; error?: string; metadata?: Record<string, unknown> }
export interface ImprovementProposal { id: string; title: string; rationale: string; target: string; evidence: string[]; risk: 'low' | 'medium' | 'high'; status: 'proposed' | 'approved' | 'dismissed'; createdAt: string; decidedAt?: string }
export interface UpgradePlan { id: string; proposalId: string; title: string; target: string; status: 'preparing'|'ready'|'blocked'|'verified'; createdAt: string; updatedAt: string; steps: string[]; validation: { command: string; ok: boolean; durationMs: number; output: string }[] }

export interface JarvisData {
  version: 1;
  tasks: Task[];
  notes: Note[];
  projects: Project[];
  events: CalendarEvent[];
  research: ResearchItem[];
  automations: Automation[];
  learning: LearningItem[];
  audit: AuditEvent[];
  generatedTools: ToolManifest[];
  generatedSkills: SkillManifest[];
  memories: LocalMemory[];
  approvals: Approval[];
  rollbacks: RollbackRecord[];
  conversations: Conversation[];
  modelRuns: ModelRun[];
  notifications: Notification[];
  briefings: Briefing[];
  executionMetrics: ExecutionMetric[];
  improvementProposals: ImprovementProposal[];
  upgradePlans: UpgradePlan[];
}

export type MemoryCategory =
  | 'user-profile'
  | 'project'
  | 'task'
  | 'research'
  | 'learning'
  | 'decision'
  | 'codebase'
  | 'conversation'
  | 'daily-log'
  | 'automation'
  | 'contact'
  | 'tool'
  | 'skill'
  | 'note';

export interface MemoryEntry {
  id: string;
  category: MemoryCategory;
  content: string;
  summary?: string | null;
  source: string;
  is_inferred: boolean;
  confidence: number;
  tags: string[];
  project_id?: string | null;
  tool_id?: string | null;
  created_at: string;
  updated_at: string;
  expires_at?: string | null;
}

export type CreateMemoryEntry = Omit<MemoryEntry, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export interface MemorySearchOptions {
  category?: MemoryCategory;
  tags?: string[];
  limit?: number;
  offset?: number;
  orderBy?: 'created_at' | 'updated_at';
  orderDir?: 'asc' | 'desc';
}

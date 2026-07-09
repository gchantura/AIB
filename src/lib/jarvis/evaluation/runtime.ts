import { randomUUID } from 'node:crypto';
import { record, snapshot, insertRow, updateRow } from '../core/store.js';
import type { ExecutionMetric, ImprovementProposal } from '../core/types.js';

export async function recordExecution(metric: Omit<ExecutionMetric, 'id'>) {
  await insertRow('executionMetrics', { id: randomUUID(), ...metric });
}

function summarize(metrics: ExecutionMetric[]) {
  const groups = new Map<string, ExecutionMetric[]>(); for (const metric of metrics) groups.set(metric.capability, [...(groups.get(metric.capability) ?? []), metric]);
  return [...groups].map(([capability, items]) => ({ capability, kind: items[0]?.kind, runs: items.length, successes: items.filter((item) => item.ok).length, failures: items.filter((item) => !item.ok).length, successRate: Math.round(items.filter((item) => item.ok).length / items.length * 100), averageDurationMs: Math.round(items.reduce((sum, item) => sum + item.durationMs, 0) / items.length), lastRunAt: items[0]?.startedAt })).sort((a, b) => b.runs - a.runs);
}

export async function evaluationSnapshot() {
  const data = await snapshot(); const metrics = summarize(data.executionMetrics); const modelRuns = data.modelRuns;
  return { summary: { totalExecutions: data.executionMetrics.length, successRate: data.executionMetrics.length ? Math.round(data.executionMetrics.filter((item) => item.ok).length / data.executionMetrics.length * 100) : 100, modelRuns: modelRuns.length, modelFailures: modelRuns.filter((run) => run.status === 'failed').length, proposalsOpen: data.improvementProposals.filter((proposal) => proposal.status === 'proposed').length }, capabilities: metrics, recentFailures: data.executionMetrics.filter((item) => !item.ok).slice(0, 20), proposals: data.improvementProposals };
}

export async function generateProposals() {
  const data = await snapshot();
  const candidates: Omit<ImprovementProposal, 'id'|'createdAt'|'status'>[] = [];
  const failedModels = data.modelRuns.filter((run) => run.status === 'failed').slice(0, 20);
  if (failedModels.length >= 2) candidates.push({ title: 'Improve provider availability diagnostics', rationale: 'Repeated model runs failed. Add clearer remediation and provider-specific health detail before expanding autonomous model use.', target: 'llm-router', evidence: failedModels.slice(0, 5).map((run) => `${run.kind}: ${run.error}`), risk: 'low' });
  const failures = data.executionMetrics.filter((metric) => !metric.ok); const byCapability = new Map<string, ExecutionMetric[]>(); for (const item of failures) byCapability.set(item.capability, [...(byCapability.get(item.capability) ?? []), item]);
  for (const [target, items] of byCapability) if (items.length >= 2) candidates.push({ title: `Harden ${target}`, rationale: `${items.length} recorded failures indicate a reusable reliability issue.`, target, evidence: items.slice(0, 5).map((item) => item.error ?? 'Unspecified failure'), risk: 'medium' });
  if (data.memories.length > 100) candidates.push({ title: 'Add memory consolidation review', rationale: 'The local memory collection is large enough to benefit from duplicate and contradiction review.', target: 'memory', evidence: [`${data.memories.length} local memories`], risk: 'medium' });
  const created: ImprovementProposal[] = [];
  for (const candidate of candidates) {
    if (data.improvementProposals.some((proposal) => proposal.target === candidate.target && proposal.status === 'proposed')) continue;
    const proposal: ImprovementProposal = { id: randomUUID(), createdAt: new Date().toISOString(), status: 'proposed', ...candidate };
    await insertRow('improvementProposals', proposal);
    created.push(proposal);
  }
  await record(null, { action: 'generate-improvement-proposals', entity: 'system', outcome: 'success', detail: `${created.length} proposal(s)` });
  return created;
}

export async function decideProposal(id: string, status: 'approved'|'dismissed') {
  const data = await snapshot();
  const proposal = data.improvementProposals.find((item) => item.id === id);
  if (!proposal || proposal.status !== 'proposed') throw new Error('Open proposal not found');
  const decidedAt = new Date().toISOString();
  await updateRow('improvementProposals', id, { status, decidedAt });
  await record(null, { action: `${status}-improvement-proposal`, entity: 'system', entityId: id, outcome: status === 'approved' ? 'success' : 'denied', detail: proposal.title });
  return { ...proposal, status, decidedAt };
}

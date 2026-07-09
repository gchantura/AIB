import { randomUUID } from 'node:crypto';
import { spawn } from 'node:child_process';
import { record, snapshot, insertRow, updateRow } from '../core/store.js';
import type { UpgradePlan } from '../core/types.js';

const allowed = [['npm','run','check'],['npm','run','ai:validate']] as const;

async function run(command: readonly string[]) {
  const started = Date.now();
  return new Promise<{ command: string; ok: boolean; durationMs: number; output: string }>((resolve) => {
    const child = spawn(command[0], command.slice(1), { cwd: process.cwd(), shell: process.platform === 'win32', windowsHide: true, env: { ...process.env, NO_COLOR: '1' } });
    let output = '';
    const timer = setTimeout(() => child.kill(), 120000);
    child.stdout.on('data', (chunk) => output += String(chunk));
    child.stderr.on('data', (chunk) => output += String(chunk));
    child.on('close', (code) => { clearTimeout(timer); resolve({ command: command.join(' '), ok: code === 0, durationMs: Date.now() - started, output: output.slice(-12000) }); });
  });
}

export async function listUpgradePlans() { return (await snapshot()).upgradePlans; }

export async function prepareUpgrade(proposalId: string) {
  const data = await snapshot();
  const proposal = data.improvementProposals.find(item => item.id === proposalId);
  if (!proposal || proposal.status !== 'approved') throw new Error('An approved proposal is required');
  if (data.upgradePlans.some(plan => plan.proposalId === proposalId)) throw new Error('Upgrade plan already exists');
  const now = new Date().toISOString();
  const plan: UpgradePlan = {
    id: randomUUID(), proposalId, title: proposal.title, target: proposal.target,
    status: 'preparing', createdAt: now, updatedAt: now,
    steps: [`Inspect ${proposal.target} implementation and tests`, 'Define the smallest reversible change', 'Run fixed pre-change validation gates', 'Request one-time approval before mutation', 'Run post-change validation and compare results'],
    validation: [],
  };
  await insertRow('upgradePlans', plan);

  const validation: UpgradePlan['validation'] = [];
  for (const command of allowed) validation.push(await run(command));

  const status = validation.every(item => item.ok) ? 'ready' : 'blocked';
  const updatedAt = new Date().toISOString();
  await updateRow('upgradePlans', plan.id, { validation, status, updatedAt });
  await record(null, { action: 'prepare-upgrade-plan', entity: 'system', entityId: plan.id, outcome: status === 'ready' ? 'success' : 'failed', detail: plan.title });
  return { ...plan, validation, status, updatedAt };
}

export async function verifyUpgrade(id: string) {
  const validation: UpgradePlan['validation'] = [];
  for (const command of allowed) validation.push(await run(command));
  const status = validation.every(item => item.ok) ? 'verified' : 'blocked';
  const updatedAt = new Date().toISOString();
  await updateRow('upgradePlans', id, { validation, status, updatedAt });
  await record(null, { action: 'verify-upgrade-plan', entity: 'system', entityId: id, outcome: status === 'verified' ? 'success' : 'failed', detail: 'Verification' });
  return { id, validation, status, updatedAt } as UpgradePlan;
}

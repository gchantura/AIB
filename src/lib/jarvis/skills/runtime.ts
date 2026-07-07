import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { record, snapshot, transaction } from '../core/store.js';

const skillsDir = join(process.cwd(), '.claude', 'skills');

export async function listSkills() {
  await mkdir(skillsDir, { recursive: true });
  const generated = (await snapshot()).generatedSkills;
  const dirs = await readdir(skillsDir, { withFileTypes: true });
  return Promise.all(dirs.filter((dir) => dir.isDirectory()).map(async (dir) => {
    const path = join(skillsDir, dir.name, 'SKILL.md');
    const content = await readFile(path, 'utf8').catch(() => '');
    const description = content.match(/(?:description:|## Purpose)\s*([^\n]+)/i)?.[1]?.trim() || content.split('\n').find((line) => line.trim() && !line.startsWith('#')) || 'Workspace skill';
    return { id: dir.name, name: dir.name.split('-').map((part) => part[0]?.toUpperCase() + part.slice(1)).join(' '), description, path: `.claude/skills/${dir.name}/SKILL.md`, generated: generated.some((skill) => skill.id === dir.name) };
  }));
}

export async function createSkill(input: { id: string; name: string; description: string; instructions: string }) {
  if (!/^[a-z0-9-]+$/.test(input.id)) throw new Error('Skill id must use lowercase letters, numbers, and hyphens');
  if ((await listSkills()).some((skill) => skill.id === input.id)) throw new Error('Skill already exists');
  const dir = join(skillsDir, input.id);
  await mkdir(dir, { recursive: false });
  const content = `# ${input.name}\n\n## Purpose\n\n${input.description}\n\n## Instructions\n\n${input.instructions}\n\n## Validation\n\n- Verify outputs before reporting completion.\n- Record material decisions and reusable improvements.\n`;
  await writeFile(join(dir, 'SKILL.md'), content, 'utf8');
  const skill = { id: input.id, name: input.name, description: input.description, path: `.claude/skills/${input.id}/SKILL.md`, generated: true };
  await transaction((data) => { data.generatedSkills.push(skill); record(data, { action: 'create-skill', entity: 'skill', entityId: skill.id, outcome: 'success', detail: skill.description }); });
  return skill;
}

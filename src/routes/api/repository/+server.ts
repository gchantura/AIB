import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { readdir, readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';

const ignored = new Set(['node_modules', '.git', '.svelte-kit', 'dist', 'build', '.vercel']);
async function walk(dir: string, base = dir): Promise<string[]> {
  const out: string[] = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...await walk(full, base)); else out.push(full.slice(base.length + 1).replaceAll('\\', '/'));
  }
  return out;
}

export const GET: RequestHandler = async () => {
  const root = process.cwd(); const files = await walk(root); const pkg = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
  const byExtension = files.reduce<Record<string, number>>((all, file) => { const ext = extname(file) || '[none]'; all[ext] = (all[ext] ?? 0) + 1; return all; }, {});
  return json({ name: pkg.name, root, fileCount: files.length, byExtension, routes: files.filter((file) => file.startsWith('src/routes/') && file.includes('+')), modules: files.filter((file) => file.startsWith('src/lib/')), scripts: pkg.scripts, dependencies: Object.keys({ ...pkg.dependencies, ...pkg.devDependencies }).sort() });
};

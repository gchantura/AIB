#!/usr/bin/env node
/**
 * PreToolUse hook: Remind agent to check repository map before large file searches.
 * This script is called before glob/grep/find operations.
 */

const args = process.argv.slice(2);
const toolName = args[0] || '';

const searchTools = ['glob', 'grep', 'find', 'ls'];
const isSearchTool = searchTools.some(t => toolName.toLowerCase().includes(t));

if (isSearchTool) {
  console.log('[JARVIS HOOK] Before searching: have you checked docs/REPOSITORY_MAP.md?');
  console.log('[JARVIS HOOK] Use the map to identify relevant modules before raw file search.');
}

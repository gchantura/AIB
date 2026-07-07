import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import adapter from '@sveltejs/adapter-node';

export default {
	preprocess: vitePreprocess(),
	compilerOptions: {
		// Force runes mode for application code while dependencies retain their own mode.
		runes: ({ filename }) => filename.split(/[/\\]/).includes('node_modules') ? undefined : true
	},
	kit: {
		adapter: adapter()
	}
};

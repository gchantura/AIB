import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	test: {
		include: ['src/**/*.test.ts', 'tests/integration/**/*.test.ts'],
		environment: 'node'
	},
	plugins: [
		tailwindcss(),
		sveltekit()
	]
});

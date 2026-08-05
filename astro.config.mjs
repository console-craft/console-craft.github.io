// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import gruvwareDark from './src/styles/gruvware-dark.mjs';

// https://astro.build/config
export default defineConfig({
	site: 'https://console-craft.github.io',
	integrations: [react()],
	markdown: {
		shikiConfig: {
			theme: gruvwareDark,
		},
	},
});

import { describe, test, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/svelte';
import Layout from './+layout.svelte';

describe('/+layout.svelte', () => {
	test('should render h1', () => {
		render(Layout);
		expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
	});
});

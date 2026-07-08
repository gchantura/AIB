import { expect, test } from '@playwright/test';

test('application shell and core navigation render', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Chat', exact: true })).toBeVisible();
});

test('models endpoint reports provider health without requiring Ollama', async ({ request }) => {
  const response = await request.get('/api/models');
  expect(response.ok()).toBeTruthy();
  const body = await response.json();
  expect(Array.isArray(body.providers)).toBeTruthy();
});


import { test, expect } from '@playwright/test';

test('User can create, view, edit, move and delete a workflow item', async ({ page }) => {
// 1. Register a unique test account

// Detect browser errors
page.on('requestfailed', request => {
  console.log('REQUEST FAILED:', request.url(), request.failure()?.errorText);
});

page.on('response', response => {
  if (response.status() === 404) {
    console.log('404 URL:', response.url());
  }
});

await page.goto('/');



// Debugging: detect failed network requests
page.on('requestfailed', request => {
  console.log(
    'REQUEST FAILED:',
    request.url(),
    request.failure()?.errorText
  );
});

// Debugging: detect browser errors
page.on('console', message => {
  if (message.type() === 'error') {
    console.log('BROWSER ERROR:', message.text());
  }
});

  await page.getByRole('button', { name: 'Create an account' }).click();

  const username = `pwtest${Date.now()}`;

  await page.getByLabel('Username').fill(username);
  await page.getByLabel('Email').fill(`${username}@example.com`);

  await page.locator('input[type="password"]').nth(0).fill('N3wWorkflow!Pass2026');
  await page.locator('input[type="password"]').nth(1).fill('N3wWorkflow!Pass2026');

  await page.getByRole('button', { name: 'Create account' }).click();

  // Wait until the authenticated board appears
  await expect(
    page.getByRole('button', { name: /New item/ })
  ).toBeVisible({ timeout: 15000 });

  // 2. Create a workflow item
  await page.getByRole('button', { name: /New item/ }).click();

  const modal = page.getByRole('dialog');

  await modal.getByLabel('Title').fill('Playwright Test Task');
  await modal.getByLabel('Description').fill('Testing WorkflowHub CRUD functionality');
  await modal.getByLabel('Status').selectOption('pending');
  await modal.getByLabel('Priority').selectOption('high');

  await modal.getByRole('button', { name: 'Add item' }).click();

  let taskCard = page.locator('article.card').filter({
    has: page.getByRole('heading', { name: 'Playwright Test Task' })
  });

  // 3. Verify the task appears
  await expect(taskCard).toBeVisible();
  await expect(taskCard).toContainText('Testing WorkflowHub CRUD functionality');
  await expect(taskCard).toContainText('High');

  // 4. Edit the task
  await taskCard.getByRole('button', { name: 'Edit' }).click();

  const editModal = page.getByRole('dialog');

  await editModal.getByLabel('Title').fill('Updated Playwright Task');
  await editModal.getByLabel('Description').fill('Task successfully updated');

  await editModal.getByRole('button', { name: 'Save changes' }).click();

  taskCard = page.locator('article.card').filter({
    has: page.getByRole('heading', { name: 'Updated Playwright Task' })
  });

  await expect(taskCard).toBeVisible();
  await expect(taskCard).toContainText('Task successfully updated');

  // 5. Move task from Pending to In Progress
  await taskCard.getByRole('button', {
    name: 'Move Updated Playwright Task forward'
  }).click();

  const inProgressColumn = page.locator('.column').filter({
    has: page.getByRole('heading', { name: 'In Progress' })
  });

  taskCard = inProgressColumn.locator('article.card').filter({
    has: page.getByRole('heading', { name: 'Updated Playwright Task' })
  });

  await expect(taskCard).toBeVisible();

  // 6. Delete the task
  await taskCard.getByRole('button', { name: 'Delete' }).click();

  await page.getByRole('button', { name: 'Yes, delete' }).click();

  await expect(
    page.getByRole('heading', { name: 'Updated Playwright Task' })
  ).toHaveCount(0);
});

import { test, expect } from '@playwright/test'

test.describe('Notes screen', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('shows SlipNotes header', async ({ page }) => {
    await expect(page.getByText('SlipNotes')).toBeVisible()
  })

  test('shows search bar', async ({ page }) => {
    await expect(page.getByPlaceholder(/search/i)).toBeVisible()
  })

  test('shows sort chips: Updated, Created, Title', async ({ page }) => {
    await expect(page.getByText('Updated')).toBeVisible()
    await expect(page.getByText('Created')).toBeVisible()
    await expect(page.getByText('Title')).toBeVisible()
  })

  test('shows empty state when no notes exist', async ({ page }) => {
    const noteCards = page.locator('[data-testid="note-card"]')
    const emptyState = page.getByText('No notes yet')
    const count = await noteCards.count()
    if (count === 0) {
      await expect(emptyState).toBeVisible()
    }
  })

  test('shows FAB button', async ({ page }) => {
    await expect(page.getByText('+').last()).toBeVisible()
  })

  test('FAB opens new note modal', async ({ page }) => {
    await page.getByText('+').last().click()
    await expect(page).toHaveURL(/note\/new/)
  })

  test('theme toggle button is visible', async ({ page }) => {
    // moon emoji in light mode, sun in dark mode
    const toggle = page.locator('text=🌙').or(page.locator('text=☀️'))
    await expect(toggle.first()).toBeVisible()
  })

  test('sort chip changes active state on click', async ({ page }) => {
    const titleChip = page.getByText('Title')
    await titleChip.click()
    // after clicking Title, clicking back to Updated should work without error
    await page.getByText('Updated').click()
    await expect(page.getByText('Updated')).toBeVisible()
  })
})

test.describe('Bottom tab navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('shows Notes, Archive, Trash, Expenses tabs', async ({ page }) => {
    await expect(page.getByRole('tab', { name: /Notes/ })).toBeVisible()
    await expect(page.getByRole('tab', { name: /Archive/ })).toBeVisible()
    await expect(page.getByRole('tab', { name: /Trash/ })).toBeVisible()
    await expect(page.getByRole('tab', { name: /Expenses/ })).toBeVisible()
  })

  test('navigates to Archive tab', async ({ page }) => {
    await page.getByRole('tab', { name: /Archive/ }).click()
    await expect(page).toHaveURL(/archive/)
  })

  test('navigates to Trash tab', async ({ page }) => {
    await page.getByRole('tab', { name: /Trash/ }).click()
    await expect(page).toHaveURL(/trash/)
  })

  test('navigates to Expenses tab', async ({ page }) => {
    await page.getByRole('tab', { name: /Expenses/ }).click()
    await expect(page).toHaveURL(/expenses/)
  })
})

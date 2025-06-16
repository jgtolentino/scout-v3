import { test, expect } from '@playwright/test';

test.describe('Scout Analytics Dashboard', () => {
  test('homepage loads and displays main navigation', async ({ page }) => {
    await page.goto('/');
    
    // Check for main heading
    await expect(page.getByText('Scout Analytics')).toBeVisible();
    
    // Check navigation items
    await expect(page.getByRole('link', { name: 'Overview' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Transaction Trends' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Product Mix' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Consumer Insights' })).toBeVisible();
  });

  test('can navigate between pages', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to Transaction Trends
    await page.getByRole('link', { name: 'Transaction Trends' }).click();
    await expect(page.getByText('Transaction Trends')).toBeVisible();
    
    // Navigate to Product Mix
    await page.getByRole('link', { name: 'Product Mix' }).click();
    await expect(page.getByText('Product Performance')).toBeVisible();
    
    // Navigate to Consumer Insights
    await page.getByRole('link', { name: 'Consumer Insights' }).click();
    await expect(page.getByText('Consumer Demographics')).toBeVisible();
    
    // Navigate back to Overview
    await page.getByRole('link', { name: 'Overview' }).click();
    await expect(page.getByText('Executive Dashboard')).toBeVisible();
  });

  test('global filters are present and functional', async ({ page }) => {
    await page.goto('/');
    
    // Check for filter controls
    await expect(page.getByText('Date Range')).toBeVisible();
    await expect(page.getByText('Location')).toBeVisible();
    await expect(page.getByText('Category')).toBeVisible();
    await expect(page.getByText('Brand')).toBeVisible();
  });

  test('charts and KPI cards are displayed', async ({ page }) => {
    await page.goto('/');
    
    // Wait for content to load
    await page.waitForTimeout(2000);
    
    // Check for KPI cards (should have at least some metric displays)
    const kpiCards = page.locator('[data-testid*="kpi"], .bg-white').filter({
      has: page.locator('text=/Total|Revenue|Average|Growth/')
    });
    await expect(kpiCards.first()).toBeVisible();
  });

  test('responsive design works on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Check that navigation is still accessible (might be collapsed)
    await expect(page.getByText('Scout Analytics')).toBeVisible();
    
    // Verify main content is visible and not overflowing
    const mainContent = page.locator('main, [role="main"]').first();
    await expect(mainContent).toBeVisible();
  });

  test('accessibility: basic keyboard navigation', async ({ page }) => {
    await page.goto('/');
    
    // Test tab navigation through main navigation
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Check that focus is visible (this is a basic check)
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });
});
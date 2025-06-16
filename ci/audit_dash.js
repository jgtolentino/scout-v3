#!/usr/bin/env node
// Scout Analytics AI Agent Profiler
// Usage: node ci/audit_deploy.js https://scout-mvp.vercel.app

import { chromium } from 'playwright';
import fs from 'node:fs/promises';

if (process.argv.length < 3) {
  console.error('❌  Pass the target URL as first argument');
  process.exit(1);
}

// Default to localhost:3000 if no URL provided
const url = process.argv[2] || 'http://localhost:3000';
console.log(`🔍  Scout Analytics AI Agent starting audit of ${url}...`);

const browser = await chromium.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'] // For CI environments
});

const page = await browser.newPage({ 
  viewport: { width: 1366, height: 768 },
  userAgent: 'Scout-Analytics-Agent/1.0 (Deployment Audit Bot)'
});

const errors = [];
const networkFailures = [];
const performanceMetrics = {};

// Capture console errors
page.on('console', msg => {
  if (msg.type() === 'error') {
    errors.push({
      type: 'console_error',
      message: msg.text(),
      timestamp: new Date().toISOString()
    });
  }
});

// Capture JavaScript exceptions
page.on('pageerror', err => {
  errors.push({
    type: 'javascript_exception',
    message: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString()
  });
});

// Capture network failures
page.on('requestfailed', req => {
  const failure = req.failure();
  networkFailures.push({
    type: 'network_failure',
    url: req.url(),
    method: req.method(),
    error: failure?.errorText || 'Unknown error',
    timestamp: new Date().toISOString()
  });
  
  errors.push({
    type: 'network_failure',
    message: `REQUEST FAILED ${req.method()} ${req.url()} – ${failure?.errorText}`,
    timestamp: new Date().toISOString()
  });
});

try {
  // Navigate to Scout Analytics
  console.log('🚀  Loading Scout Analytics dashboard...');
  const startTime = Date.now();
  
  await page.goto(url, { 
    waitUntil: 'networkidle', 
    timeout: 90_000 
  });
  
  const loadTime = Date.now() - startTime;
  performanceMetrics.pageLoadTime = loadTime;
  console.log(`⏱️   Page loaded in ${loadTime}ms`);

  // Wait for React app to mount and data to load
  console.log('⏳  Waiting for dashboard components to load...');
  await page.waitForTimeout(5000);

  // Scout Analytics specific checks
  console.log('🧪  Running Scout Analytics specific tests...');
  
  // Check if main dashboard elements are present
  const dashboardTests = await page.evaluate(() => {
    const results = {
      hasMainContent: !!document.querySelector('main'),
      hasKPICards: document.querySelectorAll('[class*="kpi"], [class*="metric"], [class*="card"]').length > 0,
      hasCharts: document.querySelectorAll('svg, canvas, [class*="chart"]').length > 0,
      hasNavigation: !!document.querySelector('nav, [class*="sidebar"], [class*="menu"]'),
      hasDataLoading: document.body.textContent.includes('Loading') || document.body.textContent.includes('0'),
      hasErrorMessages: document.body.textContent.includes('Error') || document.body.textContent.includes('Failed'),
      totalElements: document.querySelectorAll('*').length
    };
    
    // Check for specific Scout Analytics elements
    results.hasScoutBranding = document.body.textContent.includes('Scout') || 
                               document.body.textContent.includes('TBWA') ||
                               document.body.textContent.includes('Analytics');
    
    // Check if dashboard shows real data (not all zeros)
    const textContent = document.body.textContent;
    results.hasNonZeroData = !textContent.includes('₱0') && 
                            !textContent.includes('0 transactions') &&
                            textContent.includes('₱');
    
    return results;
  });

  // Add dashboard-specific issues to errors if found
  if (dashboardTests.hasDataLoading) {
    errors.push({
      type: 'dashboard_issue',
      message: 'Dashboard appears to be stuck in loading state or showing zero values',
      timestamp: new Date().toISOString()
    });
  }

  if (dashboardTests.hasErrorMessages) {
    errors.push({
      type: 'dashboard_issue', 
      message: 'Dashboard contains error messages visible to users',
      timestamp: new Date().toISOString()
    });
  }

  if (!dashboardTests.hasKPICards) {
    errors.push({
      type: 'dashboard_issue',
      message: 'No KPI cards or metrics found - dashboard may not be rendering properly',
      timestamp: new Date().toISOString()
    });
  }

  if (!dashboardTests.hasNonZeroData) {
    errors.push({
      type: 'dashboard_issue',
      message: 'Dashboard appears to show zero/empty data - may indicate data loading issues',
      timestamp: new Date().toISOString()
    });
  }

  // Capture performance metrics
  const metrics = await page.evaluate(() => {
    if (performance.getEntriesByType) {
      const navigation = performance.getEntriesByType('navigation')[0];
      return {
        domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart,
        loadComplete: navigation?.loadEventEnd - navigation?.loadEventStart,
        firstPaint: performance.getEntriesByType('paint').find(p => p.name === 'first-paint')?.startTime,
        firstContentfulPaint: performance.getEntriesByType('paint').find(p => p.name === 'first-contentful-paint')?.startTime
      };
    }
    return {};
  });

  Object.assign(performanceMetrics, metrics);

  // Take full page screenshot
  console.log('📸  Capturing full-page screenshot...');
  await page.screenshot({ 
    path: 'screenshot.png', 
    fullPage: true,
    animations: 'disabled' // Disable animations for consistent screenshots
  });

  console.log('💾  Saving audit results...');
  
  // Compile comprehensive audit report
  const auditReport = {
    url,
    timestamp: new Date().toISOString(),
    userAgent: await page.evaluate(() => navigator.userAgent),
    viewport: { width: 1366, height: 768 },
    errors: errors,
    networkFailures: networkFailures,
    dashboardTests: dashboardTests,
    performanceMetrics: performanceMetrics,
    summary: {
      totalErrors: errors.length,
      totalNetworkFailures: networkFailures.length,
      dashboardHealthy: !dashboardTests.hasDataLoading && !dashboardTests.hasErrorMessages && dashboardTests.hasKPICards,
      pageLoadTime: performanceMetrics.pageLoadTime
    }
  };

  await fs.writeFile('audit-logs.json', JSON.stringify(auditReport, null, 2));

} catch (error) {
  console.error('💥  Audit failed with exception:', error.message);
  errors.push({
    type: 'audit_exception',
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  });
  
  // Still try to save what we have and take a screenshot
  try {
    await page.screenshot({ path: 'screenshot.png', fullPage: true });
    await fs.writeFile('audit-logs.json', JSON.stringify({ url, errors, exception: error.message }, null, 2));
  } catch (saveError) {
    console.error('💥  Could not save audit results:', saveError.message);
  }
} finally {
  await browser.close();
}

const hasErrors = errors.length > 0;
const hasNetworkFailures = networkFailures.length > 0;

if (hasErrors) {
  console.log(`❌  Found ${errors.length} error(s) during Scout Analytics audit`);
  errors.forEach((error, i) => {
    console.log(`   ${i + 1}. [${error.type}] ${error.message}`);
  });
} else {
  console.log('✅  No console errors detected');
}

if (hasNetworkFailures) {
  console.log(`🌐  Found ${networkFailures.length} network failure(s)`);
}

console.log('📋  Audit complete - results saved to audit-logs.json and screenshot.png');

// Set GitHub Actions output
process.stdout.write(`::set-output name=has_errors::${hasErrors || hasNetworkFailures}\n`);

process.exit(0);
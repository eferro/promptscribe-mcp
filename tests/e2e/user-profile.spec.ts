import { test, expect } from '@playwright/test';

test.describe('User Profile Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the application
    await page.goto('/');
  });

  test('should load the application without errors', async ({ page }) => {
    // Check if the page loads
    await expect(page).toHaveTitle(/MCP Prompt Manager/);
    
    // Check for any console errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Check if there are any console errors
    if (consoleErrors.length > 0) {
      console.log('Console errors found:', consoleErrors);
    }
  });

  test('should handle authentication flow', async ({ page }) => {
    // Check if we're redirected to login or if we see the dashboard
    await page.waitForTimeout(2000); // Wait for any initial redirects
    
    const url = page.url();
    console.log('Current URL:', url);
    
    // Check if there's a sign-in form or if we're already authenticated
    const hasSignInForm = await page.locator('form').isVisible().catch(() => false);
    const hasUserProfile = await page.locator('[data-testid="user-profile"]').isVisible().catch(() => false);
    const hasDashboard = await page.locator('[data-testid="dashboard"]').isVisible().catch(() => false);
    
    console.log('Has sign-in form:', hasSignInForm);
    console.log('Has user profile:', hasUserProfile);
    console.log('Has dashboard:', hasDashboard);
  });

  test('should detect profile loading errors', async ({ page }) => {
    // Listen for network requests that might be failing
    const failedRequests: any[] = [];
    
    page.on('requestfailed', request => {
      failedRequests.push({
        url: request.url(),
        method: request.method(),
        failure: request.failure()
      });
    });

    // Listen for response errors
    const errorResponses: any[] = [];
    
    page.on('response', response => {
      if (response.status() >= 400) {
        errorResponses.push({
          url: response.url(),
          status: response.status(),
          statusText: response.statusText()
        });
      }
    });

    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check for failed requests
    if (failedRequests.length > 0) {
      console.log('Failed requests:', failedRequests);
    }
    
    // Check for error responses
    if (errorResponses.length > 0) {
      console.log('Error responses:', errorResponses);
    }
    
    // Look for any error messages in the UI
    const errorElements = await page.locator('[role="alert"]').all();
    const toastElements = await page.locator('.sonner-toast').all();
    
    for (const element of errorElements) {
      const text = await element.textContent();
      console.log('Error alert found:', text);
    }
    
    for (const element of toastElements) {
      const text = await element.textContent();
      console.log('Toast found:', text);
    }
  });

  test('should check user profile service calls', async ({ page }) => {
    // Intercept API calls to user profile endpoints
    const apiCalls: any[] = [];
    
    page.on('request', request => {
      const url = request.url();
      if (url.includes('user_profiles') || url.includes('auth') || url.includes('rpc/')) {
        apiCalls.push({
          url,
          method: request.method(),
          headers: Object.fromEntries(request.headers())
        });
      }
    });

    page.on('response', async response => {
      const url = response.url();
      if (url.includes('user_profiles') || url.includes('auth') || url.includes('rpc/')) {
        try {
          const responseBody = await response.json().catch(() => response.text().catch(() => 'Unable to read response'));
          console.log('API Response:', {
            url,
            status: response.status(),
            body: responseBody
          });
        } catch (e) {
          console.log('API Response (error reading body):', {
            url,
            status: response.status(),
            error: e
          });
        }
      }
    });

    // Navigate and wait for API calls
    await page.waitForLoadState('networkidle');
    
    console.log('API calls made:', apiCalls);
  });

  test('should test basic interaction flow', async ({ page }) => {
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'tests/e2e/screenshots/app-state.png', fullPage: true });
    
    // Try to interact with common elements
    const buttons = await page.locator('button').all();
    console.log(`Found ${buttons.length} buttons on the page`);
    
    const inputs = await page.locator('input').all();
    console.log(`Found ${inputs.length} inputs on the page`);
    
    const links = await page.locator('a').all();
    console.log(`Found ${links.length} links on the page`);
    
    // Check page content
    const pageContent = await page.content();
    const hasErrorText = pageContent.toLowerCase().includes('error') || 
                        pageContent.toLowerCase().includes('failed') ||
                        pageContent.toLowerCase().includes('something went wrong');
                        
    if (hasErrorText) {
      console.log('Page contains error-related text');
    }
  });
});

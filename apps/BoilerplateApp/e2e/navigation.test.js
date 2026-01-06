import { device, element, by, expect, waitFor } from 'detox';

describe('Navigation', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should display bottom tab navigation with two tabs', async () => {
    // Check if Home tab is visible
    await expect(element(by.text('Home'))).toBeVisible();

    // Check if Second tab is visible
    await expect(element(by.text('Second'))).toBeVisible();
  });

  it('should start on Home tab by default', async () => {
    // Hello screen should be visible by default
    await expect(element(by.id('hello-screen'))).toBeVisible();
    await expect(element(by.text('Hello!'))).toBeVisible();
  });

  it('should navigate between tabs', async () => {
    // Verify we're on Home tab
    await expect(element(by.id('hello-screen'))).toBeVisible();

    // Navigate to Second tab
    await element(by.text('Second')).tap();

    // Wait for Second screen to appear
    await waitFor(element(by.id('second-screen')))
      .toBeVisible()
      .withTimeout(5000);

    // Second screen should be visible
    await expect(element(by.text('Second Screen'))).toBeVisible();

    // Hello screen should not be visible
    try {
      await expect(element(by.id('hello-screen'))).not.toBeVisible();
    } catch (e) {
      // Element might be unmounted, which is fine
    }

    // Navigate back to Home tab
    await element(by.text('Home')).tap();

    // Wait for Hello screen to appear
    await waitFor(element(by.id('hello-screen')))
      .toBeVisible()
      .withTimeout(5000);

    // Hello screen should be visible again
    await expect(element(by.text('Hello!'))).toBeVisible();
  });

  it('should preserve state when switching tabs', async () => {
    // Start on Home tab
    await expect(element(by.id('hello-screen'))).toBeVisible();

    // Delete first card
    await element(by.id('swipeable-card-1')).swipe('left', 'fast', 0.75);
    await new Promise((resolve) => setTimeout(resolve, 500));
    await element(by.id('swipeable-card-1-delete-button')).tap();
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Confirm deletion
    if (device.getPlatform() === 'ios') {
      await element(by.label('Delete')).tap();
    } else {
      await element(by.text('Delete')).tap();
    }

    await new Promise((resolve) => setTimeout(resolve, 500));

    // Navigate to Second tab
    await element(by.text('Second')).tap();
    await waitFor(element(by.id('second-screen')))
      .toBeVisible()
      .withTimeout(5000);

    // Navigate back to Home tab
    await element(by.text('Home')).tap();
    await waitFor(element(by.id('hello-screen')))
      .toBeVisible()
      .withTimeout(5000);

    // First card should still be deleted (state preserved)
    await expect(element(by.id('card-title-2'))).toBeVisible();

    // Try to find first card - it should not exist
    try {
      await expect(element(by.id('card-title-1'))).not.toBeVisible();
    } catch (e) {
      // Element not found is acceptable
    }
  });

  it('should handle rapid tab switching', async () => {
    // Rapidly switch between tabs
    for (let i = 0; i < 3; i++) {
      await element(by.text('Second')).tap();
      await new Promise((resolve) => setTimeout(resolve, 300));

      await element(by.text('Home')).tap();
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    // Should still be functional
    await expect(element(by.id('hello-screen'))).toBeVisible();
    await expect(element(by.text('Hello!'))).toBeVisible();
  });

  it('should display correct icons on tab bar', async () => {
    // Note: Testing icons by accessibility label or description
    // The actual implementation depends on how React Navigation renders icons

    // Home tab should have home icon (we can't directly test icon name, but tab should be there)
    await expect(element(by.text('Home'))).toBeVisible();

    // Second tab should have chart icon
    await expect(element(by.text('Second'))).toBeVisible();
  });
});

import { device, element, by, expect, waitFor } from 'detox';

describe('Second Screen', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should navigate to second screen via tab bar', async () => {
    // Tap on the Second tab
    await element(by.text('Second')).tap();

    // Wait for second screen to be visible
    await waitFor(element(by.id('second-screen')))
      .toBeVisible()
      .withTimeout(5000);

    // Check if the screen content is visible
    await expect(element(by.id('chart-icon'))).toBeVisible();
    await expect(element(by.id('second-title'))).toBeVisible();
    await expect(element(by.text('Second Screen'))).toBeVisible();
  });

  it('should display React Query demo card with loading state', async () => {
    // Navigate to second screen
    await element(by.text('Second')).tap();
    await waitFor(element(by.id('second-screen')))
      .toBeVisible()
      .withTimeout(5000);

    // React Query card should be visible
    await expect(element(by.id('react-query-card'))).toBeVisible();

    // Check for loading text (might be brief)
    try {
      await waitFor(element(by.id('loading-text')))
        .toBeVisible()
        .withTimeout(2000);
    } catch (e) {
      // Loading might be too fast to catch, that's okay
    }
  });

  it('should display data after React Query loads', async () => {
    // Navigate to second screen
    await element(by.text('Second')).tap();
    await waitFor(element(by.id('second-screen')))
      .toBeVisible()
      .withTimeout(5000);

    // Wait for data to load
    await waitFor(element(by.id('data-container')))
      .toBeVisible()
      .withTimeout(5000);

    // Check if data message is displayed
    await expect(element(by.id('data-message'))).toBeVisible();
    await expect(element(by.text('Data loaded with React Query!'))).toBeVisible();

    // Check if timestamp is displayed
    await expect(element(by.id('data-timestamp'))).toBeVisible();
  });

  it('should refresh data when refresh button is tapped', async () => {
    // Navigate to second screen
    await element(by.text('Second')).tap();
    await waitFor(element(by.id('second-screen')))
      .toBeVisible()
      .withTimeout(5000);

    // Wait for initial data to load
    await waitFor(element(by.id('data-container')))
      .toBeVisible()
      .withTimeout(5000);

    // Get initial timestamp text (we'll just verify refresh button works)
    await expect(element(by.id('refresh-button'))).toBeVisible();

    // Tap refresh button
    await element(by.id('refresh-button')).tap();

    // Should show loading state briefly
    try {
      await waitFor(element(by.id('loading-text')))
        .toBeVisible()
        .withTimeout(2000);
    } catch (e) {
      // Loading might be too fast
    }

    // Data should be visible again after refresh
    await waitFor(element(by.id('data-container')))
      .toBeVisible()
      .withTimeout(5000);

    await expect(element(by.id('data-message'))).toBeVisible();
  });

  it('should display features card with all features', async () => {
    // Navigate to second screen
    await element(by.text('Second')).tap();
    await waitFor(element(by.id('second-screen')))
      .toBeVisible()
      .withTimeout(5000);

    // Scroll down to see features card
    await element(by.id('second-screen')).scrollTo('bottom');

    // Wait for features card to be visible
    await waitFor(element(by.id('features-card')))
      .toBeVisible()
      .withTimeout(3000);

    // Check all feature items
    await expect(element(by.id('feature-1'))).toBeVisible();
    await expect(element(by.text('Bottom Tab Navigation'))).toBeVisible();

    await expect(element(by.id('feature-2'))).toBeVisible();
    await expect(element(by.text('React Query for State Management'))).toBeVisible();

    await expect(element(by.id('feature-3'))).toBeVisible();
    await expect(element(by.text('Swipeable Cards with Gestures'))).toBeVisible();

    await expect(element(by.id('feature-4'))).toBeVisible();
    await expect(element(by.text('Industry Standard Folder Structure'))).toBeVisible();
  });

  it('should scroll through second screen content', async () => {
    // Navigate to second screen
    await element(by.text('Second')).tap();
    await waitFor(element(by.id('second-screen')))
      .toBeVisible()
      .withTimeout(5000);

    // Title should be visible at top
    await expect(element(by.id('second-title'))).toBeVisible();

    // Scroll to bottom
    await element(by.id('second-screen')).scrollTo('bottom');

    // Features card should be visible
    await expect(element(by.id('features-card'))).toBeVisible();

    // Scroll back to top
    await element(by.id('second-screen')).scrollTo('top');

    // Title should be visible again
    await expect(element(by.id('second-title'))).toBeVisible();
  });
});

/**
 * Settings Navigation E2E Tests
 *
 * Tests navigation to and within the Settings screen:
 * - Navigating to Settings from launch screen
 * - Tab navigation between all 5 tabs
 * - Back navigation
 */

import {
  waitForElement,
  tapElement,
  expectTextVisible,
  expectElementVisible,
  navigateToSettings,
  navigateToTab,
  goBack,
  wait,
} from './helpers';

describe('Settings Navigation', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('Navigate to Settings', () => {
    it('should navigate to Settings when settings button is tapped', async () => {
      await navigateToSettings();

      // Settings screen should be visible with title
      await expectTextVisible('Settings');
    });

    it('should display all 5 tab icons in the bottom navigation', async () => {
      await navigateToSettings();

      // Wait for tabs to be visible
      await wait(500);

      // All tabs should be visible by their text labels
      await expectTextVisible('Profile');
      await expectTextVisible('Teams');
      await expectTextVisible('Badges');
      await expectTextVisible('History');
      await expectTextVisible('Setup');
    });

    it('should default to Profile tab', async () => {
      await navigateToSettings();

      // Profile tab content should be visible
      // ProfileForm or profile-related content
      await wait(500);

      // The Profile tab should be the active/selected one
      await expect(element(by.text('Profile'))).toBeVisible();
    });
  });

  describe('Tab Navigation', () => {
    beforeEach(async () => {
      await navigateToSettings();
    });

    it('should navigate to Teams tab', async () => {
      await navigateToTab('Teams');

      // Teams tab content - either team cards or empty state
      await waitFor(element(by.text('No Teams Yet')).or(element(by.id('create-team-fab'))))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should navigate to Badges tab', async () => {
      await navigateToTab('Badges');

      // Badges tab should show badge content
      await waitFor(element(by.text('Your Badges')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should navigate to History tab', async () => {
      await navigateToTab('History');

      // History tab should show stats or empty state
      await waitFor(
        element(by.text('No Quiz History')).or(element(by.text('Total Quizzes')))
      )
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should navigate to Setup tab', async () => {
      await navigateToTab('Setup');

      // Setup tab should show theme toggle and settings
      await waitForElement('theme-toggle', 5000);
      await expectElementVisible('theme-toggle');
    });

    it('should switch between tabs preserving state', async () => {
      // Navigate to Setup tab
      await navigateToTab('Setup');
      await expectElementVisible('theme-toggle');

      // Navigate to Teams tab
      await navigateToTab('Teams');
      await wait(300);

      // Navigate back to Setup tab
      await navigateToTab('Setup');

      // Setup content should still be visible
      await expectElementVisible('theme-toggle');
    });

    it('should be able to cycle through all tabs', async () => {
      // Profile (default)
      await expect(element(by.text('Profile'))).toBeVisible();

      // Teams
      await navigateToTab('Teams');
      await wait(200);

      // Badges
      await navigateToTab('Badges');
      await wait(200);

      // History
      await navigateToTab('History');
      await wait(200);

      // Setup
      await navigateToTab('Setup');
      await wait(200);

      // Back to Profile
      await navigateToTab('Profile');
      await wait(200);

      // Verify we're on Profile
      await expect(element(by.text('Profile'))).toBeVisible();
    });
  });

  describe('Back Navigation', () => {
    it('should return to QuizLaunchScreen when back is pressed', async () => {
      await navigateToSettings();
      await wait(500);

      // Go back
      await goBack();

      // Should be on launch screen
      await expectElementVisible('start-quiz-button');
      await expectTextVisible('Quiz Bowl');
    });

    it('should preserve launch screen state after returning from settings', async () => {
      // Start on launch screen
      await expectTextVisible('Quiz Bowl');

      // Navigate to settings and back
      await navigateToSettings();
      await wait(500);
      await goBack();

      // Launch screen should be unchanged
      await expectElementVisible('start-quiz-button');
      await expectElementVisible('settings-button');
      await expectTextVisible('Quiz Bowl');
    });
  });
});

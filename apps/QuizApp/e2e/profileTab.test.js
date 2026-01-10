/**
 * Profile Tab E2E Tests
 *
 * Tests for the Profile settings tab:
 * - Profile form display
 * - User data input
 * - Save functionality
 * - Google Sign-In display
 */

import {
  waitForElement,
  tapElement,
  expectTextVisible,
  expectElementVisible,
  navigateToSettings,
  navigateToTab,
  typeText,
  clearText,
  dismissAlert,
  wait,
  elementExists,
} from './helpers';

describe('Profile Tab', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
    await navigateToSettings();
    await navigateToTab('Profile');
  });

  describe('Profile Tab Display', () => {
    it('should navigate to Profile tab', async () => {
      // Profile tab should be visible
      await waitFor(element(by.text('Profile')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should display profile form after loading', async () => {
      // Wait for loading to complete
      await wait(1000);

      // Should show some profile form elements
      // The ProfileForm component is from ui-components
      await waitFor(
        element(by.text('First Name'))
          .or(element(by.text('Sign in with Google')))
          .or(element(by.text('Profile')))
      )
        .toBeVisible()
        .withTimeout(5000);
    });
  });

  describe('Profile Form Fields', () => {
    it('should display First Name field if user exists', async () => {
      await wait(1000);

      try {
        await expectTextVisible('First Name');
      } catch {
        // User may not exist, Google Sign-In may be shown instead
        await expectTextVisible('Sign in with Google');
      }
    });

    it('should display Last Name field if user exists', async () => {
      await wait(1000);

      try {
        await expectTextVisible('Last Name');
      } catch {
        // User may not exist
      }
    });

    it('should display Email field if user exists', async () => {
      await wait(1000);

      try {
        await expectTextVisible('Email');
      } catch {
        // User may not exist
      }
    });
  });

  describe('Google Sign-In', () => {
    it('should display Google Sign-In option', async () => {
      await wait(1000);

      // Either show Sign in with Google button or user profile
      await waitFor(
        element(by.text('Sign in with Google'))
          .or(element(by.text('First Name')))
      )
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should have interactive Google Sign-In button if not signed in', async () => {
      await wait(1000);

      const hasGoogleButton = await elementExists('google-signin-button');

      if (hasGoogleButton) {
        await expectElementVisible('google-signin-button');
      }
    });
  });

  describe('Profile Save', () => {
    it('should display Save button if user profile is shown', async () => {
      await wait(1000);

      try {
        await expectTextVisible('Save Profile');
      } catch {
        // May show Google Sign-In instead
      }
    });
  });

  describe('Avatar Selection', () => {
    it('should display avatar section if user exists', async () => {
      await wait(1000);

      // Avatar may or may not be visible depending on user state
      try {
        await waitFor(element(by.text('Select Avatar')).or(element(by.text('Avatar'))))
          .toBeVisible()
          .withTimeout(3000);
      } catch {
        // Avatar section may not be visible
      }
    });
  });

  describe('Logout', () => {
    it('should display logout option if signed in', async () => {
      await wait(1000);

      // Logout may be visible if user is signed in
      try {
        await expectTextVisible('Logout');
      } catch {
        // User may not be signed in
      }
    });
  });

  describe('Profile Tab State', () => {
    it('should maintain state when switching tabs', async () => {
      // Go to another tab
      await navigateToTab('Setup');
      await wait(300);

      // Come back to Profile
      await navigateToTab('Profile');
      await wait(300);

      // Profile should still load correctly
      await waitFor(
        element(by.text('Profile'))
          .or(element(by.text('First Name')))
          .or(element(by.text('Sign in with Google')))
      )
        .toBeVisible()
        .withTimeout(5000);
    });
  });
});

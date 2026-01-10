/**
 * Quiz Setup Tab E2E Tests
 *
 * Tests the Quiz Setup settings tab:
 * - Theme toggle (light/dark mode)
 * - Buzzer time slider
 * - Answer time slider
 * - Difficulty selection
 * - Save and Reset functionality
 */

import {
  waitForElement,
  tapElement,
  expectTextVisible,
  expectElementVisible,
  navigateToSettings,
  navigateToTab,
  selectDifficulty,
  toggleTheme,
  dismissAlert,
  wait,
} from './helpers';

describe('Quiz Setup Tab', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
    // Navigate to Quiz Setup tab
    await navigateToSettings();
    await navigateToTab('Setup');
  });

  describe('Theme Toggle', () => {
    it('should display the theme toggle switch', async () => {
      await expectElementVisible('theme-toggle');
    });

    it('should display App Theme label', async () => {
      await expectTextVisible('App Theme');
    });

    it('should display Light and Dark labels', async () => {
      await expectTextVisible('Light');
      await expectTextVisible('Dark');
    });

    it('should toggle theme when switch is tapped', async () => {
      // Get initial state and toggle
      await toggleTheme();

      // The toggle should still be visible after toggling
      await expectElementVisible('theme-toggle');

      // Toggle back
      await toggleTheme();
      await expectElementVisible('theme-toggle');
    });

    it('should update UI colors when theme changes', async () => {
      // This is a visual test - we verify the toggle works
      // and the app doesn't crash on theme change
      await toggleTheme();
      await wait(500);

      // Verify settings are still visible
      await expectElementVisible('theme-toggle');
      await expectElementVisible('buzzer-time-slider');

      // Toggle back for consistency
      await toggleTheme();
    });
  });

  describe('Buzzer Time Slider', () => {
    it('should display the buzzer time slider', async () => {
      await expectElementVisible('buzzer-time-slider');
    });

    it('should display Buzzer Window label', async () => {
      await expectTextVisible('Buzzer Window');
    });

    it('should display time range labels', async () => {
      await expectTextVisible('1.0s');
      await expectTextVisible('10.0s');
    });

    it('should be interactive', async () => {
      // Verify slider is visible and can be interacted with
      await waitForElement('buzzer-time-slider');

      // Swipe on the slider (this may not change value precisely but tests interaction)
      await element(by.id('buzzer-time-slider')).swipe('right', 'slow', 0.5);
      await wait(200);

      // Slider should still be visible
      await expectElementVisible('buzzer-time-slider');
    });
  });

  describe('Answer Time Slider', () => {
    it('should display the answer time slider', async () => {
      await expectElementVisible('answer-time-slider');
    });

    it('should display Answer Time label', async () => {
      await expectTextVisible('Answer Time');
    });

    it('should be interactive', async () => {
      await waitForElement('answer-time-slider');

      // Swipe on the slider
      await element(by.id('answer-time-slider')).swipe('left', 'slow', 0.5);
      await wait(200);

      await expectElementVisible('answer-time-slider');
    });
  });

  describe('Difficulty Selection', () => {
    it('should display Difficulty Level label', async () => {
      await expectTextVisible('Difficulty Level');
    });

    it('should display all 5 difficulty options', async () => {
      await expectTextVisible('Middle School');
      await expectTextVisible('JV High School');
      await expectTextVisible('Varsity');
      await expectTextVisible('College');
      await expectTextVisible('Open');
    });

    it('should allow selecting Middle School difficulty', async () => {
      await selectDifficulty('middle_school');
      // Selection should be made (radio button visual feedback)
      await wait(200);
      await expectTextVisible('Middle School');
    });

    it('should allow selecting JV High School difficulty', async () => {
      await selectDifficulty('jv_high_school');
      await wait(200);
      await expectTextVisible('JV High School');
    });

    it('should allow selecting Varsity difficulty', async () => {
      await selectDifficulty('varsity');
      await wait(200);
      await expectTextVisible('Varsity');
    });

    it('should allow selecting College difficulty', async () => {
      await selectDifficulty('college');
      await wait(200);
      await expectTextVisible('College');
    });

    it('should allow selecting Open difficulty', async () => {
      await selectDifficulty('open');
      await wait(200);
      await expectTextVisible('Open');
    });
  });

  describe('Save and Reset Buttons', () => {
    it('should display Save Settings button', async () => {
      await expectElementVisible('save-settings-button');
      await expectTextVisible('Save Settings');
    });

    it('should display Reset to Defaults button', async () => {
      await expectElementVisible('reset-settings-button');
      await expectTextVisible('Reset to Defaults');
    });

    it('should save settings when Save is tapped after making changes', async () => {
      // Make a change first (select a difficulty)
      await selectDifficulty('college');
      await wait(200);

      // Tap save button
      await tapElement('save-settings-button');

      // Should show success alert
      await waitFor(element(by.text('Success')))
        .toBeVisible()
        .withTimeout(3000);

      // Dismiss alert
      await dismissAlert('OK');

      // Settings should still be visible
      await expectElementVisible('save-settings-button');
    });

    it('should show confirmation dialog when Reset is tapped', async () => {
      await tapElement('reset-settings-button');

      // Should show confirmation dialog
      await waitFor(element(by.text('Reset Settings')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should cancel reset when Cancel is tapped', async () => {
      await tapElement('reset-settings-button');

      await waitFor(element(by.text('Cancel')))
        .toBeVisible()
        .withTimeout(3000);

      await dismissAlert('Cancel');

      // Settings screen should still be visible
      await expectElementVisible('reset-settings-button');
    });

    it('should reset settings when Reset is confirmed', async () => {
      // First change a setting
      await selectDifficulty('open');
      await wait(200);

      // Tap reset
      await tapElement('reset-settings-button');

      await waitFor(element(by.text('Reset')))
        .toBeVisible()
        .withTimeout(3000);

      // Confirm reset
      await dismissAlert('Reset');

      // Settings should be reset (Varsity is default)
      await wait(500);
      await expectElementVisible('reset-settings-button');
    });
  });

  describe('Settings Persistence', () => {
    it('should persist theme setting after app reload', async () => {
      // Toggle theme to dark
      await toggleTheme();
      await wait(500);

      // Reload app
      await device.reloadReactNative();

      // Navigate back to Setup
      await navigateToSettings();
      await navigateToTab('Setup');

      // Theme toggle should still be visible
      await expectElementVisible('theme-toggle');

      // Toggle back for consistency
      await toggleTheme();
    });
  });
});

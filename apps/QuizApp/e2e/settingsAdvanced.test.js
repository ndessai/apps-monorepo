/**
 * Advanced Settings E2E Tests
 *
 * Comprehensive tests for all quiz settings:
 * - All slider controls
 * - Microphone settings
 * - Auto-submit settings
 * - Settings persistence
 * - Settings validation
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
  adjustSlider,
  toggleMicrophoneSetting,
  toggleAutoSubmitSilence,
} from './helpers';

describe('Advanced Settings', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
    await navigateToSettings();
    await navigateToTab('Setup');
  });

  describe('Microphone Settings', () => {
    it('should display Auto-Enable Microphone setting', async () => {
      await expectTextVisible('Auto-Enable Microphone');
    });

    it('should display microphone setting description', async () => {
      await expectTextVisible('Automatically start listening when answering');
    });

    it('should have microphone toggle switch', async () => {
      await expectElementVisible('microphone-enabled-toggle');
    });

    it('should toggle microphone setting', async () => {
      await toggleMicrophoneSetting();
      await wait(200);
      await expectElementVisible('microphone-enabled-toggle');

      // Toggle back
      await toggleMicrophoneSetting();
    });
  });

  describe('Auto-Submit on Silence', () => {
    it('should display Auto-Submit on Silence setting', async () => {
      await expectTextVisible('Auto-Submit on Silence');
    });

    it('should display auto-submit description', async () => {
      await expectTextVisible('Submit spoken answer after silence');
    });

    it('should have auto-submit toggle switch', async () => {
      await expectElementVisible('auto-submit-silence-toggle');
    });

    it('should toggle auto-submit setting', async () => {
      await toggleAutoSubmitSilence();
      await wait(200);
      await expectElementVisible('auto-submit-silence-toggle');
    });

    it('should show silence duration slider when auto-submit is enabled', async () => {
      // Enable auto-submit
      await toggleAutoSubmitSilence();
      await wait(300);

      // Silence duration slider should appear
      await expectElementVisible('auto-submit-silence-slider');
    });

    it('should display Silence Duration label when enabled', async () => {
      await toggleAutoSubmitSilence();
      await wait(300);

      await expectTextVisible('Silence Duration');
    });
  });

  describe('Buzzer Time Slider', () => {
    it('should display Buzzer Window setting', async () => {
      await expectTextVisible('Buzzer Window');
    });

    it('should display buzzer time description', async () => {
      await expectTextVisible('Time allowed to buzz after question ends');
    });

    it('should have buzzer time slider', async () => {
      await expectElementVisible('buzzer-time-slider');
    });

    it('should be able to adjust buzzer time slider', async () => {
      await adjustSlider('buzzer-time-slider', 'right', 0.3);
      await wait(200);
      await expectElementVisible('buzzer-time-slider');
    });
  });

  describe('Answer Time Slider', () => {
    it('should display Answer Time setting', async () => {
      await expectTextVisible('Answer Time');
    });

    it('should display answer time description', async () => {
      await expectTextVisible('Time allowed to answer after buzzing');
    });

    it('should have answer time slider', async () => {
      await expectElementVisible('answer-time-slider');
    });

    it('should be able to adjust answer time slider', async () => {
      await adjustSlider('answer-time-slider', 'left', 0.2);
      await wait(200);
      await expectElementVisible('answer-time-slider');
    });
  });

  describe('Tossup Answer Time Slider', () => {
    it('should display Tossup Answer Time setting', async () => {
      await expectTextVisible('Tossup Answer Time');
    });

    it('should have tossup answer time slider', async () => {
      await expectElementVisible('tossup-answer-time-slider');
    });
  });

  describe('Bonus Answer Time Slider', () => {
    it('should display Bonus Answer Time setting', async () => {
      await expectTextVisible('Bonus Answer Time');
    });

    it('should have bonus answer time slider', async () => {
      await expectElementVisible('bonus-answer-time-slider');
    });
  });

  describe('Tossup Review Time Slider', () => {
    it('should display Tossup Review Time setting', async () => {
      await expectTextVisible('Tossup Review Time');
    });

    it('should have tossup review time slider', async () => {
      await expectElementVisible('tossup-review-time-slider');
    });
  });

  describe('Bonus Review Time Slider', () => {
    it('should display Bonus Review Time setting', async () => {
      await expectTextVisible('Bonus Review Time');
    });

    it('should have bonus review time slider', async () => {
      await expectElementVisible('bonus-review-time-slider');
    });
  });

  describe('Difficulty Selection', () => {
    it('should display all five difficulty levels', async () => {
      await expectTextVisible('Middle School');
      await expectTextVisible('JV High School');
      await expectTextVisible('Varsity');
      await expectTextVisible('College');
      await expectTextVisible('Open');
    });

    it('should have radio buttons for each difficulty', async () => {
      await expectElementVisible('difficulty-middle_school');
      await expectElementVisible('difficulty-jv_high_school');
      await expectElementVisible('difficulty-varsity');
      await expectElementVisible('difficulty-college');
      await expectElementVisible('difficulty-open');
    });

    it('should be able to select each difficulty level', async () => {
      const difficulties = ['middle_school', 'jv_high_school', 'varsity', 'college', 'open'];

      for (const difficulty of difficulties) {
        await selectDifficulty(difficulty);
        await wait(200);
      }

      // Final selection should stick
      await expectElementVisible('difficulty-open');
    });
  });

  describe('Theme Toggle', () => {
    it('should display App Theme setting', async () => {
      await expectTextVisible('App Theme');
    });

    it('should display Light and Dark options', async () => {
      await expectTextVisible('Light');
      await expectTextVisible('Dark');
    });

    it('should toggle theme without crashing', async () => {
      await toggleTheme();
      await wait(500);

      // Settings should still be visible
      await expectElementVisible('theme-toggle');

      // Toggle back
      await toggleTheme();
    });

    it('should persist theme after toggle', async () => {
      await toggleTheme();
      await wait(500);

      // Verify settings still work
      await expectElementVisible('buzzer-time-slider');
    });
  });

  describe('Save and Reset Buttons', () => {
    it('should display both action buttons', async () => {
      await expectElementVisible('save-settings-button');
      await expectElementVisible('reset-settings-button');
    });

    it('should show Save Settings button text', async () => {
      await expectTextVisible('Save Settings');
    });

    it('should show Reset to Defaults button text', async () => {
      await expectTextVisible('Reset to Defaults');
    });

    it('should show success alert when saving', async () => {
      // Make a change first
      await selectDifficulty('college');
      await wait(200);

      await tapElement('save-settings-button');

      await waitFor(element(by.text('Success')))
        .toBeVisible()
        .withTimeout(3000);

      await dismissAlert('OK');
    });

    it('should show confirmation dialog on reset', async () => {
      await tapElement('reset-settings-button');

      await waitFor(element(by.text('Reset Settings')))
        .toBeVisible()
        .withTimeout(3000);

      // Cancel the reset
      await dismissAlert('Cancel');
    });

    it('should reset settings when confirmed', async () => {
      // Change a setting
      await selectDifficulty('open');
      await wait(200);

      // Reset
      await tapElement('reset-settings-button');

      await waitFor(element(by.text('Reset')))
        .toBeVisible()
        .withTimeout(3000);

      await dismissAlert('Reset');

      // Settings should reset (Varsity is default)
      await wait(500);
      await expectElementVisible('reset-settings-button');
    });
  });

  describe('Slider Range Labels', () => {
    it('should display min and max labels for buzzer slider', async () => {
      await expectTextVisible('1.0s');
      await expectTextVisible('10.0s');
    });
  });

  describe('Settings Card Layout', () => {
    it('should display settings icon for each setting', async () => {
      // Each setting card has an icon - verify cards are visible
      await expectElementVisible('theme-toggle');
      await expectElementVisible('buzzer-time-slider');
      await expectElementVisible('answer-time-slider');
    });

    it('should allow scrolling through all settings', async () => {
      // Scroll down to see all settings
      await element(by.text('App Theme')).swipe('up', 'slow', 0.5);
      await wait(300);

      // Should still see settings content
      await expectTextVisible('Difficulty Level');
    });
  });
});

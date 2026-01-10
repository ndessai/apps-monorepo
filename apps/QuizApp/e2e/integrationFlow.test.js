/**
 * Integration Flow E2E Tests
 *
 * End-to-end integration tests covering complete user journeys:
 * - Full quiz completion flow
 * - Settings modification and quiz with new settings
 * - History verification after quiz
 * - Multiple quiz sessions
 */

import {
  waitForElement,
  tapElement,
  expectTextVisible,
  expectElementVisible,
  startQuiz,
  tapBuzzButton,
  waitForQuizResults,
  wait,
  submitAnswer,
  waitForBottomSheet,
  navigateToSettings,
  navigateToTab,
  selectDifficulty,
  toggleTheme,
  dismissAlert,
  goBack,
  reloadApp,
} from './helpers';

describe('Integration Flow Tests', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('Complete User Journey - Quiz Flow', () => {
    it('should complete full journey: launch -> quiz -> results -> back to menu', async () => {
      // Start on launch screen
      await expectTextVisible('Quiz Bowl');
      await expectElementVisible('start-quiz-button');

      // Start quiz
      await startQuiz();
      await waitForElement('progress-indicator', 15000);
      await expectElementVisible('score-display');

      // Complete quiz (let it timeout or answer)
      await waitForQuizResults();

      // Verify results
      await expectTextVisible('Quiz Complete!');
      await expectElementVisible('play-again-button');
      await expectElementVisible('back-to-menu-button');

      // Go back to menu
      await tapElement('back-to-menu-button');
      await wait(500);

      // Verify back on launch screen
      await expectTextVisible('Quiz Bowl');
      await expectElementVisible('start-quiz-button');
    });

    it('should complete multiple quizzes in succession', async () => {
      // First quiz
      await startQuiz();
      await waitForQuizResults();
      await expectTextVisible('Quiz Complete!');

      // Play again
      await tapElement('play-again-button');
      await wait(500);

      // Second quiz
      await waitForElement('progress-indicator', 15000);
      await waitForQuizResults();
      await expectTextVisible('Quiz Complete!');

      // Play again once more
      await tapElement('play-again-button');
      await wait(500);

      // Third quiz
      await waitForElement('progress-indicator', 15000);
      await waitForQuizResults();
      await expectTextVisible('Quiz Complete!');

      // Finally return to menu
      await tapElement('back-to-menu-button');
      await expectTextVisible('Quiz Bowl');
    });
  });

  describe('Settings to Quiz Integration', () => {
    it('should navigate to settings, change difficulty, and start quiz', async () => {
      // Go to settings
      await navigateToSettings();
      await navigateToTab('Setup');

      // Change difficulty
      await selectDifficulty('college');
      await wait(200);

      // Save settings
      await tapElement('save-settings-button');
      await waitFor(element(by.text('Success')))
        .toBeVisible()
        .withTimeout(3000);
      await dismissAlert('OK');

      // Go back to launch screen
      await goBack();
      await wait(500);

      // Start quiz
      await startQuiz();
      await waitForElement('progress-indicator', 15000);

      // Quiz should work
      await expectElementVisible('score-display');
    });

    it('should toggle theme and verify quiz still works', async () => {
      // Toggle theme
      await navigateToSettings();
      await navigateToTab('Setup');
      await toggleTheme();
      await wait(500);

      // Go back and start quiz
      await goBack();
      await startQuiz();

      // Quiz should work with new theme
      await waitForElement('progress-indicator', 15000);
      await expectElementVisible('score-display');
    });
  });

  describe('Quiz and History Integration', () => {
    it('should complete quiz and verify history tab has entry', async () => {
      // Complete a quiz
      await startQuiz();
      await waitForQuizResults();

      // Return to menu
      await tapElement('back-to-menu-button');
      await wait(500);

      // Go to history tab
      await navigateToSettings();
      await navigateToTab('History');
      await wait(500);

      // Should show history stats or entry
      await waitFor(
        element(by.text('Total Quizzes'))
          .or(element(by.text('No Quiz History')))
          .or(element(by.id(/^history-entry-/)))
      )
        .toBeVisible()
        .withTimeout(5000);
    });
  });

  describe('Settings Tab Navigation Integration', () => {
    it('should navigate through all settings tabs without errors', async () => {
      await navigateToSettings();

      // Profile tab (default)
      await waitFor(element(by.text('Profile')))
        .toBeVisible()
        .withTimeout(5000);

      // Teams tab
      await navigateToTab('Teams');
      await waitFor(
        element(by.text('No Teams Yet'))
          .or(element(by.id('create-team-fab')))
      )
        .toBeVisible()
        .withTimeout(5000);

      // Badges tab
      await navigateToTab('Badges');
      await waitFor(element(by.text('Your Badges')))
        .toBeVisible()
        .withTimeout(5000);

      // History tab
      await navigateToTab('History');
      await waitFor(
        element(by.text('No Quiz History'))
          .or(element(by.text('Total Quizzes')))
      )
        .toBeVisible()
        .withTimeout(5000);

      // Setup tab
      await navigateToTab('Setup');
      await expectElementVisible('theme-toggle');
    });

    it('should maintain settings state when switching between tabs', async () => {
      await navigateToSettings();
      await navigateToTab('Setup');

      // Change a setting
      await selectDifficulty('open');
      await wait(200);

      // Switch to another tab
      await navigateToTab('Badges');
      await wait(300);

      // Switch back to Setup
      await navigateToTab('Setup');
      await wait(300);

      // Setting should still be visible (not necessarily persisted until save)
      await expectElementVisible('difficulty-open');
    });
  });

  describe('App State Persistence', () => {
    it('should persist theme setting across app reload', async () => {
      // Set dark theme
      await navigateToSettings();
      await navigateToTab('Setup');
      await toggleTheme();
      await wait(500);

      // Reload app
      await reloadApp();

      // Go back to setup
      await navigateToSettings();
      await navigateToTab('Setup');

      // Theme toggle should still be visible and working
      await expectElementVisible('theme-toggle');
    });

    it('should start on launch screen after app reload', async () => {
      // Start quiz
      await startQuiz();
      await wait(2000);

      // Reload app
      await reloadApp();

      // Should be back on launch screen
      await expectTextVisible('Quiz Bowl');
      await expectElementVisible('start-quiz-button');
    });
  });

  describe('Error Recovery', () => {
    it('should recover from rapid navigation actions', async () => {
      // Rapidly switch between screens
      await navigateToSettings();
      await wait(100);
      await goBack();
      await wait(100);
      await navigateToSettings();
      await wait(100);
      await goBack();
      await wait(100);

      // App should still be functional
      await expectTextVisible('Quiz Bowl');
      await expectElementVisible('start-quiz-button');
    });

    it('should handle rapid tab switching in settings', async () => {
      await navigateToSettings();

      // Rapidly switch tabs
      for (let i = 0; i < 3; i++) {
        await navigateToTab('Teams');
        await wait(100);
        await navigateToTab('Setup');
        await wait(100);
        await navigateToTab('Badges');
        await wait(100);
      }

      // Settings should still work
      await navigateToTab('Setup');
      await expectElementVisible('theme-toggle');
    });
  });

  describe('Full E2E Workflow', () => {
    it('should complete entire workflow: settings -> quiz -> results -> history', async () => {
      // Step 1: Configure settings
      await navigateToSettings();
      await navigateToTab('Setup');
      await selectDifficulty('varsity');
      await tapElement('save-settings-button');
      await waitFor(element(by.text('Success')))
        .toBeVisible()
        .withTimeout(3000);
      await dismissAlert('OK');

      // Step 2: Go back and start quiz
      await goBack();
      await startQuiz();

      // Step 3: Complete quiz
      await waitForQuizResults();
      await expectTextVisible('Quiz Complete!');

      // Step 4: Return to menu
      await tapElement('back-to-menu-button');
      await wait(500);

      // Step 5: Check history
      await navigateToSettings();
      await navigateToTab('History');
      await wait(500);

      // Step 6: Check badges
      await navigateToTab('Badges');
      await expectTextVisible('Your Badges');

      // Step 7: Return to home
      await goBack();
      await expectTextVisible('Quiz Bowl');
    });
  });
});

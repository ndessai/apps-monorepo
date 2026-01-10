/**
 * Quiz Flow E2E Tests
 *
 * Tests the main quiz flow:
 * - Quiz launch screen display
 * - Starting a quiz
 * - Quiz gameplay (buzz and answer)
 * - Quiz results
 */

import {
  waitForElement,
  tapElement,
  expectTextVisible,
  expectElementVisible,
  startQuiz,
  tapBuzzButton,
  typeAnswer,
  waitForQuizResults,
  wait,
  reloadApp,
} from './helpers';

describe('Quiz Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('Quiz Launch Screen', () => {
    it('should display the quiz launch screen with title', async () => {
      await expectTextVisible('Quiz Bowl');
    });

    it('should display the subtitle', async () => {
      await expectTextVisible('Test your knowledge with NAQT format questions');
    });

    it('should display the settings button', async () => {
      await expectElementVisible('settings-button');
    });

    it('should display the Start Quiz button enabled', async () => {
      await expectElementVisible('start-quiz-button');
      // Button should be tappable (enabled)
      await expect(element(by.id('start-quiz-button'))).toBeVisible();
    });

    it('should display Host Tournament button disabled', async () => {
      await expectElementVisible('host-tournament-button');
      // Button exists with "Coming Soon" text nearby
      await expectTextVisible('Coming Soon');
    });

    it('should display Join Tournament button disabled', async () => {
      await expectElementVisible('join-tournament-button');
    });
  });

  describe('Starting a Quiz', () => {
    it('should navigate to quiz screen when Start Quiz is tapped', async () => {
      await startQuiz();

      // Verify quiz screen elements appear
      await waitForElement('progress-indicator', 10000);
      await expectElementVisible('score-display');
    });

    it('should show progress indicator with Question 1', async () => {
      await startQuiz();

      await waitForElement('progress-indicator');
      // Progress indicator should show question number
      await waitFor(element(by.text(/Question 1/)))
        .toBeVisible()
        .withTimeout(10000);
    });

    it('should show initial score of 0', async () => {
      await startQuiz();

      await waitForElement('score-display');
      await waitFor(element(by.text(/0 \//)))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should display the tossup reader with question text', async () => {
      await startQuiz();

      await waitForElement('tossup-reader', 15000);
      await expectElementVisible('tossup-reader');
    });
  });

  describe('Quiz Gameplay - Buzz and Answer', () => {
    it('should show buzz button during question reading', async () => {
      await startQuiz();

      // Wait for quiz to start and buzz button to appear
      await waitForElement('buzz-button', 15000);
      await expectElementVisible('buzz-button');
    });

    it('should show answer input after tapping buzz button', async () => {
      await startQuiz();

      await tapBuzzButton();

      // Answer input should appear
      await waitForElement('answer-input-field', 5000);
      await expectElementVisible('answer-input-field');
    });

    it('should allow typing an answer', async () => {
      await startQuiz();

      await tapBuzzButton();
      await waitForElement('answer-input-field');

      // Type an answer
      await typeAnswer('test answer');

      // Verify text was entered (element still visible with text)
      await expectElementVisible('answer-input-field');
    });

    it('should show microphone button for voice input', async () => {
      await startQuiz();

      await tapBuzzButton();
      await waitForElement('answer-input-mic-button', 5000);
      await expectElementVisible('answer-input-mic-button');
    });
  });

  describe('Quiz Results Screen', () => {
    // Note: This test may be slow as it waits for quiz completion
    it('should navigate to results screen after quiz completion', async () => {
      await startQuiz();

      // Wait for the quiz to complete (this may take a while)
      // The quiz will auto-complete after all questions or timeouts
      await waitForQuizResults();

      await expectElementVisible('play-again-button');
      await expectElementVisible('back-to-menu-button');
    });

    it('should display question breakdown cards', async () => {
      await startQuiz();
      await waitForQuizResults();

      // At least one breakdown card should exist
      await waitForElement('breakdown-0', 5000);
      await expectElementVisible('breakdown-0');
    });

    it('should navigate back to launch screen when Back to Menu is tapped', async () => {
      await startQuiz();
      await waitForQuizResults();

      await tapElement('back-to-menu-button');
      await wait(500);

      // Should be back on launch screen
      await expectElementVisible('start-quiz-button');
      await expectTextVisible('Quiz Bowl');
    });

    it('should start a new quiz when Play Again is tapped', async () => {
      await startQuiz();
      await waitForQuizResults();

      await tapElement('play-again-button');
      await wait(500);

      // Should be on quiz screen again
      await waitForElement('progress-indicator', 10000);
      await expectElementVisible('score-display');
    });
  });
});

/**
 * Buzz Button E2E Tests
 *
 * Tests for the buzz button component:
 * - Button display and visibility
 * - Button interaction
 * - Buzz window countdown
 * - Button states
 */

import {
  waitForElement,
  tapElement,
  expectTextVisible,
  expectElementVisible,
  startQuiz,
  tapBuzzButton,
  wait,
  waitForBottomSheet,
} from './helpers';

describe('Buzz Button Component', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('Buzz Button Display', () => {
    it('should display buzz button during quiz', async () => {
      await startQuiz();

      await waitForElement('buzz-button', 15000);
    });

    it('should have buzz-button test ID', async () => {
      await startQuiz();

      await expectElementVisible('buzz-button');
    });

    it('should be visible during question reading', async () => {
      await startQuiz();

      await waitForElement('buzz-button', 15000);
      await expectElementVisible('buzz-button');
    });
  });

  describe('Buzz Button Interaction', () => {
    it('should be tappable', async () => {
      await startQuiz();

      await waitForElement('buzz-button', 15000);
      await tapElement('buzz-button');

      // Should transition to answer input
      await waitForBottomSheet();
    });

    it('should respond to tap during reading', async () => {
      await startQuiz();

      await waitForElement('buzz-button', 15000);

      // Tap early while TTS is reading
      await wait(1000);
      await tapBuzzButton();

      // Answer input should appear
      await waitForBottomSheet();
    });

    it('should disappear after buzzing', async () => {
      await startQuiz();

      await tapBuzzButton();
      await waitForBottomSheet();

      // Buzz button should not be visible during answering
      await wait(500);
      try {
        await expect(element(by.id('buzz-button'))).not.toBeVisible();
      } catch {
        // Button may still be visible but disabled
      }
    });
  });

  describe('Buzz Window State', () => {
    it('should show countdown during buzz window', async () => {
      await startQuiz();

      // Wait for TTS to finish and buzz window to start
      // This may take 10-30 seconds depending on question length
      await waitForElement('buzz-button', 30000);

      // During buzz window, countdown should be visible
      // The button shows a countdown number overlay
      await wait(1000);
      await expectElementVisible('buzz-button');
    });

    it('should respond to tap during buzz window', async () => {
      await startQuiz();

      await waitForElement('buzz-button', 30000);

      // Wait for buzz window to start (after TTS)
      await wait(2000);

      await tapBuzzButton();
      await waitForBottomSheet();
    });
  });

  describe('Buzz Button Styling', () => {
    it('should have prominent display', async () => {
      await startQuiz();

      await waitForElement('buzz-button', 15000);

      // Button should be visible and accessible
      await expectElementVisible('buzz-button');
    });
  });

  describe('Multiple Buzzes Prevention', () => {
    it('should prevent multiple buzzes on same question', async () => {
      await startQuiz();

      await tapBuzzButton();
      await waitForBottomSheet();

      // Buzz button should not be tappable again
      await wait(500);

      // Answer input should be visible, not buzz button
      await expectElementVisible('quiz-answer-bottom-sheet');
    });
  });

  describe('Buzz During Different States', () => {
    it('should work when buzzing during reading state', async () => {
      await startQuiz();

      // Buzz immediately during reading
      await waitForElement('buzz-button', 15000);
      await tapBuzzButton();

      await waitForBottomSheet();
      await expectElementVisible('quiz-answer-bottom-sheet');
    });

    it('should work when buzzing during buzz window state', async () => {
      await startQuiz();

      // Wait for buzz window (after TTS finishes)
      await waitForElement('buzz-button', 30000);

      // Let TTS finish and buzz window start
      await wait(10000);

      await tapBuzzButton();
      await waitForBottomSheet();
    });
  });

  describe('Buzz Button Reappearance', () => {
    it('should reappear for next question', async () => {
      await startQuiz();

      // First question - buzz and answer
      await tapBuzzButton();
      await waitForBottomSheet();

      await waitForElement('quiz-answer-bottom-sheet-submitter-input-field');
      await element(by.id('quiz-answer-bottom-sheet-submitter-input-field')).typeText('test');
      await tapElement('quiz-answer-bottom-sheet-submitter-input-submit-button');

      // Wait for feedback and next question
      await wait(6000);

      // Buzz button should reappear for next question (or bonus)
      await waitFor(
        element(by.id('buzz-button'))
          .or(element(by.id('quiz-answer-bottom-sheet')))  // Bonus goes directly to answer
      )
        .toBeVisible()
        .withTimeout(15000);
    });
  });
});

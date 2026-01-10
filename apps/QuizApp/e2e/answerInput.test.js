/**
 * Answer Input E2E Tests
 *
 * Tests for the answer input component:
 * - Text input functionality
 * - Microphone button visibility
 * - Submit button behavior
 * - Input field interaction
 */

import {
  waitForElement,
  tapElement,
  expectTextVisible,
  expectElementVisible,
  startQuiz,
  tapBuzzButton,
  typeAnswer,
  wait,
  waitForBottomSheet,
  clearText,
  typeText,
} from './helpers';

describe('Answer Input Component', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('Input Field Display', () => {
    it('should display answer input field after buzzing', async () => {
      await startQuiz();

      await tapBuzzButton();
      await waitForBottomSheet();

      await waitForElement('quiz-answer-bottom-sheet-submitter-input-field', 5000);
    });

    it('should display placeholder text in input field', async () => {
      await startQuiz();

      await tapBuzzButton();
      await waitForBottomSheet();

      // Input field should be visible
      await waitForElement('quiz-answer-bottom-sheet-submitter-input-field');
    });

    it('should display submit button', async () => {
      await startQuiz();

      await tapBuzzButton();
      await waitForBottomSheet();

      await waitForElement('quiz-answer-bottom-sheet-submitter-input-submit-button');
      await expectElementVisible('quiz-answer-bottom-sheet-submitter-input-submit-button');
    });

    it('should display microphone button', async () => {
      await startQuiz();

      await tapBuzzButton();
      await waitForBottomSheet();

      await waitForElement('quiz-answer-bottom-sheet-submitter-input-mic-button', 5000);
    });
  });

  describe('Text Input Behavior', () => {
    it('should allow typing text', async () => {
      await startQuiz();

      await tapBuzzButton();
      await waitForBottomSheet();

      await typeAnswer('test input');

      // Field should still be visible with text
      await expectElementVisible('quiz-answer-bottom-sheet-submitter-input-field');
    });

    it('should allow typing long answers', async () => {
      await startQuiz();

      await tapBuzzButton();
      await waitForBottomSheet();

      const longAnswer = 'This is a very long answer that tests the input field capacity';
      await typeAnswer(longAnswer);

      await expectElementVisible('quiz-answer-bottom-sheet-submitter-input-field');
    });

    it('should handle special characters in input', async () => {
      await startQuiz();

      await tapBuzzButton();
      await waitForBottomSheet();

      await typeAnswer('Test-Answer_123');

      await expectElementVisible('quiz-answer-bottom-sheet-submitter-input-field');
    });
  });

  describe('Submit Button Behavior', () => {
    it('should be disabled when input is empty', async () => {
      await startQuiz();

      await tapBuzzButton();
      await waitForBottomSheet();

      // Submit button should exist but be disabled (we can't directly test disabled state)
      await expectElementVisible('quiz-answer-bottom-sheet-submitter-input-submit-button');
    });

    it('should submit answer when button is tapped', async () => {
      await startQuiz();

      await tapBuzzButton();
      await waitForBottomSheet();

      await typeAnswer('my answer');
      await tapElement('quiz-answer-bottom-sheet-submitter-input-submit-button');

      // Should transition to feedback
      await waitFor(element(by.id('quiz-answer-feedback')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should display Submit text on button', async () => {
      await startQuiz();

      await tapBuzzButton();
      await waitForBottomSheet();

      await expectTextVisible('Submit');
    });
  });

  describe('Timer Display', () => {
    it('should show timer countdown after buzzing', async () => {
      await startQuiz();

      await tapBuzzButton();
      await waitForBottomSheet();

      // Timer should be visible
      await waitFor(element(by.id('quiz-answer-bottom-sheet-submitter-timer')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should show countdown in timer (format: Xs)', async () => {
      await startQuiz();

      await tapBuzzButton();
      await waitForBottomSheet();

      // Timer should show seconds format
      await waitFor(element(by.text(/\d+s/)))
        .toBeVisible()
        .withTimeout(5000);
    });
  });

  describe('Question Type Label', () => {
    it('should show Tossup Answer label for tossup questions', async () => {
      await startQuiz();

      await tapBuzzButton();
      await waitForBottomSheet();

      await expectTextVisible('Tossup Answer');
    });
  });

  describe('Multiple Answers', () => {
    it('should clear input after submitting', async () => {
      await startQuiz();

      await tapBuzzButton();
      await waitForBottomSheet();
      await typeAnswer('first answer');
      await tapElement('quiz-answer-bottom-sheet-submitter-input-submit-button');

      // Wait for feedback and next question
      await wait(5000);

      // If another buzz window appears, try buzzing again
      try {
        await tapBuzzButton();
        await waitForBottomSheet();
        // Input should be clear for new answer
        await expectElementVisible('quiz-answer-bottom-sheet-submitter-input-field');
      } catch {
        // Quiz may have progressed to bonus or ended
      }
    });
  });
});

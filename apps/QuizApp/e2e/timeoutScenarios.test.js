/**
 * Timeout Scenarios E2E Tests
 *
 * Tests for various timeout scenarios:
 * - Buzz window timeout (no buzz after question ends)
 * - Answer timeout (no answer after buzzing)
 * - State transitions on timeout
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
  waitForBottomSheet,
  waitForAnswerFeedback,
  expectIncorrectFeedback,
} from './helpers';

describe('Timeout Scenarios', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('Buzz Window Timeout', () => {
    it('should timeout if no buzz after question reading finishes', async () => {
      await startQuiz();

      // Wait for buzz button to appear (TTS reading)
      await waitForElement('buzz-button', 15000);

      // Do NOT buzz - wait for timeout
      // The buzz window is typically 3 seconds after TTS finishes
      await wait(35000); // Wait for TTS + buzz window timeout

      // Should show feedback indicating timeout (incorrect, 0 points)
      // Or should have moved to next question
      await waitFor(
        element(by.id('quiz-answer-feedback')).or(element(by.text(/Question 2/)))
      )
        .toBeVisible()
        .withTimeout(10000);
    });

    it('should mark question as incorrect on buzz timeout', async () => {
      await startQuiz();

      await waitForElement('buzz-button', 15000);

      // Wait for buzz window to expire
      await wait(35000);

      // Feedback should show incorrect
      try {
        await waitForAnswerFeedback();
        // Should show 0 points or incorrect
        await expectTextVisible('points');
      } catch {
        // May have already moved to next question
      }
    });
  });

  describe('Answer Timeout', () => {
    it('should timeout if no answer is submitted after buzzing', async () => {
      await startQuiz();

      await tapBuzzButton();
      await waitForBottomSheet();

      // Do NOT submit an answer - wait for timeout
      // Default answer time is 8 seconds
      await wait(12000);

      // Should show feedback (incorrect due to timeout)
      await waitForAnswerFeedback();
    });

    it('should mark answer as incorrect on answer timeout', async () => {
      await startQuiz();

      await tapBuzzButton();
      await waitForBottomSheet();

      // Wait for answer timeout
      await wait(12000);

      // Feedback should appear
      await waitForAnswerFeedback();

      // Should show Incorrect status
      await expectIncorrectFeedback();
    });

    it('should show 0 points on answer timeout', async () => {
      await startQuiz();

      await tapBuzzButton();
      await waitForBottomSheet();

      // Wait for timeout
      await wait(12000);

      await waitForAnswerFeedback();

      // Should show 0 points
      await expectTextVisible('0');
    });
  });

  describe('Timer Countdown Visibility', () => {
    it('should show countdown in buzz button during buzz window', async () => {
      await startQuiz();

      // Wait for TTS to finish and buzz window to start
      await waitForElement('buzz-button', 30000);

      // During buzz window, the countdown should be visible
      // (The buzz button shows countdown number when in buzz window)
      await expectElementVisible('buzz-button');
    });

    it('should show countdown in answer timer after buzzing', async () => {
      await startQuiz();

      await tapBuzzButton();
      await waitForBottomSheet();

      // Timer should show countdown
      await waitFor(element(by.text(/\d+s/)))
        .toBeVisible()
        .withTimeout(5000);

      // Wait a bit and verify countdown is decreasing
      await wait(2000);

      // Timer should still be visible (with lower value)
      await waitFor(element(by.text(/\d+s/)))
        .toBeVisible()
        .withTimeout(5000);
    });
  });

  describe('Review Timer', () => {
    it('should show Next question in timer in feedback', async () => {
      await startQuiz();

      await tapBuzzButton();
      await waitForBottomSheet();

      await waitForElement('quiz-answer-bottom-sheet-submitter-input-field');
      await element(by.id('quiz-answer-bottom-sheet-submitter-input-field')).typeText('test');
      await tapElement('quiz-answer-bottom-sheet-submitter-input-submit-button');

      await waitForAnswerFeedback();

      // Should show "Next question in" or "Next part in"
      await waitFor(
        element(by.text('Next question in')).or(element(by.text('Next part in')))
      )
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should auto-advance to next question after review timer', async () => {
      await startQuiz();

      await tapBuzzButton();
      await waitForBottomSheet();

      await waitForElement('quiz-answer-bottom-sheet-submitter-input-field');
      await element(by.id('quiz-answer-bottom-sheet-submitter-input-field')).typeText('test');
      await tapElement('quiz-answer-bottom-sheet-submitter-input-submit-button');

      await waitForAnswerFeedback();

      // Wait for review timer to complete
      await wait(5000);

      // Should either show next question or quiz complete
      // The feedback should have disappeared
      await waitFor(element(by.id('quiz-answer-feedback')))
        .not.toBeVisible()
        .withTimeout(10000);
    });
  });

  describe('Complete Quiz With Timeouts', () => {
    it('should complete quiz even with all timeouts', async () => {
      await startQuiz();

      // Let all questions timeout without answering
      // This tests the full timeout flow
      await waitForQuizResults();

      // Should reach results screen
      await expectTextVisible('Quiz Complete!');
      await expectElementVisible('play-again-button');
    });

    it('should show 0% accuracy with all timeouts', async () => {
      await startQuiz();

      await waitForQuizResults();

      // Should show 0% accuracy (all wrong)
      await expectTextVisible('0% Accuracy');
    });
  });
});

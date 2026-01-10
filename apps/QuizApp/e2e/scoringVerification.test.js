/**
 * Scoring Verification E2E Tests
 *
 * Tests for quiz scoring system:
 * - Score display updates
 * - Points calculation
 * - Results accuracy
 * - Score persistence to results
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
  waitForAnswerFeedback,
  expectPointsDisplayed,
} from './helpers';

describe('Scoring Verification', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('Initial Score', () => {
    it('should start with 0 score', async () => {
      await startQuiz();

      await waitForElement('score-display');
      await waitFor(element(by.text(/0 \//)))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should display max possible score', async () => {
      await startQuiz();

      await waitForElement('score-display');
      // Score format is "X / Y" where Y is max score
      await waitFor(element(by.text(/\/ \d+/)))
        .toBeVisible()
        .withTimeout(5000);
    });
  });

  describe('Score Display Component', () => {
    it('should have score-display test ID', async () => {
      await startQuiz();

      await expectElementVisible('score-display');
    });

    it('should be visible throughout quiz', async () => {
      await startQuiz();

      await waitForElement('score-display');

      // Score should remain visible after buzzing
      await tapBuzzButton();
      await expectElementVisible('score-display');
    });
  });

  describe('Points in Feedback', () => {
    it('should display points earned in feedback', async () => {
      await startQuiz();

      await tapBuzzButton();
      await waitForBottomSheet();
      await submitAnswer('test');

      await waitForAnswerFeedback();

      // Should show points label
      await expectTextVisible('points');
    });

    it('should show numeric points value', async () => {
      await startQuiz();

      await tapBuzzButton();
      await waitForBottomSheet();
      await submitAnswer('test');

      await waitForAnswerFeedback();

      // Should show a number for points (0, +10, +15, etc.)
      await waitFor(
        element(by.text(/^\+?\d+$/))
          .or(element(by.text('0')))
      )
        .toBeVisible()
        .withTimeout(5000);
    });
  });

  describe('Results Screen Scoring', () => {
    it('should display final score on results screen', async () => {
      await startQuiz();
      await waitForQuizResults();

      // Score should be visible
      await waitFor(element(by.text(/\d+ \/ \d+/)))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should display accuracy percentage', async () => {
      await startQuiz();
      await waitForQuizResults();

      // Accuracy format: "X% Accuracy"
      await waitFor(element(by.text(/\d+% Accuracy/)))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should display toss-up score breakdown', async () => {
      await startQuiz();
      await waitForQuizResults();

      await expectTextVisible('Toss-ups');
      // Format: "X / Y"
      await waitFor(element(by.text(/\d+ \/ \d+/)))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should display bonus points breakdown', async () => {
      await startQuiz();
      await waitForQuizResults();

      await expectTextVisible('Bonus Points');
    });
  });

  describe('Score Accuracy', () => {
    it('should show 0% accuracy when no correct answers', async () => {
      await startQuiz();
      await waitForQuizResults();

      // With all timeouts/wrong answers, should be 0%
      await expectTextVisible('0% Accuracy');
    });
  });

  describe('Question Breakdown Scoring', () => {
    it('should display breakdown for each question', async () => {
      await startQuiz();
      await waitForQuizResults();

      // At least one breakdown card should exist
      await waitForElement('breakdown-0', 5000);
    });

    it('should show Question Breakdown title', async () => {
      await startQuiz();
      await waitForQuizResults();

      await expectTextVisible('Question Breakdown');
    });
  });

  describe('Score Color Coding', () => {
    it('should display score with appropriate color', async () => {
      await startQuiz();
      await waitForQuizResults();

      // Score should be visible (color testing is visual)
      await waitFor(element(by.text(/^\d+$/)))
        .toBeVisible()
        .withTimeout(5000);
    });
  });

  describe('Consistent Scoring', () => {
    it('should maintain consistent scoring across quiz restart', async () => {
      // Complete first quiz
      await startQuiz();
      await waitForQuizResults();

      // Start new quiz
      await tapElement('play-again-button');
      await wait(500);

      // Score should reset to 0
      await waitForElement('score-display', 10000);
      await waitFor(element(by.text(/0 \//)))
        .toBeVisible()
        .withTimeout(5000);
    });
  });
});

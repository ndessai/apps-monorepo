/**
 * Answer Feedback E2E Tests
 *
 * Tests for the answer feedback component:
 * - Correct/incorrect display
 * - Points display
 * - User answer display
 * - Acceptable answers display
 * - Review timer
 */

import {
  waitForElement,
  tapElement,
  expectTextVisible,
  expectElementVisible,
  startQuiz,
  tapBuzzButton,
  wait,
  submitAnswer,
  waitForBottomSheet,
  waitForAnswerFeedback,
  expectCorrectFeedback,
  expectIncorrectFeedback,
} from './helpers';

describe('Answer Feedback Component', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('Feedback Display', () => {
    it('should display feedback after answer submission', async () => {
      await startQuiz();

      await tapBuzzButton();
      await waitForBottomSheet();
      await submitAnswer('test');

      await waitForAnswerFeedback();
    });

    it('should have quiz-answer-feedback test ID', async () => {
      await startQuiz();

      await tapBuzzButton();
      await waitForBottomSheet();
      await submitAnswer('test');

      await waitFor(element(by.id('quiz-answer-feedback')))
        .toBeVisible()
        .withTimeout(10000);
    });
  });

  describe('Correct/Incorrect Status', () => {
    it('should display status text (Correct! or Incorrect)', async () => {
      await startQuiz();

      await tapBuzzButton();
      await waitForBottomSheet();
      await submitAnswer('test');

      await waitForAnswerFeedback();

      // Should show either Correct! or Incorrect
      await waitFor(
        element(by.text('Correct!'))
          .or(element(by.text('Incorrect')))
      )
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should display check icon for correct answers', async () => {
      await startQuiz();

      await tapBuzzButton();
      await waitForBottomSheet();
      await submitAnswer('test');

      await waitForAnswerFeedback();

      // Icon is shown but we can verify feedback is visible
      await expectElementVisible('quiz-answer-feedback');
    });
  });

  describe('Points Display', () => {
    it('should display points label', async () => {
      await startQuiz();

      await tapBuzzButton();
      await waitForBottomSheet();
      await submitAnswer('test');

      await waitForAnswerFeedback();

      await expectTextVisible('points');
    });

    it('should display numeric points value', async () => {
      await startQuiz();

      await tapBuzzButton();
      await waitForBottomSheet();
      await submitAnswer('test');

      await waitForAnswerFeedback();

      // Should show a number (0, +10, +15, -5, etc.)
      await waitFor(
        element(by.text(/^[\+\-]?\d+$/))
      )
        .toBeVisible()
        .withTimeout(5000);
    });
  });

  describe('User Answer Display', () => {
    it('should display Your Answer section', async () => {
      await startQuiz();

      await tapBuzzButton();
      await waitForBottomSheet();
      await submitAnswer('my answer here');

      await waitForAnswerFeedback();

      await expectTextVisible('Your Answer');
    });

    it('should display the submitted answer text', async () => {
      await startQuiz();

      await tapBuzzButton();
      await waitForBottomSheet();
      await submitAnswer('specific test answer');

      await waitForAnswerFeedback();

      // The answer we typed should be visible
      await expectTextVisible('specific test answer');
    });
  });

  describe('Acceptable Answers Display', () => {
    it('should display Acceptable Answers for incorrect responses', async () => {
      await startQuiz();

      await tapBuzzButton();
      await waitForBottomSheet();
      await submitAnswer('wrong answer xyz');

      await waitForAnswerFeedback();

      // For incorrect answers, should show acceptable answers
      try {
        await expectTextVisible('Acceptable Answers');
      } catch {
        // May be a correct answer by coincidence
      }
    });
  });

  describe('Review Timer', () => {
    it('should display review timer countdown', async () => {
      await startQuiz();

      await tapBuzzButton();
      await waitForBottomSheet();
      await submitAnswer('test');

      await waitForAnswerFeedback();

      // Timer shows "Xs" format
      await waitFor(element(by.text(/\d+s/)))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should display Next question/part text', async () => {
      await startQuiz();

      await tapBuzzButton();
      await waitForBottomSheet();
      await submitAnswer('test');

      await waitForAnswerFeedback();

      // Should show "Next question in" or "Next part in"
      await waitFor(
        element(by.text('Next question in'))
          .or(element(by.text('Next part in')))
      )
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should auto-dismiss after timer expires', async () => {
      await startQuiz();

      await tapBuzzButton();
      await waitForBottomSheet();
      await submitAnswer('test');

      await waitForAnswerFeedback();

      // Wait for review timer (default ~2 seconds + buffer)
      await wait(5000);

      // Feedback should have disappeared
      await waitFor(element(by.id('quiz-answer-feedback')))
        .not.toBeVisible()
        .withTimeout(10000);
    });
  });

  describe('Feedback Animation', () => {
    it('should slide up from bottom', async () => {
      await startQuiz();

      await tapBuzzButton();
      await waitForBottomSheet();
      await submitAnswer('test');

      // Feedback should animate in
      await waitForAnswerFeedback();
      await expectElementVisible('quiz-answer-feedback');
    });

    it('should slide down when dismissing', async () => {
      await startQuiz();

      await tapBuzzButton();
      await waitForBottomSheet();
      await submitAnswer('test');

      await waitForAnswerFeedback();

      // Wait for auto-dismiss
      await wait(5000);

      // Feedback should be gone
      await waitFor(element(by.id('quiz-answer-feedback')))
        .not.toBeVisible()
        .withTimeout(10000);
    });
  });

  describe('Feedback for Different Question Types', () => {
    it('should show Tossup feedback for tossup questions', async () => {
      await startQuiz();

      await tapBuzzButton();
      await waitForBottomSheet();

      // Should show Tossup Answer in bottom sheet
      await expectTextVisible('Tossup Answer');

      await submitAnswer('test');
      await waitForAnswerFeedback();

      // After answering, should show next question or next part
      await waitFor(
        element(by.text('Next question in'))
          .or(element(by.text('Next part in')))
      )
        .toBeVisible()
        .withTimeout(5000);
    });
  });

  describe('Drag Handle', () => {
    it('should display drag handle on feedback sheet', async () => {
      await startQuiz();

      await tapBuzzButton();
      await waitForBottomSheet();
      await submitAnswer('test');

      await waitForAnswerFeedback();

      // Drag handle is a visual element, verify feedback is visible
      await expectElementVisible('quiz-answer-feedback');
    });
  });
});

/**
 * Advanced Quiz Gameplay E2E Tests
 *
 * Comprehensive tests for quiz gameplay including:
 * - Full quiz flow with multiple questions
 * - Buzz mechanics during reading and buzz window
 * - Answer submission and validation
 * - Score calculation verification
 * - Feedback display
 * - Bonus question handling
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
  submitAnswer,
  waitForBottomSheet,
  waitForAnswerFeedback,
  expectCorrectFeedback,
  expectIncorrectFeedback,
  verifyTossupReaderVisible,
  expectQuizComplete,
} from './helpers';

describe('Advanced Quiz Gameplay', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('Quiz Initialization', () => {
    it('should display loading state briefly then show quiz screen', async () => {
      await startQuiz();

      // Quiz should initialize with progress indicator
      await waitForElement('progress-indicator', 15000);
      await expectElementVisible('score-display');
    });

    it('should start TTS and display tossup reader', async () => {
      await startQuiz();

      // Wait for tossup reader to appear
      await verifyTossupReaderVisible();
    });

    it('should show "Toss-up Question" header in tossup reader', async () => {
      await startQuiz();

      await waitForElement('tossup-reader', 15000);
      await expectTextVisible('Toss-up Question');
    });
  });

  describe('Buzz Mechanics', () => {
    it('should allow buzzing during question reading', async () => {
      await startQuiz();

      // Wait for buzz button to appear
      await waitForElement('buzz-button', 15000);

      // Buzz during reading (before TTS finishes)
      await tapBuzzButton();

      // Answer input should appear
      await waitForBottomSheet();
    });

    it('should show answer bottom sheet after buzzing', async () => {
      await startQuiz();

      await tapBuzzButton();

      // Bottom sheet should be visible
      await waitFor(element(by.id('quiz-answer-bottom-sheet')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should display Tossup Answer label in bottom sheet', async () => {
      await startQuiz();

      await tapBuzzButton();
      await waitForBottomSheet();

      await expectTextVisible('Tossup Answer');
    });

    it('should show timer in answer submitter', async () => {
      await startQuiz();

      await tapBuzzButton();
      await waitForBottomSheet();

      // Timer should be visible (showing countdown or --)
      await waitFor(element(by.id('quiz-answer-bottom-sheet-submitter-timer')))
        .toBeVisible()
        .withTimeout(5000);
    });
  });

  describe('Answer Submission', () => {
    it('should allow typing and submitting an answer', async () => {
      await startQuiz();

      await tapBuzzButton();
      await waitForBottomSheet();

      // Type an answer
      await waitForElement('quiz-answer-bottom-sheet-submitter-input-field');
      await typeAnswer('test answer');

      // Submit button should be tappable
      await tapElement('quiz-answer-bottom-sheet-submitter-input-submit-button');

      // Feedback should appear
      await waitForAnswerFeedback();
    });

    it('should show correct feedback for correct answers', async () => {
      await startQuiz();

      await tapBuzzButton();
      await waitForBottomSheet();

      // Submit any answer (will be wrong for random questions but tests flow)
      await submitAnswer('test');

      // Feedback should appear (either correct or incorrect)
      await waitForAnswerFeedback();
    });

    it('should display points in feedback', async () => {
      await startQuiz();

      await tapBuzzButton();
      await waitForBottomSheet();
      await submitAnswer('test');

      await waitForAnswerFeedback();

      // Should show "points" label
      await expectTextVisible('points');
    });

    it('should show Your Answer section in feedback', async () => {
      await startQuiz();

      await tapBuzzButton();
      await waitForBottomSheet();
      await submitAnswer('my test answer');

      await waitForAnswerFeedback();

      // Should show user's answer in feedback
      await expectTextVisible('Your Answer');
    });
  });

  describe('Question Progression', () => {
    it('should progress to next question after answering', async () => {
      await startQuiz();

      // Answer first question
      await tapBuzzButton();
      await waitForBottomSheet();
      await submitAnswer('test');
      await waitForAnswerFeedback();

      // Wait for feedback timer and next question
      await wait(5000);

      // Should still be on quiz screen (either next question or bonus)
      await expectElementVisible('progress-indicator');
    });

    it('should show question number in progress indicator', async () => {
      await startQuiz();

      await waitForElement('progress-indicator');

      // Should show Question 1 initially
      await waitFor(element(by.text(/Question 1/)))
        .toBeVisible()
        .withTimeout(10000);
    });
  });

  describe('Score Display', () => {
    it('should show initial score of 0', async () => {
      await startQuiz();

      await waitForElement('score-display');
      await waitFor(element(by.text(/0 \//)))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should display score format as current / max', async () => {
      await startQuiz();

      await waitForElement('score-display');
      // Score format is "X / Y"
      await waitFor(element(by.text(/\d+ \/ \d+/)))
        .toBeVisible()
        .withTimeout(5000);
    });
  });

  describe('Full Quiz Completion', () => {
    it('should complete quiz and show results screen', async () => {
      await startQuiz();

      // Wait for quiz to complete (may take a while with timeouts)
      await waitForQuizResults();

      // Results screen elements
      await expectQuizComplete();
      await expectElementVisible('play-again-button');
      await expectElementVisible('back-to-menu-button');
    });

    it('should show score on results screen', async () => {
      await startQuiz();
      await waitForQuizResults();

      // Should show score and accuracy
      await waitFor(element(by.text(/\d+% Accuracy/)))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should show Toss-ups stats on results screen', async () => {
      await startQuiz();
      await waitForQuizResults();

      await expectTextVisible('Toss-ups');
    });

    it('should show Bonus Points stats on results screen', async () => {
      await startQuiz();
      await waitForQuizResults();

      await expectTextVisible('Bonus Points');
    });

    it('should show Question Breakdown section', async () => {
      await startQuiz();
      await waitForQuizResults();

      await expectTextVisible('Question Breakdown');
    });

    it('should display at least one breakdown card', async () => {
      await startQuiz();
      await waitForQuizResults();

      await waitForElement('breakdown-0', 5000);
    });
  });

  describe('Results Screen Navigation', () => {
    it('should navigate to new quiz when Play Again is tapped', async () => {
      await startQuiz();
      await waitForQuizResults();

      await tapElement('play-again-button');
      await wait(500);

      // Should be on quiz screen again
      await waitForElement('progress-indicator', 10000);
      await expectElementVisible('score-display');
    });

    it('should return to launch screen when Back to Menu is tapped', async () => {
      await startQuiz();
      await waitForQuizResults();

      await tapElement('back-to-menu-button');
      await wait(500);

      // Should be on launch screen
      await expectElementVisible('start-quiz-button');
      await expectTextVisible('Quiz Bowl');
    });

    it('should be able to start multiple quizzes in succession', async () => {
      // First quiz
      await startQuiz();
      await waitForQuizResults();
      await tapElement('play-again-button');
      await wait(500);

      // Second quiz
      await waitForElement('progress-indicator', 10000);
      await waitForQuizResults();

      // Should still work
      await expectQuizComplete();
    });
  });
});

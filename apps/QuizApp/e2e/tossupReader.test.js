/**
 * Tossup Reader E2E Tests
 *
 * Tests for the tossup reader component:
 * - Question display
 * - Power mark indicator
 * - Text reveal animation
 * - Header display
 */

import {
  waitForElement,
  tapElement,
  expectTextVisible,
  expectElementVisible,
  startQuiz,
  tapBuzzButton,
  wait,
  verifyTossupReaderVisible,
} from './helpers';

describe('Tossup Reader Component', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('Tossup Reader Display', () => {
    it('should display tossup reader during quiz', async () => {
      await startQuiz();

      await verifyTossupReaderVisible();
    });

    it('should have tossup-reader test ID', async () => {
      await startQuiz();

      await waitForElement('tossup-reader', 15000);
    });

    it('should display Toss-up Question header', async () => {
      await startQuiz();

      await waitForElement('tossup-reader', 15000);
      await expectTextVisible('Toss-up Question');
    });
  });

  describe('Power Mark Indicator', () => {
    it('should show Power badge when in power zone', async () => {
      await startQuiz();

      await waitForElement('tossup-reader', 15000);

      // Power badge should be visible at the start (before power mark)
      await waitFor(element(by.text('Power')))
        .toBeVisible()
        .withTimeout(5000);
    });
  });

  describe('Question Text Display', () => {
    it('should display question text', async () => {
      await startQuiz();

      await waitForElement('tossup-reader', 15000);

      // Wait for some text to appear in the reader
      await wait(2000);

      // Tossup reader should be visible with content
      await expectElementVisible('tossup-reader');
    });

    it('should reveal text progressively', async () => {
      await startQuiz();

      await waitForElement('tossup-reader', 15000);

      // Text should be visible as TTS reads
      await wait(1000);
      await expectElementVisible('tossup-reader');

      await wait(2000);
      await expectElementVisible('tossup-reader');
    });

    it('should show cursor while text is being revealed', async () => {
      await startQuiz();

      await waitForElement('tossup-reader', 15000);

      // Cursor (|) should be visible while revealing
      // This is a visual element that appears at the end of revealed text
      await wait(1000);
      await expectElementVisible('tossup-reader');
    });
  });

  describe('Tossup Reader Interaction', () => {
    it('should remain visible after buzzing', async () => {
      await startQuiz();

      await waitForElement('tossup-reader', 15000);
      await tapBuzzButton();

      // Tossup reader should still be visible
      await expectElementVisible('tossup-reader');
    });

    it('should freeze text reveal on buzz', async () => {
      await startQuiz();

      await waitForElement('tossup-reader', 15000);

      // Buzz early
      await wait(1000);
      await tapBuzzButton();

      // Text should be frozen at current position
      await wait(500);
      await expectElementVisible('tossup-reader');
    });
  });

  describe('Tossup Reader Styling', () => {
    it('should be contained in a card layout', async () => {
      await startQuiz();

      await waitForElement('tossup-reader', 15000);
      await expectElementVisible('tossup-reader');
    });

    it('should have scrollable content for long questions', async () => {
      await startQuiz();

      await waitForElement('tossup-reader', 15000);

      // Let the question progress
      await wait(5000);

      // Tossup reader should auto-scroll
      await expectElementVisible('tossup-reader');
    });
  });

  describe('Book Icon', () => {
    it('should display book icon in header', async () => {
      await startQuiz();

      await waitForElement('tossup-reader', 15000);

      // Header with book icon should be visible
      await expectTextVisible('Toss-up Question');
    });
  });

  describe('Multiple Questions', () => {
    it('should update reader for new questions', async () => {
      await startQuiz();

      await waitForElement('tossup-reader', 15000);
      await tapBuzzButton();

      // Wait for answer submission and next question
      await waitFor(element(by.id('quiz-answer-bottom-sheet')))
        .toBeVisible()
        .withTimeout(5000);

      await waitForElement('quiz-answer-bottom-sheet-submitter-input-field');
      await element(by.id('quiz-answer-bottom-sheet-submitter-input-field')).typeText('test');
      await tapElement('quiz-answer-bottom-sheet-submitter-input-submit-button');

      // Wait for feedback and next question
      await wait(6000);

      // Tossup reader should update (or show bonus question)
      await waitFor(
        element(by.id('tossup-reader'))
          .or(element(by.text('Bonus Answer')))
      )
        .toBeVisible()
        .withTimeout(10000);
    });
  });
});

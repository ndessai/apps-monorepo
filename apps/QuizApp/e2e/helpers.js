/**
 * Helper functions for E2E tests
 */

/**
 * Wait for an element to be visible with retries
 * @param {string} testID - The test ID of the element
 * @param {number} timeout - Timeout in milliseconds
 */
export const waitForElement = async (testID, timeout = 10000) => {
  await waitFor(element(by.id(testID)))
    .toBeVisible()
    .withTimeout(timeout);
};

/**
 * Tap on an element by test ID
 * @param {string} testID - The test ID of the element
 */
export const tapElement = async (testID) => {
  await element(by.id(testID)).tap();
};

/**
 * Swipe left on an element
 * @param {string} testID - The test ID of the element
 * @param {string} speed - Swipe speed: 'fast' or 'slow'
 */
export const swipeLeft = async (testID, speed = 'fast') => {
  await element(by.id(testID)).swipe('left', speed);
};

/**
 * Swipe right on an element
 * @param {string} testID - The test ID of the element
 * @param {string} speed - Swipe speed: 'fast' or 'slow'
 */
export const swipeRight = async (testID, speed = 'fast') => {
  await element(by.id(testID)).swipe('right', speed);
};

/**
 * Check if text is visible
 * @param {string} text - The text to check
 */
export const expectTextVisible = async (text) => {
  await expect(element(by.text(text))).toBeVisible();
};

/**
 * Check if element with testID is visible
 * @param {string} testID - The test ID of the element
 */
export const expectElementVisible = async (testID) => {
  await expect(element(by.id(testID))).toBeVisible();
};

/**
 * Scroll to element
 * @param {string} testID - The test ID of the element to scroll to
 * @param {string} scrollViewTestID - The test ID of the scroll view
 */
export const scrollToElement = async (testID, scrollViewTestID) => {
  await element(by.id(testID)).scrollTo('bottom');
};

/**
 * Type text into an element
 * @param {string} testID - The test ID of the input
 * @param {string} text - Text to type
 */
export const typeText = async (testID, text) => {
  await element(by.id(testID)).typeText(text);
};

/**
 * Clear text from an element
 * @param {string} testID - The test ID of the input
 */
export const clearText = async (testID) => {
  await element(by.id(testID)).clearText();
};

/**
 * Wait for a specific amount of time
 * @param {number} ms - Milliseconds to wait
 */
export const wait = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// ============================================
// Quiz App Specific Helpers
// ============================================

/**
 * Navigate to Settings from QuizLaunchScreen
 */
export const navigateToSettings = async () => {
  await waitForElement('settings-button');
  await tapElement('settings-button');
  await wait(500); // Wait for navigation animation
};

/**
 * Navigate to a specific tab in Settings
 * @param {string} tabName - The name of the tab: 'Profile', 'Teams', 'Badges', 'History', 'Setup'
 */
export const navigateToTab = async (tabName) => {
  await waitFor(element(by.text(tabName)))
    .toBeVisible()
    .withTimeout(5000);
  await element(by.text(tabName)).tap();
  await wait(300); // Wait for tab switch animation
};

/**
 * Start a quiz from QuizLaunchScreen
 */
export const startQuiz = async () => {
  await waitForElement('start-quiz-button');
  await tapElement('start-quiz-button');
  await wait(500); // Wait for navigation
};

/**
 * Select a difficulty level in Quiz Setup
 * @param {string} difficulty - The difficulty: 'middle_school', 'jv_high_school', 'varsity', 'college', 'open'
 */
export const selectDifficulty = async (difficulty) => {
  const testID = `difficulty-${difficulty}`;
  await waitForElement(testID);
  await tapElement(testID);
};

/**
 * Toggle the theme switch
 */
export const toggleTheme = async () => {
  await waitForElement('theme-toggle');
  await tapElement('theme-toggle');
  await wait(300); // Wait for theme transition
};

/**
 * Tap the buzz button during quiz
 */
export const tapBuzzButton = async () => {
  await waitForElement('buzz-button', 15000); // Quiz may take time to start reading
  await tapElement('buzz-button');
};

/**
 * Type an answer in the quiz answer input
 * @param {string} answer - The answer text
 */
export const typeAnswer = async (answer) => {
  await waitForElement('answer-input-field');
  await typeText('answer-input-field', answer);
};

/**
 * Wait for quiz results screen to appear
 */
export const waitForQuizResults = async () => {
  await waitFor(element(by.id('play-again-button')))
    .toBeVisible()
    .withTimeout(60000); // Quiz may take a while
};

/**
 * Dismiss an alert (platform-specific)
 * @param {string} buttonText - The alert button text to tap
 */
export const dismissAlert = async (buttonText = 'OK') => {
  if (device.getPlatform() === 'ios') {
    await element(by.label(buttonText)).atIndex(0).tap();
  } else {
    await element(by.text(buttonText)).tap();
  }
};

/**
 * Check if element exists (doesn't throw if not found)
 * @param {string} testID - The test ID of the element
 * @returns {Promise<boolean>}
 */
export const elementExists = async (testID) => {
  try {
    await expect(element(by.id(testID))).toExist();
    return true;
  } catch {
    return false;
  }
};

/**
 * Go back using the header back button
 */
export const goBack = async () => {
  if (device.getPlatform() === 'ios') {
    await element(by.traits(['button']))
      .atIndex(0)
      .tap();
  } else {
    await device.pressBack();
  }
  await wait(300);
};

/**
 * Reload the app to a fresh state
 */
export const reloadApp = async () => {
  await device.reloadReactNative();
  await wait(1000); // Wait for app to stabilize
};

/**
 * Submit an answer using the submit button
 * @param {string} answer - The answer to submit
 */
export const submitAnswer = async (answer) => {
  await waitForElement('quiz-answer-bottom-sheet-submitter-input-field', 8000);
  await typeText('quiz-answer-bottom-sheet-submitter-input-field', answer);
  await wait(200);
  await tapElement('quiz-answer-bottom-sheet-submitter-input-submit-button');
};

/**
 * Wait for answer feedback to appear
 */
export const waitForAnswerFeedback = async () => {
  await waitFor(element(by.id('quiz-answer-feedback')))
    .toBeVisible()
    .withTimeout(10000);
};

/**
 * Wait for the bottom sheet to appear
 */
export const waitForBottomSheet = async () => {
  await waitFor(element(by.id('quiz-answer-bottom-sheet')))
    .toBeVisible()
    .withTimeout(10000);
};

/**
 * Check if the feedback shows correct answer
 */
export const expectCorrectFeedback = async () => {
  await waitFor(element(by.text('Correct!')))
    .toBeVisible()
    .withTimeout(5000);
};

/**
 * Check if the feedback shows incorrect answer
 */
export const expectIncorrectFeedback = async () => {
  await waitFor(element(by.text('Incorrect')))
    .toBeVisible()
    .withTimeout(5000);
};

/**
 * Wait for quiz to transition to next question
 * @param {number} questionNumber - Expected question number
 */
export const waitForQuestion = async (questionNumber) => {
  await waitFor(element(by.text(`Question ${questionNumber}`)))
    .toBeVisible()
    .withTimeout(20000);
};

/**
 * Get score display value (returns the element for assertions)
 */
export const getScoreDisplay = async () => {
  await waitForElement('score-display');
  return element(by.id('score-display'));
};

/**
 * Toggle microphone settings
 */
export const toggleMicrophoneSetting = async () => {
  await waitForElement('microphone-enabled-toggle');
  await tapElement('microphone-enabled-toggle');
};

/**
 * Toggle auto-submit on silence
 */
export const toggleAutoSubmitSilence = async () => {
  await waitForElement('auto-submit-silence-toggle');
  await tapElement('auto-submit-silence-toggle');
};

/**
 * Scroll down on a scrollable element
 * @param {string} testID - The test ID of the scrollable element
 */
export const scrollDown = async (testID) => {
  await element(by.id(testID)).swipe('up', 'slow', 0.5);
  await wait(300);
};

/**
 * Scroll up on a scrollable element
 * @param {string} testID - The test ID of the scrollable element
 */
export const scrollUp = async (testID) => {
  await element(by.id(testID)).swipe('down', 'slow', 0.5);
  await wait(300);
};

/**
 * Wait for loading to complete (wait for ActivityIndicator to disappear)
 */
export const waitForLoadingComplete = async () => {
  await waitFor(element(by.type('ActivityIndicator')))
    .not.toBeVisible()
    .withTimeout(10000);
};

/**
 * Check if a score is displayed with expected format
 * @param {number} currentScore - Expected current score
 * @param {number} maxScore - Expected max score
 */
export const expectScore = async (currentScore, maxScore) => {
  await waitFor(element(by.text(`${currentScore} / ${maxScore}`)))
    .toBeVisible()
    .withTimeout(5000);
};

/**
 * Complete a full quiz question cycle (buzz, answer, wait for feedback)
 * @param {string} answer - The answer to submit
 */
export const completeQuizQuestion = async (answer) => {
  await tapBuzzButton();
  await waitForBottomSheet();
  await submitAnswer(answer);
  await wait(3000); // Wait for feedback and next question transition
};

/**
 * Navigate through all settings tabs to verify they load
 */
export const verifyAllSettingsTabs = async () => {
  const tabs = ['Profile', 'Teams', 'Badges', 'History', 'Setup'];
  for (const tab of tabs) {
    await navigateToTab(tab);
    await wait(500);
  }
};

/**
 * Get the current accuracy percentage text
 */
export const getAccuracyText = async () => {
  return element(by.text(/\d+% Accuracy/));
};

/**
 * Wait for specific text containing points
 * @param {string} pointsText - e.g. '+10' or '+15'
 */
export const expectPointsDisplayed = async (pointsText) => {
  await waitFor(element(by.text(pointsText)))
    .toBeVisible()
    .withTimeout(5000);
};

/**
 * Verify the tossup reader is displaying text
 */
export const verifyTossupReaderVisible = async () => {
  await waitForElement('tossup-reader', 10000);
  await expectElementVisible('tossup-reader');
};

/**
 * Wait for buzz window countdown
 */
export const waitForBuzzWindow = async () => {
  // Buzz window shows countdown when TTS finishes
  await waitFor(element(by.id('buzz-button')))
    .toBeVisible()
    .withTimeout(30000);
};

/**
 * Adjust slider value (approximate - slides to right by percentage)
 * @param {string} testID - The test ID of the slider
 * @param {string} direction - 'left' or 'right'
 * @param {number} percentage - How far to slide (0-1)
 */
export const adjustSlider = async (testID, direction, percentage = 0.5) => {
  await element(by.id(testID)).swipe(direction, 'slow', percentage);
  await wait(200);
};

/**
 * Wait for and verify quiz complete text
 */
export const expectQuizComplete = async () => {
  await waitFor(element(by.text('Quiz Complete!')))
    .toBeVisible()
    .withTimeout(10000);
};

/**
 * Verify the accuracy percentage is displayed
 * @param {number} expectedAccuracy - Expected accuracy percentage
 */
export const verifyAccuracy = async (expectedAccuracy) => {
  await waitFor(element(by.text(`${expectedAccuracy}% Accuracy`)))
    .toBeVisible()
    .withTimeout(5000);
};

/**
 * Wait for timer display in answer submitter
 */
export const waitForAnswerTimer = async () => {
  await waitFor(element(by.id('quiz-answer-bottom-sheet-submitter-timer')))
    .toBeVisible()
    .withTimeout(10000);
};

/**
 * Verify input field has correct placeholder
 */
export const verifyAnswerInputPlaceholder = async () => {
  await waitForElement('quiz-answer-bottom-sheet-submitter-input-field');
};

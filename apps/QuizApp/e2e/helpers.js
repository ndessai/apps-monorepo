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

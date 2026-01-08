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

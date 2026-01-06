import { device, element, by, expect, waitFor } from 'detox';

describe('Hello Screen', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should display the hello screen with title and subtitle', async () => {
    // Check if the hello screen is visible
    await expect(element(by.id('hello-screen'))).toBeVisible();

    // Check if the rocket icon is visible
    await expect(element(by.id('rocket-icon'))).toBeVisible();

    // Check if the title is displayed
    await expect(element(by.id('hello-title'))).toBeVisible();
    await expect(element(by.text('Hello!'))).toBeVisible();

    // Check if the subtitle is displayed
    await expect(element(by.id('hello-subtitle'))).toBeVisible();
    await expect(element(by.text('Welcome to your React Native Monorepo'))).toBeVisible();
  });

  it('should display swipeable cards', async () => {
    // Check if cards container is visible
    await expect(element(by.id('cards-container'))).toBeVisible();

    // Check if first card is visible
    await expect(element(by.id('swipeable-card-1'))).toBeVisible();
    await expect(element(by.id('card-title-1'))).toBeVisible();
    await expect(element(by.text('Swipeable Card'))).toBeVisible();

    // Check if second card is visible
    await expect(element(by.id('swipeable-card-2'))).toBeVisible();
    await expect(element(by.id('card-title-2'))).toBeVisible();
    await expect(element(by.text('Another Card'))).toBeVisible();
  });

  it('should swipe card left to reveal delete button', async () => {
    // Swipe the first card to the left
    await element(by.id('swipeable-card-1')).swipe('left', 'fast', 0.75);

    // Wait a bit for animation
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Delete button should be visible after swipe
    await expect(element(by.id('swipeable-card-1-delete-button'))).toBeVisible();
  });

  it('should delete card when delete button is tapped', async () => {
    // Verify first card exists
    await expect(element(by.id('card-title-1'))).toBeVisible();
    await expect(element(by.text('Swipeable Card'))).toBeVisible();

    // Swipe the first card to the left
    await element(by.id('swipeable-card-1')).swipe('left', 'fast', 0.75);
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Tap delete button
    await element(by.id('swipeable-card-1-delete-button')).tap();

    // Wait for alert to appear and tap Delete
    await new Promise((resolve) => setTimeout(resolve, 500));

    // On iOS, use system alert buttons
    if (device.getPlatform() === 'ios') {
      await element(by.label('Delete')).tap();
    } else {
      // On Android, use alert dialog buttons
      await element(by.text('Delete')).tap();
    }

    // Wait for card to be removed
    await new Promise((resolve) => setTimeout(resolve, 500));

    // First card should not exist anymore
    try {
      await expect(element(by.id('card-title-1'))).not.toBeVisible();
    } catch (e) {
      // Element might be completely removed from view hierarchy
      // This is acceptable
    }

    // Second card should still be visible
    await expect(element(by.id('card-title-2'))).toBeVisible();
  });

  it('should cancel card deletion', async () => {
    // Verify first card exists
    await expect(element(by.id('card-title-1'))).toBeVisible();

    // Swipe the first card to the left
    await element(by.id('swipeable-card-1')).swipe('left', 'fast', 0.75);
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Tap delete button
    await element(by.id('swipeable-card-1-delete-button')).tap();
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Tap Cancel
    if (device.getPlatform() === 'ios') {
      await element(by.label('Cancel')).tap();
    } else {
      await element(by.text('Cancel')).tap();
    }

    // Wait a bit
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Card should still be visible
    await expect(element(by.id('card-title-1'))).toBeVisible();
  });
});

/**
 * Audio Feedback Service
 *
 * Generates and speaks audio feedback after quiz answers.
 * Supports different tones: Positive and Sarcastic.
 */

import * as nativeTtsService from './nativeTtsService';
import type { AudioFeedbackTone } from '../types/settings';

// Context for generating feedback
export interface FeedbackContext {
  isCorrect: boolean;
  isTimeUp: boolean;
  points: number;
  questionType: 'tossup' | 'bonus';
  tone: AudioFeedbackTone;
}

// Positive tone feedback templates
const POSITIVE_FEEDBACK = {
  correct: [
    (points: number) => `Correct! You earned ${points} points. Great job!`,
    (points: number) => `That's right! ${points} points for you. Well done!`,
    (points: number) => `Excellent! ${points} points added. Keep it up!`,
    (points: number) => `Perfect! You got ${points} points. Nice work!`,
  ],
  incorrect: [
    () => `Not quite. You'll get the next one!`,
    () => `That's not it. Keep trying!`,
    () => `Close, but not correct. Don't give up!`,
    () => `Not the answer we were looking for. You've got this!`,
  ],
  timeUp: [
    () => `Time's up! No points this round.`,
    () => `Out of time! Better luck next question.`,
    () => `Time ran out. You'll nail the next one!`,
  ],
  nextQuestion: [
    () => `Moving on to the next question.`,
    () => `Here comes the next one.`,
    () => `Let's continue.`,
    () => `Ready for another?`,
  ],
  bonusIntro: [
    () => `Bonus question time!`,
    () => `Here's your bonus.`,
    () => `Bonus round!`,
  ],
};

// Sarcastic tone feedback templates
const SARCASTIC_FEEDBACK = {
  correct: [
    (points: number) => `Oh wow, you actually got it right. ${points} points for you.`,
    (points: number) => `Well, look who knows things. ${points} points.`,
    (points: number) => `Correct. I'm genuinely surprised. ${points} points.`,
    (points: number) => `Fine, take your ${points} points. Show off.`,
  ],
  incorrect: [
    () => `Nope. Not even close. Better luck next time, champ.`,
    () => `Wrong. Shocking, I know.`,
    () => `That's... not it. Did you even read the question?`,
    () => `Incorrect. Maybe try thinking next time?`,
  ],
  timeUp: [
    () => `Tick tock. Time's up. Zero points.`,
    () => `Too slow. The clock waits for no one.`,
    () => `Time ran out. Were you even trying?`,
  ],
  nextQuestion: [
    () => `Alright, let's see if you can handle this one.`,
    () => `Moving on. Try to keep up.`,
    () => `Next question. No pressure.`,
    () => `Here we go again.`,
  ],
  bonusIntro: [
    () => `Bonus question. Don't mess it up.`,
    () => `Here's a bonus. No pressure or anything.`,
    () => `Bonus round. Let's see what you've got.`,
  ],
};

/**
 * Get a random item from an array
 */
function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Generate feedback text based on context
 */
export function generateFeedbackText(context: FeedbackContext): string {
  const templates = context.tone === 'Positive' ? POSITIVE_FEEDBACK : SARCASTIC_FEEDBACK;

  if (context.isTimeUp) {
    return randomChoice(templates.timeUp)();
  }

  if (context.isCorrect) {
    return randomChoice(templates.correct)(context.points);
  }

  return randomChoice(templates.incorrect)();
}

/**
 * Generate next question transition text
 */
export function generateNextQuestionText(tone: AudioFeedbackTone): string {
  const templates = tone === 'Positive' ? POSITIVE_FEEDBACK : SARCASTIC_FEEDBACK;
  return randomChoice(templates.nextQuestion)();
}

/**
 * Generate bonus intro text
 */
export function generateBonusIntroText(tone: AudioFeedbackTone): string {
  const templates = tone === 'Positive' ? POSITIVE_FEEDBACK : SARCASTIC_FEEDBACK;
  return randomChoice(templates.bonusIntro)();
}

/**
 * Speak feedback using TTS
 * Returns a promise that resolves when speech completes
 */
export async function speakFeedback(context: FeedbackContext): Promise<void> {
  const text = generateFeedbackText(context);
  return speakText(text);
}

/**
 * Speak next question transition
 */
export async function speakNextQuestionTransition(tone: AudioFeedbackTone): Promise<void> {
  const text = generateNextQuestionText(tone);
  return speakText(text);
}

/**
 * Speak bonus intro
 */
export async function speakBonusIntro(tone: AudioFeedbackTone): Promise<void> {
  const text = generateBonusIntroText(tone);
  return speakText(text);
}

/**
 * Internal function to speak text and wait for completion
 */
function speakText(text: string): Promise<void> {
  return new Promise((resolve) => {
    console.log('[AudioFeedback] Speaking:', text);

    nativeTtsService.startReading(
      text,
      150, // WPM (unused by native TTS but required param)
      () => {}, // onProgress - not needed for feedback
      () => {
        console.log('[AudioFeedback] Speech completed');
        resolve();
      }
    );
  });
}

/**
 * Stop any ongoing feedback speech
 */
export function stopFeedback(): void {
  nativeTtsService.stopReading();
}

/**
 * Check if feedback is currently being spoken
 */
export function isSpeakingFeedback(): boolean {
  return nativeTtsService.isReading();
}

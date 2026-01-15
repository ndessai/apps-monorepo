/**
 * Audio Feedback Service
 *
 * Generates and speaks audio feedback after quiz answers.
 * Supports different tones: Positive and Sarcastic.
 */

import * as nativeTtsService from './nativeTtsService';
import type { VoiceType } from './nativeTtsService';
import type { AudioFeedbackTone } from '../types/settings';

/**
 * Map AudioFeedbackTone to VoiceType for TTS
 */
function getVoiceTypeForTone(tone: AudioFeedbackTone): VoiceType {
  switch (tone) {
    case 'Positive':
      return 'positiveFeedback';
    case 'Sarcastic':
      return 'sarcasticFeedback';
    default:
      return 'standard';
  }
}

// Context for generating feedback
export interface FeedbackContext {
  isCorrect: boolean;
  isTimeUp: boolean;
  points: number;
  questionType: 'tossup' | 'bonus';
  tone: AudioFeedbackTone;
  userAnswer?: string | null;
  correctAnswer?: string;
}

// Template function types
type CorrectTemplate = (userAnswer: string, points: number) => string;
type IncorrectTemplate = (userAnswer: string, correctAnswer: string) => string;
type TimeUpTemplate = (correctAnswer: string) => string;
type SimpleTemplate = () => string;

// Positive tone feedback templates
const POSITIVE_FEEDBACK = {
  correct: [
    (userAnswer: string, points: number) => `Your answer "${userAnswer}" is correct! You earned ${points} points. Great job!`,
    (userAnswer: string, points: number) => `"${userAnswer}" - that's right! ${points} points for you. Well done!`,
    (userAnswer: string, points: number) => `Excellent! "${userAnswer}" is correct. ${points} points added. Keep it up!`,
    (userAnswer: string, points: number) => `Perfect! "${userAnswer}" earns you ${points} points. Nice work!`,
  ] as CorrectTemplate[],
  incorrect: [
    (userAnswer: string, correctAnswer: string) => `Your answer "${userAnswer}" is incorrect. The correct answer is "${correctAnswer}". You'll get the next one!`,
    (userAnswer: string, correctAnswer: string) => `"${userAnswer}" is not quite right. It was "${correctAnswer}". Keep trying!`,
    (userAnswer: string, correctAnswer: string) => `Close, but "${userAnswer}" is incorrect. The answer was "${correctAnswer}". Don't give up!`,
    (userAnswer: string, correctAnswer: string) => `"${userAnswer}" wasn't the answer. It was "${correctAnswer}". You've got this!`,
  ] as IncorrectTemplate[],
  timeUp: [
    (correctAnswer: string) => `Time's up! The answer was "${correctAnswer}". No points this round.`,
    (correctAnswer: string) => `Out of time! It was "${correctAnswer}". Better luck next question.`,
    (correctAnswer: string) => `Time ran out. The correct answer was "${correctAnswer}". You'll nail the next one!`,
  ] as TimeUpTemplate[],
  nextQuestion: [
    () => `Moving on to the next question.`,
    () => `Here comes the next one.`,
    () => `Let's continue.`,
    () => `Ready for another?`,
  ] as SimpleTemplate[],
  bonusIntro: [
    () => `Bonus question time!`,
    () => `Here's your bonus.`,
    () => `Bonus round!`,
  ] as SimpleTemplate[],
};

// Sarcastic tone feedback templates
const SARCASTIC_FEEDBACK = {
  correct: [
    (userAnswer: string, points: number) => `Your answer "${userAnswer}" is actually correct. ${points} points for you. Color me impressed.`,
    (userAnswer: string, points: number) => `"${userAnswer}" - well, look who knows things. ${points} points.`,
    (userAnswer: string, points: number) => `"${userAnswer}" is correct. I'm genuinely surprised. ${points} points.`,
    (userAnswer: string, points: number) => `Fine, "${userAnswer}" is right. Take your ${points} points. Show off.`,
  ] as CorrectTemplate[],
  incorrect: [
    (userAnswer: string, correctAnswer: string) => `Your answer "${userAnswer}" is incorrect. It was "${correctAnswer}". Not even close, champ.`,
    (userAnswer: string, correctAnswer: string) => `"${userAnswer}"? Wrong. It was "${correctAnswer}". Shocking, I know.`,
    (userAnswer: string, correctAnswer: string) => `"${userAnswer}" is not it. The answer was "${correctAnswer}". Did you even read the question?`,
    (userAnswer: string, correctAnswer: string) => `Nope, "${userAnswer}" is incorrect. It was "${correctAnswer}". Maybe try thinking next time?`,
  ] as IncorrectTemplate[],
  timeUp: [
    (correctAnswer: string) => `Tick tock. Time's up. It was "${correctAnswer}". Zero points.`,
    (correctAnswer: string) => `Too slow. The answer was "${correctAnswer}". The clock waits for no one.`,
    (correctAnswer: string) => `Time ran out. It was "${correctAnswer}". Were you even trying?`,
  ] as TimeUpTemplate[],
  nextQuestion: [
    () => `Alright, let's see if you can handle this one.`,
    () => `Moving on. Try to keep up.`,
    () => `Next question. No pressure.`,
    () => `Here we go again.`,
  ] as SimpleTemplate[],
  bonusIntro: [
    () => `Bonus question. Don't mess it up.`,
    () => `Here's a bonus. No pressure or anything.`,
    () => `Bonus round. Let's see what you've got.`,
  ] as SimpleTemplate[],
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
  const userAnswer = context.userAnswer?.trim() || 'no answer';
  const correctAnswer = context.correctAnswer || 'the correct answer';

  if (context.isTimeUp) {
    return randomChoice(templates.timeUp)(correctAnswer);
  }

  if (context.isCorrect) {
    return randomChoice(templates.correct)(userAnswer, context.points);
  }

  return randomChoice(templates.incorrect)(userAnswer, correctAnswer);
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
  const voiceType = getVoiceTypeForTone(context.tone);
  return speakText(text, voiceType);
}

/**
 * Speak next question transition
 */
export async function speakNextQuestionTransition(tone: AudioFeedbackTone): Promise<void> {
  const text = generateNextQuestionText(tone);
  const voiceType = getVoiceTypeForTone(tone);
  return speakText(text, voiceType);
}

/**
 * Speak bonus intro
 */
export async function speakBonusIntro(tone: AudioFeedbackTone): Promise<void> {
  const text = generateBonusIntroText(tone);
  const voiceType = getVoiceTypeForTone(tone);
  return speakText(text, voiceType);
}

/**
 * Internal function to speak text and wait for completion
 */
function speakText(text: string, voiceType: VoiceType = 'standard'): Promise<void> {
  return new Promise((resolve) => {
    console.log(`[AudioFeedback] Speaking (${voiceType}):`, text);

    nativeTtsService.startReading(
      text,
      150, // WPM (unused by native TTS but required param)
      () => {}, // onProgress - not needed for feedback
      () => {
        console.log('[AudioFeedback] Speech completed');
        resolve();
      },
      voiceType
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

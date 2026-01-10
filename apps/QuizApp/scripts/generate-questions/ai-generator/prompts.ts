/**
 * AI Prompt Templates for Question Generation
 *
 * Templates for generating Human Body questions using AI
 */

import type { QuestionDifficulty } from '../types.js';

/**
 * Difficulty descriptions for prompts
 */
export const DIFFICULTY_DESCRIPTIONS: Record<QuestionDifficulty, string> = {
  middle_school: `middle school students (ages 11-14). Use straightforward vocabulary and focus on fundamental concepts that would be taught in a 6th-8th grade life science class. Questions should be answerable by students who have basic knowledge of human anatomy.`,

  high_school: `high school students (ages 14-18). Use appropriate scientific terminology and cover topics from a standard high school biology or anatomy course. Questions can include more specific details but should avoid college-level depth.`,

  college: `college students studying biology or pre-med. Use precise scientific terminology, include specific anatomical terms, and cover material from introductory college anatomy and physiology courses. Questions can reference specific studies, diseases, or mechanisms.`,

  open: `advanced competitors with expert knowledge. Questions should challenge even those with strong biology backgrounds, include obscure facts, historical medical context, or complex physiological mechanisms. Assume familiarity with medical terminology and advanced concepts.`,
};

/**
 * System prompt for question generation
 */
export const SYSTEM_PROMPT = `You are an expert quiz bowl question writer specializing in human anatomy and physiology. You create high-quality tossup and bonus questions following NAQT (National Academic Quiz Tournaments) format and style.

Key principles:
1. Questions progress from harder/more specific clues to easier/more general clues (pyramidal structure)
2. Each clue should be independently verifiable and factually accurate
3. Avoid clues that could apply to multiple answers
4. End tossups with "For ten points, name this..." or similar phrasing
5. Answers should be specific (organ names, processes, terms) rather than vague
6. DO NOT include questions about the reproductive system
7. Use proper scientific terminology appropriate for the difficulty level`;

/**
 * Tossup generation prompt
 */
export function getTossupPrompt(
  topic: string,
  subcategory: string,
  difficulty: QuestionDifficulty
): string {
  return `Generate a quiz bowl TOSSUP question about "${topic}" in the context of the human ${subcategory.toLowerCase()} system.

Target audience: ${DIFFICULTY_DESCRIPTIONS[difficulty]}

Requirements:
1. Write 3-5 sentences with pyramidal structure (harder clues first, easier clues last)
2. Include specific, verifiable facts (not vague or generic statements)
3. End with "For ten points, name this..." followed by a brief description
4. The answer should be a specific anatomical term, organ, process, or concept
5. Make the first 30-40% of the question the "power" portion with harder clues

Return your response as valid JSON with this exact structure:
{
  "question": "The full question text here...",
  "answer": "Primary Answer",
  "acceptableAnswers": ["Primary Answer", "Alternative 1", "Alternative 2"],
  "explanation": "Brief educational explanation of the answer"
}

Important: Return ONLY the JSON object, no additional text or markdown formatting.`;
}

/**
 * Bonus generation prompt
 */
export function getBonusPrompt(
  topic: string,
  subcategory: string,
  difficulty: QuestionDifficulty
): string {
  return `Generate a quiz bowl BONUS question (3 parts) about "${topic}" in the context of the human ${subcategory.toLowerCase()} system.

Target audience: ${DIFFICULTY_DESCRIPTIONS[difficulty]}

Requirements:
1. Include a brief leadin that introduces the topic
2. Create exactly 3 parts, each worth 10 points
3. Each part should be 1-2 sentences with a direct question
4. Parts should cover related but distinct aspects of the topic
5. Answers should be short (1-4 words each)
6. Parts can progress in difficulty or explore different facets

Return your response as valid JSON with this exact structure:
{
  "leadin": "For 10 points each, answer these questions about [topic].",
  "parts": [
    {
      "text": "First part question text...",
      "answer": "Answer 1",
      "acceptableAnswers": ["Answer 1", "Alt1"]
    },
    {
      "text": "Second part question text...",
      "answer": "Answer 2",
      "acceptableAnswers": ["Answer 2", "Alt2"]
    },
    {
      "text": "Third part question text...",
      "answer": "Answer 3",
      "acceptableAnswers": ["Answer 3", "Alt3"]
    }
  ]
}

Important: Return ONLY the JSON object, no additional text or markdown formatting.`;
}

/**
 * Batch generation prompt for efficiency
 */
export function getBatchTossupPrompt(
  topics: string[],
  subcategory: string,
  difficulty: QuestionDifficulty
): string {
  const topicList = topics.map((t, i) => `${i + 1}. ${t}`).join('\n');

  return `Generate ${topics.length} quiz bowl TOSSUP questions about the human ${subcategory.toLowerCase()} system.

Topics to cover:
${topicList}

Target audience: ${DIFFICULTY_DESCRIPTIONS[difficulty]}

Requirements for each question:
1. Write 3-5 sentences with pyramidal structure (harder clues first)
2. Include specific, verifiable facts
3. End with "For ten points, name this..."
4. Answers should be specific anatomical terms, organs, or processes

Return your response as a valid JSON array with this structure:
[
  {
    "topic": "Topic name",
    "question": "The full question text...",
    "answer": "Primary Answer",
    "acceptableAnswers": ["Primary Answer", "Alt1"],
    "explanation": "Brief explanation"
  },
  ...
]

Important: Return ONLY the JSON array, no additional text or markdown formatting.`;
}

/**
 * Validation prompt to check question quality
 */
export function getValidationPrompt(question: string, answer: string): string {
  return `Evaluate this quiz bowl question for accuracy and quality:

Question: ${question}
Expected Answer: ${answer}

Check for:
1. Factual accuracy - are all clues correct?
2. Unambiguous answer - does only one answer fit all clues?
3. Appropriate difficulty - are clues properly pyramidal?
4. No reproductive system content

Return JSON:
{
  "isValid": true/false,
  "issues": ["issue 1", "issue 2"] or [],
  "suggestedFixes": "Description of fixes if needed" or null
}`;
}

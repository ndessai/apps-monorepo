/**
 * Pyramidal Clue Builder
 * Builds clues for vocabulary tossups in NAQT pyramidal format
 * Clues are ordered from hardest (etymology) to easiest (definition)
 */

import type { VocabularyWord, VocabularyClue, ClueType, QuestionDifficulty } from '../types';

/** Clue template */
interface ClueTemplate {
  type: ClueType;
  generate: (word: VocabularyWord) => string | null;
  difficultyRank: number;
}

/** All available clue templates */
const CLUE_TEMPLATES: ClueTemplate[] = [
  // RANK 1: Etymology clue (hardest)
  {
    type: 'etymology',
    difficultyRank: 1,
    generate: (word) => {
      if (word.etymology.roots.length === 0) return null;
      const root = word.etymology.roots[0];
      const prefix = word.etymology.prefix;
      const suffix = word.etymology.suffix;

      let clue = `Derived from the ${root.language} "${root.root}" meaning "${root.meaning}"`;

      if (prefix) {
        clue += `, combined with the prefix "${prefix.prefix}" meaning "${prefix.meaning}"`;
      }

      if (suffix) {
        clue += `, this word uses the suffix "${suffix.suffix}"`;
      }

      // Add cognates if available
      if (word.etymology.cognates && word.etymology.cognates.length > 0) {
        clue += `. It is cognate with "${word.etymology.cognates[0]}"`;
      }

      return clue + '.';
    },
  },

  // RANK 2: Word family clue
  {
    type: 'word_family',
    difficultyRank: 2,
    generate: (word) => {
      if (word.relatedWords.length === 0) return null;
      const related = word.relatedWords.slice(0, 2);
      if (related.length === 1) {
        return `This word shares its root with "${related[0]}".`;
      }
      return `This word shares its root with "${related[0]}" and "${related[1]}".`;
    },
  },

  // RANK 3: Obscure synonym clue
  {
    type: 'obscure_synonym',
    difficultyRank: 3,
    generate: (word) => {
      // Try to find a less common synonym (usually later in the list)
      if (word.synonyms.length < 3) return null;
      const obscureSynonym = word.synonyms[word.synonyms.length - 1];
      return `Sometimes described as "${obscureSynonym}", this ${word.partOfSpeech} describes a particular quality.`;
    },
  },

  // RANK 4: Usage context clue
  {
    type: 'usage_context',
    difficultyRank: 4,
    generate: (word) => {
      const categoryContext = getCategoryContext(word.category, word.subcategory);

      let clue = `Often used ${categoryContext}`;

      if (word.usageNotes) {
        clue += `. ${word.usageNotes}`;
      }

      return clue;
    },
  },

  // RANK 5: Common synonym clue
  {
    type: 'common_synonym',
    difficultyRank: 5,
    generate: (word) => {
      if (word.synonyms.length === 0) return null;
      const synonym = word.synonyms[0];
      const antonym = word.antonyms?.[0];

      let clue = `This ${word.partOfSpeech} is synonymous with "${synonym}"`;

      if (antonym) {
        clue += ` and antonymous with "${antonym}"`;
      }

      return clue + '.';
    },
  },

  // RANK 6: Example sentence clue
  {
    type: 'example_sentence',
    difficultyRank: 6,
    generate: (word) => {
      if (word.exampleSentences.length === 0) return null;
      // Create a fill-in-the-blank style clue
      const sentence = word.exampleSentences[0];
      const blankedSentence = sentence.replace(
        new RegExp(word.word, 'gi'),
        '[BLANK]'
      );
      return `In the sentence: "${blankedSentence}"`;
    },
  },

  // RANK 7: Antonym clue
  {
    type: 'antonym',
    difficultyRank: 7,
    generate: (word) => {
      if (!word.antonyms || word.antonyms.length === 0) return null;
      const antonyms = word.antonyms.slice(0, 2);
      if (antonyms.length === 1) {
        return `The opposite of "${antonyms[0]}",`;
      }
      return `The opposite of both "${antonyms[0]}" and "${antonyms[1]}",`;
    },
  },

  // RANK 8: Definition hint (easiest, used in giveaway)
  {
    type: 'definition',
    difficultyRank: 8,
    generate: (word) => {
      return `For ten points, name this ${word.partOfSpeech} meaning "${word.definition}".`;
    },
  },
];

/** Get context description for a category */
function getCategoryContext(category: string, subcategory: string): string {
  const contexts: Record<string, Record<string, string>> = {
    HumanBehavior: {
      PersonalityTraits: 'to describe inherent character traits',
      CharacterFlaws: 'to describe negative moral qualities',
      Virtues: 'to describe positive moral qualities',
      IntellectualQualities: 'in academic or intellectual contexts',
      SocialBehaviors: 'to describe interpersonal conduct',
      AttitudesDispositions: 'to describe temperament and outlook',
    },
    EmotionsFeelings: {
      PositiveEmotions: 'to describe pleasant emotional states',
      NegativeEmotions: 'to describe unpleasant emotional states',
      ComplexEmotions: 'to describe nuanced emotional experiences',
      Moods: 'to describe extended emotional states',
      EmotionalStates: 'to describe general emotional conditions',
    },
    MedicalScientific: {
      MedicalPractitioners: 'in medical and healthcare contexts',
      Diseases: 'in clinical or pathological discussions',
      ScientificTerms: 'in scientific literature',
      AnatomicalTerms: 'in anatomical or medical contexts',
      PsychologicalTerms: 'in psychological or psychiatric contexts',
    },
    LiteraryArtistic: {
      LiteraryDevices: 'in literary analysis and criticism',
      ArtisticStyles: 'in art history and criticism',
      CriticalTerms: 'in literary and cultural criticism',
      GenreTerms: 'to describe literary forms and genres',
      RhetoricalTerms: 'in rhetoric and persuasive writing',
    },
    AbstractConcepts: {
      PhilosophicalTerms: 'in philosophical discourse',
      TimeRelated: 'to describe temporal concepts',
      QualityDescriptors: 'to describe essential qualities',
      RelationshipTerms: 'to describe connections between concepts',
      StateOfBeing: 'to describe conditions of existence',
    },
    ActionsVerbs: {
      Communication: 'to describe acts of speaking or expressing',
      Movement: 'to describe physical actions or motion',
      CognitiveActions: 'to describe mental processes',
      InterpersonalActions: 'to describe social interactions',
      TransformativeActions: 'to describe processes of change',
    },
  };

  return contexts[category]?.[subcategory] || 'in formal writing and speech';
}

/** Build pyramidal clues for a vocabulary word */
export function buildPyramidalClues(
  word: VocabularyWord,
  difficulty: QuestionDifficulty
): VocabularyClue[] {
  const clues: VocabularyClue[] = [];

  // Adjust how many clues based on difficulty
  const maxClues = difficulty === 'middle_school' ? 3 :
    difficulty === 'high_school' ? 4 :
      difficulty === 'college' ? 5 : 6;

  // Try to generate clues in order of difficulty
  for (const template of CLUE_TEMPLATES) {
    if (clues.length >= maxClues - 1) break; // Leave room for definition giveaway

    // Skip harder clues for easier difficulties
    if (difficulty === 'middle_school' && template.difficultyRank <= 2) continue;
    if (difficulty === 'high_school' && template.difficultyRank <= 1) continue;

    const clueText = template.generate(word);
    if (clueText) {
      clues.push({
        type: template.type,
        text: clueText,
        difficultyRank: template.difficultyRank,
      });
    }
  }

  // Always add definition giveaway at the end
  const definitionTemplate = CLUE_TEMPLATES.find(t => t.type === 'definition');
  if (definitionTemplate) {
    const definitionClue = definitionTemplate.generate(word);
    if (definitionClue) {
      clues.push({
        type: 'definition',
        text: definitionClue,
        difficultyRank: 8,
      });
    }
  }

  // Sort by difficulty rank (hardest first)
  return clues.sort((a, b) => a.difficultyRank - b.difficultyRank);
}

/** Assemble clues into full question text */
export function assembleQuestionText(clues: VocabularyClue[]): string {
  return clues.map(clue => clue.text).join(' ');
}

/** Calculate power mark position (where 15pt answer becomes 10pt) */
export function calculatePowerMarkPosition(questionText: string, ratio: number = 0.35): number {
  // Power mark should be approximately at the given ratio through the question
  const targetPosition = Math.floor(questionText.length * ratio);

  // Find a natural break point (end of sentence) near the target
  let bestPosition = targetPosition;

  // Look for periods, question marks, or sentence endings
  for (let i = targetPosition - 20; i < targetPosition + 30 && i < questionText.length; i++) {
    if (i >= 0 && (questionText[i] === '.' || questionText[i] === ',' || questionText[i] === ';')) {
      if (Math.abs(i - targetPosition) < Math.abs(bestPosition - targetPosition)) {
        bestPosition = i + 1;
      }
    }
  }

  return bestPosition;
}

/** Build explanation for after the question is answered */
export function buildExplanation(word: VocabularyWord): string {
  const parts: string[] = [];

  // Word and pronunciation
  parts.push(`${word.word.toUpperCase()} (${word.pronunciation})`);

  // Definition
  parts.push(`Definition: ${word.definition}`);

  // Etymology
  if (word.etymology.narrative) {
    parts.push(`Etymology: ${word.etymology.narrative}`);
  }

  // Example sentence
  if (word.exampleSentences.length > 0) {
    parts.push(`Example: "${word.exampleSentences[0]}"`);
  }

  // Mnemonic if available
  if (word.mnemonic) {
    parts.push(`Memory tip: ${word.mnemonic}`);
  }

  return parts.join('\n\n');
}

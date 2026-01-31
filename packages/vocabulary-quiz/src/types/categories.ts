/**
 * Vocabulary Category Taxonomy
 * Based on Word Power Made Easy and Six Weeks to Words of Power organization
 */

/** Main vocabulary categories */
export type VocabularyCategory =
  | 'HumanBehavior'
  | 'EmotionsFeelings'
  | 'MedicalScientific'
  | 'LiteraryArtistic'
  | 'AbstractConcepts'
  | 'ActionsVerbs';

/** Human Behavior subcategories */
export type HumanBehaviorSubcategory =
  | 'PersonalityTraits'
  | 'CharacterFlaws'
  | 'Virtues'
  | 'IntellectualQualities'
  | 'SocialBehaviors'
  | 'AttitudesDispositions';

/** Emotions & Feelings subcategories */
export type EmotionsFeelingsSubcategory =
  | 'PositiveEmotions'
  | 'NegativeEmotions'
  | 'ComplexEmotions'
  | 'Moods'
  | 'EmotionalStates';

/** Medical & Scientific subcategories */
export type MedicalScientificSubcategory =
  | 'MedicalPractitioners'
  | 'Diseases'
  | 'ScientificTerms'
  | 'AnatomicalTerms'
  | 'PsychologicalTerms';

/** Literary & Artistic subcategories */
export type LiteraryArtisticSubcategory =
  | 'LiteraryDevices'
  | 'ArtisticStyles'
  | 'CriticalTerms'
  | 'GenreTerms'
  | 'RhetoricalTerms';

/** Abstract Concepts subcategories */
export type AbstractConceptsSubcategory =
  | 'PhilosophicalTerms'
  | 'TimeRelated'
  | 'QualityDescriptors'
  | 'RelationshipTerms'
  | 'StateOfBeing';

/** Actions & Verbs subcategories */
export type ActionsVerbsSubcategory =
  | 'Communication'
  | 'Movement'
  | 'CognitiveActions'
  | 'InterpersonalActions'
  | 'TransformativeActions';

/** Union of all subcategories */
export type VocabularySubcategory =
  | HumanBehaviorSubcategory
  | EmotionsFeelingsSubcategory
  | MedicalScientificSubcategory
  | LiteraryArtisticSubcategory
  | AbstractConceptsSubcategory
  | ActionsVerbsSubcategory;

/** Subcategory definition with metadata */
export interface SubcategoryDefinition {
  key: VocabularySubcategory;
  displayName: string;
  description: string;
}

/** Category definition with metadata */
export interface CategoryDefinition {
  category: VocabularyCategory;
  displayName: string;
  description: string;
  subcategories: SubcategoryDefinition[];
}

/** Category to subcategory mapping */
export const CATEGORY_SUBCATEGORY_MAP: Record<VocabularyCategory, VocabularySubcategory[]> = {
  HumanBehavior: [
    'PersonalityTraits',
    'CharacterFlaws',
    'Virtues',
    'IntellectualQualities',
    'SocialBehaviors',
    'AttitudesDispositions',
  ],
  EmotionsFeelings: [
    'PositiveEmotions',
    'NegativeEmotions',
    'ComplexEmotions',
    'Moods',
    'EmotionalStates',
  ],
  MedicalScientific: [
    'MedicalPractitioners',
    'Diseases',
    'ScientificTerms',
    'AnatomicalTerms',
    'PsychologicalTerms',
  ],
  LiteraryArtistic: [
    'LiteraryDevices',
    'ArtisticStyles',
    'CriticalTerms',
    'GenreTerms',
    'RhetoricalTerms',
  ],
  AbstractConcepts: [
    'PhilosophicalTerms',
    'TimeRelated',
    'QualityDescriptors',
    'RelationshipTerms',
    'StateOfBeing',
  ],
  ActionsVerbs: [
    'Communication',
    'Movement',
    'CognitiveActions',
    'InterpersonalActions',
    'TransformativeActions',
  ],
};

/** All category definitions with full metadata */
export const VOCABULARY_CATEGORIES: CategoryDefinition[] = [
  {
    category: 'HumanBehavior',
    displayName: 'Human Behavior & Personality',
    description: 'Words describing personality traits, character qualities, and behavioral patterns',
    subcategories: [
      { key: 'PersonalityTraits', displayName: 'Personality Traits', description: 'Inherent character characteristics' },
      { key: 'CharacterFlaws', displayName: 'Character Flaws', description: 'Negative moral qualities' },
      { key: 'Virtues', displayName: 'Virtues', description: 'Positive moral qualities' },
      { key: 'IntellectualQualities', displayName: 'Intellectual Qualities', description: 'Mental capabilities and wisdom' },
      { key: 'SocialBehaviors', displayName: 'Social Behaviors', description: 'Interpersonal conduct patterns' },
      { key: 'AttitudesDispositions', displayName: 'Attitudes & Dispositions', description: 'Temperament and outlook' },
    ],
  },
  {
    category: 'EmotionsFeelings',
    displayName: 'Emotions & Feelings',
    description: 'Words describing emotional states, moods, and feelings',
    subcategories: [
      { key: 'PositiveEmotions', displayName: 'Positive Emotions', description: 'Pleasant emotional states' },
      { key: 'NegativeEmotions', displayName: 'Negative Emotions', description: 'Unpleasant emotional states' },
      { key: 'ComplexEmotions', displayName: 'Complex Emotions', description: 'Nuanced emotional states' },
      { key: 'Moods', displayName: 'Moods', description: 'Extended emotional states' },
      { key: 'EmotionalStates', displayName: 'Emotional States', description: 'General emotional conditions' },
    ],
  },
  {
    category: 'MedicalScientific',
    displayName: 'Medical & Scientific Terms',
    description: 'Words from medicine, science, and healthcare',
    subcategories: [
      { key: 'MedicalPractitioners', displayName: 'Medical Practitioners', description: 'Types of medical specialists' },
      { key: 'Diseases', displayName: 'Diseases & Conditions', description: 'Medical conditions and pathology' },
      { key: 'ScientificTerms', displayName: 'Scientific Terms', description: 'General scientific vocabulary' },
      { key: 'AnatomicalTerms', displayName: 'Anatomical Terms', description: 'Body-related terminology' },
      { key: 'PsychologicalTerms', displayName: 'Psychological Terms', description: 'Mental health vocabulary' },
    ],
  },
  {
    category: 'LiteraryArtistic',
    displayName: 'Literary & Artistic Terms',
    description: 'Words from literature, rhetoric, and the arts',
    subcategories: [
      { key: 'LiteraryDevices', displayName: 'Literary Devices', description: 'Figures of speech and techniques' },
      { key: 'ArtisticStyles', displayName: 'Artistic Styles', description: 'Art movements and styles' },
      { key: 'CriticalTerms', displayName: 'Critical Terms', description: 'Literary criticism vocabulary' },
      { key: 'GenreTerms', displayName: 'Genre Terms', description: 'Literary genres and forms' },
      { key: 'RhetoricalTerms', displayName: 'Rhetorical Terms', description: 'Rhetoric and persuasion' },
    ],
  },
  {
    category: 'AbstractConcepts',
    displayName: 'Abstract Concepts',
    description: 'Words describing abstract ideas, states, and qualities',
    subcategories: [
      { key: 'PhilosophicalTerms', displayName: 'Philosophical Terms', description: 'Philosophy vocabulary' },
      { key: 'TimeRelated', displayName: 'Time-Related', description: 'Temporal concepts' },
      { key: 'QualityDescriptors', displayName: 'Quality Descriptors', description: 'Abstract quality words' },
      { key: 'RelationshipTerms', displayName: 'Relationship Terms', description: 'Connection and opposition' },
      { key: 'StateOfBeing', displayName: 'State of Being', description: 'Existence and condition' },
    ],
  },
  {
    category: 'ActionsVerbs',
    displayName: 'Actions & Verbs',
    description: 'Words describing actions, processes, and behaviors',
    subcategories: [
      { key: 'Communication', displayName: 'Communication', description: 'Speaking and expressing' },
      { key: 'Movement', displayName: 'Movement', description: 'Physical actions' },
      { key: 'CognitiveActions', displayName: 'Cognitive Actions', description: 'Thinking and reasoning' },
      { key: 'InterpersonalActions', displayName: 'Interpersonal Actions', description: 'Social actions' },
      { key: 'TransformativeActions', displayName: 'Transformative Actions', description: 'Changing and affecting' },
    ],
  },
];

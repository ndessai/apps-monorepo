/**
 * Common Suffixes Database
 * Based on Word Power Made Easy and vocabulary building resources
 */

import type { SuffixInfo } from '../../types';

export const SUFFIXES: SuffixInfo[] = [
  // Noun-forming suffixes
  { id: 'suf-tion', suffix: '-tion', meaning: 'act, state, result of', language: 'Latin', partOfSpeechResult: 'noun', examples: ['action', 'creation', 'education', 'information'] },
  { id: 'suf-sion', suffix: '-sion', meaning: 'act, state, result of', language: 'Latin', partOfSpeechResult: 'noun', examples: ['decision', 'confusion', 'tension', 'expansion'] },
  { id: 'suf-ment', suffix: '-ment', meaning: 'action, result, state', language: 'Latin', partOfSpeechResult: 'noun', examples: ['government', 'movement', 'development', 'judgment'] },
  { id: 'suf-ness', suffix: '-ness', meaning: 'state, quality of being', language: 'Old English', partOfSpeechResult: 'noun', examples: ['happiness', 'kindness', 'darkness', 'sadness'] },
  { id: 'suf-ity', suffix: '-ity', meaning: 'state, quality', language: 'Latin', partOfSpeechResult: 'noun', examples: ['reality', 'ability', 'curiosity', 'complexity'] },
  { id: 'suf-ty', suffix: '-ty', meaning: 'state, quality', language: 'Latin', partOfSpeechResult: 'noun', examples: ['certainty', 'liberty', 'novelty', 'safety'] },
  { id: 'suf-ance', suffix: '-ance', meaning: 'state, quality, action', language: 'Latin', partOfSpeechResult: 'noun', examples: ['tolerance', 'performance', 'appearance', 'distance'] },
  { id: 'suf-ence', suffix: '-ence', meaning: 'state, quality, action', language: 'Latin', partOfSpeechResult: 'noun', examples: ['confidence', 'patience', 'violence', 'experience'] },
  { id: 'suf-dom', suffix: '-dom', meaning: 'state, realm, condition', language: 'Old English', partOfSpeechResult: 'noun', examples: ['freedom', 'kingdom', 'wisdom', 'boredom'] },
  { id: 'suf-hood', suffix: '-hood', meaning: 'state, condition', language: 'Old English', partOfSpeechResult: 'noun', examples: ['childhood', 'neighborhood', 'brotherhood', 'likelihood'] },
  { id: 'suf-ship', suffix: '-ship', meaning: 'state, position, skill', language: 'Old English', partOfSpeechResult: 'noun', examples: ['friendship', 'leadership', 'relationship', 'citizenship'] },
  { id: 'suf-er', suffix: '-er', meaning: 'one who, that which', language: 'Old English', partOfSpeechResult: 'noun', examples: ['teacher', 'writer', 'player', 'computer'] },
  { id: 'suf-or', suffix: '-or', meaning: 'one who, that which', language: 'Latin', partOfSpeechResult: 'noun', examples: ['actor', 'doctor', 'instructor', 'editor'] },
  { id: 'suf-ist', suffix: '-ist', meaning: 'one who practices, believes', language: 'Greek', partOfSpeechResult: 'noun', examples: ['artist', 'scientist', 'optimist', 'specialist'] },
  { id: 'suf-ian', suffix: '-ian', meaning: 'one who, relating to', language: 'Latin', partOfSpeechResult: 'noun', examples: ['musician', 'physician', 'guardian', 'librarian'] },
  { id: 'suf-ant', suffix: '-ant', meaning: 'one who, performing', language: 'Latin', partOfSpeechResult: 'noun', examples: ['servant', 'assistant', 'applicant', 'consultant'] },
  { id: 'suf-ent', suffix: '-ent', meaning: 'one who, performing', language: 'Latin', partOfSpeechResult: 'noun', examples: ['student', 'president', 'resident', 'dependent'] },
  { id: 'suf-ee', suffix: '-ee', meaning: 'one who receives', language: 'Latin', partOfSpeechResult: 'noun', examples: ['employee', 'trainee', 'referee', 'nominee'] },
  { id: 'suf-ism', suffix: '-ism', meaning: 'doctrine, belief, practice', language: 'Greek', partOfSpeechResult: 'noun', examples: ['capitalism', 'optimism', 'realism', 'criticism'] },
  { id: 'suf-logy', suffix: '-logy', meaning: 'study of', language: 'Greek', partOfSpeechResult: 'noun', examples: ['biology', 'psychology', 'technology', 'methodology'] },
  { id: 'suf-cracy', suffix: '-cracy', meaning: 'rule, government', language: 'Greek', partOfSpeechResult: 'noun', examples: ['democracy', 'aristocracy', 'bureaucracy', 'theocracy'] },
  { id: 'suf-archy', suffix: '-archy', meaning: 'rule', language: 'Greek', partOfSpeechResult: 'noun', examples: ['monarchy', 'anarchy', 'hierarchy', 'oligarchy'] },
  { id: 'suf-phobia', suffix: '-phobia', meaning: 'fear of', language: 'Greek', partOfSpeechResult: 'noun', examples: ['claustrophobia', 'xenophobia', 'arachnophobia', 'hydrophobia'] },
  { id: 'suf-cide', suffix: '-cide', meaning: 'killing', language: 'Latin', partOfSpeechResult: 'noun', examples: ['suicide', 'homicide', 'genocide', 'pesticide'] },

  // Adjective-forming suffixes
  { id: 'suf-ous', suffix: '-ous', meaning: 'full of, having', language: 'Latin', partOfSpeechResult: 'adjective', examples: ['famous', 'dangerous', 'nervous', 'glorious'] },
  { id: 'suf-ious', suffix: '-ious', meaning: 'full of, having', language: 'Latin', partOfSpeechResult: 'adjective', examples: ['curious', 'serious', 'furious', 'various'] },
  { id: 'suf-eous', suffix: '-eous', meaning: 'having nature of', language: 'Latin', partOfSpeechResult: 'adjective', examples: ['gorgeous', 'courageous', 'gaseous', 'aqueous'] },
  { id: 'suf-ful', suffix: '-ful', meaning: 'full of', language: 'Old English', partOfSpeechResult: 'adjective', examples: ['beautiful', 'helpful', 'powerful', 'successful'] },
  { id: 'suf-less', suffix: '-less', meaning: 'without', language: 'Old English', partOfSpeechResult: 'adjective', examples: ['hopeless', 'careless', 'endless', 'fearless'] },
  { id: 'suf-able', suffix: '-able', meaning: 'capable of, worthy of', language: 'Latin', partOfSpeechResult: 'adjective', examples: ['capable', 'lovable', 'comfortable', 'reasonable'] },
  { id: 'suf-ible', suffix: '-ible', meaning: 'capable of, worthy of', language: 'Latin', partOfSpeechResult: 'adjective', examples: ['possible', 'terrible', 'visible', 'incredible'] },
  { id: 'suf-al', suffix: '-al', meaning: 'relating to', language: 'Latin', partOfSpeechResult: 'adjective', examples: ['natural', 'musical', 'personal', 'logical'] },
  { id: 'suf-ial', suffix: '-ial', meaning: 'relating to', language: 'Latin', partOfSpeechResult: 'adjective', examples: ['social', 'official', 'essential', 'commercial'] },
  { id: 'suf-ic', suffix: '-ic', meaning: 'relating to, like', language: 'Greek', partOfSpeechResult: 'adjective', examples: ['electric', 'historic', 'magic', 'basic'] },
  { id: 'suf-ical', suffix: '-ical', meaning: 'relating to', language: 'Greek', partOfSpeechResult: 'adjective', examples: ['historical', 'political', 'practical', 'logical'] },
  { id: 'suf-ive', suffix: '-ive', meaning: 'having tendency to', language: 'Latin', partOfSpeechResult: 'adjective', examples: ['active', 'creative', 'sensitive', 'expensive'] },
  { id: 'suf-ative', suffix: '-ative', meaning: 'having tendency to', language: 'Latin', partOfSpeechResult: 'adjective', examples: ['talkative', 'informative', 'creative', 'imaginative'] },
  { id: 'suf-ish', suffix: '-ish', meaning: 'resembling, somewhat', language: 'Old English', partOfSpeechResult: 'adjective', examples: ['foolish', 'childish', 'selfish', 'reddish'] },
  { id: 'suf-like', suffix: '-like', meaning: 'resembling', language: 'Old English', partOfSpeechResult: 'adjective', examples: ['childlike', 'lifelike', 'warlike', 'dreamlike'] },
  { id: 'suf-ly', suffix: '-ly', meaning: 'having quality of', language: 'Old English', partOfSpeechResult: 'adjective', examples: ['friendly', 'lovely', 'costly', 'deadly'] },
  { id: 'suf-ary', suffix: '-ary', meaning: 'relating to', language: 'Latin', partOfSpeechResult: 'adjective', examples: ['ordinary', 'necessary', 'primary', 'military'] },
  { id: 'suf-ory', suffix: '-ory', meaning: 'relating to, place for', language: 'Latin', partOfSpeechResult: 'adjective', examples: ['auditory', 'sensory', 'mandatory', 'explanatory'] },
  { id: 'suf-ant-adj', suffix: '-ant', meaning: 'performing, being in state', language: 'Latin', partOfSpeechResult: 'adjective', examples: ['pleasant', 'dominant', 'significant', 'elegant'] },
  { id: 'suf-ent-adj', suffix: '-ent', meaning: 'performing, being in state', language: 'Latin', partOfSpeechResult: 'adjective', examples: ['different', 'excellent', 'patient', 'confident'] },

  // Verb-forming suffixes
  { id: 'suf-ize', suffix: '-ize', meaning: 'to make, to become', language: 'Greek', partOfSpeechResult: 'verb', examples: ['realize', 'organize', 'modernize', 'criticize'] },
  { id: 'suf-ise', suffix: '-ise', meaning: 'to make, to become', language: 'Greek', partOfSpeechResult: 'verb', examples: ['advertise', 'exercise', 'supervise', 'comprise'] },
  { id: 'suf-ate', suffix: '-ate', meaning: 'to make, to act', language: 'Latin', partOfSpeechResult: 'verb', examples: ['create', 'educate', 'demonstrate', 'celebrate'] },
  { id: 'suf-ify', suffix: '-ify', meaning: 'to make, to cause', language: 'Latin', partOfSpeechResult: 'verb', examples: ['simplify', 'clarify', 'magnify', 'justify'] },
  { id: 'suf-en', suffix: '-en', meaning: 'to make, to become', language: 'Old English', partOfSpeechResult: 'verb', examples: ['strengthen', 'weaken', 'brighten', 'darken'] },

  // Adverb-forming suffixes
  { id: 'suf-ly-adv', suffix: '-ly', meaning: 'in a manner', language: 'Old English', partOfSpeechResult: 'adverb', examples: ['quickly', 'slowly', 'carefully', 'happily'] },
  { id: 'suf-ward', suffix: '-ward', meaning: 'in direction of', language: 'Old English', partOfSpeechResult: 'adverb', examples: ['forward', 'backward', 'inward', 'outward'] },
  { id: 'suf-wise', suffix: '-wise', meaning: 'in manner of, with regard to', language: 'Old English', partOfSpeechResult: 'adverb', examples: ['otherwise', 'likewise', 'clockwise', 'lengthwise'] },
];

/** Get a suffix by ID */
export function getSuffixById(id: string): SuffixInfo | undefined {
  return SUFFIXES.find(suffix => suffix.id === id);
}

/** Get suffixes by suffix string */
export function getSuffixesBySuffix(suffixStr: string): SuffixInfo[] {
  const normalized = suffixStr.toLowerCase();
  return SUFFIXES.filter(
    suffix => suffix.suffix.toLowerCase().replace('-', '') === normalized.replace('-', '')
  );
}

/** Get suffixes that result in a specific part of speech */
export function getSuffixesByPartOfSpeech(partOfSpeech: SuffixInfo['partOfSpeechResult']): SuffixInfo[] {
  return SUFFIXES.filter(suffix => suffix.partOfSpeechResult === partOfSpeech);
}

/**
 * Common Prefixes Database
 * Based on Word Power Made Easy and vocabulary building resources
 */

import type { PrefixInfo } from '../../types';

export const PREFIXES: PrefixInfo[] = [
  // A
  { id: 'pre-a', prefix: 'a-', meaning: 'not, without', language: 'Greek', variants: ['an-'], examples: ['amoral', 'apathy', 'anonymous', 'atypical', 'anarchy'] },
  { id: 'pre-ab', prefix: 'ab-', meaning: 'away from', language: 'Latin', variants: ['abs-'], examples: ['abnormal', 'absent', 'abstract', 'absolve', 'abstain'] },
  { id: 'pre-ad', prefix: 'ad-', meaning: 'to, toward', language: 'Latin', variants: ['ac-', 'af-', 'ag-', 'al-', 'an-', 'ap-', 'ar-', 'as-', 'at-'], examples: ['advance', 'accept', 'affect', 'aggravate', 'announce', 'appear', 'arrive', 'assist', 'attract'] },
  { id: 'pre-ambi', prefix: 'ambi-', meaning: 'both', language: 'Latin', examples: ['ambidextrous', 'ambivalent', 'ambiguous', 'ambient'] },
  { id: 'pre-ante', prefix: 'ante-', meaning: 'before', language: 'Latin', examples: ['antecedent', 'anterior', 'antebellum', 'antedate'] },
  { id: 'pre-anti', prefix: 'anti-', meaning: 'against, opposite', language: 'Greek', variants: ['ant-'], examples: ['antibiotic', 'antisocial', 'antithesis', 'antagonist', 'antonym'] },
  { id: 'pre-auto', prefix: 'auto-', meaning: 'self', language: 'Greek', examples: ['automatic', 'autonomous', 'autobiography', 'autocrat'] },

  // B
  { id: 'pre-bene', prefix: 'bene-', meaning: 'good, well', language: 'Latin', examples: ['benefit', 'benevolent', 'benefactor', 'benign'] },
  { id: 'pre-bi', prefix: 'bi-', meaning: 'two', language: 'Latin', examples: ['bicycle', 'bilingual', 'biannual', 'bilateral', 'bipartisan'] },

  // C
  { id: 'pre-circum', prefix: 'circum-', meaning: 'around', language: 'Latin', examples: ['circumference', 'circumstance', 'circumvent', 'circumnavigate'] },
  { id: 'pre-co', prefix: 'co-', meaning: 'together, with', language: 'Latin', variants: ['col-', 'com-', 'con-', 'cor-'], examples: ['cooperate', 'collaborate', 'combine', 'connect', 'correlate'] },
  { id: 'pre-contra', prefix: 'contra-', meaning: 'against', language: 'Latin', variants: ['counter-'], examples: ['contradict', 'contrast', 'controversy', 'counteract', 'counterfeit'] },

  // D
  { id: 'pre-de', prefix: 'de-', meaning: 'down, away, reverse', language: 'Latin', examples: ['descend', 'decrease', 'depart', 'decompose', 'defame'] },
  { id: 'pre-di', prefix: 'di-', meaning: 'two', language: 'Greek', examples: ['dichotomy', 'dioxide', 'dilemma', 'dialogue'] },
  { id: 'pre-dis', prefix: 'dis-', meaning: 'not, apart, away', language: 'Latin', variants: ['dif-'], examples: ['disagree', 'disappear', 'disconnect', 'different', 'diffuse'] },
  { id: 'pre-dys', prefix: 'dys-', meaning: 'bad, difficult', language: 'Greek', examples: ['dysfunction', 'dyslexia', 'dystopia', 'dyspepsia'] },

  // E
  { id: 'pre-e', prefix: 'e-', meaning: 'out of, from', language: 'Latin', variants: ['ex-', 'ef-'], examples: ['emit', 'exit', 'exhale', 'export', 'effect'] },
  { id: 'pre-en', prefix: 'en-', meaning: 'in, into, cause to be', language: 'Latin', variants: ['em-'], examples: ['enable', 'encourage', 'embrace', 'empower', 'entrust'] },
  { id: 'pre-epi', prefix: 'epi-', meaning: 'upon, over', language: 'Greek', examples: ['epidemic', 'epilogue', 'epitaph', 'epitome', 'epiphany'] },
  { id: 'pre-eu', prefix: 'eu-', meaning: 'good, well', language: 'Greek', examples: ['euphoria', 'eulogy', 'euphemism', 'euthanasia', 'euphony'] },
  { id: 'pre-extra', prefix: 'extra-', meaning: 'beyond, outside', language: 'Latin', examples: ['extraordinary', 'extravagant', 'extraterrestrial', 'extrovert'] },

  // H
  { id: 'pre-hemi', prefix: 'hemi-', meaning: 'half', language: 'Greek', examples: ['hemisphere', 'hemicycle'] },
  { id: 'pre-hyper', prefix: 'hyper-', meaning: 'over, excessive', language: 'Greek', examples: ['hyperbole', 'hyperactive', 'hypertension', 'hyperventilate'] },
  { id: 'pre-hypo', prefix: 'hypo-', meaning: 'under, below', language: 'Greek', examples: ['hypothesis', 'hypodermic', 'hypocrite', 'hypothermia'] },

  // I
  { id: 'pre-il', prefix: 'il-', meaning: 'not', language: 'Latin', examples: ['illegal', 'illiterate', 'illogical', 'illuminate'] },
  { id: 'pre-im', prefix: 'im-', meaning: 'not, into', language: 'Latin', examples: ['impossible', 'immoral', 'immortal', 'impatient', 'import'] },
  { id: 'pre-in', prefix: 'in-', meaning: 'not, in, into', language: 'Latin', variants: ['ir-'], examples: ['invisible', 'incorrect', 'insane', 'irresponsible', 'irregular'] },
  { id: 'pre-inter', prefix: 'inter-', meaning: 'between, among', language: 'Latin', examples: ['interact', 'international', 'interrupt', 'intervene', 'intermediate'] },
  { id: 'pre-intra', prefix: 'intra-', meaning: 'within', language: 'Latin', examples: ['intravenous', 'intramural', 'intrastate'] },

  // M
  { id: 'pre-macro', prefix: 'macro-', meaning: 'large', language: 'Greek', examples: ['macroscopic', 'macroeconomics', 'macrocosm'] },
  { id: 'pre-mal', prefix: 'mal-', meaning: 'bad, evil', language: 'Latin', examples: ['malice', 'malevolent', 'malfunction', 'malady', 'malignant'] },
  { id: 'pre-mega', prefix: 'mega-', meaning: 'great, large', language: 'Greek', examples: ['megalomania', 'megaphone', 'megabyte', 'megalopolis'] },
  { id: 'pre-meta', prefix: 'meta-', meaning: 'change, beyond', language: 'Greek', examples: ['metamorphosis', 'metaphor', 'metaphysics', 'metabolism'] },
  { id: 'pre-micro', prefix: 'micro-', meaning: 'small', language: 'Greek', examples: ['microscope', 'microbe', 'microcosm', 'microphone'] },
  { id: 'pre-mis', prefix: 'mis-', meaning: 'wrong, bad', language: 'Old English', examples: ['mistake', 'misunderstand', 'mislead', 'misfortune', 'misbehave'] },
  { id: 'pre-mono', prefix: 'mono-', meaning: 'one, single', language: 'Greek', examples: ['monotone', 'monopoly', 'monologue', 'monastery', 'monarch'] },
  { id: 'pre-multi', prefix: 'multi-', meaning: 'many', language: 'Latin', examples: ['multiply', 'multitude', 'multimedia', 'multilingual'] },

  // N
  { id: 'pre-neo', prefix: 'neo-', meaning: 'new', language: 'Greek', examples: ['neophyte', 'neologism', 'neonatal', 'neolithic'] },
  { id: 'pre-non', prefix: 'non-', meaning: 'not', language: 'Latin', examples: ['nonsense', 'nonfiction', 'nonprofit', 'nonchalant'] },

  // O
  { id: 'pre-ob', prefix: 'ob-', meaning: 'against, toward', language: 'Latin', variants: ['oc-', 'of-', 'op-'], examples: ['object', 'obstacle', 'occur', 'offend', 'oppose'] },
  { id: 'pre-omni', prefix: 'omni-', meaning: 'all', language: 'Latin', examples: ['omniscient', 'omnipotent', 'omnivore', 'omnipresent'] },
  { id: 'pre-out', prefix: 'out-', meaning: 'beyond, surpass', language: 'Old English', examples: ['outperform', 'outweigh', 'outlive', 'outcast'] },
  { id: 'pre-over', prefix: 'over-', meaning: 'excessive, above', language: 'Old English', examples: ['overcome', 'overlook', 'overpower', 'overwhelm'] },

  // P
  { id: 'pre-pan', prefix: 'pan-', meaning: 'all', language: 'Greek', examples: ['panorama', 'pandemic', 'panacea', 'pandemonium'] },
  { id: 'pre-para', prefix: 'para-', meaning: 'beside, beyond', language: 'Greek', examples: ['parallel', 'paranormal', 'paraphrase', 'paradox', 'paramedic'] },
  { id: 'pre-peri', prefix: 'peri-', meaning: 'around', language: 'Greek', examples: ['perimeter', 'peripheral', 'period', 'periscope'] },
  { id: 'pre-poly', prefix: 'poly-', meaning: 'many', language: 'Greek', examples: ['polygon', 'polyglot', 'polynomial', 'polygamy'] },
  { id: 'pre-post', prefix: 'post-', meaning: 'after', language: 'Latin', examples: ['postpone', 'postwar', 'postmortem', 'posterior'] },
  { id: 'pre-pre', prefix: 'pre-', meaning: 'before', language: 'Latin', examples: ['predict', 'prevent', 'precede', 'preliminary', 'premature'] },
  { id: 'pre-pro', prefix: 'pro-', meaning: 'forward, in favor of', language: 'Latin', examples: ['progress', 'promote', 'propose', 'proactive', 'profound'] },
  { id: 'pre-proto', prefix: 'proto-', meaning: 'first', language: 'Greek', examples: ['prototype', 'protocol', 'proton', 'protagonist'] },
  { id: 'pre-pseudo', prefix: 'pseudo-', meaning: 'false', language: 'Greek', examples: ['pseudonym', 'pseudo', 'pseudoscience'] },

  // R
  { id: 'pre-re', prefix: 're-', meaning: 'again, back', language: 'Latin', examples: ['return', 'review', 'repeat', 'rebuild', 'recall'] },
  { id: 'pre-retro', prefix: 'retro-', meaning: 'backward', language: 'Latin', examples: ['retrospect', 'retrograde', 'retroactive'] },

  // S
  { id: 'pre-se', prefix: 'se-', meaning: 'apart, away', language: 'Latin', examples: ['separate', 'secede', 'seclude', 'segregate'] },
  { id: 'pre-semi', prefix: 'semi-', meaning: 'half', language: 'Latin', examples: ['semicircle', 'semifinal', 'semiconductor', 'semiannual'] },
  { id: 'pre-sub', prefix: 'sub-', meaning: 'under, below', language: 'Latin', variants: ['suc-', 'suf-', 'sug-', 'sup-', 'sus-'], examples: ['submarine', 'subtract', 'succeed', 'suffer', 'suggest', 'support', 'sustain'] },
  { id: 'pre-super', prefix: 'super-', meaning: 'above, beyond', language: 'Latin', examples: ['supernatural', 'supervise', 'superfluous', 'superior'] },
  { id: 'pre-sym', prefix: 'sym-', meaning: 'together, with', language: 'Greek', variants: ['syn-'], examples: ['symphony', 'sympathy', 'symbol', 'synchronize', 'synthesis'] },

  // T
  { id: 'pre-tele', prefix: 'tele-', meaning: 'far, distant', language: 'Greek', examples: ['telephone', 'television', 'telescope', 'telepathy'] },
  { id: 'pre-trans', prefix: 'trans-', meaning: 'across, beyond', language: 'Latin', examples: ['transport', 'transfer', 'transform', 'transcend', 'translate'] },
  { id: 'pre-tri', prefix: 'tri-', meaning: 'three', language: 'Latin', examples: ['triangle', 'trilogy', 'tripod', 'triplicate'] },

  // U
  { id: 'pre-ultra', prefix: 'ultra-', meaning: 'beyond, extreme', language: 'Latin', examples: ['ultraviolet', 'ultrasound', 'ultimate', 'ultramodern'] },
  { id: 'pre-un', prefix: 'un-', meaning: 'not, reverse', language: 'Old English', examples: ['unable', 'unhappy', 'undo', 'unlock', 'unusual'] },
  { id: 'pre-under', prefix: 'under-', meaning: 'below, insufficient', language: 'Old English', examples: ['understand', 'underestimate', 'undergo', 'undermine'] },
  { id: 'pre-uni', prefix: 'uni-', meaning: 'one', language: 'Latin', examples: ['uniform', 'unique', 'unity', 'universe', 'unilateral'] },
];

/** Get a prefix by ID */
export function getPrefixById(id: string): PrefixInfo | undefined {
  return PREFIXES.find(prefix => prefix.id === id);
}

/** Get prefixes by prefix string */
export function getPrefixesByPrefix(prefixStr: string): PrefixInfo[] {
  const normalized = prefixStr.toLowerCase();
  return PREFIXES.filter(
    prefix => prefix.prefix.toLowerCase().replace('-', '') === normalized.replace('-', '') ||
      prefix.variants?.some(v => v.toLowerCase().replace('-', '') === normalized.replace('-', ''))
  );
}

/**
 * Latin Roots Database
 * Based on Word Power Made Easy and vocabulary building resources
 */

import type { RootInfo } from '../../types';

export const LATIN_ROOTS: RootInfo[] = [
  // A
  { id: 'lat-acer', root: 'acer', meaning: 'sharp, bitter', language: 'Latin', variants: ['acr', 'acri'], examples: ['acerbic', 'acrimony', 'acrid', 'exacerbate'] },
  { id: 'lat-ago', root: 'ago', meaning: 'to do, to drive, to act', language: 'Latin', variants: ['act', 'ag', 'ig'], examples: ['agent', 'action', 'agitate', 'navigate'] },
  { id: 'lat-alter', root: 'alter', meaning: 'other', language: 'Latin', examples: ['alternate', 'altercation', 'altruism', 'alter ego'] },
  { id: 'lat-amo', root: 'amo', meaning: 'to love', language: 'Latin', variants: ['am', 'ami'], examples: ['amorous', 'amiable', 'amity', 'enamored'] },
  { id: 'lat-anima', root: 'anima', meaning: 'breath, soul, spirit', language: 'Latin', variants: ['anim'], examples: ['animate', 'animosity', 'magnanimous', 'pusillanimous', 'equanimity'] },
  { id: 'lat-annus', root: 'annus', meaning: 'year', language: 'Latin', variants: ['ann', 'enn'], examples: ['annual', 'anniversary', 'perennial', 'biennial'] },
  { id: 'lat-audire', root: 'audire', meaning: 'to hear', language: 'Latin', variants: ['aud', 'audit'], examples: ['audible', 'audience', 'audition', 'auditory'] },

  // B
  { id: 'lat-bellum', root: 'bellum', meaning: 'war', language: 'Latin', variants: ['bell'], examples: ['bellicose', 'belligerent', 'antebellum', 'rebel'] },
  { id: 'lat-bene', root: 'bene', meaning: 'good, well', language: 'Latin', variants: ['ben'], examples: ['benevolent', 'benefactor', 'benefit', 'benign'] },
  { id: 'lat-brevis', root: 'brevis', meaning: 'short', language: 'Latin', variants: ['brev', 'brief'], examples: ['brevity', 'abbreviate', 'brief'] },

  // C
  { id: 'lat-caedere', root: 'caedere', meaning: 'to cut, to kill', language: 'Latin', variants: ['cid', 'cis'], examples: ['incision', 'precise', 'suicide', 'homicide', 'fratricide'] },
  { id: 'lat-candere', root: 'candere', meaning: 'to shine, to glow', language: 'Latin', variants: ['cand'], examples: ['candid', 'candle', 'incandescent', 'candor'] },
  { id: 'lat-capere', root: 'capere', meaning: 'to take, to seize', language: 'Latin', variants: ['cap', 'cept', 'cip'], examples: ['capture', 'accept', 'recipient', 'captivate'] },
  { id: 'lat-caput', root: 'caput', meaning: 'head', language: 'Latin', variants: ['cap', 'capit'], examples: ['capital', 'captain', 'decapitate', 'capitulate'] },
  { id: 'lat-caro', root: 'caro', meaning: 'flesh', language: 'Latin', variants: ['carn'], examples: ['carnal', 'carnage', 'carnivore', 'incarnate'] },
  { id: 'lat-cedere', root: 'cedere', meaning: 'to go, to yield', language: 'Latin', variants: ['ced', 'cess'], examples: ['precede', 'recede', 'concede', 'secede', 'cessation'] },
  { id: 'lat-cernere', root: 'cernere', meaning: 'to separate, to distinguish', language: 'Latin', variants: ['cern', 'cret'], examples: ['discern', 'discrete', 'secrete', 'concern'] },
  { id: 'lat-clamare', root: 'clamare', meaning: 'to cry out, to shout', language: 'Latin', variants: ['claim', 'clam'], examples: ['exclaim', 'proclaim', 'clamor', 'declaim'] },
  { id: 'lat-claudere', root: 'claudere', meaning: 'to close, to shut', language: 'Latin', variants: ['clud', 'clus', 'clos'], examples: ['include', 'exclude', 'seclude', 'recluse', 'closet'] },
  { id: 'lat-cor', root: 'cor', meaning: 'heart', language: 'Latin', variants: ['cord'], examples: ['cordial', 'concord', 'discord', 'accord', 'core'] },
  { id: 'lat-corpus', root: 'corpus', meaning: 'body', language: 'Latin', variants: ['corp'], examples: ['corpse', 'corporation', 'corpulent', 'incorporate'] },
  { id: 'lat-credere', root: 'credere', meaning: 'to believe, to trust', language: 'Latin', variants: ['cred', 'credit'], examples: ['credible', 'credulous', 'incredulous', 'credit', 'creed'] },
  { id: 'lat-currere', root: 'currere', meaning: 'to run', language: 'Latin', variants: ['cur', 'curs', 'cours'], examples: ['current', 'cursor', 'course', 'recur', 'excursion'] },

  // D
  { id: 'lat-dicere', root: 'dicere', meaning: 'to say, to speak', language: 'Latin', variants: ['dic', 'dict'], examples: ['dictate', 'predict', 'verdict', 'contradict', 'diction'] },
  { id: 'lat-docere', root: 'docere', meaning: 'to teach', language: 'Latin', variants: ['doc', 'doct'], examples: ['docile', 'doctor', 'doctrine', 'document', 'indoctrinate'] },
  { id: 'lat-ducere', root: 'ducere', meaning: 'to lead', language: 'Latin', variants: ['duc', 'duct'], examples: ['conduct', 'deduce', 'induce', 'produce', 'seduce'] },
  { id: 'lat-durare', root: 'durare', meaning: 'to harden, to last', language: 'Latin', variants: ['dur'], examples: ['durable', 'endure', 'duration', 'obdurate'] },

  // E-F
  { id: 'lat-errare', root: 'errare', meaning: 'to wander, to stray', language: 'Latin', variants: ['err'], examples: ['errant', 'erratic', 'error', 'aberrant'] },
  { id: 'lat-facere', root: 'facere', meaning: 'to make, to do', language: 'Latin', variants: ['fac', 'fact', 'fect', 'fic'], examples: ['factory', 'manufacture', 'perfect', 'efficient', 'benefactor'] },
  { id: 'lat-fallere', root: 'fallere', meaning: 'to deceive', language: 'Latin', variants: ['fall', 'fals'], examples: ['fallacy', 'fallible', 'infallible', 'false'] },
  { id: 'lat-ferre', root: 'ferre', meaning: 'to carry, to bear', language: 'Latin', variants: ['fer', 'lat'], examples: ['transfer', 'refer', 'confer', 'defer', 'infer', 'prolific'] },
  { id: 'lat-fides', root: 'fides', meaning: 'faith, trust', language: 'Latin', variants: ['fid'], examples: ['fidelity', 'confide', 'perfidious', 'infidel', 'bona fide'] },
  { id: 'lat-finire', root: 'finire', meaning: 'to end, to limit', language: 'Latin', variants: ['fin'], examples: ['finish', 'finite', 'infinite', 'definite', 'confine'] },
  { id: 'lat-flectere', root: 'flectere', meaning: 'to bend', language: 'Latin', variants: ['flect', 'flex'], examples: ['reflect', 'deflect', 'flexible', 'inflection'] },
  { id: 'lat-fluere', root: 'fluere', meaning: 'to flow', language: 'Latin', variants: ['flu', 'flux'], examples: ['fluent', 'affluent', 'confluence', 'fluctuate', 'superfluous'] },
  { id: 'lat-forma', root: 'forma', meaning: 'shape, form', language: 'Latin', variants: ['form'], examples: ['form', 'conform', 'reform', 'transform', 'deform'] },
  { id: 'lat-fortis', root: 'fortis', meaning: 'strong', language: 'Latin', variants: ['fort'], examples: ['fortify', 'fortress', 'comfort', 'effort'] },
  { id: 'lat-fundere', root: 'fundere', meaning: 'to pour, to melt', language: 'Latin', variants: ['fund', 'fus'], examples: ['confuse', 'diffuse', 'profuse', 'transfusion', 'refund'] },

  // G
  { id: 'lat-generare', root: 'generare', meaning: 'to produce, to create', language: 'Latin', variants: ['gen', 'gener'], examples: ['generate', 'generation', 'generous', 'degenerate'] },
  { id: 'lat-gradi', root: 'gradi', meaning: 'to step, to walk', language: 'Latin', variants: ['grad', 'gress'], examples: ['graduate', 'progress', 'regress', 'digress', 'transgress'] },
  { id: 'lat-gratia', root: 'gratia', meaning: 'favor, thanks', language: 'Latin', variants: ['grat', 'grac'], examples: ['gratitude', 'grateful', 'gracious', 'ingrate'] },
  { id: 'lat-gravis', root: 'gravis', meaning: 'heavy, serious', language: 'Latin', variants: ['grav'], examples: ['gravity', 'grave', 'aggravate', 'gravitas'] },

  // H-J
  { id: 'lat-habere', root: 'habere', meaning: 'to have, to hold', language: 'Latin', variants: ['hab', 'hib'], examples: ['habit', 'inhabit', 'prohibit', 'exhibit'] },
  { id: 'lat-jacere', root: 'jacere', meaning: 'to throw', language: 'Latin', variants: ['jac', 'ject'], examples: ['project', 'reject', 'inject', 'eject', 'subject'] },
  { id: 'lat-jungere', root: 'jungere', meaning: 'to join', language: 'Latin', variants: ['junct', 'jug'], examples: ['junction', 'conjunction', 'conjugal', 'subjugate'] },
  { id: 'lat-jurare', root: 'jurare', meaning: 'to swear', language: 'Latin', variants: ['jur'], examples: ['jury', 'perjury', 'abjure', 'conjure'] },

  // L
  { id: 'lat-laus', root: 'laus', meaning: 'praise', language: 'Latin', variants: ['laud'], examples: ['laud', 'laudable', 'applaud', 'laudatory'] },
  { id: 'lat-legere', root: 'legere', meaning: 'to read, to choose', language: 'Latin', variants: ['leg', 'lect'], examples: ['legible', 'lecture', 'select', 'collect', 'intellect'] },
  { id: 'lat-levare', root: 'levare', meaning: 'to raise, to lighten', language: 'Latin', variants: ['lev'], examples: ['lever', 'elevate', 'levity', 'alleviate', 'relevant'] },
  { id: 'lat-liber', root: 'liber', meaning: 'free', language: 'Latin', variants: ['liber'], examples: ['liberty', 'liberal', 'liberate', 'libertine'] },
  { id: 'lat-lingua', root: 'lingua', meaning: 'tongue, language', language: 'Latin', variants: ['lingu'], examples: ['linguist', 'bilingual', 'lingual', 'linguistics'] },
  { id: 'lat-loqui', root: 'loqui', meaning: 'to speak', language: 'Latin', variants: ['loqu', 'locut'], examples: ['eloquent', 'loquacious', 'colloquial', 'soliloquy', 'elocution'] },
  { id: 'lat-lucere', root: 'lucere', meaning: 'to shine, light', language: 'Latin', variants: ['luc', 'lumen'], examples: ['lucid', 'elucidate', 'translucent', 'luminous'] },

  // M
  { id: 'lat-magnus', root: 'magnus', meaning: 'great', language: 'Latin', variants: ['magn', 'maj'], examples: ['magnify', 'magnificent', 'magnanimous', 'magnitude', 'major'] },
  { id: 'lat-malus', root: 'malus', meaning: 'bad, evil', language: 'Latin', variants: ['mal'], examples: ['malice', 'malevolent', 'malady', 'malign', 'malediction'] },
  { id: 'lat-manus', root: 'manus', meaning: 'hand', language: 'Latin', variants: ['man', 'manu'], examples: ['manual', 'manufacture', 'manuscript', 'manipulate', 'maneuver'] },
  { id: 'lat-medius', root: 'medius', meaning: 'middle', language: 'Latin', variants: ['med', 'medi'], examples: ['medium', 'mediate', 'medieval', 'mediocre', 'immediate'] },
  { id: 'lat-mens', root: 'mens', meaning: 'mind', language: 'Latin', variants: ['ment'], examples: ['mental', 'mentality', 'demented', 'mentor'] },
  { id: 'lat-mittere', root: 'mittere', meaning: 'to send', language: 'Latin', variants: ['mit', 'miss'], examples: ['transmit', 'emit', 'submit', 'permit', 'mission', 'dismiss'] },
  { id: 'lat-mors', root: 'mors', meaning: 'death', language: 'Latin', variants: ['mort'], examples: ['mortal', 'immortal', 'mortify', 'moribund', 'mortgage'] },
  { id: 'lat-movere', root: 'movere', meaning: 'to move', language: 'Latin', variants: ['mov', 'mot'], examples: ['move', 'motion', 'motive', 'emotion', 'promote', 'remote'] },
  { id: 'lat-multus', root: 'multus', meaning: 'many, much', language: 'Latin', variants: ['mult'], examples: ['multiply', 'multitude', 'multiple', 'multimedia'] },

  // N-O
  { id: 'lat-nascor', root: 'nascor', meaning: 'to be born', language: 'Latin', variants: ['nasc', 'nat'], examples: ['nascent', 'native', 'nature', 'innate', 'renaissance'] },
  { id: 'lat-novus', root: 'novus', meaning: 'new', language: 'Latin', variants: ['nov'], examples: ['novel', 'novice', 'innovate', 'renovate'] },
  { id: 'lat-omnis', root: 'omnis', meaning: 'all', language: 'Latin', variants: ['omni'], examples: ['omniscient', 'omnipotent', 'omnivore', 'omnibus'] },

  // P
  { id: 'lat-pars', root: 'pars', meaning: 'part, piece', language: 'Latin', variants: ['part'], examples: ['particle', 'participate', 'partition', 'impart'] },
  { id: 'lat-pater', root: 'pater', meaning: 'father', language: 'Latin', variants: ['patr'], examples: ['paternal', 'patriarch', 'patriot', 'patronize'] },
  { id: 'lat-pax', root: 'pax', meaning: 'peace', language: 'Latin', variants: ['pac'], examples: ['pacify', 'pacific', 'peace', 'pact'] },
  { id: 'lat-pellere', root: 'pellere', meaning: 'to drive, to push', language: 'Latin', variants: ['pel', 'puls'], examples: ['compel', 'expel', 'repel', 'propel', 'pulse', 'impulse'] },
  { id: 'lat-pendere', root: 'pendere', meaning: 'to hang, to weigh', language: 'Latin', variants: ['pend', 'pens'], examples: ['pendant', 'suspend', 'depend', 'impending', 'pensive'] },
  { id: 'lat-petere', root: 'petere', meaning: 'to seek, to strive', language: 'Latin', variants: ['pet', 'petit'], examples: ['compete', 'petition', 'appetite', 'repetition'] },
  { id: 'lat-placere', root: 'placere', meaning: 'to please', language: 'Latin', variants: ['plac'], examples: ['placate', 'placid', 'complacent', 'implacable'] },
  { id: 'lat-plicare', root: 'plicare', meaning: 'to fold', language: 'Latin', variants: ['plic', 'plex', 'ply'], examples: ['complicate', 'implicate', 'complex', 'apply', 'reply'] },
  { id: 'lat-ponere', root: 'ponere', meaning: 'to put, to place', language: 'Latin', variants: ['pon', 'pos', 'posit'], examples: ['position', 'compose', 'impose', 'deposit', 'opponent'] },
  { id: 'lat-portare', root: 'portare', meaning: 'to carry', language: 'Latin', variants: ['port'], examples: ['transport', 'export', 'import', 'portable', 'deport'] },
  { id: 'lat-prehendere', root: 'prehendere', meaning: 'to seize, to grasp', language: 'Latin', variants: ['prehend', 'pris'], examples: ['apprehend', 'comprehend', 'surprise', 'enterprise'] },

  // Q-R
  { id: 'lat-quaerere', root: 'quaerere', meaning: 'to seek, to ask', language: 'Latin', variants: ['quer', 'quir', 'quest'], examples: ['query', 'inquire', 'acquire', 'quest', 'request'] },
  { id: 'lat-regere', root: 'regere', meaning: 'to rule, to guide', language: 'Latin', variants: ['reg', 'rect'], examples: ['regulate', 'regime', 'direct', 'correct', 'erect'] },
  { id: 'lat-rumpere', root: 'rumpere', meaning: 'to break', language: 'Latin', variants: ['rupt'], examples: ['rupture', 'erupt', 'interrupt', 'corrupt', 'disrupt'] },

  // S
  { id: 'lat-scribere', root: 'scribere', meaning: 'to write', language: 'Latin', variants: ['scrib', 'script'], examples: ['describe', 'prescribe', 'manuscript', 'scripture', 'inscription'] },
  { id: 'lat-sedere', root: 'sedere', meaning: 'to sit, to settle', language: 'Latin', variants: ['sed', 'sess', 'sid'], examples: ['sedentary', 'session', 'reside', 'preside', 'subside'] },
  { id: 'lat-sentire', root: 'sentire', meaning: 'to feel, to perceive', language: 'Latin', variants: ['sent', 'sens'], examples: ['sentiment', 'sense', 'sensitive', 'consent', 'resent'] },
  { id: 'lat-sequi', root: 'sequi', meaning: 'to follow', language: 'Latin', variants: ['sequ', 'secut'], examples: ['sequence', 'consequence', 'execute', 'prosecute', 'subsequent'] },
  { id: 'lat-servare', root: 'servare', meaning: 'to keep, to save', language: 'Latin', variants: ['serv'], examples: ['preserve', 'conserve', 'reserve', 'observe', 'servant'] },
  { id: 'lat-solvere', root: 'solvere', meaning: 'to loosen, to release', language: 'Latin', variants: ['solv', 'solut'], examples: ['solve', 'dissolve', 'resolve', 'solution', 'absolute'] },
  { id: 'lat-specere', root: 'specere', meaning: 'to look, to see', language: 'Latin', variants: ['spec', 'spect', 'spic'], examples: ['spectacle', 'inspect', 'respect', 'suspect', 'conspicuous'] },
  { id: 'lat-spirare', root: 'spirare', meaning: 'to breathe', language: 'Latin', variants: ['spir'], examples: ['inspire', 'expire', 'respire', 'spirit', 'conspire'] },
  { id: 'lat-stare', root: 'stare', meaning: 'to stand', language: 'Latin', variants: ['sta', 'stat', 'sist'], examples: ['state', 'station', 'statue', 'constant', 'resist', 'persist'] },
  { id: 'lat-stringere', root: 'stringere', meaning: 'to bind, to draw tight', language: 'Latin', variants: ['string', 'strict'], examples: ['stringent', 'strict', 'restrict', 'constrict', 'district'] },
  { id: 'lat-struere', root: 'struere', meaning: 'to build', language: 'Latin', variants: ['struct'], examples: ['structure', 'construct', 'destruct', 'instruct', 'obstruct'] },

  // T
  { id: 'lat-tacere', root: 'tacere', meaning: 'to be silent', language: 'Latin', variants: ['tac', 'tacit'], examples: ['tacit', 'taciturn', 'reticent'] },
  { id: 'lat-tangere', root: 'tangere', meaning: 'to touch', language: 'Latin', variants: ['tang', 'tact', 'ting'], examples: ['tangible', 'contact', 'contingent', 'intact', 'tangent'] },
  { id: 'lat-tempus', root: 'tempus', meaning: 'time', language: 'Latin', variants: ['temp', 'tempor'], examples: ['temporary', 'contemporary', 'temporal', 'extemporaneous'] },
  { id: 'lat-tendere', root: 'tendere', meaning: 'to stretch', language: 'Latin', variants: ['tend', 'tens', 'tent'], examples: ['extend', 'intend', 'tension', 'pretend', 'attention'] },
  { id: 'lat-tenere', root: 'tenere', meaning: 'to hold', language: 'Latin', variants: ['ten', 'tain', 'tin'], examples: ['contain', 'retain', 'maintain', 'sustain', 'tenacious'] },
  { id: 'lat-terrere', root: 'terrere', meaning: 'to frighten', language: 'Latin', variants: ['terr'], examples: ['terror', 'terrible', 'terrify', 'deter'] },
  { id: 'lat-torquere', root: 'torquere', meaning: 'to twist', language: 'Latin', variants: ['tort', 'torqu'], examples: ['torture', 'contort', 'distort', 'extort', 'torque'] },
  { id: 'lat-trahere', root: 'trahere', meaning: 'to draw, to pull', language: 'Latin', variants: ['trah', 'tract'], examples: ['attract', 'contract', 'extract', 'subtract', 'tractor'] },

  // U-V
  { id: 'lat-verus', root: 'verus', meaning: 'true', language: 'Latin', variants: ['ver'], examples: ['verify', 'verdict', 'verity', 'veracity', 'veritable'] },
  { id: 'lat-videre', root: 'videre', meaning: 'to see', language: 'Latin', variants: ['vid', 'vis'], examples: ['vision', 'visible', 'evident', 'provide', 'revise'] },
  { id: 'lat-vincere', root: 'vincere', meaning: 'to conquer', language: 'Latin', variants: ['vict', 'vinc'], examples: ['victory', 'convince', 'invincible', 'evict'] },
  { id: 'lat-vita', root: 'vita', meaning: 'life', language: 'Latin', variants: ['vit', 'viv'], examples: ['vital', 'vitality', 'vivid', 'revive', 'survive'] },
  { id: 'lat-vocare', root: 'vocare', meaning: 'to call', language: 'Latin', variants: ['voc', 'voke'], examples: ['vocal', 'vocabulary', 'invoke', 'provoke', 'revoke', 'evoke'] },
  { id: 'lat-volvere', root: 'volvere', meaning: 'to roll, to turn', language: 'Latin', variants: ['volv', 'volut'], examples: ['revolve', 'evolve', 'involve', 'revolution', 'voluble'] },
];

/** Get a Latin root by ID */
export function getLatinRootById(id: string): RootInfo | undefined {
  return LATIN_ROOTS.find(root => root.id === id);
}

/** Get Latin roots by root string */
export function getLatinRootsByRoot(rootStr: string): RootInfo[] {
  const normalized = rootStr.toLowerCase();
  return LATIN_ROOTS.filter(
    root => root.root.toLowerCase() === normalized ||
      root.variants?.some(v => v.toLowerCase() === normalized)
  );
}

/** Get all Latin roots that contain a specific example word */
export function getLatinRootsByWord(word: string): RootInfo[] {
  const normalized = word.toLowerCase();
  return LATIN_ROOTS.filter(root =>
    root.examples.some(ex => ex.toLowerCase() === normalized)
  );
}

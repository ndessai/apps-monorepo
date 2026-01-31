/**
 * Greek Roots Database
 * Based on Word Power Made Easy and vocabulary building resources
 */

import type { RootInfo } from '../../types';

export const GREEK_ROOTS: RootInfo[] = [
  // A
  { id: 'grk-aer', root: 'aer', meaning: 'air', language: 'Greek', variants: ['aero'], examples: ['aerobic', 'aerospace', 'aerate', 'aerial'] },
  { id: 'grk-agogos', root: 'agogos', meaning: 'leading', language: 'Greek', variants: ['agog', 'agogue'], examples: ['pedagogue', 'demagogue', 'synagogue'] },
  { id: 'grk-agon', root: 'agon', meaning: 'struggle, contest', language: 'Greek', variants: ['agon'], examples: ['agony', 'antagonist', 'protagonist', 'agonize'] },
  { id: 'grk-anthropos', root: 'anthropos', meaning: 'human being', language: 'Greek', variants: ['anthrop'], examples: ['anthropology', 'misanthrope', 'philanthropist', 'anthropomorphic'] },
  { id: 'grk-archos', root: 'archos', meaning: 'ruler, chief', language: 'Greek', variants: ['arch'], examples: ['monarch', 'anarchy', 'patriarch', 'hierarchy', 'oligarchy'] },
  { id: 'grk-astron', root: 'astron', meaning: 'star', language: 'Greek', variants: ['aster', 'astr'], examples: ['astronomy', 'asteroid', 'astrology', 'disaster'] },
  { id: 'grk-autos', root: 'autos', meaning: 'self', language: 'Greek', variants: ['auto'], examples: ['automatic', 'autonomous', 'autobiography', 'autocrat'] },

  // B
  { id: 'grk-biblion', root: 'biblion', meaning: 'book', language: 'Greek', variants: ['biblio'], examples: ['bibliography', 'bibliophile', 'Bible'] },
  { id: 'grk-bios', root: 'bios', meaning: 'life', language: 'Greek', variants: ['bio'], examples: ['biology', 'biography', 'biopsy', 'symbiosis', 'antibiotic'] },

  // C
  { id: 'grk-chronos', root: 'chronos', meaning: 'time', language: 'Greek', variants: ['chron'], examples: ['chronological', 'chronic', 'synchronize', 'anachronism'] },
  { id: 'grk-cosmos', root: 'cosmos', meaning: 'world, order, universe', language: 'Greek', variants: ['cosm'], examples: ['cosmic', 'cosmopolitan', 'cosmetic', 'microcosm'] },
  { id: 'grk-kratos', root: 'kratos', meaning: 'power, rule', language: 'Greek', variants: ['crat', 'cracy'], examples: ['democracy', 'aristocrat', 'bureaucracy', 'plutocracy'] },
  { id: 'grk-krinein', root: 'krinein', meaning: 'to judge, to separate', language: 'Greek', variants: ['crit', 'cris'], examples: ['critic', 'crisis', 'criterion', 'hypocrite'] },
  { id: 'grk-kyklos', root: 'kyklos', meaning: 'circle, wheel', language: 'Greek', variants: ['cycl'], examples: ['cycle', 'bicycle', 'cyclone', 'encyclopedia'] },

  // D
  { id: 'grk-demos', root: 'demos', meaning: 'people', language: 'Greek', variants: ['dem'], examples: ['democracy', 'demographic', 'epidemic', 'demagogue'] },
  { id: 'grk-derma', root: 'derma', meaning: 'skin', language: 'Greek', variants: ['derm'], examples: ['dermatology', 'epidermis', 'hypodermic', 'pachyderm'] },
  { id: 'grk-doxa', root: 'doxa', meaning: 'opinion, belief', language: 'Greek', variants: ['dox'], examples: ['orthodox', 'paradox', 'heterodox', 'doxology'] },
  { id: 'grk-dynamis', root: 'dynamis', meaning: 'power', language: 'Greek', variants: ['dynam'], examples: ['dynamic', 'dynasty', 'dynamite', 'aerodynamic'] },

  // E-F
  { id: 'grk-ergon', root: 'ergon', meaning: 'work', language: 'Greek', variants: ['erg', 'urg'], examples: ['energy', 'ergonomic', 'synergy', 'metallurgy'] },
  { id: 'grk-ethnos', root: 'ethnos', meaning: 'nation, people', language: 'Greek', variants: ['ethn'], examples: ['ethnic', 'ethnicity', 'ethnocentric'] },
  { id: 'grk-eu', root: 'eu', meaning: 'good, well', language: 'Greek', examples: ['euphoria', 'eulogy', 'euphemism', 'euthanasia', 'euphony'] },

  // G
  { id: 'grk-gamos', root: 'gamos', meaning: 'marriage', language: 'Greek', variants: ['gam'], examples: ['monogamy', 'polygamy', 'bigamy', 'gamete'] },
  { id: 'grk-ge', root: 'ge', meaning: 'earth', language: 'Greek', variants: ['geo'], examples: ['geography', 'geology', 'geometry', 'geopolitical'] },
  { id: 'grk-genos', root: 'genos', meaning: 'race, kind, birth', language: 'Greek', variants: ['gen'], examples: ['genesis', 'gene', 'genetic', 'genocide', 'genus'] },
  { id: 'grk-gnosis', root: 'gnosis', meaning: 'knowledge', language: 'Greek', variants: ['gno'], examples: ['agnostic', 'diagnosis', 'prognosis', 'ignorant'] },
  { id: 'grk-graphein', root: 'graphein', meaning: 'to write', language: 'Greek', variants: ['graph', 'gram'], examples: ['graphic', 'photograph', 'telegraph', 'diagram', 'grammar'] },

  // H
  { id: 'grk-haima', root: 'haima', meaning: 'blood', language: 'Greek', variants: ['hem', 'hemo'], examples: ['hemorrhage', 'hemoglobin', 'hemophilia', 'anemia'] },
  { id: 'grk-helios', root: 'helios', meaning: 'sun', language: 'Greek', variants: ['helio'], examples: ['heliocentric', 'helium', 'heliotrope'] },
  { id: 'grk-heteros', root: 'heteros', meaning: 'other, different', language: 'Greek', variants: ['heter'], examples: ['heterogeneous', 'heterodox', 'heterosexual'] },
  { id: 'grk-hieros', root: 'hieros', meaning: 'sacred', language: 'Greek', variants: ['hier'], examples: ['hierarchy', 'hieroglyphic'] },
  { id: 'grk-hippos', root: 'hippos', meaning: 'horse', language: 'Greek', variants: ['hipp'], examples: ['hippopotamus', 'hippodrome', 'hippocampus'] },
  { id: 'grk-homos', root: 'homos', meaning: 'same', language: 'Greek', variants: ['homo'], examples: ['homogeneous', 'homonym', 'homosexual', 'homophone'] },
  { id: 'grk-hydor', root: 'hydor', meaning: 'water', language: 'Greek', variants: ['hydr', 'hydro'], examples: ['hydrate', 'hydrogen', 'dehydrate', 'hydraulic'] },
  { id: 'grk-hyper', root: 'hyper', meaning: 'over, excessive', language: 'Greek', examples: ['hyperbole', 'hyperactive', 'hypertension', 'hyperventilate'] },
  { id: 'grk-hypo', root: 'hypo', meaning: 'under, below', language: 'Greek', examples: ['hypothesis', 'hypodermic', 'hypocrite', 'hypothermia'] },

  // I-K
  { id: 'grk-isos', root: 'isos', meaning: 'equal', language: 'Greek', variants: ['iso'], examples: ['isometric', 'isotope', 'isosceles', 'isobar'] },
  { id: 'grk-kinesis', root: 'kinesis', meaning: 'movement', language: 'Greek', variants: ['kine', 'cine'], examples: ['kinetic', 'cinema', 'kinesthesia', 'telekinesis'] },

  // L
  { id: 'grk-lithos', root: 'lithos', meaning: 'stone', language: 'Greek', variants: ['lith'], examples: ['lithograph', 'monolith', 'neolithic', 'lithosphere'] },
  { id: 'grk-logos', root: 'logos', meaning: 'word, study, reason', language: 'Greek', variants: ['log', 'logy'], examples: ['logic', 'biology', 'dialogue', 'prologue', 'epilogue'] },

  // M
  { id: 'grk-makros', root: 'makros', meaning: 'long, large', language: 'Greek', variants: ['macro'], examples: ['macroscopic', 'macroeconomics', 'macrocosm'] },
  { id: 'grk-mania', root: 'mania', meaning: 'madness, obsession', language: 'Greek', examples: ['mania', 'maniac', 'kleptomania', 'pyromania', 'megalomania'] },
  { id: 'grk-megas', root: 'megas', meaning: 'great, large', language: 'Greek', variants: ['mega'], examples: ['megalomania', 'megaphone', 'megabyte', 'megalopolis'] },
  { id: 'grk-metron', root: 'metron', meaning: 'measure', language: 'Greek', variants: ['meter'], examples: ['meter', 'thermometer', 'barometer', 'geometry', 'metric'] },
  { id: 'grk-mikros', root: 'mikros', meaning: 'small', language: 'Greek', variants: ['micro'], examples: ['microscope', 'microbe', 'microcosm', 'microphone'] },
  { id: 'grk-misos', root: 'misos', meaning: 'hatred', language: 'Greek', variants: ['mis'], examples: ['misanthrope', 'misogyny', 'misogamist'] },
  { id: 'grk-mneme', root: 'mneme', meaning: 'memory', language: 'Greek', variants: ['mnem'], examples: ['mnemonic', 'amnesia', 'amnesty'] },
  { id: 'grk-monos', root: 'monos', meaning: 'one, single, alone', language: 'Greek', variants: ['mono'], examples: ['monotone', 'monopoly', 'monologue', 'monastery', 'monarch'] },
  { id: 'grk-morphe', root: 'morphe', meaning: 'form, shape', language: 'Greek', variants: ['morph'], examples: ['morphology', 'metamorphosis', 'amorphous', 'anthropomorphic'] },

  // N
  { id: 'grk-nekros', root: 'nekros', meaning: 'dead, corpse', language: 'Greek', variants: ['necr'], examples: ['necropolis', 'necromancy', 'necrosis'] },
  { id: 'grk-neos', root: 'neos', meaning: 'new, young', language: 'Greek', variants: ['neo'], examples: ['neophyte', 'neologism', 'neonatal', 'neolithic'] },
  { id: 'grk-neuron', root: 'neuron', meaning: 'nerve', language: 'Greek', variants: ['neur'], examples: ['neurology', 'neurosis', 'neural', 'neuron'] },
  { id: 'grk-nomos', root: 'nomos', meaning: 'law, custom', language: 'Greek', variants: ['nom'], examples: ['autonomy', 'astronomy', 'economy', 'taxonomy'] },

  // O
  { id: 'grk-odos', root: 'odos', meaning: 'way, path', language: 'Greek', variants: ['od'], examples: ['method', 'period', 'exodus', 'episode', 'odometer'] },
  { id: 'grk-onoma', root: 'onoma', meaning: 'name', language: 'Greek', variants: ['onym'], examples: ['synonym', 'antonym', 'anonymous', 'pseudonym', 'acronym'] },
  { id: 'grk-optikos', root: 'optikos', meaning: 'seeing', language: 'Greek', variants: ['opt', 'optic'], examples: ['optical', 'optician', 'optometry', 'myopia'] },
  { id: 'grk-orthos', root: 'orthos', meaning: 'straight, correct', language: 'Greek', variants: ['orth'], examples: ['orthodox', 'orthopedic', 'orthodontist', 'orthography'] },

  // P
  { id: 'grk-pais', root: 'pais', meaning: 'child', language: 'Greek', variants: ['ped', 'paed'], examples: ['pediatric', 'pedagogy', 'pedophile', 'encyclopedia'] },
  { id: 'grk-pan', root: 'pan', meaning: 'all', language: 'Greek', variants: ['panto'], examples: ['panorama', 'pandemic', 'panacea', 'pandemonium', 'pantomime'] },
  { id: 'grk-pathos', root: 'pathos', meaning: 'feeling, suffering', language: 'Greek', variants: ['path'], examples: ['sympathy', 'empathy', 'apathy', 'pathology', 'pathos'] },
  { id: 'grk-phagein', root: 'phagein', meaning: 'to eat', language: 'Greek', variants: ['phag'], examples: ['esophagus', 'sarcophagus', 'phagocyte'] },
  { id: 'grk-phanein', root: 'phanein', meaning: 'to show, to appear', language: 'Greek', variants: ['phan', 'phen'], examples: ['phantom', 'phenomenon', 'epiphany', 'fantasy'] },
  { id: 'grk-philein', root: 'philein', meaning: 'to love', language: 'Greek', variants: ['phil'], examples: ['philosophy', 'philanthropist', 'bibliophile', 'philharmonic'] },
  { id: 'grk-phobos', root: 'phobos', meaning: 'fear', language: 'Greek', variants: ['phob', 'phobia'], examples: ['phobia', 'claustrophobia', 'arachnophobia', 'xenophobia'] },
  { id: 'grk-phone', root: 'phone', meaning: 'sound, voice', language: 'Greek', variants: ['phon'], examples: ['telephone', 'phonetic', 'symphony', 'euphony', 'cacophony'] },
  { id: 'grk-phos', root: 'phos', meaning: 'light', language: 'Greek', variants: ['phot', 'photo'], examples: ['photograph', 'photosynthesis', 'phosphorus'] },
  { id: 'grk-physis', root: 'physis', meaning: 'nature', language: 'Greek', variants: ['phys'], examples: ['physics', 'physical', 'physiology', 'physician'] },
  { id: 'grk-polis', root: 'polis', meaning: 'city, state', language: 'Greek', variants: ['polit'], examples: ['politics', 'metropolitan', 'cosmopolitan', 'police', 'policy'] },
  { id: 'grk-polys', root: 'polys', meaning: 'many', language: 'Greek', variants: ['poly'], examples: ['polygon', 'polyglot', 'polynomial', 'polygamy', 'polytheism'] },
  { id: 'grk-pous', root: 'pous', meaning: 'foot', language: 'Greek', variants: ['pod', 'ped'], examples: ['podium', 'tripod', 'podiatrist', 'pedestrian', 'centipede'] },
  { id: 'grk-protos', root: 'protos', meaning: 'first', language: 'Greek', variants: ['prot', 'proto'], examples: ['prototype', 'protocol', 'proton', 'protagonist'] },
  { id: 'grk-pseudein', root: 'pseudein', meaning: 'to deceive, false', language: 'Greek', variants: ['pseud'], examples: ['pseudonym', 'pseudo', 'pseudoscience'] },
  { id: 'grk-psyche', root: 'psyche', meaning: 'soul, mind', language: 'Greek', variants: ['psych'], examples: ['psychology', 'psychiatry', 'psychic', 'psychopath', 'psychosis'] },
  { id: 'grk-pyr', root: 'pyr', meaning: 'fire', language: 'Greek', variants: ['pyro'], examples: ['pyromania', 'pyromaniac', 'pyre', 'pyrotechnics'] },

  // S
  { id: 'grk-skopein', root: 'skopein', meaning: 'to look at, to examine', language: 'Greek', variants: ['scop', 'scope'], examples: ['microscope', 'telescope', 'horoscope', 'scope'] },
  { id: 'grk-sophia', root: 'sophia', meaning: 'wisdom', language: 'Greek', variants: ['soph'], examples: ['philosophy', 'sophisticated', 'sophomore', 'sophistry'] },
  { id: 'grk-syn', root: 'syn', meaning: 'together, with', language: 'Greek', variants: ['sym'], examples: ['synchronize', 'symphony', 'synthesis', 'sympathy', 'symbol'] },

  // T
  { id: 'grk-taxis', root: 'taxis', meaning: 'arrangement, order', language: 'Greek', variants: ['tax'], examples: ['taxonomy', 'syntax', 'taxidermy'] },
  { id: 'grk-techne', root: 'techne', meaning: 'art, skill', language: 'Greek', variants: ['techn'], examples: ['technology', 'technique', 'technical', 'architect'] },
  { id: 'grk-tele', root: 'tele', meaning: 'far, distant', language: 'Greek', examples: ['telephone', 'television', 'telescope', 'telepathy', 'telegram'] },
  { id: 'grk-theos', root: 'theos', meaning: 'god', language: 'Greek', variants: ['theo'], examples: ['theology', 'theocracy', 'atheist', 'polytheism', 'monotheism'] },
  { id: 'grk-therme', root: 'therme', meaning: 'heat', language: 'Greek', variants: ['therm'], examples: ['thermometer', 'thermal', 'thermostat', 'hypothermia'] },
  { id: 'grk-thesis', root: 'thesis', meaning: 'placing, proposition', language: 'Greek', variants: ['thet'], examples: ['thesis', 'hypothesis', 'antithesis', 'synthesis', 'synthetic'] },
  { id: 'grk-topos', root: 'topos', meaning: 'place', language: 'Greek', variants: ['top'], examples: ['topology', 'topography', 'utopia', 'dystopia', 'topic'] },
  { id: 'grk-tropein', root: 'tropein', meaning: 'to turn', language: 'Greek', variants: ['trop'], examples: ['tropical', 'entropy', 'heliotrope', 'tropic'] },
  { id: 'grk-typos', root: 'typos', meaning: 'impression, type', language: 'Greek', variants: ['typ'], examples: ['type', 'typical', 'stereotype', 'archetype', 'prototype'] },

  // X-Z
  { id: 'grk-xenos', root: 'xenos', meaning: 'stranger, foreigner', language: 'Greek', variants: ['xen'], examples: ['xenophobia', 'xenophile', 'xenon'] },
  { id: 'grk-zoon', root: 'zoon', meaning: 'animal', language: 'Greek', variants: ['zo'], examples: ['zoology', 'zoo', 'protozoa', 'zodiac'] },
];

/** Get a Greek root by ID */
export function getGreekRootById(id: string): RootInfo | undefined {
  return GREEK_ROOTS.find(root => root.id === id);
}

/** Get Greek roots by root string */
export function getGreekRootsByRoot(rootStr: string): RootInfo[] {
  const normalized = rootStr.toLowerCase();
  return GREEK_ROOTS.filter(
    root => root.root.toLowerCase() === normalized ||
      root.variants?.some(v => v.toLowerCase() === normalized)
  );
}

/** Get all Greek roots that contain a specific example word */
export function getGreekRootsByWord(word: string): RootInfo[] {
  const normalized = word.toLowerCase();
  return GREEK_ROOTS.filter(root =>
    root.examples.some(ex => ex.toLowerCase() === normalized)
  );
}

/**
 * Human Body Topics for AI Generation
 *
 * Structured topic coverage to ensure comprehensive question generation
 */

import type { QuestionDifficulty } from '../types.js';

export interface TopicDefinition {
  name: string;
  subtopics: string[];
  keyTerms: string[];
}

/**
 * Human Body subcategories with detailed topics
 */
export const HUMAN_BODY_TOPICS: Record<string, TopicDefinition[]> = {
  Cardiovascular: [
    {
      name: 'Heart Anatomy',
      subtopics: [
        'Four chambers of the heart',
        'Heart valves and their functions',
        'Layers of the heart wall',
        'Coronary arteries',
        'Pacemaker cells and SA node',
      ],
      keyTerms: ['atrium', 'ventricle', 'septum', 'myocardium', 'pericardium', 'tricuspid valve', 'mitral valve'],
    },
    {
      name: 'Blood Vessels',
      subtopics: [
        'Arteries vs veins vs capillaries',
        'Major arteries (aorta, carotid, femoral)',
        'Major veins (vena cava, jugular, portal)',
        'Capillary exchange',
        'Blood vessel structure',
      ],
      keyTerms: ['aorta', 'vena cava', 'capillary', 'arteriole', 'venule', 'tunica', 'endothelium'],
    },
    {
      name: 'Blood Circulation',
      subtopics: [
        'Pulmonary circulation',
        'Systemic circulation',
        'Cardiac cycle',
        'Blood pressure regulation',
        'Portal systems',
      ],
      keyTerms: ['systole', 'diastole', 'cardiac output', 'stroke volume', 'blood pressure'],
    },
    {
      name: 'Blood Components',
      subtopics: [
        'Red blood cells and hemoglobin',
        'White blood cell types',
        'Platelets and clotting',
        'Blood plasma',
        'Blood types and Rh factor',
      ],
      keyTerms: ['erythrocyte', 'leukocyte', 'platelet', 'hemoglobin', 'plasma', 'fibrin', 'ABO blood type'],
    },
  ],

  Respiratory: [
    {
      name: 'Upper Respiratory Tract',
      subtopics: [
        'Nasal cavity and sinuses',
        'Pharynx divisions',
        'Larynx and vocal cords',
        'Epiglottis function',
      ],
      keyTerms: ['pharynx', 'larynx', 'epiglottis', 'trachea', 'glottis', 'sinuses'],
    },
    {
      name: 'Lower Respiratory Tract',
      subtopics: [
        'Trachea structure',
        'Bronchi and bronchioles',
        'Alveoli structure and function',
        'Lung lobes and segments',
      ],
      keyTerms: ['bronchus', 'bronchiole', 'alveolus', 'surfactant', 'pleura'],
    },
    {
      name: 'Breathing Mechanics',
      subtopics: [
        'Diaphragm and intercostal muscles',
        'Inspiration and expiration',
        'Lung volumes and capacities',
        'Respiratory rate control',
      ],
      keyTerms: ['diaphragm', 'tidal volume', 'vital capacity', 'residual volume', 'ventilation'],
    },
    {
      name: 'Gas Exchange',
      subtopics: [
        'Oxygen diffusion',
        'Carbon dioxide transport',
        'Hemoglobin oxygen binding',
        'Partial pressure gradients',
      ],
      keyTerms: ['diffusion', 'partial pressure', 'oxyhemoglobin', 'carbaminohemoglobin', 'bicarbonate'],
    },
  ],

  Digestive: [
    {
      name: 'Upper GI Tract',
      subtopics: [
        'Mouth and salivary glands',
        'Esophagus and swallowing',
        'Stomach anatomy',
        'Gastric secretions',
      ],
      keyTerms: ['esophagus', 'peristalsis', 'fundus', 'pylorus', 'gastric juice', 'pepsin', 'amylase'],
    },
    {
      name: 'Small Intestine',
      subtopics: [
        'Duodenum, jejunum, ileum',
        'Villi and microvilli',
        'Nutrient absorption',
        'Intestinal enzymes',
      ],
      keyTerms: ['duodenum', 'jejunum', 'ileum', 'villus', 'lacteal', 'brush border'],
    },
    {
      name: 'Accessory Organs',
      subtopics: [
        'Liver functions',
        'Gallbladder and bile',
        'Pancreas digestive enzymes',
        'Hepatic portal system',
      ],
      keyTerms: ['liver', 'bile', 'gallbladder', 'pancreas', 'lipase', 'trypsin', 'hepatocyte'],
    },
    {
      name: 'Large Intestine',
      subtopics: [
        'Colon sections',
        'Water absorption',
        'Gut microbiome',
        'Defecation reflex',
      ],
      keyTerms: ['colon', 'cecum', 'appendix', 'rectum', 'feces', 'microbiome'],
    },
  ],

  Nervous: [
    {
      name: 'Brain Anatomy',
      subtopics: [
        'Cerebral cortex lobes',
        'Cerebellum function',
        'Brainstem structures',
        'Limbic system',
        'Ventricles and CSF',
      ],
      keyTerms: ['cerebrum', 'cerebellum', 'brainstem', 'hypothalamus', 'thalamus', 'hippocampus', 'amygdala'],
    },
    {
      name: 'Neurons and Synapses',
      subtopics: [
        'Neuron structure',
        'Action potentials',
        'Synaptic transmission',
        'Neurotransmitters',
      ],
      keyTerms: ['axon', 'dendrite', 'synapse', 'myelin', 'action potential', 'neurotransmitter', 'dopamine', 'serotonin'],
    },
    {
      name: 'Spinal Cord',
      subtopics: [
        'Spinal cord structure',
        'Spinal nerves',
        'Reflex arcs',
        'Ascending and descending tracts',
      ],
      keyTerms: ['spinal cord', 'reflex', 'gray matter', 'white matter', 'dorsal root', 'ventral root'],
    },
    {
      name: 'Peripheral Nervous System',
      subtopics: [
        'Cranial nerves',
        'Autonomic nervous system',
        'Sympathetic vs parasympathetic',
        'Sensory receptors',
      ],
      keyTerms: ['cranial nerve', 'vagus nerve', 'sympathetic', 'parasympathetic', 'ganglion'],
    },
  ],

  Musculoskeletal: [
    {
      name: 'Skeletal System',
      subtopics: [
        'Axial skeleton bones',
        'Appendicular skeleton',
        'Bone structure and types',
        'Bone development and growth',
      ],
      keyTerms: ['skull', 'vertebra', 'femur', 'humerus', 'compact bone', 'spongy bone', 'ossification'],
    },
    {
      name: 'Joints',
      subtopics: [
        'Types of joints',
        'Synovial joint structure',
        'Joint movements',
        'Cartilage types',
      ],
      keyTerms: ['synovial', 'cartilage', 'ligament', 'tendon', 'flexion', 'extension', 'rotation'],
    },
    {
      name: 'Muscle Types',
      subtopics: [
        'Skeletal muscle structure',
        'Cardiac muscle features',
        'Smooth muscle locations',
        'Muscle fiber types',
      ],
      keyTerms: ['sarcomere', 'myofibril', 'actin', 'myosin', 'striated', 'cardiac muscle'],
    },
    {
      name: 'Muscle Contraction',
      subtopics: [
        'Sliding filament theory',
        'Neuromuscular junction',
        'ATP and muscle energy',
        'Muscle fatigue',
      ],
      keyTerms: ['contraction', 'troponin', 'tropomyosin', 'calcium', 'ATP', 'motor unit'],
    },
  ],

  Immune: [
    {
      name: 'Innate Immunity',
      subtopics: [
        'Physical barriers',
        'Phagocytes and macrophages',
        'Inflammatory response',
        'Complement system',
      ],
      keyTerms: ['phagocyte', 'macrophage', 'neutrophil', 'inflammation', 'complement', 'cytokine'],
    },
    {
      name: 'Adaptive Immunity',
      subtopics: [
        'T cells and cell-mediated immunity',
        'B cells and antibodies',
        'Antigen presentation',
        'Memory cells',
      ],
      keyTerms: ['T cell', 'B cell', 'antibody', 'antigen', 'lymphocyte', 'immunoglobulin'],
    },
    {
      name: 'Lymphatic System',
      subtopics: [
        'Lymph nodes and vessels',
        'Spleen functions',
        'Thymus gland',
        'Tonsils and MALT',
      ],
      keyTerms: ['lymph', 'lymph node', 'spleen', 'thymus', 'tonsil', 'lymphatic vessel'],
    },
    {
      name: 'Immunity and Disease',
      subtopics: [
        'Vaccines and immunization',
        'Allergies and hypersensitivity',
        'Autoimmune diseases',
        'Immunodeficiency',
      ],
      keyTerms: ['vaccine', 'allergy', 'autoimmune', 'histamine', 'anaphylaxis'],
    },
  ],

  Endocrine: [
    {
      name: 'Hypothalamus and Pituitary',
      subtopics: [
        'Hypothalamic hormones',
        'Anterior pituitary hormones',
        'Posterior pituitary hormones',
        'Feedback loops',
      ],
      keyTerms: ['hypothalamus', 'pituitary', 'growth hormone', 'prolactin', 'ADH', 'oxytocin'],
    },
    {
      name: 'Thyroid and Parathyroid',
      subtopics: [
        'Thyroid hormones T3 and T4',
        'Metabolism regulation',
        'Calcitonin',
        'Parathyroid hormone',
      ],
      keyTerms: ['thyroid', 'thyroxine', 'T3', 'T4', 'calcitonin', 'parathyroid', 'calcium'],
    },
    {
      name: 'Adrenal Glands',
      subtopics: [
        'Adrenal cortex hormones',
        'Adrenal medulla hormones',
        'Stress response',
        'Cortisol functions',
      ],
      keyTerms: ['adrenal', 'cortisol', 'aldosterone', 'epinephrine', 'adrenaline', 'norepinephrine'],
    },
    {
      name: 'Pancreatic Hormones',
      subtopics: [
        'Insulin and glucagon',
        'Blood glucose regulation',
        'Diabetes types',
        'Islets of Langerhans',
      ],
      keyTerms: ['insulin', 'glucagon', 'pancreas', 'islet', 'glucose', 'diabetes', 'beta cell'],
    },
  ],

  Integumentary: [
    {
      name: 'Skin Layers',
      subtopics: [
        'Epidermis structure',
        'Dermis components',
        'Hypodermis function',
        'Skin cell types',
      ],
      keyTerms: ['epidermis', 'dermis', 'hypodermis', 'keratinocyte', 'melanocyte', 'stratum'],
    },
    {
      name: 'Skin Appendages',
      subtopics: [
        'Hair follicle structure',
        'Nail anatomy',
        'Sebaceous glands',
        'Sweat glands',
      ],
      keyTerms: ['hair follicle', 'nail', 'sebaceous', 'sweat gland', 'keratin', 'sebum'],
    },
    {
      name: 'Skin Functions',
      subtopics: [
        'Protection and barrier',
        'Temperature regulation',
        'Sensation and receptors',
        'Vitamin D synthesis',
      ],
      keyTerms: ['thermoregulation', 'melanin', 'vitamin D', 'receptor', 'sensation'],
    },
    {
      name: 'Wound Healing',
      subtopics: [
        'Hemostasis phase',
        'Inflammatory phase',
        'Proliferation phase',
        'Scar formation',
      ],
      keyTerms: ['wound healing', 'scar', 'collagen', 'granulation', 'epithelialization'],
    },
  ],

  Urinary: [
    {
      name: 'Kidney Anatomy',
      subtopics: [
        'Kidney structure',
        'Nephron components',
        'Renal cortex and medulla',
        'Blood supply to kidneys',
      ],
      keyTerms: ['kidney', 'nephron', 'cortex', 'medulla', 'renal artery', 'glomerulus'],
    },
    {
      name: 'Urine Formation',
      subtopics: [
        'Glomerular filtration',
        'Tubular reabsorption',
        'Tubular secretion',
        'Concentration of urine',
      ],
      keyTerms: ['filtration', 'reabsorption', 'secretion', 'GFR', 'loop of Henle', 'collecting duct'],
    },
    {
      name: 'Urinary Tract',
      subtopics: [
        'Ureters',
        'Urinary bladder',
        'Urethra',
        'Micturition reflex',
      ],
      keyTerms: ['ureter', 'bladder', 'urethra', 'micturition', 'sphincter'],
    },
    {
      name: 'Fluid Balance',
      subtopics: [
        'Water balance regulation',
        'Electrolyte balance',
        'ADH and aldosterone',
        'pH regulation by kidneys',
      ],
      keyTerms: ['ADH', 'aldosterone', 'sodium', 'potassium', 'acid-base', 'buffer'],
    },
  ],
};

/**
 * Get all topics for a subcategory
 */
export function getSubcategoryTopics(subcategory: string): string[] {
  const topics = HUMAN_BODY_TOPICS[subcategory];
  if (!topics) return [];

  return topics.flatMap(t => t.subtopics);
}

/**
 * Get all subcategories
 */
export function getAllSubcategories(): string[] {
  return Object.keys(HUMAN_BODY_TOPICS);
}

/**
 * Get topic count for planning
 */
export function getTotalTopicCount(): number {
  let count = 0;
  for (const topics of Object.values(HUMAN_BODY_TOPICS)) {
    for (const topic of topics) {
      count += topic.subtopics.length;
    }
  }
  return count;
}

/**
 * Get a flat list of all topics with their subcategory
 */
export function getAllTopicsFlat(): Array<{ subcategory: string; topic: string; keyTerms: string[] }> {
  const result: Array<{ subcategory: string; topic: string; keyTerms: string[] }> = [];

  for (const [subcategory, topics] of Object.entries(HUMAN_BODY_TOPICS)) {
    for (const topicDef of topics) {
      for (const subtopic of topicDef.subtopics) {
        result.push({
          subcategory,
          topic: subtopic,
          keyTerms: topicDef.keyTerms,
        });
      }
    }
  }

  return result;
}

/**
 * Get topics for a specific difficulty level
 * Some topics are more appropriate for certain difficulties
 */
export function getTopicsForDifficulty(
  difficulty: QuestionDifficulty
): Array<{ subcategory: string; topic: string }> {
  const allTopics = getAllTopicsFlat();

  // All topics are available at all difficulties, but we can weight them
  // For now, return all topics and let the AI adjust complexity
  return allTopics.map(t => ({
    subcategory: t.subcategory,
    topic: t.topic,
  }));
}

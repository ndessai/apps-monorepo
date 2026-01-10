/**
 * Configuration for question generation
 */

// QB Reader API configuration
export const QBREADER_CONFIG = {
  baseUrl: 'https://www.qbreader.org/api',
  rateLimit: {
    maxConcurrent: 5,
    minTime: 50, // 20 requests per second = 50ms between requests
  },
  maxReturnLength: 1000, // Questions per request
  retryAttempts: 3,
  retryDelayMs: 1000,
};

// Difficulty mapping from QB Reader (0-10) to App levels
export const DIFFICULTY_MAP: Record<number, 'middle_school' | 'high_school' | 'college' | 'open'> = {
  0: 'middle_school',
  1: 'middle_school',
  2: 'middle_school',
  3: 'high_school',
  4: 'high_school',
  5: 'high_school',
  6: 'college',
  7: 'college',
  8: 'open',
  9: 'open',
  10: 'open',
};

// QB Reader difficulty ranges for fetching
export const QB_DIFFICULTY_RANGES = {
  middle_school: [1, 2],
  high_school: [3, 4, 5],
  college: [6, 7],
  open: [8, 9, 10],
};

// Category mapping from QB Reader to App
export const CATEGORY_MAP: Record<string, string> = {
  'Science': 'Science',
  'Literature': 'Literature',
  'History': 'History',
  'Fine Arts': 'Fine Arts',
  'Geography': 'Geography',
  'Social Science': 'Social Science',
  'Mythology': 'Mythology',
  'Philosophy': 'Philosophy',
  'Religion': 'Philosophy', // Merge into Philosophy
  'Current Events': 'Current Events',
  'Trash': null as any, // Skip pop culture/trash
};

// Categories to fetch from QB Reader
export const QB_CATEGORIES = [
  'Science',
  'Literature',
  'History',
  'Fine Arts',
  'Geography',
  'Social Science',
  'Mythology',
  'Philosophy',
  'Religion',
];

// Target question counts per category
export const TARGET_COUNTS = {
  Science: { tossups: 1000, bonuses: 1000 },
  Literature: { tossups: 1000, bonuses: 1000 },
  History: { tossups: 1000, bonuses: 1000 },
  'Fine Arts': { tossups: 500, bonuses: 500 },
  Geography: { tossups: 300, bonuses: 300 },
  'Social Science': { tossups: 300, bonuses: 300 },
  Mathematics: { tossups: 300, bonuses: 300 },
  Mythology: { tossups: 300, bonuses: 300 },
  Philosophy: { tossups: 200, bonuses: 200 },
  'Current Events': { tossups: 200, bonuses: 200 },
  'Human Body': { tossups: 500, bonuses: 500 },
};

// Packet configuration
export const PACKET_CONFIG = {
  tossupCount: 20,
  bonusCount: 20,
  targetPackets: 100,
};

// Human Body topics for AI generation
export const HUMAN_BODY_TOPICS = {
  Cardiovascular: [
    'Heart anatomy and chambers',
    'Blood vessels (arteries, veins, capillaries)',
    'Blood circulation pathways',
    'Blood types and transfusions',
    'Heart diseases and conditions',
    'Blood pressure regulation',
    'Cardiac cycle and heartbeat',
    'Red blood cells and hemoglobin',
  ],
  Respiratory: [
    'Lung anatomy and structure',
    'Breathing mechanics',
    'Gas exchange in alveoli',
    'Respiratory diseases',
    'Trachea and bronchi',
    'Diaphragm function',
    'Oxygen transport',
    'Respiratory rate control',
  ],
  Digestive: [
    'Stomach anatomy and function',
    'Small and large intestines',
    'Liver functions',
    'Pancreas and enzymes',
    'Digestive enzymes',
    'Nutrient absorption',
    'Digestive disorders',
    'Esophagus and swallowing',
  ],
  Nervous: [
    'Brain regions and functions',
    'Neurons and synapses',
    'Spinal cord structure',
    'Reflexes and reflex arcs',
    'Neurotransmitters',
    'Sensory systems',
    'Motor control',
    'Peripheral nervous system',
  ],
  Musculoskeletal: [
    'Major bones of the skeleton',
    'Muscle types and function',
    'Joint types and movement',
    'Tendons and ligaments',
    'Bone structure and growth',
    'Skeletal disorders',
    'Muscle contraction',
    'Posture and movement',
  ],
  Immune: [
    'White blood cells types',
    'Antibodies and antigens',
    'Lymphatic system',
    'Immune response stages',
    'Vaccines and immunity',
    'Autoimmune diseases',
    'Inflammation response',
    'Lymph nodes and spleen',
  ],
  Endocrine: [
    'Hormones and their functions',
    'Thyroid gland',
    'Pituitary gland',
    'Adrenal glands',
    'Insulin and diabetes',
    'Growth hormone',
    'Metabolism regulation',
    'Hormone feedback loops',
  ],
  Integumentary: [
    'Skin layers (epidermis, dermis)',
    'Hair structure and growth',
    'Nail anatomy',
    'Sweat glands',
    'Skin conditions',
    'Wound healing',
    'Melanin and pigmentation',
    'Temperature regulation',
  ],
  Urinary: [
    'Kidney anatomy',
    'Bladder function',
    'Filtration process',
    'Urine formation',
    'Kidney diseases',
    'Nephron structure',
    'Water balance',
    'Waste elimination',
  ],
};

// Output paths
export const OUTPUT_PATHS = {
  packetsDir: '../../src/assets/questions/packets',
  byCategoryDir: '../../src/assets/questions/by-category',
  metadataFile: '../../src/assets/questions/metadata.json',
  checkpointFile: './.checkpoint.json',
  rawQBReaderDir: './raw-data/qbreader',
  rawAIDir: './raw-data/ai-generated',
};

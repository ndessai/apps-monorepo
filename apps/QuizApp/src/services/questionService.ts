/**
 * Question Service
 *
 * Loads and validates NAQT-format quiz questions
 * - Onboarding mode: uses sample-questions.json (2 tossups + bonuses)
 * - Regular mode: loads random packet from 264 available packets
 */

import { QuizData, TossupQuestion, BonusQuestion, QuestionCategory, QuestionDifficulty } from '../types/quiz';
import sampleQuestions from '../assets/sample-questions.json';

// Import all 264 packets statically (React Native requires static imports for bundled assets)
import packet001 from '../assets/questions/packets/packet-001.json';
import packet002 from '../assets/questions/packets/packet-002.json';
import packet003 from '../assets/questions/packets/packet-003.json';
import packet004 from '../assets/questions/packets/packet-004.json';
import packet005 from '../assets/questions/packets/packet-005.json';
import packet006 from '../assets/questions/packets/packet-006.json';
import packet007 from '../assets/questions/packets/packet-007.json';
import packet008 from '../assets/questions/packets/packet-008.json';
import packet009 from '../assets/questions/packets/packet-009.json';
import packet010 from '../assets/questions/packets/packet-010.json';
import packet011 from '../assets/questions/packets/packet-011.json';
import packet012 from '../assets/questions/packets/packet-012.json';
import packet013 from '../assets/questions/packets/packet-013.json';
import packet014 from '../assets/questions/packets/packet-014.json';
import packet015 from '../assets/questions/packets/packet-015.json';
import packet016 from '../assets/questions/packets/packet-016.json';
import packet017 from '../assets/questions/packets/packet-017.json';
import packet018 from '../assets/questions/packets/packet-018.json';
import packet019 from '../assets/questions/packets/packet-019.json';
import packet020 from '../assets/questions/packets/packet-020.json';
import packet021 from '../assets/questions/packets/packet-021.json';
import packet022 from '../assets/questions/packets/packet-022.json';
import packet023 from '../assets/questions/packets/packet-023.json';
import packet024 from '../assets/questions/packets/packet-024.json';
import packet025 from '../assets/questions/packets/packet-025.json';
import packet026 from '../assets/questions/packets/packet-026.json';
import packet027 from '../assets/questions/packets/packet-027.json';
import packet028 from '../assets/questions/packets/packet-028.json';
import packet029 from '../assets/questions/packets/packet-029.json';
import packet030 from '../assets/questions/packets/packet-030.json';
import packet031 from '../assets/questions/packets/packet-031.json';
import packet032 from '../assets/questions/packets/packet-032.json';
import packet033 from '../assets/questions/packets/packet-033.json';
import packet034 from '../assets/questions/packets/packet-034.json';
import packet035 from '../assets/questions/packets/packet-035.json';
import packet036 from '../assets/questions/packets/packet-036.json';
import packet037 from '../assets/questions/packets/packet-037.json';
import packet038 from '../assets/questions/packets/packet-038.json';
import packet039 from '../assets/questions/packets/packet-039.json';
import packet040 from '../assets/questions/packets/packet-040.json';
import packet041 from '../assets/questions/packets/packet-041.json';
import packet042 from '../assets/questions/packets/packet-042.json';
import packet043 from '../assets/questions/packets/packet-043.json';
import packet044 from '../assets/questions/packets/packet-044.json';
import packet045 from '../assets/questions/packets/packet-045.json';
import packet046 from '../assets/questions/packets/packet-046.json';
import packet047 from '../assets/questions/packets/packet-047.json';
import packet048 from '../assets/questions/packets/packet-048.json';
import packet049 from '../assets/questions/packets/packet-049.json';
import packet050 from '../assets/questions/packets/packet-050.json';
import packet051 from '../assets/questions/packets/packet-051.json';
import packet052 from '../assets/questions/packets/packet-052.json';
import packet053 from '../assets/questions/packets/packet-053.json';
import packet054 from '../assets/questions/packets/packet-054.json';
import packet055 from '../assets/questions/packets/packet-055.json';
import packet056 from '../assets/questions/packets/packet-056.json';
import packet057 from '../assets/questions/packets/packet-057.json';
import packet058 from '../assets/questions/packets/packet-058.json';
import packet059 from '../assets/questions/packets/packet-059.json';
import packet060 from '../assets/questions/packets/packet-060.json';
import packet061 from '../assets/questions/packets/packet-061.json';
import packet062 from '../assets/questions/packets/packet-062.json';
import packet063 from '../assets/questions/packets/packet-063.json';
import packet064 from '../assets/questions/packets/packet-064.json';
import packet065 from '../assets/questions/packets/packet-065.json';
import packet066 from '../assets/questions/packets/packet-066.json';
import packet067 from '../assets/questions/packets/packet-067.json';
import packet068 from '../assets/questions/packets/packet-068.json';
import packet069 from '../assets/questions/packets/packet-069.json';
import packet070 from '../assets/questions/packets/packet-070.json';
import packet071 from '../assets/questions/packets/packet-071.json';
import packet072 from '../assets/questions/packets/packet-072.json';
import packet073 from '../assets/questions/packets/packet-073.json';
import packet074 from '../assets/questions/packets/packet-074.json';
import packet075 from '../assets/questions/packets/packet-075.json';
import packet076 from '../assets/questions/packets/packet-076.json';
import packet077 from '../assets/questions/packets/packet-077.json';
import packet078 from '../assets/questions/packets/packet-078.json';
import packet079 from '../assets/questions/packets/packet-079.json';
import packet080 from '../assets/questions/packets/packet-080.json';
import packet081 from '../assets/questions/packets/packet-081.json';
import packet082 from '../assets/questions/packets/packet-082.json';
import packet083 from '../assets/questions/packets/packet-083.json';
import packet084 from '../assets/questions/packets/packet-084.json';
import packet085 from '../assets/questions/packets/packet-085.json';
import packet086 from '../assets/questions/packets/packet-086.json';
import packet087 from '../assets/questions/packets/packet-087.json';
import packet088 from '../assets/questions/packets/packet-088.json';
import packet089 from '../assets/questions/packets/packet-089.json';
import packet090 from '../assets/questions/packets/packet-090.json';
import packet091 from '../assets/questions/packets/packet-091.json';
import packet092 from '../assets/questions/packets/packet-092.json';
import packet093 from '../assets/questions/packets/packet-093.json';
import packet094 from '../assets/questions/packets/packet-094.json';
import packet095 from '../assets/questions/packets/packet-095.json';
import packet096 from '../assets/questions/packets/packet-096.json';
import packet097 from '../assets/questions/packets/packet-097.json';
import packet098 from '../assets/questions/packets/packet-098.json';
import packet099 from '../assets/questions/packets/packet-099.json';
import packet100 from '../assets/questions/packets/packet-100.json';
import packet101 from '../assets/questions/packets/packet-101.json';
import packet102 from '../assets/questions/packets/packet-102.json';
import packet103 from '../assets/questions/packets/packet-103.json';
import packet104 from '../assets/questions/packets/packet-104.json';
import packet105 from '../assets/questions/packets/packet-105.json';
import packet106 from '../assets/questions/packets/packet-106.json';
import packet107 from '../assets/questions/packets/packet-107.json';
import packet108 from '../assets/questions/packets/packet-108.json';
import packet109 from '../assets/questions/packets/packet-109.json';
import packet110 from '../assets/questions/packets/packet-110.json';
import packet111 from '../assets/questions/packets/packet-111.json';
import packet112 from '../assets/questions/packets/packet-112.json';
import packet113 from '../assets/questions/packets/packet-113.json';
import packet114 from '../assets/questions/packets/packet-114.json';
import packet115 from '../assets/questions/packets/packet-115.json';
import packet116 from '../assets/questions/packets/packet-116.json';
import packet117 from '../assets/questions/packets/packet-117.json';
import packet118 from '../assets/questions/packets/packet-118.json';
import packet119 from '../assets/questions/packets/packet-119.json';
import packet120 from '../assets/questions/packets/packet-120.json';
import packet121 from '../assets/questions/packets/packet-121.json';
import packet122 from '../assets/questions/packets/packet-122.json';
import packet123 from '../assets/questions/packets/packet-123.json';
import packet124 from '../assets/questions/packets/packet-124.json';
import packet125 from '../assets/questions/packets/packet-125.json';
import packet126 from '../assets/questions/packets/packet-126.json';
import packet127 from '../assets/questions/packets/packet-127.json';
import packet128 from '../assets/questions/packets/packet-128.json';
import packet129 from '../assets/questions/packets/packet-129.json';
import packet130 from '../assets/questions/packets/packet-130.json';
import packet131 from '../assets/questions/packets/packet-131.json';
import packet132 from '../assets/questions/packets/packet-132.json';
import packet133 from '../assets/questions/packets/packet-133.json';
import packet134 from '../assets/questions/packets/packet-134.json';
import packet135 from '../assets/questions/packets/packet-135.json';
import packet136 from '../assets/questions/packets/packet-136.json';
import packet137 from '../assets/questions/packets/packet-137.json';
import packet138 from '../assets/questions/packets/packet-138.json';
import packet139 from '../assets/questions/packets/packet-139.json';
import packet140 from '../assets/questions/packets/packet-140.json';
import packet141 from '../assets/questions/packets/packet-141.json';
import packet142 from '../assets/questions/packets/packet-142.json';
import packet143 from '../assets/questions/packets/packet-143.json';
import packet144 from '../assets/questions/packets/packet-144.json';
import packet145 from '../assets/questions/packets/packet-145.json';
import packet146 from '../assets/questions/packets/packet-146.json';
import packet147 from '../assets/questions/packets/packet-147.json';
import packet148 from '../assets/questions/packets/packet-148.json';
import packet149 from '../assets/questions/packets/packet-149.json';
import packet150 from '../assets/questions/packets/packet-150.json';
import packet151 from '../assets/questions/packets/packet-151.json';
import packet152 from '../assets/questions/packets/packet-152.json';
import packet153 from '../assets/questions/packets/packet-153.json';
import packet154 from '../assets/questions/packets/packet-154.json';
import packet155 from '../assets/questions/packets/packet-155.json';
import packet156 from '../assets/questions/packets/packet-156.json';
import packet157 from '../assets/questions/packets/packet-157.json';
import packet158 from '../assets/questions/packets/packet-158.json';
import packet159 from '../assets/questions/packets/packet-159.json';
import packet160 from '../assets/questions/packets/packet-160.json';
import packet161 from '../assets/questions/packets/packet-161.json';
import packet162 from '../assets/questions/packets/packet-162.json';
import packet163 from '../assets/questions/packets/packet-163.json';
import packet164 from '../assets/questions/packets/packet-164.json';
import packet165 from '../assets/questions/packets/packet-165.json';
import packet166 from '../assets/questions/packets/packet-166.json';
import packet167 from '../assets/questions/packets/packet-167.json';
import packet168 from '../assets/questions/packets/packet-168.json';
import packet169 from '../assets/questions/packets/packet-169.json';
import packet170 from '../assets/questions/packets/packet-170.json';
import packet171 from '../assets/questions/packets/packet-171.json';
import packet172 from '../assets/questions/packets/packet-172.json';
import packet173 from '../assets/questions/packets/packet-173.json';
import packet174 from '../assets/questions/packets/packet-174.json';
import packet175 from '../assets/questions/packets/packet-175.json';
import packet176 from '../assets/questions/packets/packet-176.json';
import packet177 from '../assets/questions/packets/packet-177.json';
import packet178 from '../assets/questions/packets/packet-178.json';
import packet179 from '../assets/questions/packets/packet-179.json';
import packet180 from '../assets/questions/packets/packet-180.json';
import packet181 from '../assets/questions/packets/packet-181.json';
import packet182 from '../assets/questions/packets/packet-182.json';
import packet183 from '../assets/questions/packets/packet-183.json';
import packet184 from '../assets/questions/packets/packet-184.json';
import packet185 from '../assets/questions/packets/packet-185.json';
import packet186 from '../assets/questions/packets/packet-186.json';
import packet187 from '../assets/questions/packets/packet-187.json';
import packet188 from '../assets/questions/packets/packet-188.json';
import packet189 from '../assets/questions/packets/packet-189.json';
import packet190 from '../assets/questions/packets/packet-190.json';
import packet191 from '../assets/questions/packets/packet-191.json';
import packet192 from '../assets/questions/packets/packet-192.json';
import packet193 from '../assets/questions/packets/packet-193.json';
import packet194 from '../assets/questions/packets/packet-194.json';
import packet195 from '../assets/questions/packets/packet-195.json';
import packet196 from '../assets/questions/packets/packet-196.json';
import packet197 from '../assets/questions/packets/packet-197.json';
import packet198 from '../assets/questions/packets/packet-198.json';
import packet199 from '../assets/questions/packets/packet-199.json';
import packet200 from '../assets/questions/packets/packet-200.json';
import packet201 from '../assets/questions/packets/packet-201.json';
import packet202 from '../assets/questions/packets/packet-202.json';
import packet203 from '../assets/questions/packets/packet-203.json';
import packet204 from '../assets/questions/packets/packet-204.json';
import packet205 from '../assets/questions/packets/packet-205.json';
import packet206 from '../assets/questions/packets/packet-206.json';
import packet207 from '../assets/questions/packets/packet-207.json';
import packet208 from '../assets/questions/packets/packet-208.json';
import packet209 from '../assets/questions/packets/packet-209.json';
import packet210 from '../assets/questions/packets/packet-210.json';
import packet211 from '../assets/questions/packets/packet-211.json';
import packet212 from '../assets/questions/packets/packet-212.json';
import packet213 from '../assets/questions/packets/packet-213.json';
import packet214 from '../assets/questions/packets/packet-214.json';
import packet215 from '../assets/questions/packets/packet-215.json';
import packet216 from '../assets/questions/packets/packet-216.json';
import packet217 from '../assets/questions/packets/packet-217.json';
import packet218 from '../assets/questions/packets/packet-218.json';
import packet219 from '../assets/questions/packets/packet-219.json';
import packet220 from '../assets/questions/packets/packet-220.json';
import packet221 from '../assets/questions/packets/packet-221.json';
import packet222 from '../assets/questions/packets/packet-222.json';
import packet223 from '../assets/questions/packets/packet-223.json';
import packet224 from '../assets/questions/packets/packet-224.json';
import packet225 from '../assets/questions/packets/packet-225.json';
import packet226 from '../assets/questions/packets/packet-226.json';
import packet227 from '../assets/questions/packets/packet-227.json';
import packet228 from '../assets/questions/packets/packet-228.json';
import packet229 from '../assets/questions/packets/packet-229.json';
import packet230 from '../assets/questions/packets/packet-230.json';
import packet231 from '../assets/questions/packets/packet-231.json';
import packet232 from '../assets/questions/packets/packet-232.json';
import packet233 from '../assets/questions/packets/packet-233.json';
import packet234 from '../assets/questions/packets/packet-234.json';
import packet235 from '../assets/questions/packets/packet-235.json';
import packet236 from '../assets/questions/packets/packet-236.json';
import packet237 from '../assets/questions/packets/packet-237.json';
import packet238 from '../assets/questions/packets/packet-238.json';
import packet239 from '../assets/questions/packets/packet-239.json';
import packet240 from '../assets/questions/packets/packet-240.json';
import packet241 from '../assets/questions/packets/packet-241.json';
import packet242 from '../assets/questions/packets/packet-242.json';
import packet243 from '../assets/questions/packets/packet-243.json';
import packet244 from '../assets/questions/packets/packet-244.json';
import packet245 from '../assets/questions/packets/packet-245.json';
import packet246 from '../assets/questions/packets/packet-246.json';
import packet247 from '../assets/questions/packets/packet-247.json';
import packet248 from '../assets/questions/packets/packet-248.json';
import packet249 from '../assets/questions/packets/packet-249.json';
import packet250 from '../assets/questions/packets/packet-250.json';
import packet251 from '../assets/questions/packets/packet-251.json';
import packet252 from '../assets/questions/packets/packet-252.json';
import packet253 from '../assets/questions/packets/packet-253.json';
import packet254 from '../assets/questions/packets/packet-254.json';
import packet255 from '../assets/questions/packets/packet-255.json';
import packet256 from '../assets/questions/packets/packet-256.json';
import packet257 from '../assets/questions/packets/packet-257.json';
import packet258 from '../assets/questions/packets/packet-258.json';
import packet259 from '../assets/questions/packets/packet-259.json';
import packet260 from '../assets/questions/packets/packet-260.json';
import packet261 from '../assets/questions/packets/packet-261.json';
import packet262 from '../assets/questions/packets/packet-262.json';
import packet263 from '../assets/questions/packets/packet-263.json';
import packet264 from '../assets/questions/packets/packet-264.json';

// Array of all 264 packets for random selection
const PACKETS = [
  packet001, packet002, packet003, packet004, packet005,
  packet006, packet007, packet008, packet009, packet010,
  packet011, packet012, packet013, packet014, packet015,
  packet016, packet017, packet018, packet019, packet020,
  packet021, packet022, packet023, packet024, packet025,
  packet026, packet027, packet028, packet029, packet030,
  packet031, packet032, packet033, packet034, packet035,
  packet036, packet037, packet038, packet039, packet040,
  packet041, packet042, packet043, packet044, packet045,
  packet046, packet047, packet048, packet049, packet050,
  packet051, packet052, packet053, packet054, packet055,
  packet056, packet057, packet058, packet059, packet060,
  packet061, packet062, packet063, packet064, packet065,
  packet066, packet067, packet068, packet069, packet070,
  packet071, packet072, packet073, packet074, packet075,
  packet076, packet077, packet078, packet079, packet080,
  packet081, packet082, packet083, packet084, packet085,
  packet086, packet087, packet088, packet089, packet090,
  packet091, packet092, packet093, packet094, packet095,
  packet096, packet097, packet098, packet099, packet100,
  packet101, packet102, packet103, packet104, packet105,
  packet106, packet107, packet108, packet109, packet110,
  packet111, packet112, packet113, packet114, packet115,
  packet116, packet117, packet118, packet119, packet120,
  packet121, packet122, packet123, packet124, packet125,
  packet126, packet127, packet128, packet129, packet130,
  packet131, packet132, packet133, packet134, packet135,
  packet136, packet137, packet138, packet139, packet140,
  packet141, packet142, packet143, packet144, packet145,
  packet146, packet147, packet148, packet149, packet150,
  packet151, packet152, packet153, packet154, packet155,
  packet156, packet157, packet158, packet159, packet160,
  packet161, packet162, packet163, packet164, packet165,
  packet166, packet167, packet168, packet169, packet170,
  packet171, packet172, packet173, packet174, packet175,
  packet176, packet177, packet178, packet179, packet180,
  packet181, packet182, packet183, packet184, packet185,
  packet186, packet187, packet188, packet189, packet190,
  packet191, packet192, packet193, packet194, packet195,
  packet196, packet197, packet198, packet199, packet200,
  packet201, packet202, packet203, packet204, packet205,
  packet206, packet207, packet208, packet209, packet210,
  packet211, packet212, packet213, packet214, packet215,
  packet216, packet217, packet218, packet219, packet220,
  packet221, packet222, packet223, packet224, packet225,
  packet226, packet227, packet228, packet229, packet230,
  packet231, packet232, packet233, packet234, packet235,
  packet236, packet237, packet238, packet239, packet240,
  packet241, packet242, packet243, packet244, packet245,
  packet246, packet247, packet248, packet249, packet250,
  packet251, packet252, packet253, packet254, packet255,
  packet256, packet257, packet258, packet259, packet260,
  packet261, packet262, packet263, packet264,
];

// Types for packet system
interface PacketMetadata {
  id: string;
  file: string;
  difficulty: QuestionDifficulty | 'mixed';
  categories: QuestionCategory[];
  tossupCount: number;
  bonusCount: number;
}

interface QuestionsMetadata {
  version: string;
  generatedAt: string;
  totalPackets: number;
  totalTossups: number;
  totalBonuses: number;
  packets: PacketMetadata[];
  categoryStats: Record<QuestionCategory, { tossups: number; bonuses: number }>;
}

interface QuizFilters {
  categories?: QuestionCategory[];
  difficulty?: QuestionDifficulty;
  packetId?: string;
}

/**
 * Load questions from JSON file
 * @param isOnboarding - If true, loads sample questions; otherwise loads a random packet
 */
export async function loadQuestions(isOnboarding: boolean = false): Promise<QuizData> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        let quizData: QuizData;

        if (isOnboarding) {
          // Load sample questions for onboarding (2 tossups + bonuses)
          quizData = sampleQuestions as QuizData;
        } else {
          // Load a random packet for regular quiz
          const randomIndex = Math.floor(Math.random() * PACKETS.length);
          const packet = PACKETS[randomIndex];
          quizData = {
            tossups: packet.tossups,
            bonuses: packet.bonuses,
          } as QuizData;
        }

        if (!validateQuizData(quizData)) {
          reject(new Error('Invalid quiz data format'));
          return;
        }

        resolve(quizData);
      } catch (error) {
        reject(new Error(`Failed to load questions: ${error}`));
      }
    }, 100);
  });
}

/**
 * Get list of available packets
 */
export async function getPacketList(): Promise<QuestionsMetadata | null> {
  // TODO: Implement packet list loading from metadata.json if needed
  return null;
}

/**
 * Load a specific packet by ID (1-100)
 */
export async function loadPacket(packetId: string): Promise<QuizData> {
  const packetNum = parseInt(packetId.replace('packet-', ''), 10);
  if (isNaN(packetNum) || packetNum < 1 || packetNum > PACKETS.length) {
    throw new Error(`Invalid packet ID: ${packetId}. Must be packet-001 to packet-${String(PACKETS.length).padStart(3, '0')}`);
  }

  const packet = PACKETS[packetNum - 1];
  const quizData: QuizData = {
    tossups: packet.tossups,
    bonuses: packet.bonuses,
  } as QuizData;

  if (!validateQuizData(quizData)) {
    throw new Error('Invalid quiz data format in packet');
  }

  return quizData;
}

/**
 * Load a random packet, optionally filtered by criteria
 */
export async function loadRandomPacket(_filters?: QuizFilters): Promise<QuizData> {
  return loadQuestions(false);
}

/**
 * Load questions by category
 * TODO: Implement category-specific loading from by-category folder
 */
export async function loadByCategory(_category: QuestionCategory): Promise<QuizData> {
  // For now, just load a random packet
  return loadQuestions(false);
}

/**
 * Load questions filtered by multiple criteria
 */
export async function loadFilteredQuestions(_filters: QuizFilters): Promise<QuizData> {
  return loadQuestions(false);
}

/**
 * Get statistics about available questions
 */
export async function getQuestionStats(): Promise<{
  totalPackets: number;
  totalTossups: number;
  totalBonuses: number;
  categories: QuestionCategory[];
  categoryStats: Record<string, { tossups: number; bonuses: number }>;
} | null> {
  // Return basic stats based on loaded packets
  return {
    totalPackets: PACKETS.length,
    totalTossups: PACKETS.length * 20, // Approximate - each packet has ~20 tossups
    totalBonuses: PACKETS.length * 20, // Approximate - each packet has ~20 bonuses
    categories: ['History', 'Literature', 'Science', 'Fine Arts', 'Geography', 'Mythology', 'Philosophy', 'Social Science'] as QuestionCategory[],
    categoryStats: {},
  };
}

/**
 * Clear the packet cache (no-op since we use static imports)
 */
export function clearCache(): void {
  // No-op - packets are statically imported
}

/**
 * Validate quiz data structure
 * Ensures all required fields are present and properly formatted
 */
export function validateQuizData(data: any): boolean {
  try {
    // Check if data exists and has required properties
    if (!data || typeof data !== 'object') {
      console.error('Quiz data is not an object');
      return false;
    }

    if (!Array.isArray(data.tossups) || !Array.isArray(data.bonuses)) {
      console.error('Missing tossups or bonuses arrays');
      return false;
    }

    // Validate each toss-up
    for (const tossup of data.tossups) {
      if (!validateTossup(tossup)) {
        return false;
      }
    }

    // Validate each bonus
    for (const bonus of data.bonuses) {
      if (!validateBonus(bonus)) {
        return false;
      }
    }

    // Ensure bonuses link to valid toss-ups
    const tossupIds = new Set(data.tossups.map((t: TossupQuestion) => t.id));
    for (const bonus of data.bonuses) {
      if (!tossupIds.has(bonus.linkedTossupId)) {
        console.error(`Bonus ${bonus.id} links to non-existent toss-up ${bonus.linkedTossupId}`);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error validating quiz data:', error);
    return false;
  }
}

/**
 * Validate a single toss-up question
 */
function validateTossup(tossup: any): boolean {
  if (!tossup.id || typeof tossup.id !== 'string') {
    console.error('Toss-up missing or invalid id');
    return false;
  }

  if (!tossup.text || typeof tossup.text !== 'string') {
    console.error(`Toss-up ${tossup.id} missing or invalid text`);
    return false;
  }

  if (typeof tossup.powerMarkPosition !== 'number') {
    console.error(`Toss-up ${tossup.id} missing or invalid powerMarkPosition`);
    return false;
  }

  if (!tossup.answer || typeof tossup.answer !== 'string') {
    console.error(`Toss-up ${tossup.id} missing or invalid answer`);
    return false;
  }

  if (!Array.isArray(tossup.acceptableAnswers) || tossup.acceptableAnswers.length === 0) {
    console.error(`Toss-up ${tossup.id} missing or invalid acceptableAnswers`);
    return false;
  }

  return true;
}

/**
 * Validate a single bonus question
 */
function validateBonus(bonus: any): boolean {
  if (!bonus.id || typeof bonus.id !== 'string') {
    console.error('Bonus missing or invalid id');
    return false;
  }

  if (!bonus.linkedTossupId || typeof bonus.linkedTossupId !== 'string') {
    console.error(`Bonus ${bonus.id} missing or invalid linkedTossupId`);
    return false;
  }

  if (!Array.isArray(bonus.parts) || bonus.parts.length !== 3) {
    console.error(`Bonus ${bonus.id} must have exactly 3 parts`);
    return false;
  }

  // Validate each part
  for (let i = 0; i < bonus.parts.length; i++) {
    const part = bonus.parts[i];
    if (!part.text || typeof part.text !== 'string') {
      console.error(`Bonus ${bonus.id} part ${i} missing or invalid text`);
      return false;
    }
    if (!part.answer || typeof part.answer !== 'string') {
      console.error(`Bonus ${bonus.id} part ${i} missing or invalid answer`);
      return false;
    }
    if (!Array.isArray(part.acceptableAnswers) || part.acceptableAnswers.length === 0) {
      console.error(`Bonus ${bonus.id} part ${i} missing or invalid acceptableAnswers`);
      return false;
    }
  }

  return true;
}

/**
 * Get the bonus question linked to a toss-up
 * @param quizData The quiz data
 * @param tossupId The toss-up question ID
 * @returns The linked bonus question, or null if not found
 */
export function getLinkedBonus(
  quizData: QuizData,
  tossupId: string
): BonusQuestion | null {
  const bonus = quizData.bonuses.find((b) => b.linkedTossupId === tossupId);
  return bonus || null;
}

/**
 * Get a question by ID
 * @param quizData The quiz data
 * @param questionId The question ID
 * @returns The question, or null if not found
 */
export function getQuestionById(
  quizData: QuizData,
  questionId: string
): TossupQuestion | BonusQuestion | null {
  // Check toss-ups
  const tossup = quizData.tossups.find((t) => t.id === questionId);
  if (tossup) return tossup;

  // Check bonuses
  const bonus = quizData.bonuses.find((b) => b.id === questionId);
  if (bonus) return bonus;

  return null;
}

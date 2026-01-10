import { Database, Q } from '@nozbe/watermelondb';
import { v4 as uuidv4 } from 'uuid';
import { Badge } from '../models/Badge';
import type { BadgeData, BadgeDefinition, BADGE_DEFINITIONS } from '../types/settings';

/**
 * Get all badges earned by a user
 */
export async function getUserBadges(
  database: Database,
  userId: string
): Promise<BadgeData[]> {
  const badgesCollection = database.get<Badge>('badges');

  const badges = await badgesCollection
    .query(Q.where('user_id', userId))
    .fetch();

  return badges.map((badge) => ({
    badgeId: badge.badgeId,
    name: badge.name,
    description: badge.description,
    icon: badge.icon,
    earnedAt: badge.earnedAt,
  }));
}

/**
 * Check if a user has a specific badge
 */
export async function hasBadge(
  database: Database,
  userId: string,
  badgeName: string
): Promise<boolean> {
  const badgesCollection = database.get<Badge>('badges');

  const badges = await badgesCollection
    .query(Q.where('user_id', userId), Q.where('name', badgeName))
    .fetch();

  return badges.length > 0;
}

/**
 * Award a badge to a user
 */
export async function awardBadge(
  database: Database,
  userId: string,
  badgeDefinition: BadgeDefinition
): Promise<Badge | null> {
  // Check if user already has this badge
  const alreadyHas = await hasBadge(database, userId, badgeDefinition.name);
  if (alreadyHas) {
    return null;
  }

  const badgesCollection = database.get<Badge>('badges');

  const badge = await database.write(async () => {
    return await badgesCollection.create((b) => {
      b.badgeId = uuidv4();
      b.userId = userId;
      b.name = badgeDefinition.name;
      b.description = badgeDefinition.description;
      b.icon = badgeDefinition.icon;
    });
  });

  return badge;
}

/**
 * Check quiz results and award any earned badges
 */
export async function checkAndAwardBadges(
  database: Database,
  userId: string,
  quizResult: {
    accuracy: number;
    totalQuizzes: number;
    perfectRounds: number;
    totalScore: number;
    difficulty: string;
  },
  badgeDefinitions: BadgeDefinition[]
): Promise<BadgeData[]> {
  const awardedBadges: BadgeData[] = [];

  for (const definition of badgeDefinitions) {
    // Check if user already has this badge
    const alreadyHas = await hasBadge(database, userId, definition.name);
    if (alreadyHas) {
      continue;
    }

    // Check if criteria is met
    let earned = false;

    switch (definition.id) {
      case 'first_quiz':
        earned = quizResult.totalQuizzes >= 1;
        break;
      case 'perfect_round':
        earned = quizResult.perfectRounds >= 1;
        break;
      case 'quiz_master':
        earned = quizResult.totalQuizzes >= 10;
        break;
      case 'accuracy_ace':
        earned = quizResult.accuracy >= 90;
        break;
      case 'century_club':
        earned = quizResult.totalScore >= 100;
        break;
      case 'varsity_player':
        earned = quizResult.difficulty === 'varsity' && quizResult.totalQuizzes >= 5;
        break;
      case 'college_scholar':
        earned = quizResult.difficulty === 'college' && quizResult.totalQuizzes >= 5;
        break;
      case 'open_champion':
        earned = quizResult.difficulty === 'open' && quizResult.accuracy >= 80;
        break;
      default:
        break;
    }

    if (earned) {
      const badge = await awardBadge(database, userId, definition);
      if (badge) {
        awardedBadges.push({
          badgeId: badge.badgeId,
          name: badge.name,
          description: badge.description,
          icon: badge.icon,
          earnedAt: badge.earnedAt,
        });
      }
    }
  }

  return awardedBadges;
}

/**
 * Get all badge definitions (predefined badges in the app)
 */
export function getAllBadgeDefinitions(): BadgeDefinition[] {
  return [
    {
      id: 'first_quiz',
      name: 'First Steps',
      description: 'Complete your first quiz',
      icon: 'flag-checkered',
    },
    {
      id: 'perfect_round',
      name: 'Perfect Round',
      description: 'Get 100% accuracy on a quiz',
      icon: 'star-circle',
    },
    {
      id: 'quiz_master',
      name: 'Quiz Master',
      description: 'Complete 10 quizzes',
      icon: 'trophy',
    },
    {
      id: 'accuracy_ace',
      name: 'Accuracy Ace',
      description: 'Achieve 90%+ accuracy on any quiz',
      icon: 'bullseye-arrow',
    },
    {
      id: 'century_club',
      name: 'Century Club',
      description: 'Score 100+ points in a single quiz',
      icon: 'numeric-100-box',
    },
    {
      id: 'varsity_player',
      name: 'Varsity Player',
      description: 'Complete 5 quizzes at Varsity difficulty',
      icon: 'school',
    },
    {
      id: 'college_scholar',
      name: 'College Scholar',
      description: 'Complete 5 quizzes at College difficulty',
      icon: 'account-school',
    },
    {
      id: 'open_champion',
      name: 'Open Champion',
      description: 'Score 80%+ on Open difficulty',
      icon: 'crown',
    },
  ];
}

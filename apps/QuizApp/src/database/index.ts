import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { schema } from './schema';
import { migrations } from './migrations';
import { User } from '../models/User';
import { Team } from '../models/Team';
import { TeamMember } from '../models/TeamMember';
import { TeamInvitation } from '../models/TeamInvitation';
import { Badge } from '../models/Badge';
import { QuizHistory } from '../models/QuizHistory';
import { QuizSettings } from '../models/QuizSettings';

const adapter = new SQLiteAdapter({
  schema,
  migrations,
  jsi: true, // Enable JSI for better performance
  onSetUpError: (error) => {
    console.error('Database setup error:', error);
  },
});

export const database = new Database({
  adapter,
  modelClasses: [
    User,
    Team,
    TeamMember,
    TeamInvitation,
    Badge,
    QuizHistory,
    QuizSettings,
  ],
});

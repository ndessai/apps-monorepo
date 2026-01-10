import { Model } from '@nozbe/watermelondb';
import { field, date, relation } from '@nozbe/watermelondb/decorators';
import type { Team } from './Team';

export type TeamRole = 'owner' | 'member';

export class TeamMember extends Model {
  static table = 'team_members';
  static associations = {
    teams: { type: 'belongs_to' as const, key: 'team_id' },
  };

  @field('team_id') teamId!: string;
  @field('user_id') userId!: string;
  @field('role') role!: TeamRole;
  @date('joined_at') joinedAt!: Date;

  @relation('teams', 'team_id') team!: Team;
}

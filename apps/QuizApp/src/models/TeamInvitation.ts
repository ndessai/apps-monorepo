import { Model } from '@nozbe/watermelondb';
import { field, date, relation } from '@nozbe/watermelondb/decorators';
import type { Team } from './Team';

export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'expired';

export class TeamInvitation extends Model {
  static table = 'team_invitations';
  static associations = {
    teams: { type: 'belongs_to' as const, key: 'team_id' },
  };

  @field('team_id') teamId!: string;
  @field('email') email!: string;
  @field('invited_by') invitedBy!: string;
  @field('status') status!: InvitationStatus;
  @date('created_at') createdAt!: Date;
  @date('expires_at') expiresAt!: Date;

  @relation('teams', 'team_id') team!: Team;
}

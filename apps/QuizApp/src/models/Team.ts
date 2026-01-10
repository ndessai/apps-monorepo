import { Model } from '@nozbe/watermelondb';
import { field, date, readonly, children } from '@nozbe/watermelondb/decorators';
import type { TeamMember } from './TeamMember';
import type { TeamInvitation } from './TeamInvitation';

export class Team extends Model {
  static table = 'teams';
  static associations = {
    team_members: { type: 'has_many' as const, foreignKey: 'team_id' },
    team_invitations: { type: 'has_many' as const, foreignKey: 'team_id' },
  };

  @field('team_id') teamId!: string;
  @field('name') name!: string;
  @field('description') description!: string;
  @field('owner_id') ownerId!: string;
  @field('invite_code') inviteCode!: string;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  @children('team_members') members!: TeamMember[];
  @children('team_invitations') invitations!: TeamInvitation[];
}

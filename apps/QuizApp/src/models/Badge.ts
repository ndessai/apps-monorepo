import { Model } from '@nozbe/watermelondb';
import { field, date } from '@nozbe/watermelondb/decorators';

export class Badge extends Model {
  static table = 'badges';

  @field('badge_id') badgeId!: string;
  @field('user_id') userId!: string;
  @field('name') name!: string;
  @field('description') description!: string;
  @field('icon') icon!: string;
  @date('earned_at') earnedAt!: Date;
}

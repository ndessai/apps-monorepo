import { Model } from '@nozbe/watermelondb';
import { field, date } from '@nozbe/watermelondb/decorators';

export class QuizSettings extends Model {
  static table = 'quiz_settings';

  @field('user_id') userId!: string;
  @field('buzzer_time_ms') buzzerTimeMs!: number;
  @field('answer_time_ms') answerTimeMs!: number;
  @field('difficulty') difficulty!: string;
  @field('theme') theme!: string;
  @date('updated_at') updatedAt!: Date;
}

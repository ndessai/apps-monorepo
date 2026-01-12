import { Model } from '@nozbe/watermelondb';
import { field, date } from '@nozbe/watermelondb/decorators';

export class QuizSettings extends Model {
  static table = 'quiz_settings';

  @field('user_id') userId!: string;
  @field('buzzer_time_ms') buzzerTimeMs!: number;
  @field('answer_time_ms') answerTimeMs!: number;
  @field('tossup_answer_time_ms') tossupAnswerTimeMs!: number;
  @field('bonus_answer_time_ms') bonusAnswerTimeMs!: number;
  @field('tossup_review_time_ms') tossupReviewTimeMs!: number;
  @field('bonus_review_time_ms') bonusReviewTimeMs!: number;
  @field('reading_speed_wpm') readingSpeedWpm!: number;
  @field('microphone_enabled') microphoneEnabled!: boolean;
  @field('auto_submit_on_silence') autoSubmitOnSilence!: boolean;
  @field('auto_submit_silence_ms') autoSubmitSilenceMs!: number;
  @field('audio_actions_enabled') audioActionsEnabled!: boolean;
  @field('difficulty') difficulty!: string;
  @field('theme') theme!: string;
  @date('updated_at') updatedAt!: Date;
}

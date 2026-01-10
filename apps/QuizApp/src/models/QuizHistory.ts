import { Model } from '@nozbe/watermelondb';
import { field, date, json } from '@nozbe/watermelondb/decorators';

export class QuizHistory extends Model {
  static table = 'quiz_history';

  @field('session_id') sessionId!: string;
  @field('user_id') userId!: string;
  @field('difficulty') difficulty!: string;
  @field('total_score') totalScore!: number;
  @field('max_score') maxScore!: number;
  @field('accuracy') accuracy!: number;
  @field('tossup_correct') tossupCorrect!: number;
  @field('tossup_total') tossupTotal!: number;
  @field('bonus_points') bonusPoints!: number;
  @field('bonus_max_points') bonusMaxPoints!: number;
  @field('duration_seconds') durationSeconds!: number;
  @json('results_json', (raw: string) => JSON.parse(raw || '{}')) resultsJson!: object;
  @date('completed_at') completedAt!: Date;
}

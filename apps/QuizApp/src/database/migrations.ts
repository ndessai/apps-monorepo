import { schemaMigrations, createTable, addColumns } from '@nozbe/watermelondb/Schema/migrations';

export const migrations = schemaMigrations({
  migrations: [
    {
      toVersion: 2,
      steps: [
        createTable({
          name: 'teams',
          columns: [
            { name: 'team_id', type: 'string', isIndexed: true },
            { name: 'name', type: 'string' },
            { name: 'description', type: 'string', isOptional: true },
            { name: 'owner_id', type: 'string', isIndexed: true },
            { name: 'invite_code', type: 'string', isIndexed: true },
            { name: 'created_at', type: 'number' },
            { name: 'updated_at', type: 'number' },
          ],
        }),
        createTable({
          name: 'team_members',
          columns: [
            { name: 'team_id', type: 'string', isIndexed: true },
            { name: 'user_id', type: 'string', isIndexed: true },
            { name: 'role', type: 'string' },
            { name: 'joined_at', type: 'number' },
          ],
        }),
        createTable({
          name: 'team_invitations',
          columns: [
            { name: 'team_id', type: 'string', isIndexed: true },
            { name: 'email', type: 'string', isIndexed: true },
            { name: 'invited_by', type: 'string' },
            { name: 'status', type: 'string' },
            { name: 'created_at', type: 'number' },
            { name: 'expires_at', type: 'number' },
          ],
        }),
        createTable({
          name: 'badges',
          columns: [
            { name: 'badge_id', type: 'string', isIndexed: true },
            { name: 'user_id', type: 'string', isIndexed: true },
            { name: 'name', type: 'string' },
            { name: 'description', type: 'string' },
            { name: 'icon', type: 'string' },
            { name: 'earned_at', type: 'number' },
          ],
        }),
        createTable({
          name: 'quiz_history',
          columns: [
            { name: 'session_id', type: 'string', isIndexed: true },
            { name: 'user_id', type: 'string', isIndexed: true },
            { name: 'difficulty', type: 'string' },
            { name: 'total_score', type: 'number' },
            { name: 'max_score', type: 'number' },
            { name: 'accuracy', type: 'number' },
            { name: 'tossup_correct', type: 'number' },
            { name: 'tossup_total', type: 'number' },
            { name: 'bonus_points', type: 'number' },
            { name: 'bonus_max_points', type: 'number' },
            { name: 'duration_seconds', type: 'number' },
            { name: 'results_json', type: 'string' },
            { name: 'completed_at', type: 'number' },
          ],
        }),
        createTable({
          name: 'quiz_settings',
          columns: [
            { name: 'user_id', type: 'string', isIndexed: true },
            { name: 'buzzer_time_ms', type: 'number' },
            { name: 'answer_time_ms', type: 'number' },
            { name: 'difficulty', type: 'string' },
            { name: 'updated_at', type: 'number' },
          ],
        }),
      ],
    },
    {
      toVersion: 3,
      steps: [
        addColumns({
          table: 'quiz_settings',
          columns: [{ name: 'theme', type: 'string', isOptional: true }],
        }),
      ],
    },
    {
      toVersion: 4,
      steps: [
        addColumns({
          table: 'quiz_settings',
          columns: [{ name: 'reading_speed_wpm', type: 'number' }],
        }),
      ],
    },
  ],
});

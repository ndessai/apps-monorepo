import { schemaMigrations } from '@nozbe/watermelondb/Schema/migrations';

// Starting fresh with version 1 - no migrations needed
// When migrations are required in the future, add them here
export const migrations = schemaMigrations({
  migrations: [],
});

import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'users',
      columns: [
        { name: 'user_id', type: 'string', isIndexed: true },
        { name: 'first_name', type: 'string', isOptional: true },
        { name: 'last_name', type: 'string', isOptional: true },
        { name: 'email', type: 'string', isOptional: true, isIndexed: true },
        { name: 'avatar_icon', type: 'string', isOptional: true },
        { name: 'auth_provider', type: 'string', isOptional: true },
        { name: 'google_id', type: 'string', isOptional: true, isIndexed: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
  ],
});

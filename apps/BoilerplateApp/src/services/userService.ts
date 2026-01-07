import { Database, Q } from '@nozbe/watermelondb';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../models/User';
import { GoogleUserData } from './googleSignIn';

export interface CreateUserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  avatarIcon?: string;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  avatarIcon?: string;
}

/**
 * Get the current user (singleton pattern - one user per app)
 */
export async function getCurrentUser(database: Database): Promise<User | null> {
  const usersCollection = database.get<User>('users');
  const users = await usersCollection.query().fetch();

  if (users.length === 0) {
    return null;
  }

  // Return the first user (singleton pattern)
  return users[0];
}

/**
 * Create a new user with a random GUID
 */
export async function createUser(
  database: Database,
  data: CreateUserData
): Promise<User> {
  const usersCollection = database.get<User>('users');

  const user = await database.write(async () => {
    return await usersCollection.create((newUser) => {
      newUser.userId = uuidv4(); // Generate random GUID
      newUser.firstName = data.firstName || '';
      newUser.lastName = data.lastName || '';
      newUser.email = data.email || '';
      newUser.avatarIcon = data.avatarIcon || 'account-circle';
      newUser.authProvider = 'local';
      newUser.googleId = '';
    });
  });

  return user;
}

/**
 * Update an existing user
 */
export async function updateUser(
  database: Database,
  user: User,
  data: UpdateUserData
): Promise<User> {
  await database.write(async () => {
    await user.update((updatedUser) => {
      if (data.firstName !== undefined) {
        updatedUser.firstName = data.firstName;
      }
      if (data.lastName !== undefined) {
        updatedUser.lastName = data.lastName;
      }
      if (data.email !== undefined) {
        updatedUser.email = data.email;
      }
      if (data.avatarIcon !== undefined) {
        updatedUser.avatarIcon = data.avatarIcon;
      }
    });
  });

  return user;
}

/**
 * Find a user by Google ID
 */
export async function findUserByGoogleId(
  database: Database,
  googleId: string
): Promise<User | null> {
  const usersCollection = database.get<User>('users');
  const users = await usersCollection
    .query(Q.where('google_id', googleId))
    .fetch();

  if (users.length === 0) {
    return null;
  }

  return users[0];
}

/**
 * Get or create a user from Google Sign-In data (upsert logic)
 */
export async function getOrCreateGoogleUser(
  database: Database,
  googleData: GoogleUserData
): Promise<User> {
  // Check if user already exists by Google ID
  let user = await findUserByGoogleId(database, googleData.id);

  if (user) {
    // Update existing user with latest Google data
    await database.write(async () => {
      await user!.update((updatedUser) => {
        updatedUser.firstName = googleData.firstName;
        updatedUser.lastName = googleData.lastName;
        updatedUser.email = googleData.email;
        updatedUser.authProvider = 'google';
      });
    });
    return user;
  }

  // Check if there's an existing local user
  const existingUser = await getCurrentUser(database);

  if (existingUser) {
    // Update existing local user with Google data
    await database.write(async () => {
      await existingUser.update((updatedUser) => {
        updatedUser.firstName = googleData.firstName;
        updatedUser.lastName = googleData.lastName;
        updatedUser.email = googleData.email;
        updatedUser.authProvider = 'google';
        updatedUser.googleId = googleData.id;
      });
    });
    return existingUser;
  }

  // Create new user from Google data
  const usersCollection = database.get<User>('users');
  const newUser = await database.write(async () => {
    return await usersCollection.create((newUser) => {
      newUser.userId = uuidv4();
      newUser.firstName = googleData.firstName;
      newUser.lastName = googleData.lastName;
      newUser.email = googleData.email;
      newUser.avatarIcon = 'account-circle';
      newUser.authProvider = 'google';
      newUser.googleId = googleData.id;
    });
  });

  return newUser;
}

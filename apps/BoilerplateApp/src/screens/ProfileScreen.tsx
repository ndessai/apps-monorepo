import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { ProfileForm, ProfileFormData, colors } from '@monorepo/ui-components';
import { useDatabase } from '../providers/DatabaseProvider';
import {
  getCurrentUser,
  createUser,
  updateUser,
  getOrCreateGoogleUser,
} from '../services/userService';
import { signInWithGoogle, isSignedIn } from '../services/googleSignIn';
import { User } from '../models/User';

export const ProfileScreen: React.FC = () => {
  const database = useDatabase();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGoogleSignedIn, setIsGoogleSignedIn] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      setIsLoading(true);

      // Try to load existing user from database
      try {
        const existingUser = await getCurrentUser(database);
        setUser(existingUser);
      } catch (dbError) {
        console.error('Error loading user from database:', dbError);
        setUser(null);
      }

      // Try to check Google Sign-In status
      try {
        const googleSignedIn = await isSignedIn();
        setIsGoogleSignedIn(googleSignedIn);
      } catch (googleError) {
        console.error('Error checking Google Sign-In status:', googleError);
        setIsGoogleSignedIn(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (data: ProfileFormData) => {
    try {
      setIsSaving(true);

      if (user) {
        // Update existing user
        await updateUser(database, user, {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          avatarIcon: data.avatarIcon,
        });
      } else {
        // Create new user
        const newUser = await createUser(database, {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          avatarIcon: data.avatarIcon,
        });
        setUser(newUser);
      }

      Alert.alert('Success', 'Profile saved successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const googleData = await signInWithGoogle();

      if (!googleData) {
        // User cancelled sign-in
        return;
      }

      // Create or update user with Google data
      const googleUser = await getOrCreateGoogleUser(database, googleData);
      setUser(googleUser);
      setIsGoogleSignedIn(true);

      Alert.alert('Success', 'Signed in with Google successfully');
    } catch (error) {
      console.error('Error signing in with Google:', error);
      Alert.alert('Error', 'Failed to sign in with Google');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.main} />
      </View>
    );
  }

  return (
    <ProfileForm
      initialData={
        user
          ? {
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              avatarIcon: user.avatarIcon,
            }
          : undefined
      }
      onSave={handleSave}
      onGoogleSignIn={handleGoogleSignIn}
      isGoogleSignedIn={isGoogleSignedIn}
      isSaving={isSaving}
    />
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.default,
  },
});

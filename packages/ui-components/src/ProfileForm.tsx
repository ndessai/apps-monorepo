import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AvatarIconPicker } from './AvatarIconPicker';
import { colors, spacing, elevation, radius } from './theme';

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  avatarIcon: string;
}

interface ProfileFormProps {
  initialData?: Partial<ProfileFormData>;
  onSave: (data: ProfileFormData) => void;
  onGoogleSignIn?: () => void;
  isGoogleSignedIn?: boolean;
  isSaving?: boolean;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ProfileForm({
  initialData,
  onSave,
  onGoogleSignIn,
  isGoogleSignedIn = false,
  isSaving = false,
}: ProfileFormProps) {
  const [firstName, setFirstName] = useState(initialData?.firstName || '');
  const [lastName, setLastName] = useState(initialData?.lastName || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [avatarIcon, setAvatarIcon] = useState(
    initialData?.avatarIcon || 'account-circle'
  );
  const [emailError, setEmailError] = useState('');
  const [showIconPicker, setShowIconPicker] = useState(false);

  useEffect(() => {
    if (initialData?.firstName) setFirstName(initialData.firstName);
    if (initialData?.lastName) setLastName(initialData.lastName);
    if (initialData?.email) setEmail(initialData.email);
    if (initialData?.avatarIcon) setAvatarIcon(initialData.avatarIcon);
  }, [initialData]);

  const validateEmail = (value: string) => {
    if (!value) {
      setEmailError('');
      return true;
    }
    if (!EMAIL_REGEX.test(value)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (emailError) {
      validateEmail(value);
    }
  };

  const handleSave = () => {
    const isEmailValid = validateEmail(email);
    if (!isEmailValid) {
      return;
    }

    onSave({
      firstName,
      lastName,
      email,
      avatarIcon,
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.avatarSection}>
        <TouchableOpacity
          style={styles.avatarButton}
          onPress={() => setShowIconPicker(true)}
        >
          <Icon name={avatarIcon} size={80} color={colors.primary.main} />
          <View style={styles.editBadge}>
            <Icon name="pencil" size={16} color={colors.surface.default} />
          </View>
        </TouchableOpacity>
        <Text variant="labelMedium" style={styles.avatarHint}>
          Tap to change avatar
        </Text>
      </View>

      <View style={styles.formSection}>
        <TextInput
          label="First Name"
          value={firstName}
          onChangeText={setFirstName}
          mode="outlined"
          style={styles.input}
          outlineColor={colors.divider}
          activeOutlineColor={colors.primary.main}
          textColor={colors.text.primary}
        />

        <TextInput
          label="Last Name"
          value={lastName}
          onChangeText={setLastName}
          mode="outlined"
          style={styles.input}
          outlineColor={colors.divider}
          activeOutlineColor={colors.primary.main}
          textColor={colors.text.primary}
        />

        <TextInput
          label="Email"
          value={email}
          onChangeText={handleEmailChange}
          onBlur={() => validateEmail(email)}
          mode="outlined"
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
          outlineColor={colors.divider}
          activeOutlineColor={colors.primary.main}
          textColor={colors.text.primary}
          error={!!emailError}
        />
        {emailError ? (
          <Text variant="bodySmall" style={styles.errorText}>
            {emailError}
          </Text>
        ) : null}

        <Button
          mode="contained"
          onPress={handleSave}
          loading={isSaving}
          disabled={isSaving}
          style={styles.saveButton}
          buttonColor={colors.primary.main}
          textColor={colors.surface.default}
        >
          Save Profile
        </Button>

        {!isGoogleSignedIn && onGoogleSignIn && (
          <>
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text variant="bodySmall" style={styles.dividerText}>
                OR
              </Text>
              <View style={styles.dividerLine} />
            </View>

            <Button
              mode="outlined"
              onPress={onGoogleSignIn}
              icon={() => <Icon name="google" size={20} color={colors.primary.main} />}
              style={styles.googleButton}
              textColor={colors.primary.main}
            >
              Sign in with Google
            </Button>
          </>
        )}

        {isGoogleSignedIn && (
          <View style={styles.googleSignedInBadge}>
            <Icon name="check-circle" size={20} color={colors.success.main} />
            <Text variant="bodyMedium" style={styles.googleSignedInText}>
              Signed in with Google
            </Text>
          </View>
        )}
      </View>

      <AvatarIconPicker
        visible={showIconPicker}
        selectedIcon={avatarIcon}
        onSelect={setAvatarIcon}
        onDismiss={() => setShowIconPicker(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  contentContainer: {
    padding: spacing.lg,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatarButton: {
    position: 'relative',
    padding: spacing.md,
    borderRadius: radius.full,
    backgroundColor: colors.surface.variant,
    ...elevation.level1,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary.main,
    borderRadius: radius.full,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    ...elevation.level2,
  },
  avatarHint: {
    marginTop: spacing.sm,
    color: colors.text.secondary,
  },
  formSection: {
    gap: spacing.md,
  },
  input: {
    backgroundColor: colors.surface.default,
  },
  errorText: {
    color: colors.error.main,
    marginTop: -spacing.sm,
  },
  saveButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.xs,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.divider,
  },
  dividerText: {
    marginHorizontal: spacing.md,
    color: colors.text.secondary,
  },
  googleButton: {
    borderColor: colors.primary.main,
    borderWidth: 1,
    paddingVertical: spacing.xs,
  },
  googleSignedInBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    backgroundColor: colors.success.light,
    borderRadius: radius.md,
    gap: spacing.sm,
  },
  googleSignedInText: {
    color: colors.success.dark,
    fontWeight: '600',
  },
});

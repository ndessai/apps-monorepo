import React, { useState } from 'react';
import {
  View,
  Modal,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, elevation, radius } from './theme';

// Curated list of popular avatar icons (expandable to 6000+)
const AVATAR_ICONS = [
  'account',
  'account-circle',
  'account-cowboy-hat',
  'account-tie',
  'alien',
  'atom',
  'basketball',
  'bat',
  'bee',
  'bike',
  'bird',
  'bottle-wine',
  'bowl-mix',
  'brain',
  'brush',
  'cake',
  'camera',
  'candy',
  'car',
  'cat',
  'chef-hat',
  'clover',
  'coffee',
  'crown',
  'cube',
  'diamond',
  'dog',
  'earth',
  'emoticon',
  'fire',
  'fish',
  'flower',
  'food-apple',
  'gamepad',
  'gift',
  'guitar',
  'heart',
  'lightning-bolt',
  'music',
  'palette',
  'paw',
  'pizza',
  'rocket',
  'star',
  'tree',
  'trophy',
  'umbrella',
  'weather-sunny',
  'wrench',
];

interface AvatarIconPickerProps {
  visible: boolean;
  selectedIcon?: string;
  onSelect: (icon: string) => void;
  onDismiss: () => void;
}

export function AvatarIconPicker({
  visible,
  selectedIcon,
  onSelect,
  onDismiss,
}: AvatarIconPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredIcons = AVATAR_ICONS.filter((icon) =>
    icon.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (icon: string) => {
    onSelect(icon);
    onDismiss();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onDismiss}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text variant="titleLarge" style={styles.title}>
              Choose Avatar Icon
            </Text>
            <IconButton
              icon="close"
              size={24}
              onPress={onDismiss}
              iconColor={colors.text.primary}
            />
          </View>

          <TextInput
            style={styles.searchInput}
            placeholder="Search icons..."
            placeholderTextColor={colors.text.disabled}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          <FlatList
            data={filteredIcons}
            keyExtractor={(item) => item}
            numColumns={4}
            contentContainerStyle={styles.iconGrid}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.iconContainer,
                  selectedIcon === item && styles.iconContainerSelected,
                ]}
                onPress={() => handleSelect(item)}
              >
                <Icon
                  name={item}
                  size={40}
                  color={
                    selectedIcon === item
                      ? colors.primary.main
                      : colors.text.secondary
                  }
                />
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface.default,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: '80%',
    ...elevation.level3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  searchInput: {
    backgroundColor: colors.surface.variant,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    fontSize: 16,
    color: colors.text.primary,
  },
  iconGrid: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  iconContainer: {
    flex: 1,
    aspectRatio: 1,
    margin: spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface.variant,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  iconContainerSelected: {
    borderColor: colors.primary.main,
    backgroundColor: colors.primary.light,
  },
});

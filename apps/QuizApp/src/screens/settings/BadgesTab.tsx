import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, Card, ActivityIndicator } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing } from '@monorepo/ui-components';
import { useDatabase } from '../../providers/DatabaseProvider';
import { getCurrentUser } from '../../services/userService';
import { getUserBadges, getAllBadgeDefinitions } from '../../services/badgeService';
import type { BadgeData, BadgeDefinition } from '../../types/settings';

interface BadgeDisplayItem extends BadgeDefinition {
  earned: boolean;
  earnedAt?: Date;
}

export const BadgesTab: React.FC = () => {
  const database = useDatabase();
  const [badges, setBadges] = useState<BadgeDisplayItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadBadges();
  }, []);

  const loadBadges = async () => {
    try {
      setIsLoading(true);
      const user = await getCurrentUser(database);

      const allDefinitions = getAllBadgeDefinitions();
      let earnedBadges: BadgeData[] = [];

      if (user) {
        earnedBadges = await getUserBadges(database, user.userId);
      }

      const displayBadges: BadgeDisplayItem[] = allDefinitions.map((def) => {
        const earned = earnedBadges.find((b) => b.name === def.name);
        return {
          ...def,
          earned: !!earned,
          earnedAt: earned?.earnedAt,
        };
      });

      // Sort: earned first, then by name
      displayBadges.sort((a, b) => {
        if (a.earned && !b.earned) return -1;
        if (!a.earned && b.earned) return 1;
        return a.name.localeCompare(b.name);
      });

      setBadges(displayBadges);
    } catch (error) {
      console.error('Error loading badges:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadBadges();
    setIsRefreshing(false);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderBadgeCard = ({ item }: { item: BadgeDisplayItem }) => {
    const iconColor = item.earned ? colors.warning.main : colors.text.disabled;
    const textColor = item.earned ? colors.text.primary : colors.text.disabled;

    return (
      <Card
        style={[styles.badgeCard, !item.earned && styles.unearnedCard]}
        testID={`badge-card-${item.name.replace(/\s+/g, '-').toLowerCase()}`}
      >
        <Card.Content style={styles.cardContent}>
          <View style={[styles.iconContainer, !item.earned && styles.unearnedIcon]}>
            <Icon name={item.icon} size={40} color={iconColor} />
          </View>
          <View style={styles.badgeInfo}>
            <Text variant="titleMedium" style={[styles.badgeName, { color: textColor }]}>
              {item.name}
            </Text>
            <Text variant="bodySmall" style={styles.badgeDescription}>
              {item.description}
            </Text>
            {item.earned && item.earnedAt && (
              <View style={styles.earnedBadge}>
                <Icon name="check-circle" size={14} color={colors.success.main} />
                <Text style={styles.earnedText}>
                  Earned {formatDate(item.earnedAt)}
                </Text>
              </View>
            )}
            {!item.earned && (
              <View style={styles.lockedBadge}>
                <Icon name="lock" size={14} color={colors.text.disabled} />
                <Text style={styles.lockedText}>Locked</Text>
              </View>
            )}
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderHeader = () => {
    const earnedCount = badges.filter((b) => b.earned).length;
    return (
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.headerTitle}>
          Your Badges
        </Text>
        <Text variant="bodyMedium" style={styles.headerSubtitle}>
          {earnedCount} of {badges.length} earned
        </Text>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="medal-outline" size={64} color={colors.text.disabled} />
      <Text variant="titleMedium" style={styles.emptyTitle}>
        No Badges Available
      </Text>
      <Text variant="bodyMedium" style={styles.emptyText}>
        Complete quizzes to earn badges
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.main} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={badges}
        renderItem={renderBadgeCard}
        keyExtractor={(item) => item.name}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={badges.length > 0 ? renderHeader : null}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        numColumns={1}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.default,
  },
  listContent: {
    padding: spacing.md,
    flexGrow: 1,
  },
  header: {
    marginBottom: spacing.md,
  },
  headerTitle: {
    color: colors.text.primary,
    fontWeight: '600',
  },
  headerSubtitle: {
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  badgeCard: {
    marginBottom: spacing.md,
    backgroundColor: colors.surface.default,
  },
  unearnedCard: {
    opacity: 0.7,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.warning.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  unearnedIcon: {
    backgroundColor: colors.surface.variant,
  },
  badgeInfo: {
    flex: 1,
  },
  badgeName: {
    fontWeight: '600',
  },
  badgeDescription: {
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  earnedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  earnedText: {
    marginLeft: spacing.xs,
    fontSize: 12,
    color: colors.success.main,
  },
  lockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  lockedText: {
    marginLeft: spacing.xs,
    fontSize: 12,
    color: colors.text.disabled,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
  },
  emptyTitle: {
    color: colors.text.primary,
    marginTop: spacing.md,
  },
  emptyText: {
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
});

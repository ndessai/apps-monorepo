import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, Card, ActivityIndicator, Divider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing } from '@monorepo/ui-components';
import { useDatabase } from '../../providers/DatabaseProvider';
import { getCurrentUser } from '../../services/userService';
import { getUserHistory, getUserStats } from '../../services/historyService';
import type { QuizHistoryEntry, QuizHistoryStats, NAQTDifficulty } from '../../types/settings';
import { NAQT_DIFFICULTY_LABELS } from '../../types/settings';

export const HistoryTab: React.FC = () => {
  const database = useDatabase();
  const [history, setHistory] = useState<QuizHistoryEntry[]>([]);
  const [stats, setStats] = useState<QuizHistoryStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const user = await getCurrentUser(database);

      if (user) {
        const [userHistory, userStats] = await Promise.all([
          getUserHistory(database, user.userId),
          getUserStats(database, user.userId),
        ]);
        setHistory(userHistory);
        setStats(userStats);
      }
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 90) return colors.success.main;
    if (accuracy >= 70) return colors.warning.main;
    return colors.error.main;
  };

  const renderStatsOverview = () => {
    if (!stats || stats.totalQuizzes === 0) return null;

    return (
      <Card style={styles.statsCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.statsTitle}>
            Your Statistics
          </Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Icon name="book-open-variant" size={24} color={colors.primary.main} />
              <Text variant="headlineSmall" style={styles.statValue}>
                {stats.totalQuizzes}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Quizzes
              </Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="percent" size={24} color={colors.success.main} />
              <Text variant="headlineSmall" style={styles.statValue}>
                {stats.averageAccuracy.toFixed(0)}%
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Avg Accuracy
              </Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="trophy" size={24} color={colors.warning.main} />
              <Text variant="headlineSmall" style={styles.statValue}>
                {stats.bestAccuracy.toFixed(0)}%
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Best Score
              </Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="sigma" size={24} color={colors.info?.main || colors.primary.main} />
              <Text variant="headlineSmall" style={styles.statValue}>
                {stats.totalScore}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Total Points
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderHistoryEntry = ({ item }: { item: QuizHistoryEntry }) => {
    return (
      <Card style={styles.historyCard} testID={`history-entry-${item.sessionId}`}>
        <Card.Content>
          <View style={styles.historyHeader}>
            <View>
              <Text variant="titleMedium" style={styles.historyDate}>
                {formatDate(item.completedAt)}
              </Text>
              <Text variant="bodySmall" style={styles.historyDifficulty}>
                {NAQT_DIFFICULTY_LABELS[item.difficulty as NAQTDifficulty] || item.difficulty}
              </Text>
            </View>
            <View style={styles.scoreContainer}>
              <Text
                variant="headlineSmall"
                style={[styles.score, { color: getAccuracyColor(item.accuracy) }]}
              >
                {item.accuracy.toFixed(0)}%
              </Text>
            </View>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.historyDetails}>
            <View style={styles.detailRow}>
              <Icon name="check-circle" size={16} color={colors.success.main} />
              <Text style={styles.detailText}>
                Tossups: {item.tossupCorrect}/{item.tossupTotal}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Icon name="star" size={16} color={colors.warning.main} />
              <Text style={styles.detailText}>
                Bonus: {item.bonusPoints}/{item.bonusMaxPoints} pts
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Icon name="timer" size={16} color={colors.text.secondary} />
              <Text style={styles.detailText}>
                {formatDuration(item.durationSeconds)}
              </Text>
            </View>
          </View>

          <View style={styles.totalScore}>
            <Text variant="bodyMedium" style={styles.totalLabel}>
              Total Score:
            </Text>
            <Text variant="titleMedium" style={styles.totalValue}>
              {item.totalScore}/{item.maxScore}
            </Text>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="history" size={64} color={colors.text.disabled} />
      <Text variant="titleMedium" style={styles.emptyTitle}>
        No Quiz History
      </Text>
      <Text variant="bodyMedium" style={styles.emptyText}>
        Complete some quizzes to see your history
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
        data={history}
        renderItem={renderHistoryEntry}
        keyExtractor={(item) => item.sessionId}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderStatsOverview}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
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
  statsCard: {
    marginBottom: spacing.lg,
    backgroundColor: colors.surface.default,
  },
  statsTitle: {
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  statValue: {
    color: colors.text.primary,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  statLabel: {
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  historyCard: {
    marginBottom: spacing.md,
    backgroundColor: colors.surface.default,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  historyDate: {
    color: colors.text.primary,
    fontWeight: '600',
  },
  historyDifficulty: {
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  score: {
    fontWeight: '700',
  },
  divider: {
    marginVertical: spacing.md,
  },
  historyDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    marginLeft: spacing.xs,
    color: colors.text.secondary,
    fontSize: 14,
  },
  totalScore: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  totalLabel: {
    color: colors.text.secondary,
    marginRight: spacing.sm,
  },
  totalValue: {
    color: colors.primary.main,
    fontWeight: '600',
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

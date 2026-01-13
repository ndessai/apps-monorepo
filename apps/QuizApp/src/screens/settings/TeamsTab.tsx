import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Alert,
  RefreshControl,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  FAB,
  Portal,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { spacing } from '@monorepo/ui-components';
import { useTheme } from '../../providers/ThemeProvider';
import { useDatabase } from '../../providers/DatabaseProvider';
import { getCurrentUser } from '../../services/userService';
import {
  getUserTeams,
  createTeam,
  leaveTeam,
  inviteToTeam,
} from '../../services/teamService';
import type { TeamData } from '../../types/settings';

export const TeamsTab: React.FC = () => {
  const { colors } = useTheme();
  const database = useDatabase();
  const [teams, setTeams] = useState<TeamData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Create team modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDescription, setNewTeamDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Invite modal state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [isInviting, setIsInviting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const user = await getCurrentUser(database);
      if (user) {
        setUserId(user.userId);
        const userTeams = await getUserTeams(database, user.userId);
        setTeams(userTeams);
      }
    } catch (error) {
      console.error('Error loading teams:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  }, []);

  const handleCreateTeam = async () => {
    if (!newTeamName.trim() || !userId) return;

    try {
      setIsCreating(true);
      await createTeam(database, {
        name: newTeamName.trim(),
        description: newTeamDescription.trim() || undefined,
        ownerId: userId,
      });
      setShowCreateModal(false);
      setNewTeamName('');
      setNewTeamDescription('');
      await loadData();
      Alert.alert('Success', 'Team created successfully');
    } catch (error) {
      console.error('Error creating team:', error);
      Alert.alert('Error', 'Failed to create team');
    } finally {
      setIsCreating(false);
    }
  };

  const handleLeaveTeam = async (teamId: string, teamName: string) => {
    if (!userId) return;

    Alert.alert(
      'Leave Team',
      `Are you sure you want to leave "${teamName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              await leaveTeam(database, teamId, userId);
              await loadData();
              Alert.alert('Success', 'Left team successfully');
            } catch (error) {
              console.error('Error leaving team:', error);
              Alert.alert('Error', 'Failed to leave team');
            }
          },
        },
      ]
    );
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !selectedTeamId || !userId) return;

    try {
      setIsInviting(true);
      await inviteToTeam(database, selectedTeamId, inviteEmail.trim(), userId);
      setShowInviteModal(false);
      setInviteEmail('');
      setSelectedTeamId(null);
      Alert.alert('Success', 'Invitation sent successfully');
    } catch (error) {
      console.error('Error sending invitation:', error);
      Alert.alert('Error', 'Failed to send invitation');
    } finally {
      setIsInviting(false);
    }
  };

  const openInviteModal = (teamId: string) => {
    setSelectedTeamId(teamId);
    setShowInviteModal(true);
  };

  const renderTeamCard = ({ item }: { item: TeamData }) => {
    const isOwner = item.ownerId === userId;

    return (
      <Card style={[styles.teamCard, { backgroundColor: colors.surface.default }]} testID={`team-card-${item.teamId}`}>
        <Card.Content>
          <View style={styles.teamHeader}>
            <View style={styles.teamInfo}>
              <Text variant="titleMedium" style={[styles.teamName, { color: colors.text.primary }]}>
                {item.name}
              </Text>
              {item.description && (
                <Text variant="bodySmall" style={[styles.teamDescription, { color: colors.text.secondary }]}>
                  {item.description}
                </Text>
              )}
            </View>
            {isOwner && (
              <View style={[styles.ownerBadge, { backgroundColor: colors.warning.light }]}>
                <Icon name="crown" size={16} color={colors.warning.main} />
                <Text style={[styles.ownerText, { color: colors.warning.dark }]}>Owner</Text>
              </View>
            )}
          </View>
          <View style={styles.teamMeta}>
            <Icon name="account-group" size={16} color={colors.text.secondary} />
            <Text style={[styles.memberCount, { color: colors.text.secondary }]}>{item.memberCount} members</Text>
          </View>
        </Card.Content>
        <Card.Actions>
          {isOwner && (
            <Button
              mode="outlined"
              onPress={() => openInviteModal(item.teamId)}
              icon="email-plus"
              testID={`invite-button-${item.teamId}`}
            >
              Invite
            </Button>
          )}
          <Button
            mode="text"
            onPress={() => handleLeaveTeam(item.teamId, item.name)}
            textColor={colors.error.main}
            testID={`leave-button-${item.teamId}`}
          >
            Leave
          </Button>
        </Card.Actions>
      </Card>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="account-group-outline" size={64} color={colors.text.disabled} />
      <Text variant="titleMedium" style={[styles.emptyTitle, { color: colors.text.primary }]}>
        No Teams Yet
      </Text>
      <Text variant="bodyMedium" style={[styles.emptyText, { color: colors.text.secondary }]}>
        Create a team to collaborate with others
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background.default }]}>
        <ActivityIndicator size="large" color={colors.primary.main} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background.default }]}>
      <FlatList
        data={teams}
        renderItem={renderTeamCard}
        keyExtractor={(item) => item.teamId}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      />

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: colors.primary.main }]}
        onPress={() => setShowCreateModal(true)}
        testID="create-team-fab"
      />

      {/* Create Team Modal */}
      <Portal>
        <Modal
          visible={showCreateModal}
          onDismiss={() => setShowCreateModal(false)}
          contentContainerStyle={[styles.modal, { backgroundColor: colors.surface.default }]}
        >
          <Text variant="titleLarge" style={[styles.modalTitle, { color: colors.text.primary }]}>
            Create Team
          </Text>
          <TextInput
            label="Team Name"
            value={newTeamName}
            onChangeText={setNewTeamName}
            style={[styles.input, { backgroundColor: colors.surface.default }]}
            testID="team-name-input"
          />
          <TextInput
            label="Description (optional)"
            value={newTeamDescription}
            onChangeText={setNewTeamDescription}
            multiline
            style={[styles.input, { backgroundColor: colors.surface.default }]}
            testID="team-description-input"
          />
          <View style={styles.modalActions}>
            <Button onPress={() => setShowCreateModal(false)}>Cancel</Button>
            <Button
              mode="contained"
              onPress={handleCreateTeam}
              loading={isCreating}
              disabled={!newTeamName.trim() || isCreating}
              testID="create-team-button"
            >
              Create
            </Button>
          </View>
        </Modal>
      </Portal>

      {/* Invite Modal */}
      <Portal>
        <Modal
          visible={showInviteModal}
          onDismiss={() => setShowInviteModal(false)}
          contentContainerStyle={[styles.modal, { backgroundColor: colors.surface.default }]}
        >
          <Text variant="titleLarge" style={[styles.modalTitle, { color: colors.text.primary }]}>
            Invite Member
          </Text>
          <TextInput
            label="Email Address"
            value={inviteEmail}
            onChangeText={setInviteEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={[styles.input, { backgroundColor: colors.surface.default }]}
            testID="invite-email-input"
          />
          <View style={styles.modalActions}>
            <Button onPress={() => setShowInviteModal(false)}>Cancel</Button>
            <Button
              mode="contained"
              onPress={handleInvite}
              loading={isInviting}
              disabled={!inviteEmail.trim() || isInviting}
              testID="send-invite-button"
            >
              Send Invite
            </Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: spacing.md,
    flexGrow: 1,
  },
  teamCard: {
    marginBottom: spacing.md,
  },
  teamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    fontWeight: '600',
  },
  teamDescription: {
    marginTop: spacing.xs,
  },
  ownerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  ownerText: {
    fontSize: 12,
    marginLeft: 4,
  },
  teamMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  memberCount: {
    marginLeft: spacing.xs,
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
  },
  emptyTitle: {
    marginTop: spacing.md,
  },
  emptyText: {
    marginTop: spacing.xs,
  },
  fab: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.md,
  },
  modal: {
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: 12,
  },
  modalTitle: {
    marginBottom: spacing.md,
  },
  input: {
    marginBottom: spacing.md,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
});

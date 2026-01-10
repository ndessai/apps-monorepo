import { Database, Q } from '@nozbe/watermelondb';
import { v4 as uuidv4 } from 'uuid';
import { Team } from '../models/Team';
import { TeamMember } from '../models/TeamMember';
import { TeamInvitation } from '../models/TeamInvitation';
import type { TeamData, TeamMemberData, TeamInvitationData } from '../types/settings';

/**
 * Generate a random 6-character invite code
 */
function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Create a new team
 */
export async function createTeam(
  database: Database,
  data: { name: string; description?: string; ownerId: string }
): Promise<Team> {
  const teamsCollection = database.get<Team>('teams');
  const membersCollection = database.get<TeamMember>('team_members');

  const team = await database.write(async () => {
    const newTeam = await teamsCollection.create((t) => {
      t.teamId = uuidv4();
      t.name = data.name;
      t.description = data.description || '';
      t.ownerId = data.ownerId;
      t.inviteCode = generateInviteCode();
    });

    // Add owner as a member with 'owner' role
    await membersCollection.create((m) => {
      m.teamId = newTeam.teamId;
      m.userId = data.ownerId;
      m.role = 'owner';
    });

    return newTeam;
  });

  return team;
}

/**
 * Get all teams a user belongs to
 */
export async function getUserTeams(
  database: Database,
  userId: string
): Promise<TeamData[]> {
  const membersCollection = database.get<TeamMember>('team_members');
  const teamsCollection = database.get<Team>('teams');

  // Get all team memberships for this user
  const memberships = await membersCollection
    .query(Q.where('user_id', userId))
    .fetch();

  const teamIds = memberships.map((m) => m.teamId);

  if (teamIds.length === 0) {
    return [];
  }

  // Get all teams
  const teams = await teamsCollection
    .query(Q.where('team_id', Q.oneOf(teamIds)))
    .fetch();

  // Get member counts for each team
  const teamDataPromises = teams.map(async (team) => {
    const members = await membersCollection
      .query(Q.where('team_id', team.teamId))
      .fetch();

    return {
      teamId: team.teamId,
      name: team.name,
      description: team.description,
      ownerId: team.ownerId,
      memberCount: members.length,
    };
  });

  return Promise.all(teamDataPromises);
}

/**
 * Get all members of a team
 */
export async function getTeamMembers(
  database: Database,
  teamId: string
): Promise<TeamMemberData[]> {
  const membersCollection = database.get<TeamMember>('team_members');

  const members = await membersCollection
    .query(Q.where('team_id', teamId))
    .fetch();

  return members.map((m) => ({
    userId: m.userId,
    firstName: '',
    lastName: '',
    role: m.role as 'owner' | 'admin' | 'member',
    joinedAt: m.joinedAt,
  }));
}

/**
 * Leave a team (or delete if owner)
 */
export async function leaveTeam(
  database: Database,
  teamId: string,
  userId: string
): Promise<void> {
  const teamsCollection = database.get<Team>('teams');
  const membersCollection = database.get<TeamMember>('team_members');
  const invitationsCollection = database.get<TeamInvitation>('team_invitations');

  // Find the team
  const teams = await teamsCollection
    .query(Q.where('team_id', teamId))
    .fetch();

  if (teams.length === 0) {
    throw new Error('Team not found');
  }

  const team = teams[0];

  // Find the membership
  const memberships = await membersCollection
    .query(Q.where('team_id', teamId), Q.where('user_id', userId))
    .fetch();

  if (memberships.length === 0) {
    throw new Error('User is not a member of this team');
  }

  await database.write(async () => {
    // If user is the owner, delete the entire team
    if (team.ownerId === userId) {
      // Delete all members
      const allMembers = await membersCollection
        .query(Q.where('team_id', teamId))
        .fetch();
      for (const member of allMembers) {
        await member.markAsDeleted();
      }

      // Delete all invitations
      const allInvitations = await invitationsCollection
        .query(Q.where('team_id', teamId))
        .fetch();
      for (const invitation of allInvitations) {
        await invitation.markAsDeleted();
      }

      // Delete the team
      await team.markAsDeleted();
    } else {
      // Just remove the membership
      await memberships[0].markAsDeleted();
    }
  });
}

/**
 * Delete a team (owner only)
 */
export async function deleteTeam(
  database: Database,
  team: Team
): Promise<void> {
  const membersCollection = database.get<TeamMember>('team_members');
  const invitationsCollection = database.get<TeamInvitation>('team_invitations');

  await database.write(async () => {
    // Delete all members
    const allMembers = await membersCollection
      .query(Q.where('team_id', team.teamId))
      .fetch();
    for (const member of allMembers) {
      await member.markAsDeleted();
    }

    // Delete all invitations
    const allInvitations = await invitationsCollection
      .query(Q.where('team_id', team.teamId))
      .fetch();
    for (const invitation of allInvitations) {
      await invitation.markAsDeleted();
    }

    // Delete the team
    await team.markAsDeleted();
  });
}

/**
 * Invite a user to a team via email
 */
export async function inviteToTeam(
  database: Database,
  teamId: string,
  email: string,
  invitedBy: string
): Promise<TeamInvitation> {
  const invitationsCollection = database.get<TeamInvitation>('team_invitations');

  // Check if invitation already exists
  const existingInvitations = await invitationsCollection
    .query(
      Q.where('team_id', teamId),
      Q.where('email', email.toLowerCase()),
      Q.where('status', 'pending')
    )
    .fetch();

  if (existingInvitations.length > 0) {
    throw new Error('An invitation has already been sent to this email');
  }

  const invitation = await database.write(async () => {
    return await invitationsCollection.create((inv) => {
      inv.teamId = teamId;
      inv.email = email.toLowerCase();
      inv.invitedBy = invitedBy;
      inv.status = 'pending';
      inv.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
    });
  });

  return invitation;
}

/**
 * Get pending invitations for a team
 */
export async function getTeamInvitations(
  database: Database,
  teamId: string
): Promise<TeamInvitationData[]> {
  const invitationsCollection = database.get<TeamInvitation>('team_invitations');

  const invitations = await invitationsCollection
    .query(Q.where('team_id', teamId), Q.where('status', 'pending'))
    .fetch();

  return invitations.map((inv) => ({
    email: inv.email,
    status: inv.status as 'pending' | 'accepted' | 'declined' | 'expired',
    createdAt: inv.createdAt,
  }));
}

/**
 * Accept a team invitation
 */
export async function acceptInvitation(
  database: Database,
  email: string,
  userId: string
): Promise<void> {
  const invitationsCollection = database.get<TeamInvitation>('team_invitations');
  const membersCollection = database.get<TeamMember>('team_members');

  const invitations = await invitationsCollection
    .query(
      Q.where('email', email.toLowerCase()),
      Q.where('status', 'pending')
    )
    .fetch();

  await database.write(async () => {
    for (const invitation of invitations) {
      // Check if not expired
      if (invitation.expiresAt > new Date()) {
        // Add user as member
        await membersCollection.create((m) => {
          m.teamId = invitation.teamId;
          m.userId = userId;
          m.role = 'member';
        });

        // Update invitation status
        await invitation.update((inv) => {
          inv.status = 'accepted';
        });
      } else {
        // Mark as expired
        await invitation.update((inv) => {
          inv.status = 'expired';
        });
      }
    }
  });
}

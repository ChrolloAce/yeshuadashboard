import { useState, useEffect, useCallback } from 'react';
import { TeamService, TeamMemberInfo, TeamInvite } from '@/services/team/TeamService';
import { Team } from '@/types/database';
import { useAuth } from './useAuth';

export interface UseTeamsOptions {
  realTime?: boolean;
}

export const useTeams = (options: UseTeamsOptions = {}) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userProfile } = useAuth();
  const teamService = TeamService.getInstance();

  const fetchTeams = useCallback(async () => {
    if (!userProfile?.companyId) {
      setTeams([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const companyTeams = await teamService.getCompanyTeams(userProfile.companyId);
      setTeams(companyTeams);
    } catch (err: any) {
      console.error('Error fetching teams:', err);
      setError(err.message || 'Failed to fetch teams');
    } finally {
      setLoading(false);
    }
  }, [userProfile?.companyId, teamService]);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const createTeam = useCallback(async (teamData: {
    name: string;
    description?: string;
    specialties?: string[];
    leaderId?: string;
  }) => {
    if (!userProfile?.companyId) {
      throw new Error('No company ID available');
    }

    const newTeam = await teamService.createTeam(userProfile.companyId, teamData);
    await fetchTeams(); // Refresh teams list
    return newTeam;
  }, [userProfile?.companyId, teamService, fetchTeams]);

  const updateTeam = useCallback(async (teamId: string, updates: Partial<Team>) => {
    await teamService.updateTeam(teamId, updates);
    await fetchTeams(); // Refresh teams list
  }, [teamService, fetchTeams]);

  const deleteTeam = useCallback(async (teamId: string) => {
    await teamService.deleteTeam(teamId);
    await fetchTeams(); // Refresh teams list
  }, [teamService, fetchTeams]);

  const addMemberToTeam = useCallback(async (teamId: string, userId: string) => {
    await teamService.addMemberToTeam(teamId, userId);
    await fetchTeams(); // Refresh teams list
  }, [teamService, fetchTeams]);

  const removeMemberFromTeam = useCallback(async (teamId: string, userId: string) => {
    await teamService.removeMemberFromTeam(teamId, userId);
    await fetchTeams(); // Refresh teams list
  }, [teamService, fetchTeams]);

  return {
    teams,
    loading,
    error,
    refresh: fetchTeams,
    createTeam,
    updateTeam,
    deleteTeam,
    addMemberToTeam,
    removeMemberFromTeam
  };
};

export const useTeamMembers = (teamId: string | null) => {
  const [members, setMembers] = useState<TeamMemberInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const teamService = TeamService.getInstance();

  const fetchMembers = useCallback(async () => {
    if (!teamId) {
      setMembers([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const teamMembers = await teamService.getTeamMembers(teamId);
      setMembers(teamMembers);
    } catch (err: any) {
      console.error('Error fetching team members:', err);
      setError(err.message || 'Failed to fetch team members');
    } finally {
      setLoading(false);
    }
  }, [teamId, teamService]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  return {
    members,
    loading,
    error,
    refresh: fetchMembers
  };
};

export const useTeamInvites = () => {
  const [invites, setInvites] = useState<TeamInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userProfile } = useAuth();
  const teamService = TeamService.getInstance();

  const fetchInvites = useCallback(async () => {
    if (!userProfile?.companyId) {
      setInvites([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const companyInvites = await teamService.getCompanyInvites(userProfile.companyId);
      setInvites(companyInvites);
    } catch (err: any) {
      console.error('Error fetching invites:', err);
      setError(err.message || 'Failed to fetch invites');
    } finally {
      setLoading(false);
    }
  }, [userProfile?.companyId, teamService]);

  useEffect(() => {
    fetchInvites();
  }, [fetchInvites]);

  const createInvite = useCallback(async (options: {
    teamId?: string;
    email?: string;
    role?: 'cleaner' | 'team_lead';
    expiresInDays?: number;
  } = {}) => {
    if (!userProfile?.companyId || !userProfile?.uid) {
      throw new Error('User must be authenticated and have a company');
    }

    const invite = await teamService.createTeamInvite(
      userProfile.companyId,
      userProfile.uid,
      options
    );
    await fetchInvites(); // Refresh invites list
    return invite;
  }, [userProfile?.companyId, userProfile?.uid, teamService, fetchInvites]);

  return {
    invites,
    loading,
    error,
    refresh: fetchInvites,
    createInvite
  };
};

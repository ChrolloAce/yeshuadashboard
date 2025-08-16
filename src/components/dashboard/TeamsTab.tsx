'use client';

import React, { useState } from 'react';
import { Users, Plus, Edit, Trash2, UserPlus, Phone, Mail, Calendar, Copy, Link, ExternalLink, X } from 'lucide-react';
import { ThemedButton } from '@/components/ui/ThemedButton';
import { ThemedCard } from '@/components/ui/ThemedCard';
import { ThemedInput } from '@/components/ui/ThemedInput';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useTeams, useTeamMembers, useTeamInvites } from '@/hooks/useTeams';
import { Team } from '@/types/database';

export const TeamsTab: React.FC = () => {
  const { teams, loading, error, createTeam, deleteTeam } = useTeams();
  const { invites, createInvite } = useTeamInvites();
  const [isAddingTeam, setIsAddingTeam] = useState(false);
  const [isCreatingInvite, setIsCreatingInvite] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [newTeamData, setNewTeamData] = useState({
    name: '',
    description: '',
    specialties: [] as string[]
  });
  const [newInviteData, setNewInviteData] = useState({
    teamId: '',
    email: '',
    role: 'cleaner' as 'cleaner' | 'team_lead'
  });

  const handleAddTeam = () => {
    setIsAddingTeam(true);
  };

  const handleCreateTeam = async () => {
    try {
      if (!newTeamData.name.trim()) {
        alert('Please enter a team name');
        return;
      }

      await createTeam({
        name: newTeamData.name,
        description: newTeamData.description || undefined,
        specialties: newTeamData.specialties
      });

      setIsAddingTeam(false);
      setNewTeamData({ name: '', description: '', specialties: [] });
      console.log('✅ Team created successfully');
    } catch (error) {
      console.error('❌ Error creating team:', error);
      alert('Failed to create team. Please try again.');
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (confirm('Are you sure you want to delete this team?')) {
      try {
        await deleteTeam(teamId);
        console.log('✅ Team deleted successfully');
      } catch (error) {
        console.error('❌ Error deleting team:', error);
        alert('Failed to delete team. Please try again.');
      }
    }
  };

  const handleCreateInvite = async () => {
    try {
      const invite = await createInvite({
        teamId: newInviteData.teamId || undefined,
        email: newInviteData.email || undefined,
        role: newInviteData.role
      });

      const inviteUrl = `${window.location.origin}/join/${invite.inviteCode}`;
      
      // Copy to clipboard
      await navigator.clipboard.writeText(inviteUrl);
      
      setIsCreatingInvite(false);
      setNewInviteData({ teamId: '', email: '', role: 'cleaner' });
      
      alert(`Invitation created! The invite link has been copied to your clipboard:\n\n${inviteUrl}`);
      console.log('✅ Invite created successfully');
    } catch (error) {
      console.error('❌ Error creating invite:', error);
      alert('Failed to create invite. Please try again.');
    }
  };

  const copyInviteLink = async (inviteCode: string) => {
    const inviteUrl = `${window.location.origin}/join/${inviteCode}`;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      alert('Invite link copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      alert(`Invite link: ${inviteUrl}`);
    }
  };

  const TeamCard: React.FC<{ team: Team }> = ({ team }) => {
    const { members, loading: membersLoading } = useTeamMembers(team.id);

    return (
      <ThemedCard className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{team.name}</h3>
              {team.specialties && team.specialties.length > 0 && (
                <p className="text-sm text-gray-600">{team.specialties.join(', ')}</p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <ThemedButton 
              variant="outline" 
              size="sm"
              onClick={() => setSelectedTeam(team)}
            >
              <Edit className="w-4 h-4" />
            </ThemedButton>
            <ThemedButton 
              variant="outline" 
              size="sm"
              onClick={() => handleDeleteTeam(team.id)}
              className="text-red-600 hover:text-red-700 hover:border-red-300"
            >
              <Trash2 className="w-4 h-4" />
            </ThemedButton>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">{team.members.length}</p>
            <p className="text-sm text-gray-600">Members</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">-</p>
            <p className="text-sm text-gray-600">Jobs Completed</p>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Team Members:</h4>
          {membersLoading ? (
            <div className="flex justify-center p-4">
              <LoadingSpinner size="sm" />
            </div>
          ) : members.length > 0 ? (
            <div className="space-y-2">
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-600">
                        {member.firstName?.charAt(0) || member.email?.charAt(0) || '?'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {member.firstName && member.lastName 
                          ? `${member.firstName} ${member.lastName}` 
                          : member.email}
                      </p>
                      <p className="text-sm text-gray-600 capitalize">{member.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {member.email && (
                      <Mail className="w-4 h-4 text-gray-400" />
                    )}
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      member.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {member.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No members yet</p>
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <ThemedButton 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={() => {
              setNewInviteData(prev => ({ ...prev, teamId: team.id }));
              setIsCreatingInvite(true);
            }}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Invite Member
          </ThemedButton>
        </div>
      </ThemedCard>
    );
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Teams</h3>
          <p className="text-red-600 mb-4">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teams Management</h1>
          <p className="text-gray-600">Manage your cleaning teams and invite cleaners</p>
        </div>
        
        <div className="flex space-x-3">
          <ThemedButton onClick={() => setIsCreatingInvite(true)} variant="outline">
            <Link className="w-4 h-4 mr-2" />
            Create Invite
          </ThemedButton>
          <ThemedButton onClick={handleAddTeam} variant="primary">
            <Plus className="w-4 h-4 mr-2" />
            Add Team
          </ThemedButton>
        </div>
      </div>

      {/* Active Invites Section */}
      {invites.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Active Invitations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {invites
              .filter(invite => !invite.isUsed && invite.expiresAt > new Date())
              .map((invite) => (
                <ThemedCard key={invite.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        {invite.role === 'team_lead' ? 'Team Lead' : 'Cleaner'} Invite
                      </p>
                      {invite.email && (
                        <p className="text-sm text-gray-600">{invite.email}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Expires: {invite.expiresAt.toLocaleDateString()}
                      </p>
                    </div>
                    <ThemedButton
                      variant="outline"
                      size="sm"
                      onClick={() => copyInviteLink(invite.inviteCode)}
                    >
                      <Copy className="w-4 h-4" />
                    </ThemedButton>
                  </div>
                </ThemedCard>
              ))}
          </div>
        </div>
      )}

      {/* Teams Grid */}
      {teams.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {teams.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No teams yet</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Create your first cleaning team to organize your staff and assign them to jobs efficiently.
          </p>
          <ThemedButton onClick={handleAddTeam} variant="primary">
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Team
          </ThemedButton>
        </div>
      )}

      {/* Add Team Modal */}
      {isAddingTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Create New Team</h3>
              <button
                onClick={() => setIsAddingTeam(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Team Name *
                </label>
                <ThemedInput
                  type="text"
                  value={newTeamData.name}
                  onChange={(e) => setNewTeamData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Morning Crew"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Specialties (comma-separated)
                </label>
                <ThemedInput
                  type="text"
                  value={newTeamData.specialties.join(', ')}
                  onChange={(e) => setNewTeamData(prev => ({ 
                    ...prev, 
                    specialties: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  }))}
                  placeholder="e.g., Deep Cleaning, Move-out"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <ThemedButton 
                variant="outline" 
                onClick={() => setIsAddingTeam(false)}
                className="flex-1"
              >
                Cancel
              </ThemedButton>
              <ThemedButton 
                variant="primary" 
                onClick={handleCreateTeam}
                className="flex-1"
              >
                Create Team
              </ThemedButton>
            </div>
          </div>
        </div>
      )}

      {/* Create Invite Modal */}
      {isCreatingInvite && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Create Invitation</h3>
              <button
                onClick={() => setIsCreatingInvite(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assign to Team (Optional)
                </label>
                <select
                  value={newInviteData.teamId}
                  onChange={(e) => setNewInviteData(prev => ({ ...prev, teamId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">No specific team</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>{team.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email (Optional)
                </label>
                <ThemedInput
                  type="email"
                  value={newInviteData.email}
                  onChange={(e) => setNewInviteData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="cleaner@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={newInviteData.role}
                  onChange={(e) => setNewInviteData(prev => ({ ...prev, role: e.target.value as 'cleaner' | 'team_lead' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="cleaner">Cleaner</option>
                  <option value="team_lead">Team Lead</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <ThemedButton 
                variant="outline" 
                onClick={() => setIsCreatingInvite(false)}
                className="flex-1"
              >
                Cancel
              </ThemedButton>
              <ThemedButton 
                variant="primary" 
                onClick={handleCreateInvite}
                className="flex-1"
              >
                Create Invite
              </ThemedButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

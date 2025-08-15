'use client';

import React, { useState } from 'react';
import { Users, Plus, Edit, Trash2, UserPlus, Phone, Mail, Calendar } from 'lucide-react';
import { ThemedButton } from '@/components/ui/ThemedButton';
import { ThemedCard } from '@/components/ui/ThemedCard';

interface TeamMember {
  id: string;
  name: string;
  role: 'lead' | 'cleaner';
  phone?: string;
  email?: string;
  joinDate: Date;
  isActive: boolean;
}

interface Team {
  id: string;
  name: string;
  description?: string;
  members: TeamMember[];
  isActive: boolean;
  createdAt: Date;
  totalJobs: number;
  avgRating: number;
}

export const TeamsTab: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isAddingTeam, setIsAddingTeam] = useState(false);

  const handleAddTeam = () => {
    setIsAddingTeam(true);
  };

  const handleDeleteTeam = (teamId: string) => {
    if (confirm('Are you sure you want to delete this team?')) {
      setTeams(teams.filter(team => team.id !== teamId));
    }
  };

  const TeamCard: React.FC<{ team: Team }> = ({ team }) => (
    <ThemedCard className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{team.name}</h3>
            {team.description && (
              <p className="text-sm text-gray-600">{team.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <ThemedButton variant="outline" size="sm">
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
          <p className="text-2xl font-bold text-gray-900">{team.totalJobs}</p>
          <p className="text-sm text-gray-600">Jobs Completed</p>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="font-medium text-gray-900">Team Members:</h4>
        {team.members.length > 0 ? (
          <div className="space-y-2">
            {team.members.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-600">
                      {member.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{member.name}</p>
                    <p className="text-sm text-gray-600 capitalize">{member.role}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {member.phone && (
                    <Phone className="w-4 h-4 text-gray-400" />
                  )}
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
        <ThemedButton variant="outline" size="sm" className="w-full">
          <UserPlus className="w-4 h-4 mr-2" />
          Add Member
        </ThemedButton>
      </div>
    </ThemedCard>
  );

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teams Management</h1>
          <p className="text-gray-600">Manage your cleaning teams and assign members</p>
        </div>
        
        <ThemedButton onClick={handleAddTeam} variant="primary">
          <Plus className="w-4 h-4 mr-2" />
          Add Team
        </ThemedButton>
      </div>

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

      {/* Add Team Modal - TODO: Implement */}
      {isAddingTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Team</h3>
            <p className="text-gray-600 mb-6">Team creation form will be implemented here.</p>
            <div className="flex space-x-3">
              <ThemedButton 
                variant="outline" 
                onClick={() => setIsAddingTeam(false)}
                className="flex-1"
              >
                Cancel
              </ThemedButton>
              <ThemedButton variant="primary" className="flex-1">
                Create Team
              </ThemedButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

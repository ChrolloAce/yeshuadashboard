'use client';

import React, { useState } from 'react';
import { Users, ChevronDown } from 'lucide-react';
import { ThemedCard } from '@/components/ui/ThemedCard';

interface Team {
  id: string;
  name: string;
  members: string[];
  avatar?: string;
}

interface TeamSelectorProps {
  onTeamSelect: (team: Team | null) => void;
  selectedTeamId?: string;
}

export const TeamSelector: React.FC<TeamSelectorProps> = ({
  onTeamSelect,
  selectedTeamId
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // For now, we'll have an empty teams array as requested
  const teams: Team[] = [];

  const selectedTeam = teams.find(team => team.id === selectedTeamId);

  const handleTeamSelect = (team: Team | null) => {
    onTeamSelect(team);
    setIsDropdownOpen(false);
  };

  return (
    <ThemedCard className="p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Users className="w-5 h-5 mr-2 text-primary-600" />
        Assign Team
      </h2>

      <div className="space-y-4">
        {/* Team Selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg hover:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
          >
            <div className="flex items-center space-x-3">
              {selectedTeam ? (
                <>
                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">{selectedTeam.name}</p>
                    <p className="text-sm text-gray-600">
                      {selectedTeam.members.length} member{selectedTeam.members.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-gray-500" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-500">No team assigned</p>
                    <p className="text-sm text-gray-400">Select a cleaning team</p>
                  </div>
                </>
              )}
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              {/* No Team Option */}
              <div
                onClick={() => handleTeamSelect(null)}
                className={`p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 ${!selectedTeam ? 'bg-primary-50' : ''}`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-600">No team assigned</p>
                    <p className="text-sm text-gray-500">Assign later</p>
                  </div>
                </div>
              </div>

              {/* Teams List */}
              {teams.length > 0 ? (
                teams.map((team) => (
                  <div
                    key={team.id}
                    onClick={() => handleTeamSelect(team)}
                    className={`p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                      selectedTeam?.id === team.id ? 'bg-primary-50' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{team.name}</p>
                        <p className="text-sm text-gray-600">
                          {team.members.length} member{team.members.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm">No teams available</p>
                  <p className="text-xs text-gray-400 mt-1">Teams will be added here when created</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Team Info */}
        {selectedTeam && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Team Members:</h4>
            <div className="flex flex-wrap gap-2">
              {selectedTeam.members.map((member, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-white border border-gray-200 rounded-full text-sm text-gray-700"
                >
                  {member}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close dropdown */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </ThemedCard>
  );
};

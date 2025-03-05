import React, { useState } from 'react';
import { Plus, Search, UserPlus, X } from 'lucide-react';
import type { Team, User } from '../types';

const mockUsers: User[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    role: 'owner',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80',
  },
  {
    id: '2',
    name: 'Bob Smith',
    email: 'bob@example.com',
    role: 'admin',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80',
  },
];

const mockTeams: Team[] = [
  {
    id: '1',
    name: '3D Design Team',
    description: 'Main product design team',
    members: [
      { userId: '1', teamId: '1', role: 'owner', joinedAt: new Date('2024-01-01') },
      { userId: '2', teamId: '1', role: 'admin', joinedAt: new Date('2024-01-02') },
    ],
    createdAt: new Date('2024-01-01'),
  },
];

interface TeamManagementProps {
  onClose: () => void;
}

export function TeamManagement({ onClose }: TeamManagementProps) {
  const [activeTeam, setActiveTeam] = useState<Team | null>(mockTeams[0]);
  const [showNewTeam, setShowNewTeam] = useState(false);
  const [showInviteMembers, setShowInviteMembers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [newTeamData, setNewTeamData] = useState({
    name: '',
    description: '',
  });

  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault();
    const newTeam: Team = {
      id: String(mockTeams.length + 1),
      name: newTeamData.name,
      description: newTeamData.description,
      members: [
        {
          userId: '1', // Current user
          teamId: String(mockTeams.length + 1),
          role: 'owner',
          joinedAt: new Date(),
        },
      ],
      createdAt: new Date(),
    };
    mockTeams.push(newTeam);
    setActiveTeam(newTeam);
    setShowNewTeam(false);
    setNewTeamData({ name: '', description: '' });
  };

  const filteredUsers = mockUsers.filter(
    user =>
      !activeTeam?.members.find(member => member.userId === user.id) &&
      (user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Team Management</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="flex h-full">
            {/* Teams Sidebar */}
            <div className="w-64 border-r border-gray-200 p-4 space-y-4">
              <button
                onClick={() => setShowNewTeam(true)}
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Team
              </button>
              <div className="space-y-2">
                {mockTeams.map(team => (
                  <button
                    key={team.id}
                    onClick={() => setActiveTeam(team)}
                    className={`w-full text-left px-4 py-2 rounded-md ${
                      activeTeam?.id === team.id
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium">{team.name}</div>
                    <div className="text-sm text-gray-500">
                      {team.members.length} members
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Team Details */}
            {activeTeam && (
              <div className="flex-1 p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {activeTeam.name}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {activeTeam.description}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowInviteMembers(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Members
                  </button>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Team Members</h4>
                  <div className="space-y-2">
                    {activeTeam.members.map(member => {
                      const user = mockUsers.find(u => u.id === member.userId);
                      if (!user) return null;
                      return (
                        <div
                          key={member.userId}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <img
                              src={user.avatarUrl}
                              alt={user.name}
                              className="w-10 h-10 rounded-full"
                            />
                            <div>
                              <div className="font-medium text-gray-900">
                                {user.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {user.email}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                              {member.role}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Team Modal */}
      {showNewTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Create New Team
            </h3>
            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Team Name
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={newTeamData.name}
                  onChange={e =>
                    setNewTeamData(prev => ({ ...prev, name: e.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  rows={3}
                  value={newTeamData.description}
                  onChange={e =>
                    setNewTeamData(prev => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowNewTeam(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                >
                  Create Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite Members Modal */}
      {showInviteMembers && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Add Members</h3>
              <button
                onClick={() => setShowInviteMembers(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="relative mb-4">
              <input
                type="text"
                className="block w-full rounded-md border-gray-300 pl-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Search users..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
            <div className="space-y-2 max-h-60 overflow-auto">
              {filteredUsers.map(user => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (activeTeam) {
                        activeTeam.members.push({
                          userId: user.id,
                          teamId: activeTeam.id,
                          role: 'member',
                          joinedAt: new Date(),
                        });
                        setShowInviteMembers(false);
                      }
                    }}
                    className="px-3 py-1 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-md"
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Player {
  name: string;
  isCaptain: boolean;
}

interface Team {
  _id: string;
  teamName: string;
  players: Player[];
  paymentScreenshot: string;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'verified' | 'pending'>('all');
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);
  const [adminUsername, setAdminUsername] = useState('');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      console.log('Checking authentication...');
      const response = await fetch('/api/auth/verify');
      const data = await response.json();
      console.log('Auth check result:', data);

      if (!data.authenticated) {
        console.log('Not authenticated, redirecting to login...');
        window.location.href = '/admin/login';
        return;
      }

      console.log('Authenticated, loading admin data...');
      setAdminUsername(data.admin.username);
      fetchTeams();
    } catch (error) {
      console.error('Auth check error:', error);
      window.location.href = '/admin/login';
    }
  };

  const fetchTeams = async () => {
    try {
      const response = await fetch('/api/teams');
      const data = await response.json();
      if (data.success) {
        setTeams(data.data);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/admin/login';
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleVerifyToggle = async (teamId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/teams/${teamId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ verified: !currentStatus }),
      });

      const data = await response.json();
      if (data.success) {
        setTeams(teams.map(team => 
          team._id === teamId ? { ...team, verified: !currentStatus } : team
        ));
      }
    } catch (error) {
      console.error('Error updating team:', error);
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!confirm('Are you sure you want to delete this team?')) return;

    try {
      const response = await fetch(`/api/teams/${teamId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        setTeams(teams.filter(team => team._id !== teamId));
      }
    } catch (error) {
      console.error('Error deleting team:', error);
    }
  };

  const filteredTeams = teams.filter(team => {
    if (filter === 'verified') return team.verified;
    if (filter === 'pending') return !team.verified;
    return true;
  });

  const stats = {
    total: teams.length,
    verified: teams.filter(t => t.verified).length,
    pending: teams.filter(t => !t.verified).length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-2xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-indigo-100 mt-2">Manage team registrations</p>
              </div>
              <div className="flex items-center gap-4">
                <a
                  href="/"
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Home
                </a>
                <div className="text-right">
                  <p className="text-white text-sm font-medium">Welcome,</p>
                  <p className="text-indigo-100 font-semibold">{adminUsername}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
              <div className="text-blue-600 text-sm font-semibold uppercase tracking-wide">
                Total Teams
              </div>
              <div className="text-4xl font-bold text-blue-900 mt-2">{stats.total}</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
              <div className="text-green-600 text-sm font-semibold uppercase tracking-wide">
                Verified
              </div>
              <div className="text-4xl font-bold text-green-900 mt-2">{stats.verified}</div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
              <div className="text-orange-600 text-sm font-semibold uppercase tracking-wide">
                Pending
              </div>
              <div className="text-4xl font-bold text-orange-900 mt-2">{stats.pending}</div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-6 p-2">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                filter === 'all'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              All Teams ({stats.total})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                filter === 'pending'
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Pending ({stats.pending})
            </button>
            <button
              onClick={() => setFilter('verified')}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                filter === 'verified'
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Verified ({stats.verified})
            </button>
          </div>
        </div>

        {/* Teams List */}
        <div className="space-y-4">
          {filteredTeams.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <p className="text-gray-500 text-lg">No teams found</p>
            </div>
          ) : (
            filteredTeams.map((team) => (
              <div
                key={team._id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-2xl font-bold text-gray-900">{team.teamName}</h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            team.verified
                              ? 'bg-green-100 text-green-700'
                              : 'bg-orange-100 text-orange-700'
                          }`}
                        >
                          {team.verified ? '✓ Verified' : '⏳ Pending'}
                        </span>
                      </div>
                      <p className="text-gray-500 text-sm mt-1">
                        Registered: {new Date(team.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setExpandedTeam(expandedTeam === team._id ? null : team._id)}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                      >
                        {expandedTeam === team._id ? 'Hide' : 'View'} Players
                      </button>
                      <button
                        onClick={() => handleVerifyToggle(team._id, team.verified)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          team.verified
                            ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {team.verified ? 'Unverify' : 'Verify'}
                      </button>
                      <button
                        onClick={() => handleDeleteTeam(team._id)}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Players List */}
                  {expandedTeam === team._id && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Team Players</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {team.players.map((player, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <span className="text-gray-900 font-medium">{player.name}</span>
                              {player.isCaptain && (
                                <span className="ml-2 text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-semibold">
                                  👑 Captain
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Payment Screenshot */}
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Payment Screenshot</h4>
                        <div className="bg-gray-50 rounded-lg p-4">
                          {team.paymentScreenshot ? (
                            <a
                              href={team.paymentScreenshot}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block"
                            >
                              <img
                                src={team.paymentScreenshot}
                                alt="Payment Screenshot"
                                className="max-h-96 mx-auto rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                              />
                              <p className="text-center mt-3 text-sm text-blue-600 hover:text-blue-800">
                                Click to view full size →
                              </p>
                            </a>
                          ) : (
                            <p className="text-gray-500 text-center py-8">No payment screenshot uploaded</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';

interface Player {
  name: string;
  isCaptain: boolean;
}

export default function RegisterTeam() {
  const [teamName, setTeamName] = useState('');
  const [players, setPlayers] = useState<Player[]>(
    Array(8).fill(null).map(() => ({ name: '', isCaptain: false }))
  );

  const handlePlayerNameChange = (index: number, name: string) => {
    const updatedPlayers = [...players];
    updatedPlayers[index].name = name;
    setPlayers(updatedPlayers);
  };

  const handleCaptainChange = (index: number) => {
    const updatedPlayers = players.map((player, i) => ({
      ...player,
      isCaptain: i === index,
    }));
    setPlayers(updatedPlayers);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!teamName.trim()) {
      alert('Please enter a team name');
      return;
    }

    const filledPlayers = players.filter(p => p.name.trim());
    if (filledPlayers.length < 8) {
      alert('Please enter all 8 player names');
      return;
    }

    const hasCaptain = players.some(p => p.isCaptain);
    if (!hasCaptain) {
      alert('Please select a team captain');
      return;
    }

    // Submit data
    console.log({ teamName, players });
    alert('Team registered successfully!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
            <h1 className="text-3xl font-bold text-white text-center">
              Team Registration
            </h1>
            <p className="text-blue-100 text-center mt-2">
              Register your 8-player team for the tournament
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 py-8 space-y-8">
            {/* Team Name */}
            <div>
              <label htmlFor="teamName" className="block text-sm font-semibold text-gray-700 mb-2">
                Team Name
              </label>
              <input
                type="text"
                id="teamName"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-900"
                placeholder="Enter your team name"
                required
              />
            </div>

            {/* Players List */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Team Players
              </h2>
              <div className="space-y-3">
                {players.map((player, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {index + 1}
                    </div>
                    
                    <input
                      type="text"
                      value={player.name}
                      onChange={(e) => handlePlayerNameChange(index, e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-900"
                      placeholder={`Player ${index + 1} name`}
                      required
                    />

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`captain-${index}`}
                        checked={player.isCaptain}
                        onChange={() => handleCaptainChange(index)}
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      />
                      <label
                        htmlFor={`captain-${index}`}
                        className="text-sm font-medium text-gray-700 cursor-pointer select-none whitespace-nowrap"
                      >
                        Captain
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-[1.02] transition-all shadow-lg hover:shadow-xl"
              >
                Register Team
              </button>
            </div>
          </form>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-gray-600 text-sm">
          <p>Make sure all player names are entered correctly</p>
          <p className="mt-1">Select one player as the team captain</p>
        </div>
      </div>
    </div>
  );
}

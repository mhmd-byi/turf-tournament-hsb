'use client';

import { useState, useEffect } from 'react';

interface Player {
  name: string;
  isCaptain: boolean;
}

export default function Home() {
  const [teamName, setTeamName] = useState('');
  const [players, setPlayers] = useState<Player[]>(
    Array(8).fill(null).map(() => ({ name: '', isCaptain: false }))
  );
  const [paymentScreenshot, setPaymentScreenshot] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [totalTeams, setTotalTeams] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const MAX_TEAMS = 6;

  useEffect(() => {
    checkRegistrationStatus();
  }, []);

  const checkRegistrationStatus = async () => {
    try {
      const response = await fetch('/api/teams');
      const data = await response.json();
      if (data.success) {
        setTotalTeams(data.count);
      }
    } catch (error) {
      console.error('Error checking registration status:', error);
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }

      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        setPaymentScreenshot(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
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

    if (!paymentScreenshot) {
      alert('Please upload payment screenshot');
      return;
    }

    // Submit data to database
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ teamName, players, paymentScreenshot }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Team registered successfully! ✅');
        // Refresh team count
        await checkRegistrationStatus();
        // Reset form
        setTeamName('');
        setPlayers(Array(8).fill(null).map(() => ({ name: '', isCaptain: false })));
        setPaymentScreenshot('');
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      alert('Failed to register team. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {isLoading ? (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        ) : totalTeams >= MAX_TEAMS ? (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-red-600 to-orange-600 px-4 sm:px-6 md:px-8 py-4 sm:py-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-white text-center">
                Registration Closed
              </h1>
            </div>
            <div className="px-4 sm:px-6 md:px-8 py-12 text-center">
              <svg className="mx-auto h-24 w-24 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h2 className="mt-6 text-2xl font-bold text-gray-900">Registration Limit Reached</h2>
              <p className="mt-4 text-lg text-gray-600">
                We have reached the maximum limit of <span className="font-bold text-orange-600">{MAX_TEAMS} teams</span>.
              </p>
              <p className="mt-2 text-gray-600">
                Registration is now closed. Thank you for your interest!
              </p>
              <div className="mt-8 bg-blue-50 rounded-lg p-6">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Total Teams Registered:</span>{' '}
                  <span className="text-2xl font-bold text-blue-600">{totalTeams}/{MAX_TEAMS}</span>
                </p>
              </div>
            </div>
          </div>
        ) : (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 sm:px-6 md:px-8 py-4 sm:py-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-white text-center">
              Team Registration
            </h1>
            <p className="text-blue-100 text-center mt-2 text-sm sm:text-base">
              Register your 8-player team for the tournament
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-4 sm:px-6 md:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
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
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {index + 1}
                      </div>
                      
                      <input
                        type="text"
                        value={player.name}
                        onChange={(e) => handlePlayerNameChange(index, e.target.value)}
                        className="flex-1 sm:flex-auto sm:min-w-[200px] px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-900"
                        placeholder={`Player ${index + 1} name`}
                        required
                      />
                    </div>

                    <div className="flex items-center gap-2 pl-11 sm:pl-0">
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

            {/* Payment Section */}
            <div className="border-t border-gray-200 pt-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Payment Information
              </h2>
              
              {/* QR Code */}
              <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-4 sm:p-6 mb-6">
                <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-6">
                  <div className="flex-shrink-0">
                    <div className="bg-white p-3 sm:p-4 rounded-xl shadow-lg">
                      <img 
                        src="/qr-code.png" 
                        alt="Payment QR Code" 
                        className="w-40 h-40 sm:w-48 sm:h-48 rounded-lg"
                      />
                    </div>
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Scan QR Code to Pay</h3>
                    <p className="text-sm sm:text-base text-gray-700 mb-4">
                      Scan the QR code using your payment app and complete the payment.
                    </p>
                    <div className="bg-white rounded-lg p-3 sm:p-4 inline-block">
                      <p className="text-xs sm:text-sm font-semibold text-gray-700">Registration Fee:</p>
                      <p className="text-2xl sm:text-3xl font-bold text-green-600">₹4,400</p>
                      <p className="text-xs text-gray-500 mt-1">Per Team</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Upload Payment Screenshot */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Upload Payment Screenshot <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 hover:border-blue-500 transition-colors">
                  {!paymentScreenshot ? (
                    <div className="text-center">
                      <svg className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" />
                      </svg>
                      <div className="mt-3 sm:mt-4">
                        <label htmlFor="payment-upload" className="cursor-pointer">
                          <span className="mt-2 block text-sm font-medium text-gray-900">
                            Click to upload payment screenshot
                          </span>
                          <span className="mt-1 block text-xs text-gray-500">
                            PNG, JPG, JPEG up to 5MB
                          </span>
                        </label>
                        <input
                          id="payment-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                          required
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <img
                        src={paymentScreenshot}
                        alt="Payment Screenshot"
                        className="max-h-48 sm:max-h-64 mx-auto rounded-lg shadow-md"
                      />
                      <button
                        type="button"
                        onClick={() => setPaymentScreenshot('')}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                      >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      <p className="text-center mt-3 text-sm text-green-600 font-medium">✓ Screenshot uploaded</p>
                    </div>
                  )}
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  After making the payment, upload a clear screenshot of the payment confirmation.
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-[1.02] transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSubmitting ? 'Registering...' : 'Register Team'}
              </button>
            </div>
          </form>
        </div>
        )}

        {/* Footer Info */}
        {!isLoading && totalTeams < MAX_TEAMS && (
          <div className="mt-8 text-center text-gray-600 text-sm">
            <p>Make sure all player names are entered correctly</p>
            <p className="mt-1">Select one player as the team captain</p>
            <div className="mt-4 bg-white rounded-lg p-4 inline-block shadow-md">
              <p className="text-xs font-semibold text-gray-700">Teams Registered:</p>
              <p className="text-2xl font-bold text-blue-600">{totalTeams}/{MAX_TEAMS}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

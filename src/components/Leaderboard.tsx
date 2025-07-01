import React, { useState, useEffect } from 'react';
import { ArrowLeft, Crown, Trophy, Medal, Star, Users, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

interface LeaderboardProps {
  onBack: () => void;
}

interface LeaderboardEntry {
  id: string;
  name: string;
  avatar: string;
  refCount: number;
  joinedAt: number;
  giveawayTitle?: string;
  giveawayId?: string;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ onBack }) => {
  const [globalLeaderboard, setGlobalLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState<'global' | 'giveaway'>('global');

  useEffect(() => {
    fetchGlobalLeaderboard();
  }, []);

  const fetchGlobalLeaderboard = async () => {
    try {
      const response = await fetch('http://hans-luminova.onrender.com/api/global-leaderboard');
      const data = await response.json();
      setGlobalLeaderboard(data);
    } catch (error) {
      toast.error('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-orange-400" />;
      default:
        return <Star className="w-6 h-6 text-purple-400" />;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white';
      case 2:
        return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white';
      case 3:
        return 'bg-gradient-to-r from-orange-500 to-orange-600 text-white';
      default:
        return 'bg-gradient-to-r from-purple-500 to-purple-600 text-white';
    }
  };

  const getCardBorderColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'border-yellow-500/50 bg-yellow-500/5';
      case 2:
        return 'border-gray-400/50 bg-gray-400/5';
      case 3:
        return 'border-orange-500/50 bg-orange-500/5';
      default:
        return 'border-white/20 bg-white/5';
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={onBack}
            className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors mr-4"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white flex items-center">
              <Crown className="w-8 h-8 mr-3 text-yellow-400" />
              LUMINORA Leaderboard
            </h1>
            <p className="text-gray-300 mt-1">Top performers across all giveaways</p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-500/20 rounded-lg">
                <Crown className="w-6 h-6 text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-400">Top Performer</p>
                <p className="text-xl font-bold text-white">
                  {globalLeaderboard[0]?.name || 'No data'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center">
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <Users className="w-6 h-6 text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-400">Total Competitors</p>
                <p className="text-xl font-bold text-white">{globalLeaderboard.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-400">Highest Referrals</p>
                <p className="text-xl font-bold text-white">
                  {globalLeaderboard[0]?.refCount || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Top 3 Podium */}
        {globalLeaderboard.length >= 3 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">🏆 Hall of Fame</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 2nd Place */}
              <div className="order-2 md:order-1">
                <div className="bg-gradient-to-br from-gray-400/20 to-gray-600/20 backdrop-blur-md rounded-xl p-6 border border-gray-400/30 text-center transform hover:scale-105 transition-all duration-200">
                  <div className="relative mb-4">
                    <img
                      src={globalLeaderboard[1]?.avatar}
                      alt={globalLeaderboard[1]?.name}
                      className="w-20 h-20 rounded-full mx-auto border-4 border-gray-400"
                    />
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      2
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">{globalLeaderboard[1]?.name}</h3>
                  <p className="text-gray-300 text-sm mb-2">{globalLeaderboard[1]?.refCount} referrals</p>
                  <p className="text-xs text-gray-400">{globalLeaderboard[1]?.giveawayTitle}</p>
                </div>
              </div>

              {/* 1st Place */}
              <div className="order-1 md:order-2">
                <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 backdrop-blur-md rounded-xl p-8 border border-yellow-500/30 text-center transform hover:scale-105 transition-all duration-200 relative">
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Crown className="w-8 h-8 text-yellow-400" />
                  </div>
                  <div className="relative mb-4 mt-4">
                    <img
                      src={globalLeaderboard[0]?.avatar}
                      alt={globalLeaderboard[0]?.name}
                      className="w-24 h-24 rounded-full mx-auto border-4 border-yellow-400"
                    />
                    <div className="absolute -top-2 -right-2 w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold">
                      1
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">{globalLeaderboard[0]?.name}</h3>
                  <p className="text-yellow-300 text-lg font-semibold mb-2">{globalLeaderboard[0]?.refCount} referrals</p>
                  <p className="text-xs text-gray-400">{globalLeaderboard[0]?.giveawayTitle}</p>
                </div>
              </div>

              {/* 3rd Place */}
              <div className="order-3">
                <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 backdrop-blur-md rounded-xl p-6 border border-orange-500/30 text-center transform hover:scale-105 transition-all duration-200">
                  <div className="relative mb-4">
                    <img
                      src={globalLeaderboard[2]?.avatar}
                      alt={globalLeaderboard[2]?.name}
                      className="w-20 h-20 rounded-full mx-auto border-4 border-orange-400"
                    />
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      3
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">{globalLeaderboard[2]?.name}</h3>
                  <p className="text-orange-300 text-sm mb-2">{globalLeaderboard[2]?.refCount} referrals</p>
                  <p className="text-xs text-gray-400">{globalLeaderboard[2]?.giveawayTitle}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Full Leaderboard */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
            <Trophy className="w-5 h-5 mr-2" />
            Complete Rankings
          </h2>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                <div key={i} className="flex items-center space-x-4 p-4 bg-white/5 rounded-lg animate-pulse">
                  <div className="w-12 h-12 bg-white/20 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-white/20 rounded mb-2"></div>
                    <div className="h-3 bg-white/20 rounded w-1/2"></div>
                  </div>
                  <div className="w-16 h-8 bg-white/20 rounded"></div>
                </div>
              ))}
            </div>
          ) : globalLeaderboard.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-300 mb-2">No data yet</h3>
              <p className="text-gray-400">Be the first to join a giveaway and start earning referrals!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {globalLeaderboard.map((entry, index) => (
                <div
                  key={`${entry.id}-${entry.giveawayId}`}
                  className={`flex items-center space-x-4 p-4 rounded-lg border transition-all duration-200 hover:transform hover:scale-[1.02] ${getCardBorderColor(index + 1)}`}
                >
                  <div className="flex-shrink-0">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm ${getRankBadgeColor(index + 1)}`}>
                      {index < 3 ? getRankIcon(index + 1) : index + 1}
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0">
                    <img
                      src={entry.avatar}
                      alt={entry.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-white/20"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-white truncate">{entry.name}</h3>
                      {index < 3 && (
                        <div className="flex-shrink-0">
                          {getRankIcon(index + 1)}
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 truncate">{entry.giveawayTitle}</p>
                    <p className="text-xs text-gray-500">
                      Joined {new Date(entry.joinedAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="text-right flex-shrink-0">
                    <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                      index === 0 ? 'bg-yellow-500/20 text-yellow-300' :
                      index === 1 ? 'bg-gray-400/20 text-gray-300' :
                      index === 2 ? 'bg-orange-500/20 text-orange-300' :
                      'bg-purple-500/20 text-purple-300'
                    }`}>
                      {entry.refCount}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">referrals</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Achievement Badges */}
        <div className="mt-8 bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">🏅 Achievement Levels</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <Crown className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-yellow-300">Legend</p>
              <p className="text-xs text-gray-400">100+ referrals</p>
            </div>
            <div className="text-center p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
              <Trophy className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-purple-300">Master</p>
              <p className="text-xs text-gray-400">50+ referrals</p>
            </div>
            <div className="text-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <Medal className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-blue-300">Expert</p>
              <p className="text-xs text-gray-400">25+ referrals</p>
            </div>
            <div className="text-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
              <Star className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-green-300">Rising Star</p>
              <p className="text-xs text-gray-400">10+ referrals</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
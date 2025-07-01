import React, { useState, useEffect } from 'react';
import { Gift, Plus, Trophy, Users, Calendar, TrendingUp, Crown, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

interface Giveaway {
  id: string;
  title: string;
  host: string;
  endTime: number;
  participantCount: number;
  isEnded: boolean;
}

interface HomePageProps {
  onNavigate: (page: string, giveaway?: Giveaway) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const [giveaways, setGiveaways] = useState<Giveaway[]>([]);
  const [stats, setStats] = useState({ 
    totalGiveaways: 0, 
    totalParticipants: 0, 
    activeGiveaways: 0,
    totalReferrals: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGiveaways();
    fetchStats();
  }, []);

  const fetchGiveaways = async () => {
    try {
      const response = await fetch('http://hans-luminova.onrender.com/api/giveaways');
      const data = await response.json();
      setGiveaways(data);
    } catch (error) {
      toast.error('Failed to load giveaways');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('http://hans-luminova.onrender.com/api/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats');
    }
  };

  const formatTimeRemaining = (endTime: number) => {
    const now = Date.now();
    const remaining = endTime - now;
    
    if (remaining <= 0) return 'Ended';
    
    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-6 shadow-lg">
            <Gift className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold text-white mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">
              LUMINORA
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-2">
            Create amazing giveaways and grow your community with our powerful referral system
          </p>
          <p className="text-sm text-gray-400">
            ✨ The ultimate platform for viral giveaways and community growth
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 md:p-6 border border-white/20 hover:bg-white/15 transition-all duration-200">
            <div className="flex items-center">
              <div className="p-2 md:p-3 bg-blue-500/20 rounded-lg">
                <Trophy className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />
              </div>
              <div className="ml-3 md:ml-4">
                <p className="text-xs md:text-sm text-gray-400">Total Giveaways</p>
                <p className="text-lg md:text-2xl font-bold text-white">{stats.totalGiveaways}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 md:p-6 border border-white/20 hover:bg-white/15 transition-all duration-200">
            <div className="flex items-center">
              <div className="p-2 md:p-3 bg-green-500/20 rounded-lg">
                <Users className="w-5 h-5 md:w-6 md:h-6 text-green-400" />
              </div>
              <div className="ml-3 md:ml-4">
                <p className="text-xs md:text-sm text-gray-400">Participants</p>
                <p className="text-lg md:text-2xl font-bold text-white">{stats.totalParticipants}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 md:p-6 border border-white/20 hover:bg-white/15 transition-all duration-200">
            <div className="flex items-center">
              <div className="p-2 md:p-3 bg-purple-500/20 rounded-lg">
                <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
              </div>
              <div className="ml-3 md:ml-4">
                <p className="text-xs md:text-sm text-gray-400">Active</p>
                <p className="text-lg md:text-2xl font-bold text-white">{stats.activeGiveaways}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 md:p-6 border border-white/20 hover:bg-white/15 transition-all duration-200">
            <div className="flex items-center">
              <div className="p-2 md:p-3 bg-yellow-500/20 rounded-lg">
                <Zap className="w-5 h-5 md:w-6 md:h-6 text-yellow-400" />
              </div>
              <div className="ml-3 md:ml-4">
                <p className="text-xs md:text-sm text-gray-400">Referrals</p>
                <p className="text-lg md:text-2xl font-bold text-white">{stats.totalReferrals}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <button
            onClick={() => onNavigate('create')}
            className="flex items-center justify-center px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Giveaway
          </button>
          
          <button
            onClick={() => onNavigate('join')}
            className="flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-md text-white rounded-xl font-semibold hover:bg-white/20 transform hover:scale-105 transition-all duration-200 border border-white/20"
          >
            <Gift className="w-5 h-5 mr-2" />
            Join Giveaway
          </button>
          
          <button
            onClick={() => onNavigate('leaderboard')}
            className="flex items-center justify-center px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-semibold hover:from-yellow-600 hover:to-orange-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Crown className="w-5 h-5 mr-2" />
            Leaderboard
          </button>
          
          <button
            onClick={() => onNavigate('my-giveaways')}
            className="flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-md text-white rounded-xl font-semibold hover:bg-white/20 transform hover:scale-105 transition-all duration-200 border border-white/20"
          >
            <Trophy className="w-5 h-5 mr-2" />
            My Giveaways
          </button>
        </div>
      </div>

      {/* Giveaways Grid */}
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <TrendingUp className="w-6 h-6 mr-2" />
          Active Giveaways
        </h2>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 animate-pulse">
                <div className="h-4 bg-white/20 rounded mb-4"></div>
                <div className="h-3 bg-white/20 rounded mb-2"></div>
                <div className="h-3 bg-white/20 rounded mb-4"></div>
                <div className="h-8 bg-white/20 rounded"></div>
              </div>
            ))}
          </div>
        ) : giveaways.length === 0 ? (
          <div className="text-center py-12">
            <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No giveaways yet</h3>
            <p className="text-gray-400 mb-6">Be the first to create an amazing giveaway on LUMINORA!</p>
            <button
              onClick={() => onNavigate('create')}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200"
            >
              Create First Giveaway
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {giveaways.map((giveaway) => (
              <div
                key={giveaway.id}
                onClick={() => onNavigate('details', giveaway)}
                className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-200 cursor-pointer group hover:transform hover:scale-105 hover:shadow-xl"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-purple-300 transition-colors">
                      {giveaway.title}
                    </h3>
                    <p className="text-sm text-gray-400">by {giveaway.host}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    giveaway.isEnded 
                      ? 'bg-red-500/20 text-red-400' 
                      : 'bg-green-500/20 text-green-400'
                  }`}>
                    {giveaway.isEnded ? 'Ended' : 'Active'}
                  </div>
                </div>
                
                <div className="flex items-center text-gray-300 text-sm mb-4">
                  <Users className="w-4 h-4 mr-2" />
                  <span>{giveaway.participantCount} participants</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-300 text-sm">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{formatTimeRemaining(giveaway.endTime)}</span>
                  </div>
                  <div className="text-xs text-gray-400">
                    Click to view details
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto mt-16 text-center">
        <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10">
          <p className="text-gray-400 text-sm">
            Powered by <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 font-semibold">LUMINORA</span> - 
            The future of viral giveaways and community growth
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
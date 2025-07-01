import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Users, Calendar, Trophy, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

interface MyGiveawaysProps {
  onBack: () => void;
}

const MyGiveaways: React.FC<MyGiveawaysProps> = ({ onBack }) => {
  const [giveaways, setGiveaways] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchMyGiveaways();
  }, []);

  const fetchMyGiveaways = async () => {
    try {
      const response = await fetch('http://hans-luminova.onrender.com/api/my-giveaways');
      const data = await response.json();
      setGiveaways(data);
    } catch (error) {
      toast.error('Failed to load your giveaways');
    } finally {
      setLoading(false);
    }
  };

  const deleteGiveaway = async (id: string) => {
    if (!confirm('Are you sure you want to delete this giveaway? This action cannot be undone.')) {
      return;
    }

    setDeletingId(id);
    try {
      const response = await fetch(`http://hans-luminova.onrender.com/api/delete/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Giveaway deleted successfully');
        setGiveaways(giveaways.filter(g => g.id !== id));
      } else {
        toast.error(data.error || 'Failed to delete giveaway');
      }
    } catch (error) {
      toast.error('Failed to delete giveaway');
    } finally {
      setDeletingId(null);
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

  const copyGiveawayLink = (id: string) => {
    const link = `${window.location.origin}/g/${id}`;
    navigator.clipboard.writeText(link);
    toast.success('Giveaway link copied!');
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
            <h1 className="text-3xl font-bold text-white">My Giveaways</h1>
            <p className="text-gray-300 mt-1">Manage and track your giveaways</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 animate-pulse">
                <div className="h-4 bg-white/20 rounded mb-4"></div>
                <div className="h-3 bg-white/20 rounded mb-2"></div>
                <div className="h-3 bg-white/20 rounded mb-4"></div>
                <div className="flex space-x-2">
                  <div className="h-8 bg-white/20 rounded flex-1"></div>
                  <div className="h-8 bg-white/20 rounded w-8"></div>
                </div>
              </div>
            ))}
          </div>
        ) : giveaways.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No giveaways yet</h3>
            <p className="text-gray-400 mb-6">Create your first giveaway to get started!</p>
            <button
              onClick={onBack}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200"
            >
              <Plus className="w-5 h-5 mr-2 inline" />
              Create Giveaway
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {giveaways.map((giveaway) => (
              <div
                key={giveaway.id}
                className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">
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
                
                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-gray-300 text-sm">
                    <Users className="w-4 h-4 mr-2" />
                    <span>{giveaway.participantCount} participants</span>
                  </div>
                  
                  <div className="flex items-center text-gray-300 text-sm">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{formatTimeRemaining(giveaway.endTime)}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => copyGiveawayLink(giveaway.id)}
                    className="flex-1 px-3 py-2 bg-blue-500/20 text-blue-300 rounded-lg text-sm font-medium hover:bg-blue-500/30 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 mr-1 inline" />
                    Copy Link
                  </button>
                  
                  <button
                    onClick={() => deleteGiveaway(giveaway.id)}
                    disabled={deletingId === giveaway.id}
                    className="p-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Giveaway ID for sharing */}
                <div className="mt-4 p-3 bg-white/5 rounded-lg">
                  <p className="text-xs text-gray-400 mb-1">Giveaway ID:</p>
                  <p className="text-xs text-gray-300 font-mono break-all">{giveaway.id}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyGiveaways;
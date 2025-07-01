import React, { useState, useEffect } from 'react';
import { ArrowLeft, Trophy, Users, Calendar, Clock, Phone, ExternalLink, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Participant {
  id: string;
  name: string;
  avatar: string;
  refCount: number;
  joinedAt: number;
}

interface GiveawayDetailsProps {
  giveaway: any;
  onBack: () => void;
}

const GiveawayDetails: React.FC<GiveawayDetailsProps> = ({ giveaway, onBack }) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isEnded, setIsEnded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDetails();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [giveaway.id]);

  const fetchDetails = async () => {
    try {
      const response = await fetch(`http://hans-luminova.onrender.com/api/giveaway/${giveaway.id}`);
      const data = await response.json();
      
      if (response.ok) {
        setParticipants(data.participants || []);
        setIsEnded(data.isEnded);
      }
    } catch (error) {
      toast.error('Failed to load giveaway details');
    } finally {
      setLoading(false);
    }
  };

  const updateCountdown = () => {
    const now = Date.now();
    const remaining = giveaway.endTime - now;
    
    if (remaining <= 0) {
      setIsEnded(true);
      setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      return;
    }
    
    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
    
    setCountdown({ days, hours, minutes, seconds });
  };

  const shareGiveaway = () => {
    const shareUrl = `${window.location.origin}/g/${giveaway.id}`;
    if (navigator.share) {
      navigator.share({
        title: giveaway.title,
        text: `Check out this amazing giveaway: ${giveaway.title}`,
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success('Giveaway link copied!');
    }
  };

  const winner = isEnded && participants.length > 0 
    ? participants.sort((a, b) => b.refCount - a.refCount)[0]
    : null;

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={onBack}
            className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors mr-4"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white">{giveaway.title}</h1>
            <p className="text-gray-300 mt-1">by {giveaway.host}</p>
          </div>
          <button
            onClick={shareGiveaway}
            className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <Share2 className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Giveaway Status</h2>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  isEnded 
                    ? 'bg-red-500/20 text-red-400' 
                    : 'bg-green-500/20 text-green-400'
                }`}>
                  {isEnded ? 'Ended' : 'Active'}
                </div>
              </div>

              {!isEnded ? (
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-2xl font-bold text-white">{countdown.days}</div>
                    <div className="text-xs text-gray-400">Days</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-2xl font-bold text-white">{countdown.hours}</div>
                    <div className="text-xs text-gray-400">Hours</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-2xl font-bold text-white">{countdown.minutes}</div>
                    <div className="text-xs text-gray-400">Minutes</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-2xl font-bold text-white">{countdown.seconds}</div>
                    <div className="text-xs text-gray-400">Seconds</div>
                  </div>
                </div>
              ) : winner ? (
                <div className="text-center py-6">
                  <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-4 border-4 border-yellow-500">
                    <img
                      src={winner.avatar}
                      alt="Winner"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-yellow-400 mb-2">
                    🏆 Winner: {winner.name}
                  </h3>
                  <p className="text-gray-300 mb-2">Referrals: {winner.refCount}</p>
                  <div className="flex items-center justify-center text-gray-300">
                    <Phone className="w-4 h-4 mr-2" />
                    <span>Contact: {giveaway.phone}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-300">No participants found</p>
                </div>
              )}
            </div>

            {/* Leaderboard */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h2 className="text-xl font-semibold text-white mb-4">
                <Trophy className="w-5 h-5 inline mr-2" />
                Leaderboard
              </h2>

              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center space-x-3 animate-pulse">
                      <div className="w-10 h-10 bg-white/20 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-white/20 rounded mb-1"></div>
                        <div className="h-3 bg-white/20 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : participants.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-300">No participants yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {participants
                    .sort((a, b) => b.refCount - a.refCount)
                    .slice(0, 10)
                    .map((participant, index) => (
                      <div
                        key={participant.id}
                        className={`flex items-center space-x-3 p-3 rounded-lg ${
                          index === 0 ? 'bg-yellow-500/10 border border-yellow-500/20' :
                          index === 1 ? 'bg-gray-300/10 border border-gray-300/20' :
                          index === 2 ? 'bg-orange-500/10 border border-orange-500/20' :
                          'bg-white/5'
                        }`}
                      >
                        <div className="flex-shrink-0">
                          <div className="relative">
                            <img
                              src={participant.avatar}
                              alt={participant.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                            {index < 3 && (
                              <div className={`absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                index === 0 ? 'bg-yellow-500 text-white' :
                                index === 1 ? 'bg-gray-400 text-white' :
                                'bg-orange-500 text-white'
                              }`}>
                                {index + 1}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate">{participant.name}</p>
                          <p className="text-sm text-gray-400">
                            {participant.refCount} referrals
                          </p>
                        </div>
                        <div className="text-right">
                          <div className={`text-sm font-medium ${
                            index === 0 ? 'text-yellow-400' :
                            index === 1 ? 'text-gray-300' :
                            index === 2 ? 'text-orange-400' :
                            'text-gray-400'
                          }`}>
                            #{index + 1}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Info Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4">Giveaway Info</h3>
              
              <div className="space-y-4">
                <div className="flex items-center text-gray-300">
                  <Users className="w-5 h-5 mr-3" />
                  <div>
                    <p className="text-sm text-gray-400">Participants</p>
                    <p className="font-medium">{participants.length}</p>
                  </div>
                </div>
                
                <div className="flex items-center text-gray-300">
                  <Calendar className="w-5 h-5 mr-3" />
                  <div>
                    <p className="text-sm text-gray-400">End Date</p>
                    <p className="font-medium">
                      {new Date(giveaway.endTime).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center text-gray-300">
                  <Clock className="w-5 h-5 mr-3" />
                  <div>
                    <p className="text-sm text-gray-400">End Time</p>
                    <p className="font-medium">
                      {new Date(giveaway.endTime).toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                {isEnded && (
                  <div className="flex items-center text-gray-300">
                    <Phone className="w-5 h-5 mr-3" />
                    <div>
                      <p className="text-sm text-gray-400">Host Contact</p>
                      <p className="font-medium">{giveaway.phone}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Channel Link */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4">Channel</h3>
              
              <a
                href={giveaway.channelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transform hover:scale-105 transition-all duration-200"
              >
                <ExternalLink className="w-5 h-5 mr-2" />
                Visit Channel
              </a>
            </div>

            {/* How to Win */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4">How to Win</h3>
              
              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-xs font-bold text-white mr-3 mt-0.5">
                    1
                  </div>
                  <p>Join the giveaway to get your referral link</p>
                </div>
                
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-xs font-bold text-white mr-3 mt-0.5">
                    2
                  </div>
                  <p>Share your referral link with friends</p>
                </div>
                
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-xs font-bold text-white mr-3 mt-0.5">
                    3
                  </div>
                  <p>Get the most referrals to win!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GiveawayDetails;
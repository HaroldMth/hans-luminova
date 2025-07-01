import React, { useEffect, useState } from 'react';
import { X, ExternalLink, Zap, Star, Users, Gift } from 'lucide-react';

interface HansTechPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const HansTechPopup: React.FC<HansTechPopupProps> = ({ isOpen, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for animation to complete
  };

  const joinChannel = () => {
    window.open('https://whatsapp.com/channel/0029VaZDIdxDTkKB4JSWUk1O', '_blank');
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
      isVisible ? 'bg-black/50 backdrop-blur-sm' : 'bg-black/0'
    }`}>
      <div className={`bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 rounded-2xl p-8 max-w-md w-full border border-white/20 shadow-2xl transform transition-all duration-300 relative overflow-hidden ${
        isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      }`}>
        {/* Animated background elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full animate-pulse"></div>
          <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full animate-pulse delay-1000"></div>
        </div>

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="text-center relative z-10">
          {/* Icon */}
          <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-bounce">
            <Zap className="w-10 h-10 text-white" />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-white mb-3">
            Join HANS TECH Channel!
          </h2>

          {/* Subtitle */}
          <p className="text-green-300 font-medium mb-4 flex items-center justify-center">
            <Star className="w-4 h-4 mr-1" />
            Exclusive LUMINORA Updates
            <Star className="w-4 h-4 ml-1" />
          </p>

          {/* Description */}
          <p className="text-gray-300 mb-6 leading-relaxed">
            Get the latest tech news, tutorials, and exclusive access to premium giveaways. 
            Be part of our amazing community of tech enthusiasts!
          </p>

          {/* Features */}
          <div className="space-y-3 mb-6 text-left">
            <div className="flex items-center text-sm text-gray-300 bg-white/5 rounded-lg p-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3 animate-pulse"></div>
              <span>Latest tech updates & tutorials</span>
            </div>
            <div className="flex items-center text-sm text-gray-300 bg-white/5 rounded-lg p-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 animate-pulse delay-200"></div>
              <span>Exclusive LUMINORA giveaways & contests</span>
            </div>
            <div className="flex items-center text-sm text-gray-300 bg-white/5 rounded-lg p-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-3 animate-pulse delay-400"></div>
              <span>Premium resources & tools</span>
            </div>
            <div className="flex items-center text-sm text-gray-300 bg-white/5 rounded-lg p-3">
              <div className="w-2 h-2 bg-pink-500 rounded-full mr-3 animate-pulse delay-600"></div>
              <span>Active community support</span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex justify-center space-x-6 mb-6">
            <div className="text-center">
              <div className="flex items-center justify-center text-green-400 mb-1">
                <Users className="w-4 h-4 mr-1" />
                <span className="text-lg font-bold">10K+</span>
              </div>
              <p className="text-xs text-gray-400">Members</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center text-purple-400 mb-1">
                <Gift className="w-4 h-4 mr-1" />
                <span className="text-lg font-bold">50+</span>
              </div>
              <p className="text-xs text-gray-400">Giveaways</p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={joinChannel}
              className="flex-1 flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              <ExternalLink className="w-5 h-5 mr-2" />
              Join Channel
            </button>
            
            <button
              onClick={handleClose}
              className="flex-1 px-6 py-3 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-colors border border-white/20"
            >
              Maybe Later
            </button>
          </div>

          {/* Footer */}
          <p className="text-xs text-gray-400 mt-4 flex items-center justify-center">
            <Zap className="w-3 h-3 mr-1" />
            Powered by LUMINORA Platform
            <Zap className="w-3 h-3 ml-1" />
          </p>
        </div>
      </div>
    </div>
  );
};

export default HansTechPopup;
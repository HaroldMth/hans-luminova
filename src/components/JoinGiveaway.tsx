import React, { useState } from 'react';
import { ArrowLeft, Search, Upload, User, Image, Share2, QrCode } from 'lucide-react';
import toast from 'react-hot-toast';
import QRCode from 'react-qr-code';
import { getStoredDeviceFingerprint } from '../utils/deviceFingerprint';

interface JoinGiveawayProps {
  onBack: () => void;
}

const JoinGiveaway: React.FC<JoinGiveawayProps> = ({ onBack }) => {
  const [step, setStep] = useState(1); // 1: Search, 2: Join Form, 3: Success
  const [giveawayId, setGiveawayId] = useState('');
  const [giveaway, setGiveaway] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    avatar: null,
  });
  const [loading, setLoading] = useState(false);
  const [userResult, setUserResult] = useState(null);
  const [showQR, setShowQR] = useState(false);

  const searchGiveaway = async () => {
    if (!giveawayId.trim()) {
      toast.error('Please enter a giveaway ID');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://hans-luminova.onrender.com/api/giveaway/${giveawayId}`);
      const data = await response.json();

      if (response.ok) {
        if (data.isEnded) {
          toast.error('This giveaway has already ended');
          return;
        }
        setGiveaway(data);
        setStep(2);
      } else {
        toast.error(data.error || 'Giveaway not found');
      }
    } catch (error) {
      toast.error('Failed to find giveaway');
    } finally {
      setLoading(false);
    }
  };

  const joinGiveaway = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Please enter your name');
      return;
    }

    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      if (formData.avatar) {
        formDataToSend.append('avatar', formData.avatar);
      }
      
      // Add device fingerprint to headers
      const deviceFingerprint = getStoredDeviceFingerprint();

      const response = await fetch(`http://hans-luminova.onrender.com/api/join/${giveawayId}`, {
        method: 'POST',
        body: formDataToSend,
        headers: {
          'X-Device-Fingerprint': deviceFingerprint
        }
      });

      const data = await response.json();

      if (data.success) {
        setUserResult(data);
        setStep(3);
        toast.success('Successfully joined the giveaway!');
      } else {
        toast.error(data.error || 'Failed to join giveaway');
      }
    } catch (error) {
      toast.error('Failed to join giveaway');
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    if (userResult?.refLink) {
      navigator.clipboard.writeText(userResult.refLink);
      toast.success('Referral link copied!');
    }
  };

  const shareLink = () => {
    if (userResult?.refLink && navigator.share) {
      navigator.share({
        title: `Join ${giveaway?.title}`,
        text: `Join this amazing giveaway: ${giveaway?.title}`,
        url: userResult.refLink,
      });
    } else {
      copyLink();
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={step === 1 ? onBack : () => setStep(step - 1)}
            className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors mr-4"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">Join Giveaway</h1>
            <p className="text-gray-300 mt-1">
              {step === 1 && 'Enter the giveaway ID to get started'}
              {step === 2 && 'Complete your profile to join'}
              {step === 3 && 'You\'re in! Start sharing your referral link'}
            </p>
          </div>
        </div>

        {/* Step 1: Search */}
        {step === 1 && (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Find Giveaway</h2>
              <p className="text-gray-300">Enter the giveaway ID you received</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Giveaway ID
                </label>
                <input
                  type="text"
                  value={giveawayId}
                  onChange={(e) => setGiveawayId(e.target.value)}
                  placeholder="e.g., 12345678-abcd-..."
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>

              <button
                onClick={searchGiveaway}
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200"
              >
                {loading ? 'Searching...' : 'Find Giveaway'}
              </button>
            </div>

            <div className="mt-6 p-4 bg-gray-500/10 rounded-lg border border-gray-500/20">
              <p className="text-xs text-gray-300">
                💡 <strong>Don't have a giveaway ID?</strong> Ask the host to share it with you, or check their channel for the link.
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Join Form */}
        {step === 2 && giveaway && (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20">
            {/* Giveaway Info */}
            <div className="mb-6 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
              <h3 className="text-lg font-semibold text-white mb-1">{giveaway.title}</h3>
              <p className="text-sm text-gray-300">by {giveaway.host}</p>
              <p className="text-xs text-gray-400 mt-2">{giveaway.participantCount} participants</p>
            </div>

            <form onSubmit={joinGiveaway} className="space-y-6">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Avatar Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Image className="w-4 h-4 inline mr-2" />
                  Profile Picture (Optional)
                </label>
                
                <div className="flex items-center space-x-4">
                  <label className="flex-1 flex items-center justify-center px-4 py-3 border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:border-purple-500/50 transition-colors">
                    <Upload className="w-5 h-5 text-gray-400 mr-2" />
                    <span className="text-gray-300">
                      {formData.avatar ? formData.avatar.name : 'Choose photo'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFormData({ ...formData, avatar: e.target.files[0] })}
                      className="hidden"
                    />
                  </label>
                </div>
                
                <p className="text-xs text-gray-400 mt-1">
                  If you don't upload a photo, we'll assign you a cool anime avatar!
                </p>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200"
              >
                {loading ? 'Joining...' : 'Join Giveaway'}
              </button>
            </form>
          </div>
        )}

        {/* Step 3: Success */}
        {step === 3 && userResult && (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20">
            <div className="text-center mb-6">
              <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-4 border-4 border-purple-500">
                <img
                  src={userResult.avatar}
                  alt="Your avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Welcome to the giveaway!</h2>
              <p className="text-gray-300">Start sharing your referral link to get more entries</p>
            </div>

            {/* Referral Link */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Your Referral Link
              </label>
              <div className="flex rounded-lg overflow-hidden">
                <input
                  type="text"
                  value={userResult.refLink}
                  readOnly
                  className="flex-1 px-4 py-3 bg-white/5 border border-white/20 text-white text-sm"
                />
                <button
                  onClick={copyLink}
                  className="px-4 py-3 bg-purple-500 text-white hover:bg-purple-600 transition-colors"
                >
                  Copy
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <button
                onClick={shareLink}
                className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg font-semibold hover:from-green-600 hover:to-blue-600 transform hover:scale-105 transition-all duration-200"
              >
                <Share2 className="w-5 h-5 mr-2" />
                Share Link
              </button>
              
              <button
                onClick={() => setShowQR(!showQR)}
                className="flex items-center justify-center px-6 py-3 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transform hover:scale-105 transition-all duration-200 border border-white/20"
              >
                <QrCode className="w-5 h-5 mr-2" />
                {showQR ? 'Hide QR' : 'Show QR'}
              </button>
            </div>

            {/* QR Code */}
            {showQR && (
              <div className="text-center mb-6">
                <div className="inline-block p-4 bg-white rounded-lg">
                  <QRCode value={userResult.refLink} size={200} />
                </div>
                <p className="text-xs text-gray-400 mt-2">Share this QR code for easy access</p>
              </div>
            )}

            {/* Tips */}
            <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <h3 className="text-sm font-medium text-yellow-300 mb-2">🎯 How to get more referrals:</h3>
              <ul className="text-xs text-yellow-200 space-y-1">
                <li>• Share on your social media accounts</li>
                <li>• Send to friends and family via WhatsApp</li>
                <li>• Post in relevant groups and communities</li>
                <li>• Use the QR code for offline sharing</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JoinGiveaway;
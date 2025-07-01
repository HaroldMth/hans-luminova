import React, { useState } from 'react';
import { ArrowLeft, Calendar, User, Phone, Link, Trophy, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

interface CreateGiveawayProps {
  onBack: () => void;
}

const CreateGiveaway: React.FC<CreateGiveawayProps> = ({ onBack }) => {
  const [formData, setFormData] = useState({
    title: '',
    host: '',
    phone: '',
    channelUrl: '',
    endTime: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://hans-luminova.onrender.com/api/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Giveaway created successfully on LUMINORA!');
        onBack();
      } else {
        toast.error(data.error || 'Failed to create giveaway');
      }
    } catch (error) {
      toast.error('Failed to create giveaway');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Set minimum date to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().slice(0, 16);

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={onBack}
            className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors mr-4"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">
              Create Giveaway on{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                LUMINORA
              </span>
            </h1>
            <p className="text-gray-300 mt-1">Set up your amazing giveaway in minutes</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                <Trophy className="w-4 h-4 inline mr-2" />
                Giveaway Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="e.g., iPhone 15 Pro Max Giveaway"
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Host Name */}
            <div>
              <label htmlFor="host" className="block text-sm font-medium text-gray-300 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Your Name (Host)
              </label>
              <input
                type="text"
                id="host"
                name="host"
                value={formData.host}
                onChange={handleChange}
                required
                placeholder="e.g., John Doe"
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="e.g., +1 234 567 8900"
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
              <p className="text-xs text-gray-400 mt-1">Winner will use this to contact you</p>
            </div>

            {/* Channel URL */}
            <div>
              <label htmlFor="channelUrl" className="block text-sm font-medium text-gray-300 mb-2">
                <Link className="w-4 h-4 inline mr-2" />
                Channel URL
              </label>
              <input
                type="url"
                id="channelUrl"
                name="channelUrl"
                value={formData.channelUrl}
                onChange={handleChange}
                required
                placeholder="e.g., https://t.me/yourchannel or https://whatsapp.com/channel/..."
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
              <p className="text-xs text-gray-400 mt-1">Participants will be redirected here</p>
            </div>

            {/* End Time */}
            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-gray-300 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                End Date & Time
              </label>
              <input
                type="datetime-local"
                id="endTime"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                min={minDate}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200"
            >
              {loading ? 'Creating on LUMINORA...' : 'Create Giveaway'}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-green-500/10 rounded-lg border border-green-500/20">
            <h3 className="text-sm font-medium text-green-300 mb-2 flex items-center">
              <Shield className="w-4 h-4 mr-2" />
              🔒 LUMINORA Security Features
            </h3>
            <ul className="text-xs text-green-200 space-y-1">
              <li>• Advanced anti-bot and DDoS protection</li>
              <li>• Device fingerprinting prevents duplicate entries</li>
              <li>• Only you can delete this giveaway from your current device/network</li>
              <li>• Secure referral tracking with fraud prevention</li>
            </ul>
          </div>

          {/* Info */}
          <div className="mt-4 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <h3 className="text-sm font-medium text-blue-300 mb-2">💡 Pro Tips:</h3>
            <ul className="text-xs text-blue-200 space-y-1">
              <li>• Choose an engaging title to attract more participants</li>
              <li>• Set a reasonable duration (3-7 days works best)</li>
              <li>• Make sure your channel URL is correct and accessible</li>
              <li>• Your phone number will only be shown to the winner</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateGiveaway;
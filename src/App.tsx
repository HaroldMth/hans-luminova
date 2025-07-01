import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import HomePage from './components/HomePage';
import CreateGiveaway from './components/CreateGiveaway';
import JoinGiveaway from './components/JoinGiveaway';
import GiveawayDetails from './components/GiveawayDetails';
import MyGiveaways from './components/MyGiveaways';
import Leaderboard from './components/Leaderboard';
import HansTechPopup from './components/HansTechPopup';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedGiveaway, setSelectedGiveaway] = useState(null);
  const [showHansPopup, setShowHansPopup] = useState(false);

  useEffect(() => {
    // Check if popup was shown recently
    const lastPopupTime = localStorage.getItem('hansPopupLastShown');
    const now = Date.now();
    const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds
    
    if (!lastPopupTime || (now - parseInt(lastPopupTime)) > oneHour) {
      // Show popup after 2 seconds if not shown in the last hour
      const timer = setTimeout(() => {
        setShowHansPopup(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClosePopup = () => {
    setShowHansPopup(false);
    localStorage.setItem('hansPopupLastShown', Date.now().toString());
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'create':
        return <CreateGiveaway onBack={() => setCurrentPage('home')} />;
      case 'join':
        return <JoinGiveaway onBack={() => setCurrentPage('home')} />;
      case 'details':
        return (
          <GiveawayDetails 
            giveaway={selectedGiveaway} 
            onBack={() => setCurrentPage('home')} 
          />
        );
      case 'my-giveaways':
        return <MyGiveaways onBack={() => setCurrentPage('home')} />;
      case 'leaderboard':
        return <Leaderboard onBack={() => setCurrentPage('home')} />;
      default:
        return (
          <HomePage 
            onNavigate={(page, giveaway = null) => {
              setCurrentPage(page);
              setSelectedGiveaway(giveaway);
            }}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1f2937',
            color: 'white',
            borderRadius: '12px',
          },
        }}
      />
      
      {renderPage()}
      
      <HansTechPopup 
        isOpen={showHansPopup} 
        onClose={handleClosePopup} 
      />
    </div>
  );
}

export default App;
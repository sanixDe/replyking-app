import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';

const NetworkStatus: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineMessage(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineMessage(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 right-4 z-50 bg-red-50 border border-red-200 rounded-lg p-3 shadow-lg">
      <div className="flex items-center space-x-2">
        <WifiOff className="w-5 h-5 text-red-600" />
        <div className="flex-1">
          <p className="text-sm font-medium text-red-800">
            You're offline
          </p>
          <p className="text-xs text-red-600">
            Some features may not work without an internet connection
          </p>
        </div>
        <button
          onClick={() => setShowOfflineMessage(false)}
          className="text-red-400 hover:text-red-600 transition-colors"
        >
          <AlertCircle className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default NetworkStatus; 
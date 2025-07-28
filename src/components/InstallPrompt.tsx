import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Monitor } from 'lucide-react';

interface InstallPromptProps {
  onClose: () => void;
}

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallPrompt: React.FC<InstallPromptProps> = ({ onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || 
                           (window.navigator as any).standalone === true;
    setIsStandalone(isStandaloneMode);

    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setShowPrompt(false);
      setDeferredPrompt(null);
      setIsStandalone(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Show iOS prompt if not standalone
    if (isIOSDevice && !isStandaloneMode) {
      setShowPrompt(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowPrompt(false);
      }
    }
  };

  const handleIOSInstall = () => {
    // Show iOS-specific instructions
    const instructions = [
      '1. Tap the Share button (square with arrow)',
      '2. Scroll down and tap "Add to Home Screen"',
      '3. Tap "Add" to install ReplyKing'
    ];
    alert(`To install ReplyKing on your iPhone:\n\n${instructions.join('\n')}`);
  };

  if (isStandalone || !showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center">
              <Download className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900">
              Install ReplyKing
            </h3>
            <p className="text-xs text-gray-600 mt-1">
              {isIOS 
                ? 'Add to your home screen for quick access'
                : 'Install this app on your device for a better experience'
              }
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 ml-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      <div className="mt-3 flex space-x-2">
        {isIOS ? (
          <button
            onClick={handleIOSInstall}
            className="flex-1 bg-primary-600 text-white text-sm font-medium py-2 px-3 rounded-md hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2"
          >
            <Smartphone className="w-4 h-4" />
            <span>Add to Home Screen</span>
          </button>
        ) : (
          <button
            onClick={handleInstallClick}
            className="flex-1 bg-primary-600 text-white text-sm font-medium py-2 px-3 rounded-md hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2"
          >
            <Monitor className="w-4 h-4" />
            <span>Install App</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default InstallPrompt; 
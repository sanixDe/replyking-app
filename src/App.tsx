import React, { useState, useCallback, useEffect } from 'react';
import { MessageSquare, RefreshCw, AlertCircle, Settings, HelpCircle } from 'lucide-react';
import { ReplyTone, AnalysisResult } from './types';
import { geminiService } from './services/geminiService';
import { analyticsService } from './services/analyticsService';
import { enhancedAnalyticsService } from './services/enhancedAnalyticsService';
import { cacheService } from './services/cacheService';
import { useToast } from './hooks/useToast';
import ErrorBoundary from './components/ErrorBoundary';
import Toast from './components/Toast';
import HelpModal from './components/HelpModal';
import ImageUpload from './components/ImageUpload';
import ToneSelector from './components/ToneSelector';
import ReplyResults from './components/ReplyResults';
import InstallPrompt from './components/InstallPrompt';
import NetworkStatus from './components/NetworkStatus';
import LoadingSpinner from './components/LoadingSpinner';
import TouchButton from './components/TouchButton';
import Onboarding from './components/Onboarding';

function App() {
  // State management
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedTone, setSelectedTone] = useState<ReplyTone | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isApiConfigured, setIsApiConfigured] = useState<boolean | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [analysisStartTime, setAnalysisStartTime] = useState<number | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(false);

  // Toast notifications
  const { toasts, removeToast, success, error: showError } = useToast();

  // Initialize analytics and check first visit
  useEffect(() => {
    analyticsService.initialize();
    analyticsService.trackPageView('/');
    enhancedAnalyticsService.trackSessionStart();
    
    // Check if this is the first visit
    const hasVisited = cacheService.getPreference('has_visited', false);
    if (!hasVisited) {
      setIsFirstVisit(true);
      setShowOnboarding(true);
      cacheService.setPreference('has_visited', true);
    }
    
    // Cleanup cache periodically
    const cleanupInterval = setInterval(() => {
      cacheService.cleanup();
    }, 300000); // Every 5 minutes
    
    return () => {
      clearInterval(cleanupInterval);
      enhancedAnalyticsService.trackSessionEnd();
    };
  }, []);

  // Check API configuration on mount
  useEffect(() => {
    const checkApiConfig = async () => {
      const configured = geminiService.isApiKeyConfigured();
      setIsApiConfigured(configured);
      
      if (configured) {
        try {
          const isConnected = await geminiService.testConnection();
          if (!isConnected) {
            const errorMsg = 'Unable to connect to Gemini API. Please check your API key.';
            setError(errorMsg);
            showError(errorMsg);
          }
        } catch (err) {
          const errorMsg = 'Failed to test API connection. Please check your configuration.';
          setError(errorMsg);
          showError(errorMsg);
        }
      } else {
        const errorMsg = 'Gemini API key not configured. Please set REACT_APP_GEMINI_API_KEY environment variable.';
        setError(errorMsg);
        showError(errorMsg);
      }
    };

    checkApiConfig();
  }, [showError]);

  // Handle image selection
  const handleImageSelect = useCallback((file: File) => {
    setSelectedFile(file);
    setError(null);
    setAnalysisResult(null);
    
    // Track analytics
    analyticsService.trackImageUpload();
    enhancedAnalyticsService.trackUserInteraction('image_upload', 'ImageUpload');
    success('Screenshot uploaded successfully!');
  }, [success]);

  // Handle tone selection
  const handleToneSelect = useCallback((tone: ReplyTone) => {
    setSelectedTone(tone);
    setError(null);
    
    // Track analytics and cache preference
    analyticsService.trackToneSelection(tone);
    enhancedAnalyticsService.trackUserInteraction('tone_selection', 'ToneSelector');
    enhancedAnalyticsService.trackUserPreference('preferred_tone', tone);
    cacheService.setPreference('last_used_tone', tone);
    success(`Selected ${tone.toLowerCase()} tone`);
  }, [success]);

  // Handle analysis
  const handleAnalyze = useCallback(async () => {
    if (!selectedFile || !selectedTone) {
      const errorMsg = 'Please select both an image and a tone.';
      setError(errorMsg);
      showError(errorMsg);
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setAnalysisStartTime(Date.now());
    
    // Track analytics
    analyticsService.trackAnalysisStart();
    enhancedAnalyticsService.trackUserInteraction('analysis_start', 'AnalyzeButton');

    try {
      const result = await geminiService.analyzeImageAndGenerateReplies(
        selectedFile,
        selectedTone
      );
      
      setAnalysisResult(result);
      
      // Track completion and cache result
      const duration = Date.now() - (analysisStartTime || Date.now());
      analyticsService.trackAnalysisComplete(duration);
      enhancedAnalyticsService.trackApiCall('gemini_analysis', duration, true);
      enhancedAnalyticsService.trackUserInteraction('analysis_complete', 'ReplyResults');
      
      // Cache the result for potential reuse
      cacheService.setApiResponse('analysis', { file: selectedFile.name, tone: selectedTone }, result, 300000); // 5 minutes
      
      success('Replies generated successfully!');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze image';
      setError(errorMessage);
      showError(errorMessage);
      analyticsService.trackError(errorMessage);
      enhancedAnalyticsService.trackError(err instanceof Error ? err : new Error(String(err)));
      enhancedAnalyticsService.trackApiCall('gemini_analysis', Date.now() - (analysisStartTime || Date.now()), false, errorMessage);
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
      setAnalysisStartTime(null);
    }
  }, [selectedFile, selectedTone, analysisStartTime, success, showError]);

  // Handle reset/start over
  const handleReset = useCallback(() => {
    setSelectedFile(null);
    setSelectedTone(null);
    setAnalysisResult(null);
    setError(null);
    success('Started over - ready for new analysis');
  }, [success]);

  // Handle copy reply
  const handleCopyReply = useCallback(() => {
    analyticsService.trackCopyReply();
    success('Reply copied to clipboard!');
  }, [success]);

  // Handle copy all replies
  const handleCopyAllReplies = useCallback(() => {
    analyticsService.trackCopyAllReplies();
    success('All replies copied to clipboard!');
  }, [success]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Enter to analyze
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (selectedFile && selectedTone && !isAnalyzing) {
          handleAnalyze();
        }
      }
      
      // Escape to close help modal
      if (e.key === 'Escape' && showHelp) {
        setShowHelp(false);
      }
      
      // H for help
      if (e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        setShowHelp(true);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedFile, selectedTone, isAnalyzing, showHelp, handleAnalyze]);

  // Check if we can proceed to analysis
  const canAnalyze = selectedFile && selectedTone && !isAnalyzing && !error;

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-3">
                <MessageSquare className="h-8 w-8 text-primary-600" />
                <h1 className="text-xl font-semibold text-gray-900">
                  Chat Reply Generator
                </h1>
              </div>
              <div className="flex items-center space-x-2">
                {analysisResult && (
                  <button
                    onClick={handleReset}
                    className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors min-h-[44px]"
                    title="Start over (Ctrl+Z)"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span className="hidden sm:inline">Reset</span>
                  </button>
                )}
                <button
                  onClick={() => setShowHelp(true)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                  title="Help (H)"
                >
                  <HelpCircle className="h-5 w-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center">
                  <Settings className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="space-y-6 sm:space-y-8">
            {/* API Configuration Warning */}
            {isApiConfigured === false && (
              <div className="card">
                <div className="flex items-center space-x-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <AlertCircle className="h-6 w-6 text-yellow-500 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-yellow-800">
                      API Configuration Required
                    </h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      Please set the REACT_APP_GEMINI_API_KEY environment variable to use this app.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Image Upload */}
            <div className="card">
              <div className="flex items-center space-x-3 mb-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  selectedFile 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {selectedFile ? '✓' : '1'}
                </div>
                <h2 className="text-lg font-medium text-gray-900">
                  Upload Screenshot
                </h2>
              </div>
              <ImageUpload
                onImageSelect={handleImageSelect}
                isUploading={isAnalyzing}
              />
            </div>

            {/* Step 2: Tone Selection */}
            <div className="card">
              <div className="flex items-center space-x-3 mb-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  selectedTone 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {selectedTone ? '✓' : '2'}
                </div>
                <h2 className="text-lg font-medium text-gray-900">
                  Select Reply Tone
                </h2>
              </div>
              <ToneSelector
                selectedTone={selectedTone}
                onToneSelect={handleToneSelect}
                disabled={isAnalyzing || !selectedFile}
              />
            </div>

            {/* Analysis Button */}
            {canAnalyze && (
              <div className="flex justify-center">
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className={`
                    flex items-center justify-center space-x-3 px-8 py-4 rounded-xl text-lg font-medium transition-all duration-200
                    ${isAnalyzing 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 shadow-lg hover:shadow-xl'
                    }
                    min-h-[56px] w-full max-w-sm
                  `}
                  title="Generate replies (Ctrl+Enter)"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <MessageSquare className="h-5 w-5" />
                      <span>Generate Replies</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Step 3: Results */}
            {(analysisResult || isAnalyzing || error) && (
              <div className="card">
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    analysisResult 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {analysisResult ? '✓' : '3'}
                  </div>
                  <h2 className="text-lg font-medium text-gray-900">
                    Generated Replies
                  </h2>
                </div>
                <ReplyResults
                  analysisResult={analysisResult}
                  isAnalyzing={isAnalyzing}
                  error={error}
                  onCopyReply={handleCopyReply}
                  onCopyAllReplies={handleCopyAllReplies}
                />
              </div>
            )}

            {/* Progress Indicator */}
            {!analysisResult && !isAnalyzing && !error && selectedFile && selectedTone && (
              <div className="text-center py-8">
                <p className="text-sm text-gray-600">
                  Ready to generate replies! Tap the button above to start analysis.
                </p>
              </div>
            )}

            {/* Help Text */}
            {!selectedFile && !selectedTone && !analysisResult && (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Welcome to Chat Reply Generator
                </h3>
                <p className="text-sm text-gray-600 max-w-md mx-auto px-4">
                  Upload a chat screenshot, select a tone, and let AI generate contextually appropriate replies for you.
                </p>
                <button
                  onClick={() => setShowHelp(true)}
                  className="mt-4 text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Learn how to use it →
                </button>
              </div>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-16 py-8 border-t border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="text-sm text-gray-500">
                Powered by Gemini AI • Built with React & TypeScript
              </p>
            </div>
          </div>
        </footer>

        {/* Toast Notifications */}
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        ))}

        {/* Help Modal */}
        <HelpModal
          isOpen={showHelp}
          onClose={() => setShowHelp(false)}
        />

        {/* Network Status */}
        <NetworkStatus />

        {/* Install Prompt */}
        {showInstallPrompt && (
          <InstallPrompt
            onClose={() => setShowInstallPrompt(false)}
          />
        )}

        {/* Onboarding */}
        <Onboarding
          isOpen={showOnboarding}
          onClose={() => setShowOnboarding(false)}
        />
      </div>
    </ErrorBoundary>
  );
}

export default App;

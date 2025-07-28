import React from 'react';
import { X, Camera, Palette, Copy, Zap, HelpCircle, Info } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <HelpCircle className="h-6 w-6 text-primary-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                How to Use
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {/* Step 1 */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium">
                  1
                </div>
                <h3 className="text-lg font-medium text-gray-900">Upload Screenshot</h3>
              </div>
              <div className="flex items-start space-x-3 pl-11">
                <Camera className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-700">
                    Take a screenshot of your chat conversation or upload an existing image.
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Supported formats: PNG, JPG, JPEG (max 10MB)
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium">
                  2
                </div>
                <h3 className="text-lg font-medium text-gray-900">Select Tone</h3>
              </div>
              <div className="flex items-start space-x-3 pl-11">
                <Palette className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-700">
                    Choose the tone that best fits your conversation context.
                  </p>
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-gray-600"><strong>Friendly:</strong> Warm and approachable</p>
                    <p className="text-xs text-gray-600"><strong>Casual:</strong> Relaxed and informal</p>
                    <p className="text-xs text-gray-600"><strong>Formal:</strong> Polite and structured</p>
                    <p className="text-xs text-gray-600"><strong>Professional:</strong> Business-appropriate</p>
                    <p className="text-xs text-gray-600"><strong>Flirty:</strong> Playful and charming</p>
                    <p className="text-xs text-gray-600"><strong>Witty:</strong> Clever and humorous</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium">
                  3
                </div>
                <h3 className="text-lg font-medium text-gray-900">Generate Replies</h3>
              </div>
              <div className="flex items-start space-x-3 pl-11">
                <Zap className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-700">
                    AI analyzes your screenshot and generates 3 contextually appropriate replies.
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Processing typically takes 10-30 seconds
                  </p>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium">
                  4
                </div>
                <h3 className="text-lg font-medium text-gray-900">Copy & Use</h3>
              </div>
              <div className="flex items-start space-x-3 pl-11">
                <Copy className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-700">
                    Copy individual replies or all replies at once to your clipboard.
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Paste directly into your chat app
                  </p>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Tips for Best Results</h4>
                  <ul className="text-xs text-blue-800 space-y-1">
                    <li>• Ensure the chat text is clearly visible in the screenshot</li>
                    <li>• Include enough context for the AI to understand the conversation</li>
                    <li>• Choose a tone that matches your relationship with the person</li>
                    <li>• Review and edit the generated replies before sending</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* About */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">About</h4>
              <p className="text-xs text-gray-600">
                Chat Reply Generator uses Google's Gemini AI to analyze chat screenshots and generate contextually appropriate replies. 
                Your data is processed securely and not stored permanently.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpModal; 
import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, HelpCircle, Lightbulb, MessageSquare, Copy, Smartphone } from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

interface OnboardingProps {
  isOpen: boolean;
  onClose: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to ReplyKing!',
      description: 'Generate smart replies for your chat conversations',
      icon: <MessageSquare className="w-8 h-8 text-primary-600" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-600">
            ReplyKing uses AI to analyze your chat screenshots and generate contextually appropriate replies in different tones.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">How it works:</h4>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. Upload a screenshot of your chat</li>
              <li>2. Select your preferred tone</li>
              <li>3. Get 3 smart reply options</li>
              <li>4. Copy and use them in your chat</li>
            </ol>
          </div>
        </div>
      )
    },
    {
      id: 'upload',
      title: 'Upload Screenshot',
      description: 'Take a screenshot of your chat conversation',
      icon: <Smartphone className="w-8 h-8 text-primary-600" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-600">
            Upload a clear screenshot of your chat conversation. Make sure the text is readable!
          </p>
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Tips for best results:</h4>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Ensure the chat text is clearly visible</li>
              <li>• Include the last few messages for context</li>
              <li>• Use PNG or JPG format (max 10MB)</li>
              <li>• Right side messages = you, Left side = other person</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'tones',
      title: 'Choose Your Tone',
      description: 'Select how you want to sound',
      icon: <Lightbulb className="w-8 h-8 text-primary-600" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-600">
            Pick a tone that matches your personality and the conversation context.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { name: 'Friendly', desc: 'Warm and approachable' },
              { name: 'Casual', desc: 'Relaxed and informal' },
              { name: 'Formal', desc: 'Professional and polite' },
              { name: 'Witty', desc: 'Clever and humorous' },
              { name: 'Flirty', desc: 'Playful and charming' },
              { name: 'Professional', desc: 'Business-appropriate' }
            ].map((tone) => (
              <div key={tone.name} className="bg-gray-50 p-3 rounded-lg">
                <div className="font-medium text-gray-900">{tone.name}</div>
                <div className="text-xs text-gray-600">{tone.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'replies',
      title: 'Get Smart Replies',
      description: 'Copy and use the generated replies',
      icon: <Copy className="w-8 h-8 text-primary-600" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-600">
            ReplyKing generates 3 different reply options based on your chat context and selected tone.
          </p>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-medium text-purple-900 mb-2">Features:</h4>
            <ul className="text-sm text-purple-800 space-y-1">
              <li>• One-click copy to clipboard</li>
              <li>• Copy all replies at once</li>
              <li>• Context-aware responses</li>
              <li>• Gen Z style language</li>
            </ul>
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isOpen) return null;

  const currentStepData = steps[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            {currentStepData.icon}
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {currentStepData.title}
              </h2>
              <p className="text-sm text-gray-600">
                {currentStepData.description}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {currentStepData.content}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="flex space-x-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentStep ? 'bg-primary-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          
          <div className="flex space-x-2">
            {currentStep > 0 && (
              <button
                onClick={handlePrevious}
                className="flex items-center space-x-1 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>
            )}
            
            <button
              onClick={handleNext}
              className="flex items-center space-x-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <span>{currentStep === steps.length - 1 ? 'Get Started' : 'Next'}</span>
              {currentStep < steps.length - 1 && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding; 
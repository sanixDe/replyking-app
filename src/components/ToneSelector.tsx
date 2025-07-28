import React from 'react';
import { ReplyTone, TONE_DISPLAY_NAMES, TONE_DESCRIPTIONS } from '../types';
import { MessageSquare, Heart, Smile, Briefcase, User, Zap } from 'lucide-react';

interface ToneSelectorProps {
  selectedTone: ReplyTone | null;
  onToneSelect: (tone: ReplyTone) => void;
  disabled?: boolean;
  className?: string;
}

const ToneSelector: React.FC<ToneSelectorProps> = ({
  selectedTone,
  onToneSelect,
  disabled = false,
  className = ''
}) => {
  // Tone configurations with icons and colors
  const toneConfigs = {
    [ReplyTone.FRIENDLY]: {
      icon: Smile,
      color: 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200 active:bg-green-300',
      selectedColor: 'bg-green-500 text-white border-green-500 shadow-lg'
    },
    [ReplyTone.CASUAL]: {
      icon: MessageSquare,
      color: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200 active:bg-blue-300',
      selectedColor: 'bg-blue-500 text-white border-blue-500 shadow-lg'
    },
    [ReplyTone.FORMAL]: {
      icon: Briefcase,
      color: 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200 active:bg-gray-300',
      selectedColor: 'bg-gray-500 text-white border-gray-500 shadow-lg'
    },
    [ReplyTone.PROFESSIONAL]: {
      icon: User,
      color: 'bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200 active:bg-purple-300',
      selectedColor: 'bg-purple-500 text-white border-purple-500 shadow-lg'
    },
    [ReplyTone.FLIRTY]: {
      icon: Heart,
      color: 'bg-pink-100 text-pink-700 border-pink-200 hover:bg-pink-200 active:bg-pink-300',
      selectedColor: 'bg-pink-500 text-white border-pink-500 shadow-lg'
    },
    [ReplyTone.WITTY]: {
      icon: Zap,
      color: 'bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200 active:bg-yellow-300',
      selectedColor: 'bg-yellow-500 text-white border-yellow-500 shadow-lg'
    }
  };

  const handleToneClick = (tone: ReplyTone) => {
    if (!disabled) {
      onToneSelect(tone);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Select Reply Tone
        </h3>
        <p className="text-sm text-gray-600">
          Choose the tone for your generated replies
        </p>
      </div>

      {/* Tone Grid - Mobile Optimized */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {Object.values(ReplyTone).map((tone) => {
          const config = toneConfigs[tone];
          const IconComponent = config.icon;
          const isSelected = selectedTone === tone;
          const isDisabled = disabled && !isSelected;

          return (
            <button
              key={tone}
              onClick={() => handleToneClick(tone)}
              disabled={isDisabled}
              className={`
                relative p-4 sm:p-5 rounded-xl border-2 transition-all duration-200
                ${isSelected 
                  ? config.selectedColor 
                  : config.color
                }
                ${isDisabled 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'cursor-pointer hover:scale-105 active:scale-95 touch-manipulation'
                }
                ${isSelected ? 'ring-2 ring-offset-2 ring-offset-white shadow-lg' : ''}
                min-h-[80px] sm:min-h-[100px] flex flex-col items-center justify-center
              `}
              title={TONE_DESCRIPTIONS[tone]}
              aria-label={`Select ${TONE_DISPLAY_NAMES[tone]} tone`}
              aria-pressed={isSelected}
            >
              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full border-2 border-current flex items-center justify-center shadow-sm">
                  <div className="w-2.5 h-2.5 bg-current rounded-full"></div>
                </div>
              )}

              {/* Icon and label */}
              <div className="flex flex-col items-center space-y-2 sm:space-y-3">
                <IconComponent className="h-6 w-6 sm:h-7 sm:w-7" />
                <span className="text-sm font-medium text-center leading-tight">
                  {TONE_DISPLAY_NAMES[tone]}
                </span>
              </div>

              {/* Touch feedback overlay for mobile */}
              <div className="absolute inset-0 rounded-xl bg-black opacity-0 active:opacity-10 transition-opacity pointer-events-none" />
            </button>
          );
        })}
      </div>

      {/* Selected tone info - Mobile optimized */}
      {selectedTone && (
        <div className="mt-4 p-4 bg-primary-50 rounded-lg border border-primary-200">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${toneConfigs[selectedTone].color}`}>
              {React.createElement(toneConfigs[selectedTone].icon, { className: 'h-4 w-4' })}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                Selected: {TONE_DISPLAY_NAMES[selectedTone]}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {TONE_DESCRIPTIONS[selectedTone]}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Help text */}
      {!selectedTone && (
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Tap a tone to select it
          </p>
        </div>
      )}
    </div>
  );
};

export default ToneSelector; 
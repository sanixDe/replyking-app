import React, { useState } from 'react';
import { Copy, Check, MessageSquare, Clock } from 'lucide-react';
import { GeneratedReply, ReplyTone, TONE_DISPLAY_NAMES } from '../types';
import { clipboardService } from '../services/clipboardService';

interface ReplyCardProps {
  reply: GeneratedReply;
  isSelected: boolean;
  onSelect: () => void;
  onCopy: () => void;
  isCopying: boolean;
  className?: string;
}

const ReplyCard: React.FC<ReplyCardProps> = ({
  reply,
  isSelected,
  onSelect,
  onCopy,
  isCopying,
  className = ''
}) => {
  const [copySuccess, setCopySuccess] = useState(false);

  // Tone color configurations
  const toneColors = {
    [ReplyTone.FRIENDLY]: 'border-green-200 bg-green-50',
    [ReplyTone.CASUAL]: 'border-blue-200 bg-blue-50',
    [ReplyTone.FORMAL]: 'border-gray-200 bg-gray-50',
    [ReplyTone.PROFESSIONAL]: 'border-purple-200 bg-purple-50',
    [ReplyTone.FLIRTY]: 'border-pink-200 bg-pink-50',
    [ReplyTone.WITTY]: 'border-yellow-200 bg-yellow-50'
  };

  // Handle copy button click
  const handleCopy = async () => {
    try {
      const success = await clipboardService.copyToClipboard(reply.text);
      if (success) {
        setCopySuccess(true);
        onCopy();
        setTimeout(() => setCopySuccess(false), 2000);
      }
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  // Format timestamp
  const formatTimestamp = (date: Date): string => {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div
      className={`
        relative p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer
        ${isSelected 
          ? 'border-primary-500 bg-primary-50 shadow-md' 
          : toneColors[reply.tone]
        }
        hover:shadow-md hover:scale-[1.02] active:scale-[0.98]
        ${className}
      `}
      onClick={onSelect}
    >
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
          <div className="w-3 h-3 bg-white rounded-full"></div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <MessageSquare className="h-4 w-4 text-gray-500" />
          <span className="text-xs font-medium text-gray-600">
            {TONE_DISPLAY_NAMES[reply.tone]}
          </span>
        </div>
        <div className="flex items-center space-x-1 text-xs text-gray-500">
          <Clock className="h-3 w-3" />
          <span>{formatTimestamp(reply.timestamp)}</span>
        </div>
      </div>

      {/* Reply text */}
      <div className="mb-4">
        <p className="text-gray-900 leading-relaxed">
          {reply.text}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500">
            ID: {reply.id.slice(-8)}
          </span>
        </div>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleCopy();
          }}
          disabled={isCopying}
          className={`
            p-2 rounded-lg transition-all duration-200
            ${copySuccess 
              ? 'bg-green-100 text-green-700' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }
            ${isCopying ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
          title="Copy to clipboard"
        >
          {copySuccess ? (
            <Check className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Copy success indicator */}
      {copySuccess && (
        <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
          Copied!
        </div>
      )}
    </div>
  );
};

export default ReplyCard; 
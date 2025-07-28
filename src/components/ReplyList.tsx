import React, { useState } from 'react';
import { Copy, Check, MessageSquare, AlertCircle, RefreshCw } from 'lucide-react';
import { GeneratedReply } from '../types';
import ReplyCard from './ReplyCard';
import { clipboardService } from '../services/clipboardService';

interface ReplyListProps {
  replies: GeneratedReply[];
  selectedReplyId: string | null;
  onReplySelect: (replyId: string) => void;
  onCopyReply: (replyId: string) => void;
  isCopying: boolean;
  isAnalyzing?: boolean;
  error?: string | null;
  className?: string;
}

const ReplyList: React.FC<ReplyListProps> = ({
  replies,
  selectedReplyId,
  onReplySelect,
  onCopyReply,
  isCopying,
  isAnalyzing = false,
  error = null,
  className = ''
}) => {
  const [copySuccessId, setCopySuccessId] = useState<string | null>(null);

  // Handle copy all replies
  const handleCopyAll = async () => {
    try {
      const allText = replies.map(reply => reply.text).join('\n\n');
      const success = await clipboardService.copyToClipboard(allText);
      if (success) {
        setCopySuccessId('all');
        setTimeout(() => setCopySuccessId(null), 2000);
      }
    } catch (error) {
      console.error('Failed to copy all replies:', error);
    }
  };

  // Handle individual reply copy
  const handleReplyCopy = (replyId: string) => {
    setCopySuccessId(replyId);
    onCopyReply(replyId);
    setTimeout(() => setCopySuccessId(null), 2000);
  };

  // Loading state
  if (isAnalyzing) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="card">
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Analyzing Screenshot
                </h3>
                <p className="text-sm text-gray-600">
                  Generating replies with AI...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="card">
          <div className="flex items-center space-x-3 p-4 bg-red-50 rounded-lg border border-red-200">
            <AlertCircle className="h-6 w-6 text-red-500 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-red-800">
                Analysis Failed
              </h3>
              <p className="text-sm text-red-700 mt-1">
                {error}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (replies.length === 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="card">
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Replies Generated
            </h3>
            <p className="text-sm text-gray-600">
              Upload a screenshot and select a tone to generate replies
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            Generated Replies
          </h3>
          <p className="text-sm text-gray-600">
            {replies.length} reply{replies.length !== 1 ? 'ies' : 'y'} generated
          </p>
        </div>
        
        {replies.length > 1 && (
          <button
            onClick={handleCopyAll}
            disabled={isCopying}
            className={`
              flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
              ${copySuccessId === 'all'
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
              ${isCopying ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            title="Copy all replies"
          >
            {copySuccessId === 'all' ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            <span>
              {copySuccessId === 'all' ? 'Copied!' : 'Copy All'}
            </span>
          </button>
        )}
      </div>

      {/* Replies Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {replies.map((reply) => (
          <ReplyCard
            key={reply.id}
            reply={reply}
            isSelected={selectedReplyId === reply.id}
            onSelect={() => onReplySelect(reply.id)}
            onCopy={() => handleReplyCopy(reply.id)}
            isCopying={isCopying}
          />
        ))}
      </div>

      {/* Context info */}
      {replies.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            Analysis Context
          </h4>
          <p className="text-sm text-gray-600">
            Generated at {replies[0].timestamp.toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
};

export default ReplyList; 
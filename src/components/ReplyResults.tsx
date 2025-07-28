import React, { useState } from 'react';
import { Copy, Check, MessageSquare, AlertCircle, Info, Loader2 } from 'lucide-react';
import { AnalysisResult } from '../types';
import { clipboardService } from '../services/clipboardService';

interface ReplyResultsProps {
  analysisResult: AnalysisResult | null;
  isAnalyzing: boolean;
  error: string | null;
  onCopyReply?: () => void;
  onCopyAllReplies?: () => void;
  className?: string;
}

const ReplyResults: React.FC<ReplyResultsProps> = ({
  analysisResult,
  isAnalyzing,
  error,
  onCopyReply,
  onCopyAllReplies,
  className = ''
}) => {
  const [copySuccessId, setCopySuccessId] = useState<string | null>(null);
  const [isCopying, setIsCopying] = useState(false);

  // Handle copy to clipboard
  const handleCopy = async (text: string, replyId: string) => {
    try {
      setIsCopying(true);
      const success = await clipboardService.copyToClipboard(text);
      if (success) {
        setCopySuccessId(replyId);
        setTimeout(() => setCopySuccessId(null), 2000);
        onCopyReply?.();
      }
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    } finally {
      setIsCopying(false);
    }
  };

  // Handle copy all replies
  const handleCopyAll = async () => {
    if (!analysisResult?.replies) return;
    
    try {
      setIsCopying(true);
      const allText = analysisResult.replies.map(reply => reply.text).join('\n\n');
      const success = await clipboardService.copyToClipboard(allText);
      if (success) {
        setCopySuccessId('all');
        setTimeout(() => setCopySuccessId(null), 2000);
        onCopyAllReplies?.();
      }
    } catch (error) {
      console.error('Failed to copy all replies:', error);
    } finally {
      setIsCopying(false);
    }
  };

  // Format timestamp
  const formatTimestamp = (date: Date): string => {
    return date.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {/* Context skeleton */}
      <div className="card">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>

      {/* Replies skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card animate-pulse">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                <div className="h-3 bg-gray-200 rounded w-4/6"></div>
              </div>
              <div className="flex justify-between items-center">
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                <div className="h-8 w-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Error state component
  const ErrorState = ({ message }: { message: string }) => (
    <div className="card">
      <div className="flex items-center space-x-3 p-4 bg-red-50 rounded-lg border border-red-200">
        <AlertCircle className="h-6 w-6 text-red-500 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-800">
            Analysis Failed
          </h3>
          <p className="text-sm text-red-700 mt-1">
            {message}
          </p>
        </div>
      </div>
    </div>
  );

  // Empty state component
  const EmptyState = () => (
    <div className="card">
      <div className="text-center py-12">
        <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Results Yet
        </h3>
        <p className="text-sm text-gray-600">
          Upload a screenshot and select a tone to generate replies
        </p>
      </div>
    </div>
  );

  // Loading state
  if (isAnalyzing) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 text-primary-600 animate-spin" />
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
        <LoadingSkeleton />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`space-y-6 ${className}`}>
        <ErrorState message={error} />
      </div>
    );
  }

  // Empty state
  if (!analysisResult) {
    return (
      <div className={`space-y-6 ${className}`}>
        <EmptyState />
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Generated Replies
          </h2>
          <p className="text-sm text-gray-600">
            {analysisResult.replies.length} reply{analysisResult.replies.length !== 1 ? 'ies' : 'y'} generated
          </p>
        </div>
        
        {analysisResult.replies.length > 1 && (
          <button
            onClick={handleCopyAll}
            disabled={isCopying}
            className={`
              flex items-center justify-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
              ${copySuccessId === 'all'
                ? 'bg-green-100 text-green-700'
                : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
              }
              ${isCopying ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              min-h-[44px] w-full sm:w-auto
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

      {/* Context Analysis */}
      {analysisResult.context && (
        <div className="card">
          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 text-primary-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                Analysis Context
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                {analysisResult.context}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Analyzed at {formatTimestamp(analysisResult.timestamp)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Generated Replies */}
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {analysisResult.replies.map((reply) => (
            <div
              key={reply.id}
              className="card hover:shadow-md transition-shadow duration-200 relative"
            >
              {/* Reply header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-4 w-4 text-gray-500" />
                  <span className="text-xs font-medium text-gray-600">
                    {reply.tone}
                  </span>
                </div>
                <div className="flex items-center space-x-1 text-xs text-gray-500">
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
                <span className="text-xs text-gray-500">
                  ID: {reply.id.slice(-8)}
                </span>
                
                <button
                  onClick={() => handleCopy(reply.text, reply.id)}
                  disabled={isCopying}
                  className={`
                    p-3 rounded-lg transition-all duration-200
                    ${copySuccessId === reply.id 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }
                    ${isCopying ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    min-w-[44px] min-h-[44px] flex items-center justify-center
                  `}
                  title="Copy to clipboard"
                >
                  {copySuccessId === reply.id ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Copy success indicator */}
              {copySuccessId === reply.id && (
                <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                  Copied!
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Additional info */}
      {analysisResult.screenshotUrl && (
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Analysis based on uploaded screenshot
          </p>
        </div>
      )}
    </div>
  );
};

export default ReplyResults; 
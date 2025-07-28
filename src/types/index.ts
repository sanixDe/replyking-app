// Reply tone options
export enum ReplyTone {
  FRIENDLY = 'FRIENDLY',
  CASUAL = 'CASUAL',
  FORMAL = 'FORMAL',
  PROFESSIONAL = 'PROFESSIONAL',
  FLIRTY = 'FLIRTY',
  WITTY = 'WITTY'
}

// Individual generated reply
export interface GeneratedReply {
  id: string;
  text: string;
  tone: ReplyTone;
  timestamp: Date;
  reasoning?: string; // Why this reply works in the context
}

// Analysis result containing context and replies
export interface AnalysisResult {
  context: string;
  replies: GeneratedReply[];
  timestamp: Date;
  screenshotUrl?: string;
  lastMessage?: string; // The exact last message that needs a reply
  relationship?: string; // Type of relationship (friends/romantic/professional/family/casual)
  mood?: string; // Current conversation mood (playful/serious/excited/concerned/etc)
}

// Upload state management
export interface UploadState {
  file: File | null;
  previewUrl: string | null;
  isUploading: boolean;
  error: string | null;
}

// Analysis state management
export interface AnalysisState {
  isAnalyzing: boolean;
  selectedTone: ReplyTone | null;
  error: string | null;
}

// Results state management
export interface ResultsState {
  analysisResult: AnalysisResult | null;
  selectedReplyId: string | null;
  isCopying: boolean;
}

// Main app state
export interface AppState {
  upload: UploadState;
  analysis: AnalysisState;
  results: ResultsState;
}

// API response types
export interface GeminiApiResponse {
  success: boolean;
  data?: {
    context: string;
    replies: Array<{
      text: string;
      tone: ReplyTone;
    }>;
  };
  error?: string;
}

// File upload constraints
export interface FileConstraints {
  maxSize: number; // in bytes
  allowedTypes: string[];
  maxFiles: number;
}

// Component props types
export interface UploadAreaProps {
  onFileSelect: (file: File) => void;
  isUploading: boolean;
  error: string | null;
}

export interface ToneSelectorProps {
  selectedTone: ReplyTone | null;
  onToneSelect: (tone: ReplyTone) => void;
  disabled?: boolean;
}

export interface ReplyListProps {
  replies: GeneratedReply[];
  selectedReplyId: string | null;
  onReplySelect: (replyId: string) => void;
  onCopyReply: (replyId: string) => void;
  isCopying: boolean;
}

export interface ReplyCardProps {
  reply: GeneratedReply;
  isSelected: boolean;
  onSelect: () => void;
  onCopy: () => void;
  isCopying: boolean;
}

// Re-export constants
export * from './constants'; 
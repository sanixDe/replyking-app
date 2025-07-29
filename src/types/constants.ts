import { FileConstraints } from './index';

// File upload constraints
export const FILE_CONSTRAINTS: FileConstraints = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/heic', 'image/heif'],
  maxFiles: 1
};

// Tone display names for UI
export const TONE_DISPLAY_NAMES = {
  FRIENDLY: 'Friendly',
  CASUAL: 'Casual',
  FORMAL: 'Formal',
  PROFESSIONAL: 'Professional',
  FLIRTY: 'Flirty',
  WITTY: 'Witty'
} as const;

// Tone descriptions for tooltips
export const TONE_DESCRIPTIONS = {
  FRIENDLY: 'Warm and approachable responses',
  CASUAL: 'Relaxed and informal language',
  FORMAL: 'Polite and structured communication',
  PROFESSIONAL: 'Business-appropriate and courteous',
  FLIRTY: 'Playful and charming responses',
  WITTY: 'Clever and humorous replies'
} as const;

// API configuration
export const API_CONFIG = {
  timeout: 30000, // 30 seconds
  maxRetries: 3,
  baseUrl: process.env.REACT_APP_API_BASE_URL || 'https://api.gemini.com'
} as const;

// UI constants
export const UI_CONSTANTS = {
  maxRepliesToShow: 3,
  copyTimeout: 2000, // 2 seconds
  uploadTimeout: 10000, // 10 seconds
  analysisTimeout: 30000 // 30 seconds
} as const; 
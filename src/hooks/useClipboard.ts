import { useState, useCallback } from 'react';
import { clipboardService } from '../services/clipboardService';

interface UseClipboardReturn {
  copyToClipboard: (text: string, id?: string) => Promise<boolean>;
  copySuccessId: string | null;
  isCopying: boolean;
  resetCopyState: () => void;
}

export const useClipboard = (): UseClipboardReturn => {
  const [copySuccessId, setCopySuccessId] = useState<string | null>(null);
  const [isCopying, setIsCopying] = useState(false);

  const copyToClipboard = useCallback(async (text: string, id?: string): Promise<boolean> => {
    try {
      setIsCopying(true);
      const success = await clipboardService.copyToClipboard(text);
      
      if (success && id) {
        setCopySuccessId(id);
        setTimeout(() => setCopySuccessId(null), 2000);
      }
      
      return success;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    } finally {
      setIsCopying(false);
    }
  }, []);

  const resetCopyState = useCallback(() => {
    setCopySuccessId(null);
    setIsCopying(false);
  }, []);

  return {
    copyToClipboard,
    copySuccessId,
    isCopying,
    resetCopyState
  };
}; 
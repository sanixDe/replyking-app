// Clipboard service for copying replies
export class ClipboardService {
  private static instance: ClipboardService;

  private constructor() {}

  public static getInstance(): ClipboardService {
    if (!ClipboardService.instance) {
      ClipboardService.instance = new ClipboardService();
    }
    return ClipboardService.instance;
  }

  // Copy text to clipboard
  public async copyToClipboard(text: string): Promise<boolean> {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        // Use modern clipboard API
        await navigator.clipboard.writeText(text);
        return true;
      } else {
        // Fallback for older browsers or non-secure contexts
        return this.fallbackCopyToClipboard(text);
      }
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      return false;
    }
  }

  // Fallback method for older browsers
  private fallbackCopyToClipboard(text: string): boolean {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      return successful;
    } catch (error) {
      console.error('Fallback copy failed:', error);
      return false;
    }
  }

  // Check if clipboard API is available
  public isClipboardSupported(): boolean {
    return !!(navigator.clipboard && window.isSecureContext);
  }

  // Get clipboard permission status
  public async getClipboardPermission(): Promise<PermissionState> {
    try {
      if (navigator.permissions) {
        const result = await navigator.permissions.query({ name: 'clipboard-write' as PermissionName });
        return result.state;
      }
      return 'granted'; // Assume granted if permissions API not available
    } catch (error) {
      console.error('Error checking clipboard permission:', error);
      return 'denied';
    }
  }
}

// Export singleton instance
export const clipboardService = ClipboardService.getInstance(); 
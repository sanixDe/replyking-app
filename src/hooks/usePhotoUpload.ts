import { useState, useCallback, useRef, useEffect } from 'react';

interface PhotoUploadState {
  selectedFile: File | null;
  previewUrl: string | null;
  isProcessing: boolean;
  error: string | null;
  progress: number;
}

interface PhotoUploadOptions {
  maxSizeMB?: number;
  acceptedFormats?: string[];
  enableCompression?: boolean;
  enableHeicConversion?: boolean;
}

interface DeviceInfo {
  isIOS: boolean;
  isSafari: boolean;
  isChrome: boolean;
  userAgent: string;
}

export const usePhotoUpload = (options: PhotoUploadOptions = {}) => {
  const {
    maxSizeMB = 10,
    acceptedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/heic', 'image/heif'],
    enableCompression = true,
    enableHeicConversion = true
  } = options;

  const [state, setState] = useState<PhotoUploadState>({
    selectedFile: null,
    previewUrl: null,
    isProcessing: false,
    error: null,
    progress: 0
  });

  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Detect device and browser
  useEffect(() => {
    const userAgent = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
    const isChrome = /Chrome/.test(userAgent);

    setDeviceInfo({
      isIOS,
      isSafari,
      isChrome,
      userAgent
    });

    addDebugLog(`Device detected: iOS=${isIOS}, Safari=${isSafari}, Chrome=${isChrome}`);
  }, []);

  // Add debug log
  const addDebugLog = useCallback((message: string) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    setDebugLogs(prev => [...prev.slice(-9), logMessage]); // Keep last 10 logs
  }, []);

  // Update state
  const updateState = useCallback((updates: Partial<PhotoUploadState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Process file with comprehensive error handling
  const processFile = useCallback(async (file: File) => {
    updateState({
      isProcessing: true,
      error: null,
      progress: 0
    });

    addDebugLog(`Processing file: ${file.name} (${file.type}, ${file.size} bytes)`);

    try {
      // Update progress
      updateState({ progress: 10 });

      // Import processing utilities dynamically to avoid circular dependencies
      const { processImageForIphone, validateIphoneImage, createImagePreview } = await import('../utils/imageProcessing');

      // Validate file
      updateState({ progress: 20 });
      const validation = validateIphoneImage(file);
      addDebugLog(`Validation result: ${validation.isValid ? 'PASS' : 'FAIL'} - ${validation.error || 'No error'}`);
      
      if (!validation.isValid) {
        throw new Error(validation.error || 'Invalid file');
      }

      // Process image
      updateState({ progress: 40 });
      addDebugLog('Starting image processing...');
      const processedResult = await processImageForIphone(file, maxSizeMB);
      addDebugLog(`Processing complete: ${processedResult.processedSize} bytes (${((processedResult.processedSize / processedResult.originalSize) * 100).toFixed(1)}% of original)`);

      // Create preview
      updateState({ progress: 80 });
      addDebugLog('Creating image preview...');
      const previewUrl = await createImagePreview(processedResult.file);
      addDebugLog('Preview created successfully');

      // Update state with processed file
      updateState({
        selectedFile: processedResult.file,
        previewUrl,
        isProcessing: false,
        progress: 100
      });

      addDebugLog('File processing completed successfully');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process image';
      addDebugLog(`ERROR: ${errorMessage}`);
      updateState({
        error: errorMessage,
        isProcessing: false,
        progress: 0
      });
      console.error('File processing error:', error);
    }
  }, [maxSizeMB, updateState, addDebugLog]);

  // Handle file selection
  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) {
      addDebugLog('No files selected');
      return;
    }

    const file = files[0];
    addDebugLog(`File selected: ${file.name} (${file.type})`);
    
    // iOS-specific file handling
    if (deviceInfo?.isIOS) {
      addDebugLog('iOS device detected - applying iOS-specific handling');
      
      // Handle iOS Photos app files
      if (file.type === '' && file.name.includes('.')) {
        addDebugLog('iOS Photos app file detected - attempting to determine type');
        const extension = file.name.split('.').pop()?.toLowerCase();
        if (extension === 'heic' || extension === 'heif') {
          addDebugLog('HEIC/HEIF file detected from iOS Photos');
        }
      }
    }

    processFile(file);
  }, [deviceInfo, processFile, addDebugLog]);

  // Trigger file selection
  const selectFile = useCallback(() => {
    addDebugLog('File selection triggered');
    fileInputRef.current?.click();
  }, [addDebugLog]);

  // Trigger camera capture
  const capturePhoto = useCallback(() => {
    addDebugLog('Camera capture triggered');
    cameraInputRef.current?.click();
  }, [addDebugLog]);

  // Remove selected file
  const removeFile = useCallback(() => {
    addDebugLog('Removing selected file');
    updateState({
      selectedFile: null,
      previewUrl: null,
      error: null,
      progress: 0
    });
    
    // Clear file inputs
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (cameraInputRef.current) {
      cameraInputRef.current.value = '';
    }
  }, [updateState, addDebugLog]);

  // Handle file input change
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    addDebugLog('File input change event triggered');
    handleFileSelect(e.target.files);
  }, [handleFileSelect, addDebugLog]);

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    addDebugLog('File dropped via drag & drop');
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect, addDebugLog]);

  // Format file size
  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  return {
    // State
    ...state,
    deviceInfo,
    debugLogs,
    
    // Refs
    fileInputRef,
    cameraInputRef,
    
    // Actions
    selectFile,
    capturePhoto,
    removeFile,
    handleFileInputChange,
    handleDragOver,
    handleDrop,
    formatFileSize,
    
    // Utilities
    addDebugLog
  };
}; 
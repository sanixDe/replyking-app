import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, Camera, X, Image as ImageIcon, AlertCircle, CheckCircle, Smartphone } from 'lucide-react';

import { processImageForIphone, validateIphoneImage, createImagePreview } from '../utils/imageProcessing';

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  isUploading?: boolean;
  maxSizeMB?: number;
  acceptedFormats?: string[];
}

interface DeviceInfo {
  isIOS: boolean;
  isSafari: boolean;
  isChrome: boolean;
  userAgent: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageSelect,
  isUploading = false,
  maxSizeMB = 10,
  acceptedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/heic', 'image/heif']
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
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

    // Log device info for debugging
    console.log('Device Info:', {
      isIOS,
      isSafari,
      isChrome,
      userAgent
    });
  }, []);

  // Add debug log
  const addDebugLog = useCallback((message: string) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    setDebugInfo(prev => [...prev.slice(-9), logMessage]); // Keep last 10 logs
  }, []);

  // Process selected file with comprehensive logging
  const processFile = async (file: File) => {
    setIsProcessing(true);
    setError(null);

    addDebugLog(`Processing file: ${file.name} (${file.type}, ${file.size} bytes)`);

    try {
      // Log file properties
      addDebugLog(`File properties: name="${file.name}", type="${file.type}", size=${file.size}, lastModified=${file.lastModified}`);

      // Validate file for iPhone compatibility
      const validation = validateIphoneImage(file);
      addDebugLog(`Validation result: ${validation.isValid ? 'PASS' : 'FAIL'} - ${validation.error || 'No error'}`);
      
      if (!validation.isValid) {
        throw new Error(validation.error || 'Invalid file');
      }

      // Process image for iPhone compatibility
      addDebugLog('Starting image processing...');
      const processedResult = await processImageForIphone(file, maxSizeMB);
      addDebugLog(`Processing complete: ${processedResult.processedSize} bytes (${((processedResult.processedSize / processedResult.originalSize) * 100).toFixed(1)}% of original)`);

      // Create preview
      addDebugLog('Creating image preview...');
      const previewUrl = await createImagePreview(processedResult.file);
      addDebugLog('Preview created successfully');

      setPreviewUrl(previewUrl);
      setSelectedFile(processedResult.file);
      onImageSelect(processedResult.file);

      addDebugLog('File processing completed successfully');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process image';
      addDebugLog(`ERROR: ${errorMessage}`);
      setError(errorMessage);
      console.error('File processing error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Enhanced file selection handler with iOS-specific logic
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

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    addDebugLog('File dropped via drag & drop');
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect, addDebugLog]);

  // Handle click upload with iOS-specific options
  const handleClick = useCallback(() => {
    addDebugLog('Upload button clicked');
    
    if (deviceInfo?.isIOS) {
      addDebugLog('iOS device - showing file picker');
      fileInputRef.current?.click();
    } else {
      fileInputRef.current?.click();
    }
  }, [deviceInfo, addDebugLog]);



  // Handle file input change
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    addDebugLog('File input change event triggered');
    handleFileSelect(e.target.files);
  }, [handleFileSelect, addDebugLog]);

  // Remove selected file
  const handleRemove = useCallback(() => {
    addDebugLog('Removing selected file');
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (cameraInputRef.current) {
      cameraInputRef.current.value = '';
    }
  }, [addDebugLog]);

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={isUploading || isProcessing}
      />
      
      {/* Camera input for iOS */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={isUploading || isProcessing}
      />

      {/* Upload Area */}
      {!selectedFile && (
        <div
          className={`
            relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-all duration-200 min-h-[200px] flex flex-col items-center justify-center
            ${isDragOver 
              ? 'border-primary-500 bg-primary-50' 
              : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
            }
            ${isUploading || isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          {isProcessing ? (
            <div className="space-y-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="text-sm text-gray-600">Processing image...</p>
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center space-y-3">
                <div className="flex items-center space-x-2">
                  <Camera className="h-8 w-8 text-gray-400" />
                  <Upload className="h-6 w-6 text-gray-400" />
                  {deviceInfo?.isIOS && <Smartphone className="h-6 w-6 text-blue-400" />}
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-900 mb-1">
                    Upload Screenshot
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    {deviceInfo?.isIOS 
                      ? 'Tap to select from Photos or take a photo'
                      : 'Tap to select from gallery or drag & drop'
                    }
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 max-w-sm">
                  <p className="font-medium mb-1">Supported formats:</p>
                  <p>JPEG, PNG, HEIC (iPhone) • Max {maxSizeMB}MB</p>
                  {deviceInfo?.isIOS && (
                    <p className="text-blue-600 mt-1">✓ iOS Photos app compatible</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Selected File Preview */}
      {selectedFile && (
        <div className="space-y-4">
          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-start space-x-4">
              {previewUrl && (
                <div className="flex-shrink-0">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-20 h-20 object-cover rounded-lg border"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-2">
                  <ImageIcon className="h-5 w-5 text-green-600" />
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {selectedFile.name}
                  </h3>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <p className="text-xs text-gray-500 mb-3">
                  {formatFileSize(selectedFile.size)} • {selectedFile.type}
                </p>
                <button
                  onClick={handleRemove}
                  className="inline-flex items-center space-x-1 px-3 py-1 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                >
                  <X className="h-3 w-3" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800">Upload Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <button
                onClick={handleClick}
                className="mt-2 text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Processing State */}
      {isProcessing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <div>
              <p className="text-sm font-medium text-blue-800">Processing Image</p>
              <p className="text-xs text-blue-600">Converting and optimizing...</p>
            </div>
          </div>
        </div>
      )}

      {/* Debug Information (only in development) */}
      {process.env.NODE_ENV === 'development' && debugInfo.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-800 mb-2">Debug Logs:</h3>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {debugInfo.map((log, index) => (
              <p key={index} className="text-xs text-gray-600 font-mono">
                {log}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload; 
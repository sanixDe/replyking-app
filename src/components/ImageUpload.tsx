import React, { useState, useRef, useCallback } from 'react';
import { Upload, Image, X, AlertCircle, CheckCircle, Camera } from 'lucide-react';
import { fileValidationService } from '../services/fileValidationService';

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  isUploading?: boolean;
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageSelect,
  isUploading = false,
  className = ''
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [showHapticFeedback, setShowHapticFeedback] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Handle file validation and selection
  const handleFileSelect = useCallback(async (file: File) => {
    setIsValidating(true);
    setError(null);
    setShowHapticFeedback(true);

    try {
      // Validate file
      const validation = fileValidationService.validateImageFile(file);
      
      if (!validation.isValid) {
        setError(validation.error || 'Invalid file');
        return;
      }

      // Additional image validation
      const isImage = await fileValidationService.isImageFile(file);
      if (!isImage) {
        setError('File must be a valid image');
        return;
      }

      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setSelectedFile(file);
      
      // Emit file selection
      onImageSelect(file);
      
    } catch (err) {
      setError('Failed to process image file');
      console.error('File processing error:', err);
    } finally {
      setIsValidating(false);
      setTimeout(() => setShowHapticFeedback(false), 200);
    }
  }, [onImageSelect]);

  // Handle drag events
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  // Handle drop event
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, [handleFileSelect]);

  // Handle file input change
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  // Handle camera input change
  const handleCameraInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  // Handle click on upload area
  const handleUploadAreaClick = useCallback(() => {
    if (!isUploading && !isValidating) {
      fileInputRef.current?.click();
    }
  }, [isUploading, isValidating]);

  // Handle camera button click
  const handleCameraClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isUploading && !isValidating) {
      cameraInputRef.current?.click();
    }
  }, [isUploading, isValidating]);

  // Clear selected file
  const handleClearFile = useCallback(() => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (cameraInputRef.current) {
      cameraInputRef.current.value = '';
    }
  }, []);

  // Format file size
  const formatFileSize = (bytes: number): string => {
    return fileValidationService.formatFileSize(bytes);
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleCameraInputChange}
        className="hidden"
      />

      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-xl p-6 transition-all duration-200 cursor-pointer
          ${dragActive 
            ? 'border-primary-400 bg-primary-50' 
            : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
          }
          ${isUploading || isValidating ? 'pointer-events-none opacity-75' : ''}
          ${error ? 'border-red-300 bg-red-50' : ''}
          ${showHapticFeedback ? 'scale-95' : ''}
          min-h-[200px] flex flex-col items-center justify-center
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleUploadAreaClick}
      >
        {/* Loading Overlay */}
        {(isUploading || isValidating) && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-xl z-10">
            <div className="flex flex-col items-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <p className="text-sm text-gray-600">
                {isUploading ? 'Uploading...' : 'Validating...'}
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex items-center space-x-2 mb-4 p-3 bg-red-100 rounded-lg w-full">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* File Preview */}
        {selectedFile && previewUrl && !error ? (
          <div className="space-y-4 w-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleClearFile();
                }}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="relative">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg border border-gray-200"
              />
              <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                Preview
              </div>
            </div>
          </div>
        ) : (
          /* Upload Prompt */
          <div className="text-center w-full">
            <div className="flex flex-col items-center space-y-6">
              <div className={`
                p-6 rounded-full
                ${error ? 'bg-red-100' : 'bg-gray-100'}
              `}>
                {error ? (
                  <AlertCircle className="h-12 w-12 text-red-500" />
                ) : (
                  <Upload className="h-12 w-12 text-gray-400" />
                )}
              </div>
              
              <div className="space-y-3">
                <p className="text-lg font-medium text-gray-900">
                  {error ? 'Upload Failed' : 'Upload Screenshot'}
                </p>
                <p className="text-sm text-gray-600">
                  {error 
                    ? 'Please try again with a valid image file'
                    : 'Tap to upload or drag and drop'
                  }
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG, JPEG up to 10MB
                </p>
              </div>

              {/* Mobile Camera Button */}
              <div className="flex space-x-3 w-full max-w-xs">
                <button
                  onClick={handleUploadAreaClick}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 active:bg-primary-800 transition-colors min-h-[44px]"
                >
                  <Image className="h-5 w-5" />
                  <span className="text-sm font-medium">Gallery</span>
                </button>
                <button
                  onClick={handleCameraClick}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 active:bg-gray-800 transition-colors min-h-[44px]"
                >
                  <Camera className="h-5 w-5" />
                  <span className="text-sm font-medium">Camera</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Help Text */}
      {!selectedFile && !error && (
        <div className="mt-3 text-center">
          <p className="text-xs text-gray-500">
            Supported formats: PNG, JPG, JPEG • Max size: 10MB
          </p>
        </div>
      )}
    </div>
  );
};

export default ImageUpload; 
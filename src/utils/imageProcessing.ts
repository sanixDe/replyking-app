// Image processing utilities for iPhone compatibility

export interface ImageProcessingOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

export interface ProcessedImage {
  file: File;
  originalSize: number;
  processedSize: number;
  width: number;
  height: number;
  format: string;
}

// Convert HEIC/HEIF to JPEG
export const convertHeicToJpeg = async (file: File): Promise<File> => {
  if (!file.type.includes('heic') && !file.type.includes('heif')) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Set canvas dimensions
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw image to canvas
      ctx?.drawImage(img, 0, 0);

      // Convert to JPEG blob
      canvas.toBlob((blob) => {
        if (blob) {
          // Create new file with JPEG format
          const newFile = new File([blob], file.name.replace(/\.(heic|heif)$/i, '.jpg'), {
            type: 'image/jpeg',
            lastModified: Date.now()
          });
          resolve(newFile);
        } else {
          reject(new Error('Failed to convert HEIC image'));
        }
      }, 'image/jpeg', 0.9);
    };

    img.onerror = () => reject(new Error('Failed to load HEIC image'));
    img.src = URL.createObjectURL(file);
  });
};

// Compress image while maintaining aspect ratio
export const compressImage = async (
  file: File, 
  options: ImageProcessingOptions = {}
): Promise<ProcessedImage> => {
  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.8,
    format = 'jpeg'
  } = options;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      let { width, height } = img;

      // Calculate new dimensions while maintaining aspect ratio
      if (width > maxWidth || height > maxHeight) {
        const aspectRatio = width / height;
        
        if (width > height) {
          width = maxWidth;
          height = width / aspectRatio;
        } else {
          height = maxHeight;
          width = height * aspectRatio;
        }
      }

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);

      // Convert to blob
      canvas.toBlob((blob) => {
        if (blob) {
          const processedFile = new File([blob], file.name, {
            type: `image/${format}`,
            lastModified: Date.now()
          });

          resolve({
            file: processedFile,
            originalSize: file.size,
            processedSize: blob.size,
            width: Math.round(width),
            height: Math.round(height),
            format: `image/${format}`
          });
        } else {
          reject(new Error('Failed to compress image'));
        }
      }, `image/${format}`, quality);
    };

    img.onerror = () => reject(new Error('Failed to load image for compression'));
    img.src = URL.createObjectURL(file);
  });
};

// Process image for iPhone compatibility
export const processImageForIphone = async (
  file: File,
  maxSizeMB: number = 10
): Promise<ProcessedImage> => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  try {
    // Convert HEIC if needed
    let processedFile = await convertHeicToJpeg(file);

    // Compress if file is too large
    if (processedFile.size > maxSizeBytes) {
      const result = await compressImage(processedFile, {
        maxWidth: 1920,
        maxHeight: 1920,
        quality: 0.8,
        format: 'jpeg'
      });
      return result;
    }

    // Return original file if no processing needed
    return {
      file: processedFile,
      originalSize: file.size,
      processedSize: processedFile.size,
      width: 0, // Will be set when image loads
      height: 0,
      format: processedFile.type
    };
  } catch (error) {
    throw new Error(`Failed to process image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Get image dimensions
export const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = () => reject(new Error('Failed to get image dimensions'));
    img.src = URL.createObjectURL(file);
  });
};

// Validate image file for iPhone
export const validateIphoneImage = (file: File): { isValid: boolean; error?: string } => {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/heic', 'image/heif'];
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Please select a JPEG, PNG, or HEIC image file'
    };
  }

  // Check file size (50MB limit for processing)
  const maxSize = 50 * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'File is too large. Please select an image smaller than 50MB'
    };
  }

  return { isValid: true };
};

// Create image preview URL
export const createImagePreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target?.result as string);
    };
    reader.onerror = () => reject(new Error('Failed to create image preview'));
    reader.readAsDataURL(file);
  });
}; 
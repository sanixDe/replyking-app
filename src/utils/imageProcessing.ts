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

// Enhanced HEIC/HEIF detection and conversion
export const detectAndConvertHeic = async (file: File): Promise<File> => {
  // Check if it's a HEIC/HEIF file by extension or MIME type
  const isHeicByExtension = /\.(heic|heif)$/i.test(file.name);
  const isHeicByType = file.type.includes('heic') || file.type.includes('heif');
  
  if (!isHeicByExtension && !isHeicByType) {
    return file;
  }

  console.log('HEIC/HEIF file detected, converting to JPEG...');

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      try {
        // Set canvas dimensions
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw image to canvas
        ctx?.drawImage(img, 0, 0);

        // Convert to JPEG blob with high quality
        canvas.toBlob((blob) => {
          if (blob) {
            // Create new file with JPEG format
            const newFileName = file.name.replace(/\.(heic|heif)$/i, '.jpg');
            const newFile = new File([blob], newFileName, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            console.log(`HEIC conversion successful: ${file.name} → ${newFileName}`);
            resolve(newFile);
          } else {
            reject(new Error('Failed to convert HEIC image to JPEG'));
          }
        }, 'image/jpeg', 0.9);
      } catch (error) {
        reject(new Error(`HEIC conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load HEIC image for conversion'));
    };

    // Create object URL and load image
    const objectUrl = URL.createObjectURL(file);
    img.src = objectUrl;
    
    // Clean up object URL after image loads
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      img.onload = () => {
        // Set canvas dimensions
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw image to canvas
        ctx?.drawImage(img, 0, 0);

        // Convert to JPEG blob with high quality
        canvas.toBlob((blob) => {
          if (blob) {
            // Create new file with JPEG format
            const newFileName = file.name.replace(/\.(heic|heif)$/i, '.jpg');
            const newFile = new File([blob], newFileName, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            console.log(`HEIC conversion successful: ${file.name} → ${newFileName}`);
            resolve(newFile);
          } else {
            reject(new Error('Failed to convert HEIC image to JPEG'));
          }
        }, 'image/jpeg', 0.9);
      };
    };
  });
};

// Enhanced image compression with better quality control
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
      try {
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

        // Enable image smoothing for better quality
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
        }

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
      } catch (error) {
        reject(new Error(`Image compression failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image for compression'));
    };

    // Create object URL and load image
    const objectUrl = URL.createObjectURL(file);
    img.src = objectUrl;
    
    // Clean up object URL after image loads
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      img.onload = () => {
        try {
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

          // Enable image smoothing for better quality
          if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
          }

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
        } catch (error) {
          reject(new Error(`Image compression failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
        }
      };
    };
  });
};

// Enhanced image processing for iPhone compatibility
export const processImageForIphone = async (
  file: File,
  maxSizeMB: number = 10
): Promise<ProcessedImage> => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  try {
    console.log(`Processing image: ${file.name} (${file.size} bytes)`);

    // First, convert HEIC if needed
    let processedFile = await detectAndConvertHeic(file);
    console.log(`After HEIC conversion: ${processedFile.name} (${processedFile.size} bytes)`);

    // If file is still too large, compress it
    if (processedFile.size > maxSizeBytes) {
      console.log(`File too large (${processedFile.size} bytes), compressing...`);
      const result = await compressImage(processedFile, {
        maxWidth: 1920,
        maxHeight: 1920,
        quality: 0.8,
        format: 'jpeg'
      });
      console.log(`Compression complete: ${result.processedSize} bytes`);
      return result;
    }

    // Get dimensions for the processed file
    const dimensions = await getImageDimensions(processedFile);

    // Return processed file if no compression needed
    return {
      file: processedFile,
      originalSize: file.size,
      processedSize: processedFile.size,
      width: dimensions.width,
      height: dimensions.height,
      format: processedFile.type
    };
  } catch (error) {
    console.error('Image processing error:', error);
    throw new Error(`Failed to process image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Get image dimensions with better error handling
export const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      try {
        resolve({ width: img.width, height: img.height });
      } catch (error) {
        reject(new Error(`Failed to get image dimensions: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image for dimension calculation'));
    };

    // Create object URL and load image
    const objectUrl = URL.createObjectURL(file);
    img.src = objectUrl;
    
    // Clean up object URL after image loads
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      img.onload = () => {
        try {
          resolve({ width: img.width, height: img.height });
        } catch (error) {
          reject(new Error(`Failed to get image dimensions: ${error instanceof Error ? error.message : 'Unknown error'}`));
        }
      };
    };
  });
};

// Enhanced validation for iPhone images
export const validateIphoneImage = (file: File): { isValid: boolean; error?: string } => {
  console.log(`Validating file: ${file.name} (${file.type}, ${file.size} bytes)`);

  // Check if file exists
  if (!file) {
    return { isValid: false, error: 'No file provided' };
  }

  // Check file type (including HEIC support)
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/heic', 'image/heif'];
  const isHeicByExtension = /\.(heic|heif)$/i.test(file.name);
  
  // Handle iOS Photos app files that might have empty type
  if (file.type === '' && isHeicByExtension) {
    console.log('iOS Photos app HEIC file detected');
    // Allow these files as they will be converted
  } else if (!allowedTypes.includes(file.type) && !isHeicByExtension) {
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

  // For now, return valid if basic checks pass
  // The async validation can be added later if needed
  return { isValid: true };
};

// Enhanced image preview creation
export const createImagePreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const result = e.target?.result as string;
        if (result) {
          resolve(result);
        } else {
          reject(new Error('Failed to create image preview'));
        }
      } catch (error) {
        reject(new Error(`Preview creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file for preview'));
    };
    
    reader.readAsDataURL(file);
  });
}; 
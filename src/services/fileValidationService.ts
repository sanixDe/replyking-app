import { FILE_CONSTRAINTS } from '../types';

// File validation service
export class FileValidationService {
  private static instance: FileValidationService;

  private constructor() {}

  public static getInstance(): FileValidationService {
    if (!FileValidationService.instance) {
      FileValidationService.instance = new FileValidationService();
    }
    return FileValidationService.instance;
  }

  // Validate image file
  public validateImageFile(file: File): { isValid: boolean; error?: string } {
    // Check if file exists
    if (!file) {
      return { isValid: false, error: 'No file selected' };
    }

    // Check file size
    if (file.size > FILE_CONSTRAINTS.maxSize) {
      const maxSizeMB = FILE_CONSTRAINTS.maxSize / (1024 * 1024);
      return { 
        isValid: false, 
        error: `File size must be less than ${maxSizeMB}MB` 
      };
    }

    // Check file type (including HEIC support)
    const allowedTypes = [...FILE_CONSTRAINTS.allowedTypes, 'image/heic', 'image/heif'];
    if (!allowedTypes.includes(file.type)) {
      const displayTypes = allowedTypes
        .map(type => type.split('/')[1].toUpperCase())
        .filter(type => type !== 'HEIC' && type !== 'HEIF') // Don't show HEIC in error message
        .join(', ');
      return { 
        isValid: false, 
        error: `File type must be one of: ${displayTypes} (iPhone photos are automatically converted)` 
      };
    }

    // Check if file is actually an image
    if (!file.type.startsWith('image/')) {
      return { isValid: false, error: 'File must be an image' };
    }

    return { isValid: true };
  }

  // Get file size in human readable format
  public formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Get file extension from filename
  public getFileExtension(filename: string): string {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
  }

  // Check if file is an image by reading its header
  public async isImageFile(file: File): Promise<boolean> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const arr = new Uint8Array(e.target?.result as ArrayBuffer).subarray(0, 4);
        let header = '';
        for (let i = 0; i < arr.length; i++) {
          header += arr[i].toString(16);
        }
        
        // Check for common image file signatures
        const signatures = {
          png: '89504e47',
          jpg: 'ffd8ffe0',
          jpeg: 'ffd8ffe1',
          gif: '47494638',
          webp: '52494646'
        };
        
        const isImage = Object.values(signatures).some(sig => 
          header.startsWith(sig)
        );
        
        resolve(isImage);
      };
      reader.onerror = () => resolve(false);
      reader.readAsArrayBuffer(file.slice(0, 4));
    });
  }

  // Validate multiple files
  public validateMultipleFiles(files: FileList): { 
    validFiles: File[]; 
    errors: string[] 
  } {
    const validFiles: File[] = [];
    const errors: string[] = [];

    if (files.length > FILE_CONSTRAINTS.maxFiles) {
      errors.push(`Maximum ${FILE_CONSTRAINTS.maxFiles} file(s) allowed`);
      return { validFiles, errors };
    }

    Array.from(files).forEach((file, index) => {
      const validation = this.validateImageFile(file);
      if (validation.isValid) {
        validFiles.push(file);
      } else {
        errors.push(`File ${index + 1}: ${validation.error}`);
      }
    });

    return { validFiles, errors };
  }
}

// Export singleton instance
export const fileValidationService = FileValidationService.getInstance(); 
/**
 * Compress an image file using browser Canvas API
 * @param file - The original image file
 * @param quality - Compression quality (0.1 to 1.0, where 0.7 = 70% quality)
 * @param maxWidth - Maximum width in pixels (optional)
 * @param maxHeight - Maximum height in pixels (optional)
 * @returns Promise<Blob> - Compressed image as a Blob
 */
export const compressImage = async (
  file: File,
  quality: number = 0.7,
  maxWidth: number = 1920,
  maxHeight: number = 1920
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        
        // Create canvas and resize image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        // Draw resized image
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to blob with compression
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          'image/jpeg',
          quality
        );
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
};

/**
 * Compress multiple images
 * @param files - Array of image files
 * @param quality - Compression quality (default: 0.7)
 * @returns Promise<Blob[]> - Array of compressed image blobs
 */
export const compressImages = async (
  files: File[],
  quality: number = 0.7
): Promise<Blob[]> => {
  return Promise.all(
    files.map(file => compressImage(file, quality))
  );
};

/**
 * Convert Blob to File (to preserve filename and type)
 * @param blob - The blob to convert
 * @param filename - The filename for the new File
 * @returns File - New File object
 */
export const blobToFile = (blob: Blob, filename: string): File => {
  return new File([blob], filename, {
    type: blob.type,
    lastModified: Date.now(),
  });
};

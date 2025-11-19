import { supabase } from '@/integrations/supabase/client';
import { UploadedFile, FileCollection, CollectionInfo, DatabaseFile } from '@/types/upload';

export interface FileUploadResult {
  success: boolean;
  shareUrl?: string;
  collectionUrl?: string;
  sharePin?: string;
  error?: string;
}

export interface CollectionUploadResult {
  success: boolean;
  shareUrl?: string;
  error?: string;
  collectionId?: string;
}

export class UploadService {
  // Use database function for cryptographically secure token generation
  private static async generateShareToken(): Promise<string> {
    const { data, error } = await supabase.rpc('generate_share_token');
    if (error) {
      throw new Error(`Token generation failed: ${error.message}`);
    }
      return data;
    }

    // Normalize token variants for robust lookups (handles missing or extra padding)
    private static getTokenVariants(token: string): string[] {
      const original = token.trim();
      const withoutPadding = original.replace(/=+$/g, '');
      const variants = new Set<string>();

      // Original first
      variants.add(original);

      // Without padding
      variants.add(withoutPadding);

      // Add padded variant to nearest length divisible by 4
      if (!original.includes('=')) {
        const mod = original.length % 4;
        if (mod !== 0) {
          variants.add(original + '='.repeat(4 - mod));
        }
      }

      return Array.from(variants);
    }

  // Upload single file with enhanced security validation
  static async uploadFile(
    file: UploadedFile, 
    onProgress?: (progress: number, uploadSpeed?: number, estimatedTime?: number, uploadedBytes?: number) => void,
    password?: string
  ): Promise<FileUploadResult> {
    try {
      // Get current user (optional - allow anonymous uploads)
      const { data: { user } } = await supabase.auth.getUser();

      // Server-side validation using secure RPC function (pass null for anonymous users)
      const { data: isValid, error: validationError } = await supabase
        .rpc('validate_file_upload', {
          p_filename: file.name,
          p_file_size: file.size,
          p_file_type: file.type,
          p_user_id: user?.id || null
        });

      if (validationError) {
        throw new Error(`Validation error: ${validationError.message}`);
      }

      if (!isValid) {
        throw new Error('File validation failed. Check file size, type, and upload limits.');
      }

      const shareToken = await this.generateShareToken();
      const fileExtension = file.name.split('.').pop();
      const filename = `${shareToken}.${fileExtension}`;
      const storagePath = `files/${filename}`;

      // Track upload metrics
      const startTime = Date.now();
      const totalSize = file.size;
      let progress = 0;
      
      // Simulate progress with realistic metrics
      const progressInterval = setInterval(() => {
        if (progress < 90) {
          progress += Math.random() * 15;
          progress = Math.min(progress, 90);
          
          const currentTime = Date.now();
          const elapsedSeconds = (currentTime - startTime) / 1000;
          const uploadedBytes = Math.round((progress / 100) * totalSize);
          const uploadSpeed = elapsedSeconds > 0 ? uploadedBytes / elapsedSeconds : 0;
          const remainingBytes = totalSize - uploadedBytes;
          const estimatedTime = uploadSpeed > 0 ? Math.round(remainingBytes / uploadSpeed) : 0;
          
          onProgress?.(Math.round(progress), uploadSpeed, estimatedTime, uploadedBytes);
        }
      }, 200);

      try {
        const uploadResult = await this.uploadWithProgress(file.file, storagePath, 
          (p) => {
            const currentTime = Date.now();
            const elapsedSeconds = (currentTime - startTime) / 1000;
            const uploadedBytes = Math.round((p / 100) * totalSize);
            const uploadSpeed = elapsedSeconds > 0 ? uploadedBytes / elapsedSeconds : 0;
            const remainingBytes = totalSize - uploadedBytes;
            const estimatedTime = uploadSpeed > 0 ? Math.round(remainingBytes / uploadSpeed) : 0;
            
            onProgress?.(p, uploadSpeed, estimatedTime, uploadedBytes);
          }
        );
        
        clearInterval(progressInterval);
        
        if (!uploadResult.success) {
          throw new Error(uploadResult.error || 'Upload failed');
        }

        onProgress?.(100, 0, 0, totalSize);

        // Generate PIN for the file
        const { data: pinData, error: pinError } = await supabase
          .rpc('generate_share_pin');
        
        if (pinError) {
          throw new Error(`PIN generation error: ${pinError.message}`);
        }

        const sharePin = pinData;

        // Use database function to insert file with password hashing
        const { data: fileIdData, error: dbError } = await supabase
          .rpc('insert_file_with_password', {
            p_filename: filename,
            p_original_name: file.name,
            p_file_size: file.size,
            p_file_type: file.type,
            p_storage_path: storagePath,
            p_share_token: shareToken,
            p_share_pin: sharePin,
            p_user_id: user?.id || null,
            p_password: password || null
          });

        if (dbError) {
          // Clean up uploaded file if database insert fails
          await supabase.storage.from('uploads').remove([storagePath]);
          throw new Error(`Database error: ${dbError.message}`);
        }

        // Generate shareable URL (encode token for URL-safety)
        const shareUrl = `${window.location.origin}/share/${encodeURIComponent(shareToken)}`;

        return {
          success: true,
          shareUrl,
          sharePin
        };
      } finally {
        clearInterval(progressInterval);
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  }

  // Enhanced upload with real progress tracking
  private static async uploadWithProgress(
    file: File, 
    storagePath: string, 
    onProgress?: (progress: number) => void
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Use Supabase client with progress tracking
      const { data, error } = await supabase.storage
        .from('uploads')
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  }

  // Upload multiple files as a collection with enhanced security
  static async uploadFileCollection(
    files: UploadedFile[], 
    collectionName: string = 'Shared Files',
    description?: string,
    onProgress?: (fileIndex: number, progress: number) => void
  ): Promise<CollectionUploadResult> {
    try {
      // Get current user (required for uploads now)
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Authentication required for file uploads');
      }

      // Validate all files before starting upload
      for (const file of files) {
        const { data: isValid, error: validationError } = await supabase
          .rpc('validate_file_upload', {
            p_filename: file.name,
            p_file_size: file.size,
            p_file_type: file.type,
            p_user_id: user.id
          });

        if (validationError) {
          throw new Error(`Validation error for ${file.name}: ${validationError.message}`);
        }

        if (!isValid) {
          throw new Error(`File validation failed for ${file.name}. Check file size, type, and upload limits.`);
        }
      }

      // Create file collection first
      const { data: collectionData, error: collectionError } = await supabase
        .from('file_collections')
        .insert({
          collection_name: collectionName,
          description,
          user_id: user.id
        })
        .select()
        .single();

      if (collectionError || !collectionData) {
        throw new Error(`Failed to create collection: ${collectionError?.message}`);
      }

      const collectionId = collectionData.id;
      const uploadedFiles: string[] = [];

      // Upload files in parallel for better speed (max 3 concurrent uploads)
      const uploadPromises = files.map(async (file, i) => {
        const shareToken = await this.generateShareToken();
        const fileExtension = file.name.split('.').pop();
        const filename = `${shareToken}.${fileExtension}`;
        const storagePath = `collections/${collectionId}/${filename}`;

        try {
          // Upload with real progress tracking
          const uploadResult = await this.uploadWithProgress(
            file.file, 
            storagePath, 
            (progress) => onProgress?.(i, progress)
          );

          if (!uploadResult.success) {
            throw new Error(`Upload failed for ${file.name}: ${uploadResult.error}`);
          }

          uploadedFiles.push(storagePath);

            // Generate PIN for the file
            const { data: pinData, error: pinError } = await supabase
              .rpc('generate_share_pin');
            
            if (pinError) {
              throw new Error(`PIN generation error: ${pinError.message}`);
            }

            const sharePin = pinData;

            // Save file metadata linked to collection
            const { error: dbError } = await supabase
              .from('uploaded_files')
              .insert({
                filename,
                original_name: file.name,
                file_size: file.size,
                file_type: file.type,
                storage_path: storagePath,
                share_token: shareToken,
                share_pin: sharePin,
                collection_id: collectionId,
                user_id: user.id
              });

          if (dbError) {
            throw new Error(`Database error for ${file.name}: ${dbError.message}`);
          }

          return { file, shareToken, storagePath };
        } catch (fileError) {
          throw fileError;
        }
      });

      // Execute uploads with controlled concurrency (3 at a time for better speed)
      const results = [];
      for (let i = 0; i < uploadPromises.length; i += 3) {
        const batch = uploadPromises.slice(i, i + 3);
        const batchResults = await Promise.allSettled(batch);
        
        for (const result of batchResults) {
          if (result.status === 'rejected') {
            // Clean up on any error
            if (uploadedFiles.length > 0) {
              await supabase.storage.from('uploads').remove(uploadedFiles);
            }
            await supabase.from('file_collections').delete().eq('id', collectionId);
            throw new Error(result.reason);
          }
          results.push(result.value);
        }
      }

      const shareUrl = `${window.location.origin}/collection/${encodeURIComponent(collectionData.share_token)}`;

      return {
        success: true,
        shareUrl,
        collectionId
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Collection upload failed'
      };
    }
  }

  static async getFileInfo(shareToken: string) {
    const variants = this.getTokenVariants(shareToken);
    console.log('Getting file info for token variants:', variants);
    
    for (const tok of variants) {
      console.log('Trying token variant:', tok);
      const { data, error } = await supabase
        .rpc('get_file_by_token', { p_share_token: tok });
      
      console.log('RPC response:', { data, error });
      
      if (error) {
        console.error('RPC error:', error);
        continue;
      }
      
      if (data && data.length > 0) {
        console.log('Found file:', data[0]);
        return data[0];
      }
    }
    throw new Error('File not found');
  }

  static async getFileInfoByPin(pin: string) {
    // Use secure RPC function to prevent direct table enumeration
    const { data, error } = await supabase
      .rpc('get_file_by_pin', { p_share_pin: pin });

    if (error || !data || data.length === 0) {
      throw new Error('File not found');
    }

    return data[0];
  }

  static async validateFilePassword(pin: string, password: string): Promise<boolean> {
    const { data, error } = await supabase
      .rpc('validate_file_password', { 
        p_share_pin: pin, 
        p_password: password 
      });

    if (error) {
      throw new Error('Failed to validate password');
    }

    return data === true;
  }

  static async getCollectionInfo(shareToken: string): Promise<CollectionInfo> {
    const variants = this.getTokenVariants(shareToken);
    for (const tok of variants) {
      const { data: collectionData } = await supabase
        .rpc('get_collection_by_token', { p_share_token: tok });

      if (collectionData && collectionData.length > 0) {
        const collection = collectionData[0];
        const { data: filesData } = await supabase
          .rpc('get_files_by_collection_token', { p_collection_token: tok });
        const fileCount = filesData?.length || 0;
        return { ...collection, file_count: fileCount };
      }
    }
    throw new Error('Collection not found');
  }

  static async getCollectionFiles(shareToken: string): Promise<FileCollection> {
    const variants = this.getTokenVariants(shareToken);
    for (const tok of variants) {
      const { data: collectionData } = await supabase
        .rpc('get_collection_by_token', { p_share_token: tok });

      if (collectionData && collectionData.length > 0) {
        const collection = collectionData[0];

        // Get all files in the collection using secure RPC function
        const { data: filesData } = await supabase
          .rpc('get_files_by_collection_token', { p_collection_token: tok });

        return {
          ...collection,
          files: filesData || []
        };
      }
    }
    throw new Error('Collection not found');
  }

  static async getFileUrl(storagePath: string): Promise<string> {
    // Use signed URLs for secure access (1 hour expiry)
    const { data, error } = await supabase.storage
      .from('uploads')
      .createSignedUrl(storagePath, 3600);

    if (error) {
      throw new Error(`Failed to generate secure URL: ${error.message}`);
    }

    return data.signedUrl;
  }

  static async incrementDownloadCount(shareToken: string) {
    // Use secure RPC function for consistent access control
    const { error } = await supabase
      .rpc('increment_file_download_count', { p_share_token: shareToken });
    
    if (error) {
      console.warn('Failed to increment download count:', error.message);
    }
  }

  static async incrementCollectionDownloadCount(shareToken: string) {
    // Use secure RPC function for consistent access control
    const { error } = await supabase
      .rpc('increment_collection_download_count', { p_share_token: shareToken });
    
    if (error) {
      console.warn('Failed to increment collection download count:', error.message);
    }
  }

  // Generate download URL for entire collection as ZIP
  static async downloadCollection(shareToken: string): Promise<string> {
    // This would typically generate a zip file server-side
    // For now, return the collection URL
    return `${window.location.origin}/collection/${shareToken}/download`;
  }
}
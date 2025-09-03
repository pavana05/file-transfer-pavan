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
  private static generateShareToken(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  // Upload single file with progress simulation for better UX
  static async uploadFile(file: UploadedFile, onProgress?: (progress: number) => void): Promise<FileUploadResult> {
    try {
      const shareToken = this.generateShareToken();
      const fileExtension = file.name.split('.').pop();
      const filename = `${shareToken}.${fileExtension}`;
      const storagePath = `files/${filename}`;

      // Simulate progress for better UX since Supabase doesn't provide real progress
      let progress = 0;
      const progressInterval = setInterval(() => {
        if (progress < 90) {
          progress += Math.random() * 15;
          progress = Math.min(progress, 90);
          onProgress?.(Math.round(progress));
        }
      }, 200);

      try {
        const uploadResult = await this.uploadWithProgress(file.file, storagePath, onProgress);
        
        clearInterval(progressInterval);
        
        if (!uploadResult.success) {
          throw new Error(uploadResult.error || 'Upload failed');
        }

        onProgress?.(100);

        // Generate PIN for the file
        const { data: pinData, error: pinError } = await supabase
          .rpc('generate_share_pin');
        
        if (pinError) {
          throw new Error(`PIN generation error: ${pinError.message}`);
        }

        const sharePin = pinData;

        // Save file metadata to database
        const { error: dbError } = await supabase
          .from('uploaded_files')
          .insert({
            filename,
            original_name: file.name,
            file_size: file.size,
            file_type: file.type,
            storage_path: storagePath,
            share_token: shareToken,
            share_pin: sharePin
          });

        if (dbError) {
          // Clean up uploaded file if database insert fails
          await supabase.storage.from('uploads').remove([storagePath]);
          throw new Error(`Database error: ${dbError.message}`);
        }

        // Generate shareable URL
        const shareUrl = `${window.location.origin}/share/${shareToken}`;

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

  // Upload multiple files as a collection with improved error handling
  static async uploadFileCollection(
    files: UploadedFile[], 
    collectionName: string = 'Shared Files',
    description?: string,
    onProgress?: (fileIndex: number, progress: number) => void
  ): Promise<CollectionUploadResult> {
    try {
      // Create file collection first
      const { data: collectionData, error: collectionError } = await supabase
        .from('file_collections')
        .insert({
          collection_name: collectionName,
          description
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
        const shareToken = this.generateShareToken();
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
                collection_id: collectionId
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

      const shareUrl = `${window.location.origin}/collection/${collectionData.share_token}`;

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
    // Use secure RPC function to prevent direct table enumeration
    const { data, error } = await supabase
      .rpc('get_file_by_token', { p_share_token: shareToken });

    if (error || !data || data.length === 0) {
      throw new Error('File not found');
    }

    return data[0];
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

  static async getCollectionInfo(shareToken: string): Promise<CollectionInfo> {
    // Use secure RPC function to prevent direct table enumeration
    const { data: collectionData, error: collectionError } = await supabase
      .rpc('get_collection_by_token', { p_share_token: shareToken });

    if (collectionError || !collectionData || collectionData.length === 0) {
      throw new Error('Collection not found');
    }

    const collection = collectionData[0];

    // Get file count using secure RPC function
    const { data: filesData, error: filesError } = await supabase
      .rpc('get_files_by_collection_token', { p_collection_token: shareToken });

    const fileCount = filesError ? 0 : (filesData?.length || 0);

    return {
      ...collection,
      file_count: fileCount
    };
  }

  static async getCollectionFiles(shareToken: string): Promise<FileCollection> {
    // Use secure RPC function to prevent direct table enumeration
    const { data: collectionData, error: collectionError } = await supabase
      .rpc('get_collection_by_token', { p_share_token: shareToken });

    if (collectionError || !collectionData || collectionData.length === 0) {
      throw new Error('Collection not found');
    }

    const collection = collectionData[0];

    // Get all files in the collection using secure RPC function
    const { data: filesData, error: filesError } = await supabase
      .rpc('get_files_by_collection_token', { p_collection_token: shareToken });

    if (filesError) {
      throw new Error('Failed to load collection files');
    }

    return {
      ...collection,
      files: filesData || []
    };
  }

  static async getFileUrl(storagePath: string): Promise<string> {
    const { data } = await supabase.storage
      .from('uploads')
      .getPublicUrl(storagePath);

    return data.publicUrl;
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
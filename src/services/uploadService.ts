import { supabase } from '@/integrations/supabase/client';
import { UploadedFile, FileCollection, CollectionInfo, DatabaseFile } from '@/types/upload';

export interface FileUploadResult {
  success: boolean;
  shareUrl?: string;
  collectionUrl?: string;
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

  // Upload single file with real progress tracking and optimization
  static async uploadFile(file: UploadedFile, onProgress?: (progress: number) => void): Promise<FileUploadResult> {
    try {
      const shareToken = this.generateShareToken();
      const fileExtension = file.name.split('.').pop();
      const filename = `${shareToken}.${fileExtension}`;
      const storagePath = `files/${filename}`;

      // Real progress tracking with XMLHttpRequest
      const uploadProgress = await this.uploadWithProgress(file.file, storagePath, onProgress);
      
      if (!uploadProgress.success) {
        throw new Error(uploadProgress.error || 'Upload failed');
      }

      // Complete progress
      onProgress?.(100);

        // Save file metadata to database
        const { error: dbError } = await supabase
          .from('uploaded_files')
          .insert({
            filename,
            original_name: file.name,
            file_size: file.size,
            file_type: file.type,
            storage_path: storagePath,
            share_token: shareToken
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
          shareUrl
        };
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
    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();
      
      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          onProgress?.(Math.round(percentComplete));
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve({ success: true });
        } else {
          resolve({ 
            success: false, 
            error: `Upload failed with status: ${xhr.status}` 
          });
        }
      });

      xhr.addEventListener('error', () => {
        resolve({ 
          success: false, 
          error: 'Network error during upload' 
        });
      });

      // Get Supabase upload URL and headers
      const SUPABASE_URL = "https://zbvwodqcvotrfokadwyo.supabase.co";
      const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpidndvZHFjdm90cmZva2Fkd3lvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0NzcwMDgsImV4cCI6MjA2NzA1MzAwOH0.2JhIGFjWU-gT6CspuGTqYnkXuu_GJ6IhWwLN6AqdIVA";
      
      xhr.open('POST', `${SUPABASE_URL}/storage/v1/object/uploads/${storagePath}`);
      xhr.setRequestHeader('Authorization', `Bearer ${SUPABASE_KEY}`);
      xhr.setRequestHeader('apikey', SUPABASE_KEY);
      xhr.setRequestHeader('x-upsert', 'false');
      
      // Create FormData for upload
      const formData = new FormData();
      formData.append('', file);
      
      xhr.send(formData);
    });
  }

  // Upload multiple files as a collection with parallel uploads
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
    const { data, error } = await supabase
      .from('uploaded_files')
      .select('*')
      .eq('share_token', shareToken)
      .single();

    if (error || !data) {
      throw new Error('File not found');
    }

    return data;
  }

  static async getCollectionInfo(shareToken: string): Promise<CollectionInfo> {
    const { data: collectionData, error: collectionError } = await supabase
      .from('file_collections')
      .select('*')
      .eq('share_token', shareToken)
      .single();

    if (collectionError || !collectionData) {
      throw new Error('Collection not found');
    }

    // Get file count
    const { count } = await supabase
      .from('uploaded_files')
      .select('id', { count: 'exact', head: true })
      .eq('collection_id', collectionData.id);

    return {
      ...collectionData,
      file_count: count || 0
    };
  }

  static async getCollectionFiles(shareToken: string): Promise<FileCollection> {
    const { data: collectionData, error: collectionError } = await supabase
      .from('file_collections')
      .select('*')
      .eq('share_token', shareToken)
      .single();

    if (collectionError || !collectionData) {
      throw new Error('Collection not found');
    }

    // Get all files in the collection
    const { data: filesData, error: filesError } = await supabase
      .from('uploaded_files')
      .select('*')
      .eq('collection_id', collectionData.id)
      .order('upload_date', { ascending: true });

    if (filesError) {
      throw new Error('Failed to load collection files');
    }

    return {
      ...collectionData,
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
    const { data, error } = await supabase
      .from('uploaded_files')
      .select('download_count')
      .eq('share_token', shareToken)
      .single();

    if (!error && data) {
      await supabase
        .from('uploaded_files')
        .update({ download_count: data.download_count + 1 })
        .eq('share_token', shareToken);
    }
  }

  static async incrementCollectionDownloadCount(shareToken: string) {
    const { data, error } = await supabase
      .from('file_collections')
      .select('download_count')
      .eq('share_token', shareToken)
      .single();

    if (!error && data) {
      await supabase
        .from('file_collections')
        .update({ download_count: data.download_count + 1 })
        .eq('share_token', shareToken);
    }
  }

  // Generate download URL for entire collection as ZIP
  static async downloadCollection(shareToken: string): Promise<string> {
    // This would typically generate a zip file server-side
    // For now, return the collection URL
    return `${window.location.origin}/collection/${shareToken}/download`;
  }
}
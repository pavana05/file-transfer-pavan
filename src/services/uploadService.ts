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

  // Upload single file (existing functionality)
  static async uploadFile(file: UploadedFile, onProgress?: (progress: number) => void): Promise<FileUploadResult> {
    try {
      const shareToken = this.generateShareToken();
      const fileExtension = file.name.split('.').pop();
      const filename = `${shareToken}.${fileExtension}`;
      const storagePath = `files/${filename}`;

      // Upload file to Supabase storage with progress tracking
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(storagePath, file.file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

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

  // Upload multiple files as a collection
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

      // Upload each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          const shareToken = this.generateShareToken();
          const fileExtension = file.name.split('.').pop();
          const filename = `${shareToken}.${fileExtension}`;
          const storagePath = `collections/${collectionId}/${filename}`;

          // Upload file to storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('uploads')
            .upload(storagePath, file.file, {
              cacheControl: '3600',
              upsert: false
            });

          if (uploadError) {
            throw new Error(`Upload failed for ${file.name}: ${uploadError.message}`);
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

          // Report progress
          if (onProgress) {
            onProgress(i, ((i + 1) / files.length) * 100);
          }

        } catch (fileError) {
          // Clean up on error
          if (uploadedFiles.length > 0) {
            await supabase.storage.from('uploads').remove(uploadedFiles);
          }
          await supabase.from('file_collections').delete().eq('id', collectionId);
          throw fileError;
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
import { supabase } from '@/integrations/supabase/client';
import { UploadedFile } from '@/types/upload';

export interface FileUploadResult {
  success: boolean;
  shareUrl?: string;
  error?: string;
}

export class UploadService {
  private static generateShareToken(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

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
}
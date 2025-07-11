-- Update storage bucket to allow HTML files
UPDATE storage.buckets 
SET allowed_mime_types = ARRAY[
  -- Images
  'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp', 'image/tiff',
  -- Documents  
  'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain', 'text/csv', 'application/rtf',
  -- Code files (including HTML)
  'text/html', 'text/css', 'text/javascript', 'application/javascript', 'application/json', 
  'text/xml', 'application/xml', 'text/markdown', 'application/x-python-code', 'text/x-python',
  'text/x-java-source', 'text/x-c', 'text/x-c++src', 'text/x-csharp', 'text/x-php', 
  'text/x-ruby', 'text/x-go', 'text/x-rust', 'text/x-swift', 'application/typescript', 
  'text/typescript', 'application/x-yaml', 'text/yaml',
  -- Media
  'video/mp4', 'video/webm', 'video/mov', 'video/avi', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/aac',
  -- Archives
  'application/zip', 'application/x-rar-compressed', 'application/x-tar', 'application/gzip', 'application/x-7z-compressed'
]
WHERE id = 'uploads';
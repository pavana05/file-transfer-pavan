/**
 * File Encryption Utilities
 * Implements AES-GCM encryption for files at rest
 */

// Generate a random encryption key
export async function generateEncryptionKey(): Promise<CryptoKey> {
  return await crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true, // extractable
    ['encrypt', 'decrypt']
  );
}

// Export key to storable format (base64)
export async function exportKey(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey('raw', key);
  return btoa(String.fromCharCode(...new Uint8Array(exported)));
}

// Import key from stored format
export async function importKey(keyString: string): Promise<CryptoKey> {
  const keyData = Uint8Array.from(atob(keyString), c => c.charCodeAt(0));
  return await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

// Encrypt a file
export async function encryptFile(
  file: File,
  key: CryptoKey
): Promise<{ encryptedData: ArrayBuffer; iv: Uint8Array }> {
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for AES-GCM
  const fileBuffer = await file.arrayBuffer();

  const encryptedData = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    fileBuffer
  );

  return { encryptedData, iv };
}

// Decrypt file data
export async function decryptFile(
  encryptedData: ArrayBuffer,
  key: CryptoKey,
  iv: Uint8Array
): Promise<ArrayBuffer> {
  // Create a new ArrayBuffer copy to ensure compatibility
  const ivBuffer = new Uint8Array(iv.buffer.slice(iv.byteOffset, iv.byteOffset + iv.byteLength));
  return await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: ivBuffer as unknown as BufferSource,
    },
    key,
    encryptedData
  );
}

// Create encrypted blob from file
export async function createEncryptedBlob(
  file: File,
  key: CryptoKey
): Promise<{ blob: Blob; iv: string; encryptionKey: string }> {
  const { encryptedData, iv } = await encryptFile(file, key);
  const exportedKey = await exportKey(key);
  
  // Combine IV and encrypted data into a single blob
  const ivBytes = new Uint8Array(iv);
  const combinedBuffer = new ArrayBuffer(ivBytes.length + encryptedData.byteLength);
  const combinedArray = new Uint8Array(combinedBuffer);
  combinedArray.set(ivBytes, 0);
  combinedArray.set(new Uint8Array(encryptedData), ivBytes.length);
  
  return {
    blob: new Blob([combinedBuffer], { type: 'application/octet-stream' }),
    iv: btoa(String.fromCharCode(...ivBytes)),
    encryptionKey: exportedKey
  };
}

// Decrypt blob back to original file
export async function decryptBlob(
  encryptedBlob: Blob,
  keyString: string,
  originalType: string,
  originalName: string
): Promise<File> {
  const key = await importKey(keyString);
  const buffer = await encryptedBlob.arrayBuffer();
  
  // Extract IV (first 12 bytes)
  const iv = new Uint8Array(buffer.slice(0, 12));
  const encryptedData = buffer.slice(12);
  
  const decryptedData = await decryptFile(encryptedData, key, iv);
  
  return new File([decryptedData], originalName, { type: originalType });
}

// Derive key from password using PBKDF2
export async function deriveKeyFromPassword(
  password: string,
  salt?: Uint8Array
): Promise<{ key: CryptoKey; salt: Uint8Array }> {
  const encoder = new TextEncoder();
  const passwordData = encoder.encode(password);
  
  // Generate or use provided salt
  const saltBytes = salt || crypto.getRandomValues(new Uint8Array(16));
  
  // Import password as key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordData,
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );
  
  // Derive AES key using PBKDF2
  const saltBuffer = new Uint8Array(saltBytes.buffer.slice(saltBytes.byteOffset, saltBytes.byteOffset + saltBytes.byteLength));
  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBuffer as unknown as BufferSource,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
  
  return { key: derivedKey, salt: saltBytes };
}

// Encrypt file with password
export async function encryptFileWithPassword(
  file: File,
  password: string
): Promise<{ blob: Blob; salt: string; metadata: EncryptedFileMetadata }> {
  const { key, salt } = await deriveKeyFromPassword(password);
  const { encryptedData, iv } = await encryptFile(file, key);
  
  // Combine salt, IV, and encrypted data
  const combinedBuffer = new ArrayBuffer(16 + 12 + encryptedData.byteLength);
  const combinedArray = new Uint8Array(combinedBuffer);
  combinedArray.set(salt, 0);
  combinedArray.set(iv, 16);
  combinedArray.set(new Uint8Array(encryptedData), 28);
  
  const metadata: EncryptedFileMetadata = {
    originalName: file.name,
    originalType: file.type,
    originalSize: file.size,
    encryptedAt: new Date().toISOString(),
    algorithm: 'AES-256-GCM',
    keyDerivation: 'PBKDF2-SHA256-100000'
  };
  
  return {
    blob: new Blob([combinedBuffer], { type: 'application/encrypted' }),
    salt: btoa(String.fromCharCode(...salt)),
    metadata
  };
}

// Decrypt file with password
export async function decryptFileWithPassword(
  encryptedBlob: Blob,
  password: string,
  metadata: EncryptedFileMetadata
): Promise<File> {
  const buffer = await encryptedBlob.arrayBuffer();
  
  // Extract salt (first 16 bytes), IV (next 12 bytes), and encrypted data
  const salt = new Uint8Array(buffer.slice(0, 16));
  const iv = new Uint8Array(buffer.slice(16, 28));
  const encryptedData = buffer.slice(28);
  
  const { key } = await deriveKeyFromPassword(password, salt);
  const decryptedData = await decryptFile(encryptedData, key, iv);
  
  return new File([decryptedData], metadata.originalName, { type: metadata.originalType });
}

// Metadata interface for encrypted files
export interface EncryptedFileMetadata {
  originalName: string;
  originalType: string;
  originalSize: number;
  encryptedAt: string;
  algorithm: string;
  keyDerivation: string;
}

// Check if Web Crypto API is available
export function isEncryptionSupported(): boolean {
  return typeof crypto !== 'undefined' && 
         typeof crypto.subtle !== 'undefined' &&
         typeof crypto.subtle.encrypt === 'function';
}

// Generate secure random bytes (for nonce, salt, etc.)
export function generateSecureRandom(length: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(length));
}

// Hash data using SHA-256
export async function hashData(data: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Calculate file checksum for integrity verification
export async function calculateFileChecksum(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  return await hashData(buffer);
}

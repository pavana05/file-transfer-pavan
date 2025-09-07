// Security utilities for client-side validation and sanitization
export class SecurityUtils {
  // File type validation - matches server-side validation
  private static readonly ALLOWED_FILE_TYPES = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf', 'text/plain', 'application/json',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'video/mp4', 'video/webm', 'audio/mpeg', 'audio/wav'
  ];

  private static readonly MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
  private static readonly MAX_FILENAME_LENGTH = 255;

  /**
   * Validates file before upload
   */
  static validateFile(file: File): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      errors.push(`File size exceeds 50MB limit (${(file.size / 1024 / 1024).toFixed(1)}MB)`);
    }

    // Check file type
    if (!this.ALLOWED_FILE_TYPES.includes(file.type)) {
      errors.push(`File type "${file.type}" is not allowed`);
    }

    // Check filename length
    if (file.name.length > this.MAX_FILENAME_LENGTH) {
      errors.push(`Filename is too long (max ${this.MAX_FILENAME_LENGTH} characters)`);
    }

    // Check for potentially dangerous filenames
    if (this.hasDangerousFilename(file.name)) {
      errors.push('Filename contains invalid characters');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Sanitizes filename for security
   */
  static sanitizeFilename(filename: string): string {
    return filename
      .replace(/[<>:"|?*\x00-\x1f]/g, '') // Remove dangerous characters
      .replace(/\.\./g, '') // Remove path traversal attempts
      .replace(/^\.+/, '') // Remove leading dots
      .slice(0, this.MAX_FILENAME_LENGTH) // Limit length
      .trim();
  }

  /**
   * Checks for dangerous filename patterns
   */
  private static hasDangerousFilename(filename: string): boolean {
    const dangerousPatterns = [
      /\.\./,           // Path traversal
      /\x00/,           // Null bytes
      /[<>:"|?*]/,      // Windows reserved characters
      /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i, // Windows reserved names
    ];

    return dangerousPatterns.some(pattern => pattern.test(filename));
  }

  /**
   * Validates room ID for nearby share
   */
  static validateRoomId(roomId: string): { isValid: boolean; error?: string } {
    if (!roomId || roomId.length === 0) {
      return { isValid: false, error: 'Room ID is required' };
    }

    if (roomId.length > 50) {
      return { isValid: false, error: 'Room ID is too long (max 50 characters)' };
    }

    if (!/^[a-zA-Z0-9-]+$/.test(roomId)) {
      return { isValid: false, error: 'Room ID can only contain letters, numbers, and hyphens' };
    }

    return { isValid: true };
  }

  /**
   * Validates device name for nearby share
   */
  static validateDeviceName(deviceName: string): { isValid: boolean; error?: string } {
    if (!deviceName || deviceName.length === 0) {
      return { isValid: false, error: 'Device name is required' };
    }

    if (deviceName.length > 50) {
      return { isValid: false, error: 'Device name is too long (max 50 characters)' };
    }

    // Allow alphanumeric characters, spaces, and common punctuation
    if (!/^[a-zA-Z0-9\s\-_'.]+$/.test(deviceName)) {
      return { isValid: false, error: 'Device name contains invalid characters' };
    }

    return { isValid: true };
  }

  /**
   * Rate limiting helper for client-side
   */
  static checkClientRateLimit(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const windowKey = `rate_limit_${key}`;
    const attempts = JSON.parse(localStorage.getItem(windowKey) || '[]') as number[];
    
    // Filter attempts within the window
    const recentAttempts = attempts.filter(time => now - time < windowMs);
    
    if (recentAttempts.length >= maxRequests) {
      return false; // Rate limit exceeded
    }

    // Add current attempt and store
    recentAttempts.push(now);
    localStorage.setItem(windowKey, JSON.stringify(recentAttempts));
    
    return true;
  }

  /**
   * Sanitizes input for display to prevent XSS
   */
  static sanitizeForDisplay(input: string): string {
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  /**
   * Generates a secure random string for client-side use
   */
  static generateSecureId(length: number = 16): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    
    for (let i = 0; i < length; i++) {
      result += chars[array[i] % chars.length];
    }
    
    return result;
  }

  /**
   * Validates PIN format
   */
  static validatePin(pin: string): { isValid: boolean; error?: string } {
    if (!pin || pin.length !== 4) {
      return { isValid: false, error: 'PIN must be exactly 4 digits' };
    }

    if (!/^\d{4}$/.test(pin)) {
      return { isValid: false, error: 'PIN must contain only numbers' };
    }

    return { isValid: true };
  }
}
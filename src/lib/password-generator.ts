/**
 * Generate a secure random password
 */
export const generateSecurePassword = (
  length: number = 16,
  options: {
    includeUppercase?: boolean;
    includeLowercase?: boolean;
    includeNumbers?: boolean;
    includeSymbols?: boolean;
  } = {}
): string => {
  const {
    includeUppercase = true,
    includeLowercase = true,
    includeNumbers = true,
    includeSymbols = true,
  } = options;

  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  let charset = '';
  let password = '';
  const requirements: string[] = [];

  if (includeUppercase) {
    charset += uppercase;
    requirements.push(uppercase);
  }
  if (includeLowercase) {
    charset += lowercase;
    requirements.push(lowercase);
  }
  if (includeNumbers) {
    charset += numbers;
    requirements.push(numbers);
  }
  if (includeSymbols) {
    charset += symbols;
    requirements.push(symbols);
  }

  if (charset === '') {
    throw new Error('At least one character type must be included');
  }

  // Ensure at least one character from each required category
  requirements.forEach(req => {
    password += req.charAt(Math.floor(Math.random() * req.length));
  });

  // Fill the rest with random characters from the full charset
  for (let i = password.length; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }

  // Shuffle the password to avoid predictable patterns
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
};

/**
 * Calculate password strength score (0-100)
 */
export const calculatePasswordStrength = (password: string): number => {
  if (!password) return 0;

  let score = 0;

  // Length bonus
  if (password.length >= 8) score += 20;
  if (password.length >= 12) score += 10;
  if (password.length >= 16) score += 10;

  // Character variety
  if (/[a-z]/.test(password)) score += 15;
  if (/[A-Z]/.test(password)) score += 15;
  if (/[0-9]/.test(password)) score += 15;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 15;

  return Math.min(score, 100);
};

/**
 * Validate password meets minimum requirements
 */
export const validatePassword = (
  password: string,
  minLength: number = 8
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`);
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Environment variable configuration and validation
 */

/**
 * Get JWT secret with validation
 * @throws Error if JWT_SECRET is insecure in production
 */
export function getJWTSecret(): string {
  const secret = process.env.JWT_SECRET || 'secret';
  
  // In production, enforce a strong secret
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.JWT_SECRET || secret === 'secret' || secret.length < 32) {
      throw new Error(
        'JWT_SECRET must be set to a strong random string (minimum 32 characters) in production. ' +
        'Current value is insecure.'
      );
    }
  }
  
  return secret;
}

/**
 * Get JWT expiration time
 */
export function getJWTExpiresIn(): string {
  return process.env.JWT_EXPIRES_IN || '7d';
}

/**
 * Validate critical environment variables
 * @returns Object with errors and warnings arrays
 */
export function validateEnv(): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required variables
  if (!process.env.DB_NAME) {
    errors.push('DB_NAME is required');
  }
  if (!process.env.DB_USER) {
    errors.push('DB_USER is required');
  }

  // Production security checks
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'secret' || process.env.JWT_SECRET.length < 32) {
      errors.push(
        'JWT_SECRET must be set to a strong random string (minimum 32 characters) in production'
      );
    }
  } else {
    // Development warnings
    const jwtSecret = process.env.JWT_SECRET || 'secret';
    if (jwtSecret === 'secret' || jwtSecret.length < 32) {
      warnings.push(
        '⚠️  JWT_SECRET is using an insecure default value. Change this before production deployment!'
      );
    }
  }

  // Optional but recommended
  if (!process.env.BREVO_API_KEY) {
    warnings.push('BREVO_API_KEY not set - email notifications will not work');
  }

  return { errors, warnings };
}


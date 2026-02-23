// Environment variable validation and configuration

import { z } from 'zod';

// Define the schema for environment variables
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // NextAuth
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must be a valid URL').optional(),
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET must be at least 32 characters').optional(),

  // Email configuration
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),

  // File storage
  BLOB_READ_WRITE_TOKEN: z.string().optional(),

  // API Keys
  GOOGLE_MAPS_API_KEY: z.string().optional(),

  // App configuration
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000'),

  // Feature flags
  ENABLE_ANALYTICS: z.string().transform(val => val === 'true').default('false'),
  ENABLE_PERFORMANCE_MONITORING: z.string().transform(val => val === 'true').default('false'),

  // Security
  ALLOWED_ORIGINS: z.string().optional(),
});

// Parse and validate environment variables
function validateEnv() {
  try {
    const env = envSchema.parse(process.env);
    return env;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      throw new Error(`Environment validation failed:\n${missingVars.join('\n')}`);
    }
    throw error;
  }
}

// Export validated environment variables
export const env = validateEnv();

// Helper functions for environment checks
export const isDevelopment = env.NODE_ENV === 'development';
export const isProduction = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';

// Database configuration
export const dbConfig = {
  url: env.DATABASE_URL,
  // Add connection pooling settings
  connectionLimit: isProduction ? 20 : 5,
  acquireTimeout: 60000,
  timeout: 60000,
};

// Email configuration
export const emailConfig = {
  host: env.SMTP_HOST,
  port: env.SMTP_PORT ? parseInt(env.SMTP_PORT) : 587,
  user: env.SMTP_USER,
  pass: env.SMTP_PASS,
  enabled: !!(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS),
};

// NextAuth configuration
export const authConfig = {
  url: env.NEXTAUTH_URL || `http://localhost:${env.PORT}`,
  secret: env.NEXTAUTH_SECRET,
};

// Feature flags
export const features = {
  analytics: env.ENABLE_ANALYTICS,
  performanceMonitoring: env.ENABLE_PERFORMANCE_MONITORING,
};

// Security configuration
export const securityConfig = {
  allowedOrigins: env.ALLOWED_ORIGINS?.split(',') || [],
  corsEnabled: isProduction,
};

// Logging configuration
export const logConfig = {
  level: isDevelopment ? 'debug' : 'info',
  enableConsole: isDevelopment,
  enableFile: isProduction,
};

// Build-time validation
if (typeof window === 'undefined') {
  // Server-side validation
  console.log('✅ Environment variables validated successfully');

  if (isDevelopment) {
    console.log('🔧 Running in development mode');
  } else if (isProduction) {
    console.log('🚀 Running in production mode');
  }
}
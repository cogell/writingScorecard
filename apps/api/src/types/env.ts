export interface Env {
  // Bindings - uncomment as phases are implemented
  // DB: D1Database;  // Phase 3: Persistence
  // UPLOADS: R2Bucket;  // Phase 4: File Upload
  // STREAM_SESSION: DurableObjectNamespace;  // Phase 2: Streaming

  // Environment variables
  ENVIRONMENT: 'development' | 'production';

  // Secrets
  ANTHROPIC_API_KEY: string;
  CF_ACCESS_TEAM_DOMAIN?: string; // e.g., "myteam.cloudflareaccess.com"
  CF_ACCESS_AUD?: string; // Application Audience tag
}

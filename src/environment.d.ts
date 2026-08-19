declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PAYLOAD_SECRET: string
      DATABASE_URI: string
      NEXT_PUBLIC_SERVER_URL: string
      VERCEL_PROJECT_PRODUCTION_URL: string
      CRON_SECRET: string
      PREVIEW_SECRET: string
      STRIPE_SECRET_KEY?: string
      STRIPE_PUBLISHABLE_KEY?: string
      STRIPE_WEBHOOK_SECRET?: string
      SMTP_USER?: string
      SMTP_PASS?: string
      EMAIL_FROM_NAME?: string
      COMMANDES_EMAIL?: string
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {}

import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { magicLink } from 'better-auth/plugins';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from './db/auth.schema';

const APP_NAME = 'FAST Writing Scorecard';
const RESEND_ENDPOINT = 'https://api.resend.com/emails';

export interface AuthEnv {
  DB: D1Database;
  BETTER_AUTH_SECRET: string;
  RESEND_API_KEY: string;
  RESEND_FROM_EMAIL: string;
  RESEND_FROM_NAME?: string;
  BETTER_AUTH_URL?: string;
  ADMIN_NOTIFY_EMAILS?: string;
}

async function sendMagicLinkEmail(env: AuthEnv, email: string, url: string) {
  const fromName = env.RESEND_FROM_NAME || APP_NAME;
  const fromAddress = env.RESEND_FROM_EMAIL;
  const from = fromAddress.includes('<')
    ? fromAddress
    : `${fromName} <${fromAddress}>`;

  const response = await fetch(RESEND_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject: 'Your sign-in link',
      text: `Use this link to sign in: ${url}`,
      html: `
        <div style="font-family: ui-sans-serif, system-ui; line-height: 1.5;">
          <p>Use the link below to sign in:</p>
          <p><a href="${url}">${url}</a></p>
          <p>If you did not request this, you can ignore this email.</p>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Resend error: ${response.status} ${detail}`);
  }
}

async function sendNewUserNotification(env: AuthEnv, userEmail: string) {
  const adminEmails = env.ADMIN_NOTIFY_EMAILS;
  if (!adminEmails) return;

  const recipients = adminEmails.split(',').map((e) => e.trim()).filter(Boolean);
  if (recipients.length === 0) return;

  const fromName = env.RESEND_FROM_NAME || APP_NAME;
  const fromAddress = env.RESEND_FROM_EMAIL;
  const from = fromAddress.includes('<')
    ? fromAddress
    : `${fromName} <${fromAddress}>`;

  const response = await fetch(RESEND_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: recipients,
      subject: `New user signup: ${userEmail}`,
      text: `A new user has signed up for ${APP_NAME}: ${userEmail}`,
      html: `
        <div style="font-family: ui-sans-serif, system-ui; line-height: 1.5;">
          <p>A new user has signed up for <strong>${APP_NAME}</strong>:</p>
          <p><strong>${userEmail}</strong></p>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    const responseBody = await response.text();
    throw new Error(`Resend error: ${response.status} ${responseBody}`);
  }
}

export function createAuth(env: AuthEnv, request: Request) {
  const db = drizzle(env.DB, { schema });
  const baseURL = env.BETTER_AUTH_URL || new URL(request.url).origin;

  return betterAuth({
    appName: APP_NAME,
    baseURL,
    secret: env.BETTER_AUTH_SECRET,
    database: drizzleAdapter(db, { provider: 'sqlite', schema }),
    trustedOrigins: [
      'http://localhost:5173',
      'http://localhost:8787',
    ],
    user: {
      additionalFields: {
        role: {
          type: 'string',
          defaultValue: 'user',
          input: false,
        },
      },
    },
    databaseHooks: {
      user: {
        create: {
          after: async (user) => {
            sendNewUserNotification(env, user.email).catch(console.error);
          },
        },
      },
    },
    plugins: [
      magicLink({
        sendMagicLink: async ({ email, url }) => {
          await sendMagicLinkEmail(env, email, url);
        },
      }),
    ],
  });
}

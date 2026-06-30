// Vercel serverless function — per-user lesson progress, backed by Upstash Redis.
// Auth: every request must carry a Clerk session token (Authorization: Bearer <token>),
// verified server-side against CLERK_SECRET_KEY. We never trust a client-supplied user id.
//
// Required env vars (set via `vercel env add ...`):
//   CLERK_SECRET_KEY            — Clerk dashboard → API Keys
//   UPSTASH_REDIS_REST_URL      — Upstash dashboard → REST API
//   UPSTASH_REDIS_REST_TOKEN    — Upstash dashboard → REST API

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyToken } from '@clerk/backend';
import { Redis } from '@upstash/redis';

// `moduleId/lessonId` — alphanumeric segments with dashes/underscores only.
const LESSON_KEY_RE = /^[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+$/;

let redis: Redis | null = null;
function getRedis(): Redis {
  if (!redis) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }
  return redis;
}

async function authenticate(req: VercelRequest): Promise<string | null> {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return null;
  const token = header.slice('Bearer '.length).trim();
  if (!token) return null;

  const { data, errors } = await verifyToken(token, {
    secretKey: process.env.CLERK_SECRET_KEY,
  });
  if (errors || !data?.sub) return null;
  return data.sub;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!process.env.CLERK_SECRET_KEY || !process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return res.status(500).json({ error: 'Progress storage is not configured on the server' });
  }

  const userId = await authenticate(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const key = `progress:${userId}`;

  if (req.method === 'GET') {
    const completed = await getRedis().smembers(key);
    return res.status(200).json({ completed });
  }

  if (req.method === 'POST') {
    const body = (typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body) ?? {};
    const { lessonKey, completed } = body as { lessonKey?: unknown; completed?: unknown };

    if (typeof lessonKey !== 'string' || !LESSON_KEY_RE.test(lessonKey)) {
      return res.status(400).json({ error: 'Invalid lessonKey' });
    }

    if (completed) {
      await getRedis().sadd(key, lessonKey);
    } else {
      await getRedis().srem(key, lessonKey);
    }
    return res.status(204).end();
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'Method not allowed' });
}

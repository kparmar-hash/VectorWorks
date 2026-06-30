// Vercel serverless function — proxies requests to NVIDIA NIM.
// Runs server-side, so it bypasses browser CORS restrictions.
// API key is stored in NVIDIA_NIM_API_KEY (server-only, not exposed to the browser).
// Deploy: `vercel env add NVIDIA_NIM_API_KEY` in the Vercel dashboard or CLI.

import type { VercelRequest, VercelResponse } from '@vercel/node';

const NIM_BASE = 'https://integrate.api.nvidia.com/v1';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST (chat completions)
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.NVIDIA_NIM_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'NVIDIA_NIM_API_KEY not configured on server' });
  }

  try {
    const upstream = await fetch(`${NIM_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(req.body),
    });

    // Stream the response back directly
    res.status(upstream.status);
    res.setHeader('Content-Type', upstream.headers.get('content-type') ?? 'application/json');

    if (!upstream.body) {
      return res.end();
    }

    const reader = upstream.body.getReader();
    const write = () =>
      reader.read().then(({ done, value }) => {
        if (done) { res.end(); return; }
        res.write(value);
        write();
      });
    write();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(502).json({ error: `Upstream error: ${message}` });
  }
}

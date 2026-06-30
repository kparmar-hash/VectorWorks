import { AI_CONFIG } from './config';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface NimChunk {
  choices?: { delta?: { content?: string } }[];
}

// All requests go through /api/nim — a same-origin proxy endpoint that
// avoids browser CORS restrictions on the NVIDIA NIM API.
//   • Dev:  Vite proxies /api/nim → https://integrate.api.nvidia.com/v1
//   • Prod: Vercel serverless function at api/nim.ts handles it server-side
const PROXY_ENDPOINT = '/api/nim';

export async function* streamChat(
  messages: ChatMessage[],
  pageContext?: string,
): AsyncGenerator<string, void, unknown> {
  const contextualMessages: Array<{ role: string; content: string }> = [];
  if (pageContext) {
    contextualMessages.push({
      role: 'system',
      content: `The student is currently viewing: ${pageContext}`,
    });
  }
  contextualMessages.push(...messages);

  const response = await fetch(PROXY_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: AI_CONFIG.model,
      messages: [
        { role: 'system', content: AI_CONFIG.systemPrompt },
        ...contextualMessages,
      ],
      max_tokens: AI_CONFIG.maxTokens,
      temperature: AI_CONFIG.temperature,
      stream: true,
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => response.statusText);
    throw new Error(`NIM API ${response.status}: ${text}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body from proxy');

  const decoder = new TextDecoder();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const raw = decoder.decode(value, { stream: true });
      for (const line of raw.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data: ')) continue;
        const data = trimmed.slice(6);
        if (data === '[DONE]') return;
        try {
          const parsed = JSON.parse(data) as NimChunk;
          const content = parsed.choices?.[0]?.delta?.content ?? '';
          if (content) yield content;
        } catch {
          // skip malformed SSE chunks
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

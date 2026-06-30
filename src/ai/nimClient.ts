import { AI_CONFIG } from './config';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface NimChunk {
  choices?: { delta?: { content?: string } }[];
}

// Stream a chat completion from NVIDIA NIM.
// Yields text chunks as they arrive (SSE streaming).
export async function* streamChat(
  messages: ChatMessage[],
  pageContext?: string,
): AsyncGenerator<string, void, unknown> {
  if (!AI_CONFIG.apiKey) {
    throw new Error('No NVIDIA NIM API key configured. Add VITE_NVIDIA_NIM_API_KEY to your .env file.');
  }

  // Prepend page context as a system-style user prefix when provided
  const contextualMessages: Array<{ role: string; content: string }> = [];
  if (pageContext) {
    contextualMessages.push({
      role: 'system',
      content: `The student is currently viewing: ${pageContext}`,
    });
  }
  contextualMessages.push(...messages);

  // Use the Vite dev proxy (/api/nim → https://integrate.api.nvidia.com/v1)
  // to avoid browser CORS restrictions on the NIM API.
  const endpoint = import.meta.env.DEV
    ? '/api/nim/chat/completions'
    : `${AI_CONFIG.baseUrl}/chat/completions`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${AI_CONFIG.apiKey}`,
    },
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
  if (!reader) throw new Error('No response body from NIM API');

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

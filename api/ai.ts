export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GROQ_API_KEY not configured on server' });
  }

  const { messages, system } = req.body as {
    messages: { role: 'user' | 'assistant'; content: string }[];
    system: string;
  };

  const upstream = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'authorization': `Bearer ${apiKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      max_tokens: 1024,
      messages: [
        { role: 'system', content: system },
        ...messages,
      ],
    }),
  });

  const data = await upstream.json() as any;

  if (!upstream.ok) {
    const msg = data?.error?.message ?? `Fehler ${upstream.status}`;
    return res.status(upstream.status).json({ error: msg });
  }

  // Normalize to Anthropic-style response so aiService.ts needs no changes
  const text: string = data.choices?.[0]?.message?.content ?? '';
  return res.status(200).json({ content: [{ text }] });
}

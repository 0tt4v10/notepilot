export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured on server' });
  }

  const { messages, system } = req.body as {
    messages: { role: 'user' | 'assistant'; content: string }[];
    system: string;
  };

  // Convert messages to Gemini format (assistant → model)
  const contents = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const upstream = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents,
        generationConfig: { maxOutputTokens: 1024 },
      }),
    }
  );

  const data = await upstream.json() as any;

  if (!upstream.ok) {
    const msg = data?.error?.message ?? `Fehler ${upstream.status}`;
    return res.status(upstream.status).json({ error: msg });
  }

  // Normalize to Anthropic-style response so aiService.ts needs no changes
  const text: string = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  return res.status(200).json({ content: [{ text }] });
}

const STORAGE_KEY = 'notepilot_api_key';

export const getApiKey = (): string => localStorage.getItem(STORAGE_KEY) ?? '';
export const saveApiKey = (key: string): void => localStorage.setItem(STORAGE_KEY, key);

async function post(messages: { role: 'user' | 'assistant'; content: string }[], system: string): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('Kein API-Schlüssel. Bitte in den Einstellungen hinterlegen.');

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-allow-browser': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system,
      messages,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: { message?: string } };
    throw new Error(err?.error?.message ?? `API-Fehler ${res.status}`);
  }

  const data = await res.json() as { content: { text: string }[] };
  return data.content[0]?.text ?? '';
}

const BASE_SYSTEM = `Du bist NotePilot, ein intelligenter Lernassistent.
Antworte immer auf Deutsch. Sei präzise und lernförderlich.`;

export async function summarize(noteText: string): Promise<string> {
  return post(
    [{ role: 'user', content: `Fasse diese Notiz klar und strukturiert zusammen. Verwende Stichpunkte:\n\n${noteText}` }],
    BASE_SYSTEM
  );
}

export async function generateExamQuestions(noteText: string): Promise<string> {
  return post(
    [{ role: 'user', content: `Erstelle 5–8 Prüfungsfragen (mix aus offen und Multiple Choice) zu diesen Notizen. Füge die Antworten am Ende hinzu:\n\n${noteText}` }],
    BASE_SYSTEM
  );
}

export async function findGaps(noteText: string): Promise<string> {
  return post(
    [{ role: 'user', content: `Analysiere diese Notizen auf Wissenslücken, unklare Stellen und fehlende wichtige Themen. Gib konkrete Empfehlungen:\n\n${noteText}` }],
    BASE_SYSTEM
  );
}

export async function chat(
  noteText: string,
  messages: { role: 'user' | 'assistant'; content: string }[]
): Promise<string> {
  return post(
    messages,
    `${BASE_SYSTEM}\n\nDer Nutzer hat folgende Notiz geöffnet – beziehe deine Antworten darauf:\n\n${noteText.slice(0, 4000)}`
  );
}

const OLLAMA_URL = import.meta.env.VITE_OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = import.meta.env.VITE_OLLAMA_MODEL || 'llama3.1';

async function post(messages: { role: 'user' | 'assistant'; content: string }[], system: string): Promise<string> {
  const res = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      stream: false,
      messages: [{ role: 'system', content: system }, ...messages],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(err?.error ?? `Ollama-Fehler ${res.status}`);
  }

  const data = await res.json() as { message: { content: string } };
  return data.message?.content ?? '';
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

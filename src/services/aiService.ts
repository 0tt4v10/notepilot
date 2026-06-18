async function callClaude(
  messages: { role: 'user' | 'assistant'; content: string }[],
  system: string
): Promise<string> {
  const res = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ messages, system }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: string | { message?: string } };
    const msg = typeof err.error === 'string' ? err.error : err.error?.message;
    throw new Error(msg ?? `Fehler ${res.status}`);
  }

  const data = await res.json() as { content: { text: string }[] };
  return data.content?.[0]?.text ?? '';
}

const BASE_SYSTEM = `Du bist NotePilot, ein intelligenter Lernassistent für Schweizer Schüler.
Antworte präzise, lernförderlich und auf der Sprache des Nutzers.`;

export async function summarize(noteText: string): Promise<string> {
  return callClaude(
    [{ role: 'user', content: `Fasse diese Notiz klar und strukturiert zusammen. Verwende Stichpunkte:\n\n${noteText}` }],
    BASE_SYSTEM
  );
}

export async function generateExamQuestions(noteText: string): Promise<string> {
  return callClaude(
    [{ role: 'user', content: `Erstelle 5–8 Prüfungsfragen (mix aus offen und Multiple Choice) zu diesen Notizen. Füge die Antworten am Ende hinzu:\n\n${noteText}` }],
    BASE_SYSTEM
  );
}

export async function findGaps(noteText: string): Promise<string> {
  return callClaude(
    [{ role: 'user', content: `Analysiere diese Notizen auf Wissenslücken, unklare Stellen und fehlende wichtige Themen. Gib konkrete Empfehlungen:\n\n${noteText}` }],
    BASE_SYSTEM
  );
}

export async function chat(
  noteText: string,
  messages: { role: 'user' | 'assistant'; content: string }[]
): Promise<string> {
  const system = noteText.trim()
    ? `${BASE_SYSTEM}\n\nDer Nutzer hat folgende Notiz geöffnet – beziehe deine Antworten darauf:\n\n${noteText.slice(0, 4000)}`
    : BASE_SYSTEM;
  return callClaude(messages, system);
}

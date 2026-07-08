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

export function getUserNotesContext(): string {
  try {
    const raw = localStorage.getItem('notepilot-notebooks');
    if (!raw) return '';
    const notebooks = JSON.parse(raw) as {
      name: string;
      sections: { name: string; pages: { title: string; content: string }[] }[];
    }[];
    const parts: string[] = [];
    for (const nb of notebooks) {
      for (const sec of nb.sections) {
        for (const pg of sec.pages) {
          const text = pg.content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
          const label = `[${nb.name} › ${sec.name} › ${pg.title}]`;
          parts.push(text ? `${label}\n${text.slice(0, 1500)}` : `${label}\n(leer)`);
        }
      }
    }
    return parts.slice(0, 15).join('\n\n');
  } catch {
    return '';
  }
}

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
  messages: { role: 'user' | 'assistant'; content: string }[]
): Promise<string> {
  const notesContext = getUserNotesContext();
  const system = notesContext
    ? `${BASE_SYSTEM}

WICHTIG: Du hast Zugriff auf die echten Notizen des Nutzers (unten aufgelistet).
- Wenn der Nutzer fragt was in seinen Notizen steht, zitiere NUR den tatsächlichen Inhalt – erfinde NICHTS dazu.
- Wenn eine Notiz leer oder kurz ist, sage das ehrlich.
- Ergänze eigenes Wissen nur wenn der Nutzer explizit darum bittet (z.B. "Erkläre mir das Thema").

Notizen des Nutzers:
${notesContext}`
    : BASE_SYSTEM;
  return callClaude(messages, system);
}

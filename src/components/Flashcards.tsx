import { useState } from 'react';
import { Layers, HelpCircle, RotateCcw, ChevronLeft, ChevronRight, Loader2, Sparkles, Check, X, Trophy, Bell } from 'lucide-react';
import { generateFlashcards, generateQuiz } from '../services/aiService';

interface FlashCard { front: string; back: string; }
interface QuizQ { question: string; options: string[]; correct: number; }

type Tab = 'cards' | 'quiz' | 'reminders';

function getNotesText(username: string): string {
  try {
    const raw = localStorage.getItem(`notepilot-notebooks-${username}`);
    if (!raw) return '';
    const nbs = JSON.parse(raw) as { sections: { pages: { content: string }[] }[] }[];
    return nbs.flatMap(nb => nb.sections.flatMap(s => s.pages.map(p =>
      p.content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    ))).join('\n\n').slice(0, 3000);
  } catch { return ''; }
}

function getTopics(username: string) {
  try {
    const raw = localStorage.getItem(`notepilot-topics-${username}`);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function addXp(username: string, amount: number) {
  const key = `notepilot-xp-${username}`;
  const cur = parseInt(localStorage.getItem(key) ?? '0');
  localStorage.setItem(key, String(cur + amount));
}

export default function Flashcards({ username }: { username: string }) {
  const [tab, setTab] = useState<Tab>('cards');

  // Flashcard state
  const [cards, setCards] = useState<FlashCard[]>([]);
  const [cardIdx, setCardIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [cardsLoading, setCardsLoading] = useState(false);
  const [cardsError, setCardsError] = useState('');

  // Quiz state
  const [questions, setQuestions] = useState<QuizQ[]>([]);
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizError, setQuizError] = useState('');

  const noNotes = !getNotesText(username);

  // ── Flashcards ──
  const handleGenerateCards = async () => {
    const text = getNotesText(username);
    if (!text) return;
    setCardsError('');
    setCardsLoading(true);
    try {
      const result = await generateFlashcards(text);
      if (!result.length) { setCardsError('KI konnte keine Karten erstellen. Mehr Notizen hinzufügen.'); }
      else { setCards(result); setCardIdx(0); setFlipped(false); }
    } catch { setCardsError('Fehler beim Laden. Bitte erneut versuchen.'); }
    setCardsLoading(false);
  };

  const nextCard = () => { setCardIdx(i => Math.min(i + 1, cards.length - 1)); setFlipped(false); };
  const prevCard = () => { setCardIdx(i => Math.max(i - 1, 0)); setFlipped(false); };

  // ── Quiz ──
  const handleGenerateQuiz = async () => {
    const text = getNotesText(username);
    if (!text) return;
    setQuizError('');
    setQuizLoading(true);
    try {
      const result = await generateQuiz(text);
      if (!result.length) { setQuizError('KI konnte kein Quiz erstellen. Mehr Notizen hinzufügen.'); }
      else { setQuestions(result); setQIdx(0); setSelected(null); setScore(0); setDone(false); }
    } catch { setQuizError('Fehler beim Laden. Bitte erneut versuchen.'); }
    setQuizLoading(false);
  };

  const handleAnswer = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === questions[qIdx].correct) setScore(s => s + 1);
  };

  const nextQuestion = () => {
    if (qIdx + 1 >= questions.length) {
      addXp(username, score * 10);
      setDone(true);
    } else {
      setQIdx(i => i + 1);
      setSelected(null);
    }
  };

  const resetQuiz = () => { setQuestions([]); setScore(0); setDone(false); setSelected(null); setQIdx(0); };

  // ── Reminders ──
  const topics = getTopics(username);
  const today = new Date();
  const upcoming = topics
    .map((t: any) => ({ ...t, daysLeft: Math.ceil((new Date(t.dueDate).getTime() - today.getTime()) / 86400000) }))
    .filter((t: any) => t.daysLeft <= 7 && !t.completed)
    .sort((a: any, b: any) => a.daysLeft - b.daysLeft);

  const tabs = [
    { id: 'cards' as Tab, label: 'Lernkarten', icon: Layers },
    { id: 'quiz' as Tab, label: 'Mini-Quiz', icon: HelpCircle },
    { id: 'reminders' as Tab, label: 'Erinnerungen', icon: Bell },
  ];

  return (
    <div className="flex-1 overflow-auto p-8 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Lernen</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Lernkarten, Quiz und Erinnerungen aus deinen Notizen</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-200 dark:bg-slate-700 rounded-xl p-1 mb-6">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition ${
                tab === id
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}>
              <Icon size={16} /> {label}
            </button>
          ))}
        </div>

        {/* ── LERNKARTEN ── */}
        {tab === 'cards' && (
          <div>
            {cards.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-8 text-center">
                <Layers size={48} className="mx-auto text-blue-300 dark:text-blue-700 mb-4" />
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  {noNotes ? 'Zuerst Notizen schreiben, dann Lernkarten generieren.' : 'KI erstellt Lernkarten aus deinen Notizen.'}
                </p>
                {cardsError && <p className="text-red-500 text-sm mb-4">{cardsError}</p>}
                <button onClick={handleGenerateCards} disabled={cardsLoading || noNotes}
                  className="flex items-center gap-2 mx-auto px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 transition font-medium">
                  {cardsLoading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                  {cardsLoading ? 'Generiere...' : 'Lernkarten erstellen'}
                </button>
              </div>
            ) : (
              <div>
                <div className="text-center text-sm text-slate-400 dark:text-slate-500 mb-3">
                  {cardIdx + 1} / {cards.length} — Klicke auf die Karte zum Umdrehen
                </div>

                {/* Flip card */}
                <div className="relative h-56 cursor-pointer mb-4" onClick={() => setFlipped(f => !f)}
                  style={{ perspective: '1000px' }}>
                  <div className={`absolute inset-0 transition-transform duration-500`}
                    style={{ transformStyle: 'preserve-3d', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
                    {/* Front */}
                    <div className="absolute inset-0 bg-white dark:bg-slate-800 rounded-2xl shadow-lg flex items-center justify-center p-8"
                      style={{ backfaceVisibility: 'hidden' }}>
                      <div className="text-center">
                        <p className="text-xs font-semibold text-blue-400 uppercase tracking-wide mb-3">Begriff</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{cards[cardIdx].front}</p>
                      </div>
                    </div>
                    {/* Back */}
                    <div className="absolute inset-0 bg-blue-500 rounded-2xl shadow-lg flex items-center justify-center p-8"
                      style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                      <div className="text-center">
                        <p className="text-xs font-semibold text-blue-200 uppercase tracking-wide mb-3">Antwort</p>
                        <p className="text-lg text-white font-medium">{cards[cardIdx].back}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <button onClick={prevCard} disabled={cardIdx === 0}
                    className="flex items-center gap-1 px-4 py-2 rounded-lg bg-white dark:bg-slate-800 shadow text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-30 transition">
                    <ChevronLeft size={18} /> Zurück
                  </button>
                  <button onClick={() => { setCards([]); setCardsError(''); }}
                    className="flex items-center gap-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm transition">
                    <RotateCcw size={14} /> Neu generieren
                  </button>
                  <button onClick={nextCard} disabled={cardIdx === cards.length - 1}
                    className="flex items-center gap-1 px-4 py-2 rounded-lg bg-white dark:bg-slate-800 shadow text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-30 transition">
                    Weiter <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── QUIZ ── */}
        {tab === 'quiz' && (
          <div>
            {questions.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-8 text-center">
                <HelpCircle size={48} className="mx-auto text-purple-300 dark:text-purple-700 mb-4" />
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  {noNotes ? 'Zuerst Notizen schreiben, dann Quiz starten.' : 'KI erstellt 5 Fragen aus deinen Notizen.'}
                </p>
                {quizError && <p className="text-red-500 text-sm mb-4">{quizError}</p>}
                <button onClick={handleGenerateQuiz} disabled={quizLoading || noNotes}
                  className="flex items-center gap-2 mx-auto px-6 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 disabled:opacity-50 transition font-medium">
                  {quizLoading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                  {quizLoading ? 'Generiere...' : 'Quiz starten'}
                </button>
              </div>
            ) : done ? (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-8 text-center">
                <Trophy size={56} className="mx-auto text-yellow-400 mb-4" />
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Quiz abgeschlossen!</h3>
                <p className="text-5xl font-bold text-purple-500 my-4">{score}/{questions.length}</p>
                <p className="text-slate-500 dark:text-slate-400 mb-2">
                  {score === questions.length ? 'Perfekt! Alle richtig!' :
                   score >= questions.length / 2 ? 'Gut gemacht!' : 'Weiter üben!'}
                </p>
                <p className="text-sm text-yellow-500 font-medium mb-6">+{score * 10} XP verdient</p>
                <button onClick={resetQuiz}
                  className="flex items-center gap-2 mx-auto px-6 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition font-medium">
                  <RotateCcw size={16} /> Neues Quiz
                </button>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-slate-400">Frage {qIdx + 1} von {questions.length}</span>
                  <span className="text-sm font-semibold text-purple-500">{score} richtig</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-1.5 mb-6">
                  <div className="h-1.5 rounded-full bg-purple-500 transition-all"
                    style={{ width: `${((qIdx) / questions.length) * 100}%` }} />
                </div>

                <p className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-5">
                  {questions[qIdx].question}
                </p>

                <div className="space-y-2 mb-6">
                  {questions[qIdx].options.map((opt, i) => {
                    const isCorrect = i === questions[qIdx].correct;
                    const isSelected = i === selected;
                    let cls = 'border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:border-purple-400';
                    if (selected !== null) {
                      if (isCorrect) cls = 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200';
                      else if (isSelected) cls = 'border-red-400 bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200';
                      else cls = 'border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-400 opacity-60';
                    }
                    return (
                      <button key={i} onClick={() => handleAnswer(i)}
                        className={`w-full text-left px-4 py-3 rounded-xl border-2 transition flex items-center gap-3 ${cls}`}>
                        <span className="flex-shrink-0 w-7 h-7 rounded-full border-2 border-current flex items-center justify-center text-xs font-bold">
                          {selected !== null && isCorrect ? <Check size={14} /> : selected !== null && isSelected ? <X size={14} /> : String.fromCharCode(65 + i)}
                        </span>
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {selected !== null && (
                  <button onClick={nextQuestion}
                    className="w-full py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition font-medium">
                    {qIdx + 1 >= questions.length ? 'Ergebnis anzeigen' : 'Nächste Frage'}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── ERINNERUNGEN ── */}
        {tab === 'reminders' && (
          <div className="space-y-3">
            {upcoming.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-8 text-center">
                <Bell size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                <p className="text-slate-500 dark:text-slate-400">
                  Keine dringenden Prüfungsthemen in den nächsten 7 Tagen.
                </p>
                <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">
                  Themen in der Prüfungsvorbereitung hinzufügen.
                </p>
              </div>
            ) : (
              <>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                  {upcoming.length} Thema{upcoming.length !== 1 ? 'en' : ''} in den nächsten 7 Tagen
                </p>
                {upcoming.map((t: any) => (
                  <div key={t.id} className={`bg-white dark:bg-slate-800 rounded-xl shadow p-4 border-l-4 ${
                    t.daysLeft <= 1 ? 'border-red-500' : t.daysLeft <= 3 ? 'border-orange-500' : 'border-yellow-400'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">{t.name}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                          Fortschritt: {t.progress}% · {t.goals?.length ?? 0} Lernziele
                        </p>
                      </div>
                      <div className={`text-right ${
                        t.daysLeft <= 1 ? 'text-red-500' : t.daysLeft <= 3 ? 'text-orange-500' : 'text-yellow-500'
                      }`}>
                        <p className="font-bold text-lg">{t.daysLeft <= 0 ? 'Heute!' : `${t.daysLeft}d`}</p>
                        <p className="text-xs">{t.daysLeft <= 0 ? 'Fällig' : 'verbleibend'}</p>
                      </div>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-1.5 mt-3">
                      <div className="h-1.5 rounded-full bg-blue-500 transition-all"
                        style={{ width: `${t.progress}%` }} />
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export type Language = 'de' | 'en' | 'fr' | 'it';

export interface Translations {
  // Sidebar
  nav_notes: string;
  nav_dashboard: string;
  nav_exam: string;
  nav_chat: string;
  nav_settings: string;

  // Dashboard
  dash_title: string;
  dash_subtitle: string;
  dash_total_progress: string;
  dash_avg_grade: string;
  dash_study_hours: string;
  dash_weekly_chart: string;
  dash_subject_chart: string;
  dash_recent: string;
  dash_subjects: string[];
  dash_activities: { action: string; time: string }[];

  // Exam Preparation
  exam_title: string;
  exam_subtitle: string;
  exam_completion: string;
  exam_of: string;
  exam_topics_done: string;
  exam_add_placeholder: string;
  exam_add_button: string;
  exam_progress: string;

  // Chat Assistant
  chat_title: string;
  chat_subtitle: string;
  chat_placeholder: string;
  chat_suggestions: string[];
  chat_example_questions: string;
  chat_typing: string;
  chat_welcome: string;

  // Notes
  notes_notebooks: string;
  notes_import: string;
  notes_add_section: string;
  notes_title_placeholder: string;
  notes_last_edited: string;

  // Settings
  set_title: string;
  set_subtitle: string;
  set_notifications: string;
  set_notif_learn: string;
  set_notif_learn_desc: string;
  set_notif_email: string;
  set_notif_email_desc: string;
  set_display: string;
  set_darkmode: string;
  set_darkmode_desc: string;
  set_audio: string;
  set_sound: string;
  set_sound_desc: string;
  set_language: string;
  set_preferred_lang: string;
  set_save: string;
  set_saved: string;
  set_about: string;
  set_about_desc: string;

  // AI Panel
  ai_assistant: string;
  ai_summary: string;
  ai_questions: string;
  ai_gaps: string;
  ai_chat: string;
  ai_analyzing: string;
  ai_select_mode: string;
  ai_ask_note: string;
  ai_placeholder: string;
  ai_reset: string;
  ai_empty_note: string;

  // AI Chat Popup
  popup_how_help: string;
  popup_desc: string;
  popup_prompts: string[];
  popup_placeholder: string;
  popup_answering: string;
  popup_reset: string;
}

export const translations: Record<Language, Translations> = {
  de: {
    nav_notes: 'Notizen',
    nav_dashboard: 'Lernfortschritt',
    nav_exam: 'Prüfungsvorbereitung',
    nav_chat: 'KI Assistent',
    nav_settings: 'Einstellungen',

    dash_title: 'Lernfortschritt',
    dash_subtitle: 'Übersicht Ihrer Lernaktivität und Fortschritt',
    dash_total_progress: 'Gesamtfortschritt',
    dash_avg_grade: 'Durchschnittsnote',
    dash_study_hours: 'Lernstunden diese Woche',
    dash_weekly_chart: 'Wöchentlicher Fortschritt',
    dash_subject_chart: 'Leistung nach Modul',
    dash_recent: 'Aktuelle Aktivitäten',
    dash_subjects: ['M 346', 'M 245', 'M 241', 'M 122', 'M 187'],
    dash_activities: [
      { action: 'Kapitel 5 abgeschlossen', time: 'vor 2 Stunden' },
      { action: 'Quiz bestanden: Mathematik', time: 'vor 4 Stunden' },
      { action: 'Zusammenfassung erstellt', time: 'gestern' },
    ],

    exam_title: 'Prüfungsvorbereitung',
    exam_subtitle: 'Verwalten Sie Ihre Lernthemen und Prüfungsvorbereitungen',
    exam_completion: 'Abschlussrate',
    exam_of: 'von',
    exam_topics_done: 'Themen abgeschlossen',
    exam_add_placeholder: 'Neues Lernthema hinzufügen...',
    exam_add_button: 'Hinzufügen',
    exam_progress: 'Fortschritt',

    chat_title: 'KI Assistent',
    chat_subtitle: 'Ihr persönlicher Lernbegleiter',
    chat_placeholder: 'Stellen Sie eine Frage oder bitten Sie um Hilfe...',
    chat_suggestions: ['Erstelle eine Zusammenfassung', 'Quiz zu diesem Thema', 'Tipps zum Lernen', 'Mein Lernplan'],
    chat_example_questions: 'Beispielfragen:',
    chat_typing: 'Der Assistent schreibt...',
    chat_welcome: 'Hallo! Ich bin Ihr NotePilot KI-Assistent. Wie kann ich dir heute beim Lernen helfen?',

    notes_notebooks: 'Notizbücher',
    notes_import: 'OneNote importieren',
    notes_add_section: 'Abschnitt',
    notes_title_placeholder: 'Seitentitel...',
    notes_last_edited: 'Zuletzt bearbeitet:',

    set_title: 'Einstellungen',
    set_subtitle: 'Personalisieren Sie Ihr NotePilot Erlebnis',
    set_notifications: 'Benachrichtigungen',
    set_notif_learn: 'Lernbenachrichtigungen',
    set_notif_learn_desc: 'Erhalten Sie Benachrichtigungen zu Ihren Lernaktivitäten',
    set_notif_email: 'E-Mail-Benachrichtigungen',
    set_notif_email_desc: 'Wichtige Updates per E-Mail erhalten',
    set_display: 'Anzeige',
    set_darkmode: 'Dunkler Modus',
    set_darkmode_desc: 'Verwenden Sie ein dunkles Theme für bessere Sichtbarkeit',
    set_audio: 'Audio',
    set_sound: 'Soundeffekte',
    set_sound_desc: 'Aktivieren Sie Soundeffekte für Benachrichtigungen',
    set_language: 'Sprache',
    set_preferred_lang: 'Bevorzugte Sprache',
    set_save: 'Speichern',
    set_saved: '✓ Einstellungen gespeichert',
    set_about: 'Über NotePilot',
    set_about_desc: 'NotePilot v1.0 - Ein intelligenter Lernassistent für OneNote',

    ai_assistant: 'KI-Assistent',
    ai_summary: 'Zusammenfassung',
    ai_questions: 'Prüfungsfragen',
    ai_gaps: 'Lücken erkennen',
    ai_chat: 'Chat',
    ai_analyzing: 'Analysiere...',
    ai_select_mode: 'Wähle einen Modus oben aus.',
    ai_ask_note: 'Stell mir eine Frage zu deiner Notiz.',
    ai_placeholder: 'Frage eingeben...',
    ai_reset: 'Gespräch zurücksetzen',
    ai_empty_note: 'Die Notiz ist leer.',

    popup_how_help: 'Wie kann ich helfen?',
    popup_desc: 'Stell mir eine Frage zu deinen Notizen oder zum Lernstoff.',
    popup_prompts: ['Erkläre mir dieses Konzept...', 'Erstelle Prüfungsfragen zu...', 'Fasse zusammen...'],
    popup_placeholder: 'Nachricht eingeben...',
    popup_answering: 'Antwortet...',
    popup_reset: 'Gespräch zurücksetzen',
  },

  en: {
    nav_notes: 'Notes',
    nav_dashboard: 'Learning Progress',
    nav_exam: 'Exam Preparation',
    nav_chat: 'AI Assistant',
    nav_settings: 'Settings',

    dash_title: 'Learning Progress',
    dash_subtitle: 'Overview of your learning activity and progress',
    dash_total_progress: 'Total Progress',
    dash_avg_grade: 'Average Grade',
    dash_study_hours: 'Study hours this week',
    dash_weekly_chart: 'Weekly Progress',
    dash_subject_chart: 'Performance by Subject',
    dash_recent: 'Recent Activity',
    dash_subjects: ['M 346', 'M 245', 'M 241', 'M 122', 'M 187'],
    dash_activities: [
      { action: 'Chapter 5 completed', time: '2 hours ago' },
      { action: 'Quiz passed: Mathematics', time: '4 hours ago' },
      { action: 'Summary created', time: 'yesterday' },
    ],

    exam_title: 'Exam Preparation',
    exam_subtitle: 'Manage your study topics and exam preparations',
    exam_completion: 'Completion Rate',
    exam_of: 'of',
    exam_topics_done: 'topics completed',
    exam_add_placeholder: 'Add new study topic...',
    exam_add_button: 'Add',
    exam_progress: 'Progress',

    chat_title: 'AI Assistant',
    chat_subtitle: 'Your personal learning companion',
    chat_placeholder: 'Ask a question or request help...',
    chat_suggestions: ['Create a summary', 'Quiz on this topic', 'Study tips', 'My study plan'],
    chat_example_questions: 'Example questions:',
    chat_typing: 'Assistant is typing...',
    chat_welcome: 'Hello! I am your NotePilot AI assistant. How can I help you study today?',

    notes_notebooks: 'Notebooks',
    notes_import: 'Import OneNote',
    notes_add_section: 'Section',
    notes_title_placeholder: 'Page title...',
    notes_last_edited: 'Last edited:',

    set_title: 'Settings',
    set_subtitle: 'Personalize your NotePilot experience',
    set_notifications: 'Notifications',
    set_notif_learn: 'Learning Notifications',
    set_notif_learn_desc: 'Receive notifications about your learning activities',
    set_notif_email: 'Email Notifications',
    set_notif_email_desc: 'Receive important updates by email',
    set_display: 'Display',
    set_darkmode: 'Dark Mode',
    set_darkmode_desc: 'Use a dark theme for better visibility',
    set_audio: 'Audio',
    set_sound: 'Sound Effects',
    set_sound_desc: 'Enable sound effects for notifications',
    set_language: 'Language',
    set_preferred_lang: 'Preferred Language',
    set_save: 'Save',
    set_saved: '✓ Settings saved',
    set_about: 'About NotePilot',
    set_about_desc: 'NotePilot v1.0 - An intelligent learning assistant for OneNote',

    ai_assistant: 'AI Assistant',
    ai_summary: 'Summary',
    ai_questions: 'Exam Questions',
    ai_gaps: 'Find Gaps',
    ai_chat: 'Chat',
    ai_analyzing: 'Analyzing...',
    ai_select_mode: 'Select a mode above.',
    ai_ask_note: 'Ask me a question about your note.',
    ai_placeholder: 'Enter question...',
    ai_reset: 'Reset conversation',
    ai_empty_note: 'The note is empty.',

    popup_how_help: 'How can I help?',
    popup_desc: 'Ask me a question about your notes or study material.',
    popup_prompts: ['Explain this concept...', 'Create exam questions for...', 'Summarize...'],
    popup_placeholder: 'Enter message...',
    popup_answering: 'Answering...',
    popup_reset: 'Reset conversation',
  },

  fr: {
    nav_notes: 'Notes',
    nav_dashboard: 'Progression',
    nav_exam: 'Préparation aux examens',
    nav_chat: 'Assistant IA',
    nav_settings: 'Paramètres',

    dash_title: "Progression d'apprentissage",
    dash_subtitle: "Vue d'ensemble de votre activité d'apprentissage",
    dash_total_progress: 'Progression totale',
    dash_avg_grade: 'Note moyenne',
    dash_study_hours: "Heures d'étude cette semaine",
    dash_weekly_chart: 'Progression hebdomadaire',
    dash_subject_chart: 'Performance par branche',
    dash_recent: 'Activités récentes',
    dash_subjects: ['M 346', 'M 245', 'M 241', 'M 122', 'M 187'],
    dash_activities: [
      { action: 'Chapitre 5 terminé', time: 'il y a 2 heures' },
      { action: 'Quiz réussi : Mathématiques', time: 'il y a 4 heures' },
      { action: 'Résumé créé', time: 'hier' },
    ],

    exam_title: 'Préparation aux examens',
    exam_subtitle: 'Gérez vos sujets d\'étude et vos préparations',
    exam_completion: 'Taux de complétion',
    exam_of: 'sur',
    exam_topics_done: 'sujets terminés',
    exam_add_placeholder: 'Ajouter un nouveau sujet d\'étude...',
    exam_add_button: 'Ajouter',
    exam_progress: 'Progression',

    chat_title: 'Assistant IA',
    chat_subtitle: "Votre compagnon d'apprentissage personnel",
    chat_placeholder: "Posez une question ou demandez de l'aide...",
    chat_suggestions: ['Créer un résumé', 'Quiz sur ce sujet', "Conseils d'étude", 'Mon plan d\'étude'],
    chat_example_questions: 'Exemples de questions :',
    chat_typing: "L'assistant écrit...",
    chat_welcome: "Bonjour ! Je suis votre assistant IA NotePilot. Comment puis-je vous aider à étudier aujourd'hui ?",

    notes_notebooks: 'Carnets',
    notes_import: 'Importer OneNote',
    notes_add_section: 'Section',
    notes_title_placeholder: 'Titre de la page...',
    notes_last_edited: 'Dernière modification :',

    set_title: 'Paramètres',
    set_subtitle: 'Personnalisez votre expérience NotePilot',
    set_notifications: 'Notifications',
    set_notif_learn: "Notifications d'apprentissage",
    set_notif_learn_desc: "Recevez des notifications sur vos activités d'apprentissage",
    set_notif_email: 'Notifications par e-mail',
    set_notif_email_desc: 'Recevoir les mises à jour importantes par e-mail',
    set_display: 'Affichage',
    set_darkmode: 'Mode sombre',
    set_darkmode_desc: 'Utiliser un thème sombre pour une meilleure visibilité',
    set_audio: 'Audio',
    set_sound: 'Effets sonores',
    set_sound_desc: 'Activer les effets sonores pour les notifications',
    set_language: 'Langue',
    set_preferred_lang: 'Langue préférée',
    set_save: 'Enregistrer',
    set_saved: '✓ Paramètres enregistrés',
    set_about: 'À propos de NotePilot',
    set_about_desc: "NotePilot v1.0 - Un assistant d'apprentissage intelligent pour OneNote",

    ai_assistant: 'Assistant IA',
    ai_summary: 'Résumé',
    ai_questions: "Questions d'examen",
    ai_gaps: 'Identifier les lacunes',
    ai_chat: 'Chat',
    ai_analyzing: 'Analyse...',
    ai_select_mode: 'Sélectionnez un mode ci-dessus.',
    ai_ask_note: 'Posez-moi une question sur votre note.',
    ai_placeholder: 'Entrer une question...',
    ai_reset: 'Réinitialiser la conversation',
    ai_empty_note: 'La note est vide.',

    popup_how_help: 'Comment puis-je aider ?',
    popup_desc: "Posez-moi une question sur vos notes ou le matériel d'étude.",
    popup_prompts: ['Expliquez ce concept...', "Créez des questions d'examen pour...", 'Résumez...'],
    popup_placeholder: 'Saisir un message...',
    popup_answering: 'Répond...',
    popup_reset: 'Réinitialiser la conversation',
  },

  it: {
    nav_notes: 'Note',
    nav_dashboard: 'Progresso',
    nav_exam: 'Preparazione esami',
    nav_chat: 'Assistente IA',
    nav_settings: 'Impostazioni',

    dash_title: 'Progresso di apprendimento',
    dash_subtitle: 'Panoramica della tua attività di apprendimento',
    dash_total_progress: 'Progresso totale',
    dash_avg_grade: 'Nota media',
    dash_study_hours: 'Ore di studio questa settimana',
    dash_weekly_chart: 'Progresso settimanale',
    dash_subject_chart: 'Rendimento per materia',
    dash_recent: 'Attività recenti',
    dash_subjects: ['M 346', 'M 245', 'M 241', 'M 122', 'M 187'],
    dash_activities: [
      { action: 'Capitolo 5 completato', time: '2 ore fa' },
      { action: 'Quiz superato: Matematica', time: '4 ore fa' },
      { action: 'Riassunto creato', time: 'ieri' },
    ],

    exam_title: 'Preparazione agli esami',
    exam_subtitle: 'Gestisci i tuoi argomenti di studio e le preparazioni',
    exam_completion: 'Tasso di completamento',
    exam_of: 'su',
    exam_topics_done: 'argomenti completati',
    exam_add_placeholder: 'Aggiungi nuovo argomento di studio...',
    exam_add_button: 'Aggiungi',
    exam_progress: 'Progresso',

    chat_title: 'Assistente IA',
    chat_subtitle: 'Il tuo compagno di apprendimento personale',
    chat_placeholder: 'Fai una domanda o chiedi aiuto...',
    chat_suggestions: ['Crea un riassunto', 'Quiz su questo argomento', 'Consigli per lo studio', 'Il mio piano di studio'],
    chat_example_questions: 'Domande di esempio:',
    chat_typing: "L'assistente sta scrivendo...",
    chat_welcome: 'Ciao! Sono il tuo assistente IA NotePilot. Come posso aiutarti a studiare oggi?',

    notes_notebooks: 'Quaderni',
    notes_import: 'Importa OneNote',
    notes_add_section: 'Sezione',
    notes_title_placeholder: 'Titolo della pagina...',
    notes_last_edited: 'Ultima modifica:',

    set_title: 'Impostazioni',
    set_subtitle: 'Personalizza la tua esperienza NotePilot',
    set_notifications: 'Notifiche',
    set_notif_learn: 'Notifiche di apprendimento',
    set_notif_learn_desc: 'Ricevi notifiche sulle tue attività di apprendimento',
    set_notif_email: 'Notifiche e-mail',
    set_notif_email_desc: 'Ricevi aggiornamenti importanti via e-mail',
    set_display: 'Visualizzazione',
    set_darkmode: 'Modalità scura',
    set_darkmode_desc: 'Usa un tema scuro per una migliore visibilità',
    set_audio: 'Audio',
    set_sound: 'Effetti sonori',
    set_sound_desc: 'Attiva gli effetti sonori per le notifiche',
    set_language: 'Lingua',
    set_preferred_lang: 'Lingua preferita',
    set_save: 'Salva',
    set_saved: '✓ Impostazioni salvate',
    set_about: 'Informazioni su NotePilot',
    set_about_desc: 'NotePilot v1.0 - Un assistente di apprendimento intelligente per OneNote',

    ai_assistant: 'Assistente IA',
    ai_summary: 'Riassunto',
    ai_questions: "Domande d'esame",
    ai_gaps: 'Trovare lacune',
    ai_chat: 'Chat',
    ai_analyzing: 'Analisi...',
    ai_select_mode: 'Seleziona una modalità sopra.',
    ai_ask_note: 'Fammi una domanda sulla tua nota.',
    ai_placeholder: 'Inserisci una domanda...',
    ai_reset: 'Resetta la conversazione',
    ai_empty_note: 'La nota è vuota.',

    popup_how_help: 'Come posso aiutare?',
    popup_desc: 'Fammi una domanda sulle tue note o sul materiale di studio.',
    popup_prompts: ['Spiegami questo concetto...', "Crea domande d'esame per...", 'Riassumi...'],
    popup_placeholder: 'Inserisci messaggio...',
    popup_answering: 'Risponde...',
    popup_reset: 'Resetta la conversazione',
  },
};

// AI Integration Layer using Chrome's built-in Gemini Nano

let aiSessionPromise = null;
let aiStatus = 'uninitialized'; // 'uninitialized', 'available', 'downloadable', 'downloading', 'unavailable'
let downloadMonitorCallback = null;

// Options used for availability() and create(). MUST match prompts usage.
const LM_OPTIONS = {
  expectedInputs: [{ type: 'text', languages: ['en'] }],
  expectedOutputs: [{ type: 'text', languages: ['en'] }],
};

function isValidSession(session) {
  return !!session && typeof session.prompt === 'function' && typeof session.destroy === 'function';
}

function getAiStatus() {
  return aiStatus;
}

/*
 * Normalize availability values and set aiStatus.
 * Be defensive: accept many variants returned by different Chrome builds.
 */
async function initializeAI() {
  try {
    if (typeof LanguageModel === 'undefined') {
      aiStatus = 'unavailable';
      return;
    }

    const availability = await LanguageModel.availability(LM_OPTIONS);

    // Normalize many possible values into our internal states
    const a = String(availability).toLowerCase();
    if (a === 'available' || a === 'readily' || a === 'downloaded' || a === 'ready') {
      aiStatus = 'available';
    } else if (a === 'downloadable' || a === 'after-download') {
      aiStatus = 'downloadable';
    } else if (a === 'downloading') {
      aiStatus = 'downloading';
    } else {
      aiStatus = 'unavailable';
    }
  } catch (err) {
    console.error('AI initialization failed:', err);
    aiStatus = 'unavailable';
  }
}

/*
 * Create or return an existing ready session promise.
 * Returns null if model needs user-gesture download or is unavailable.
 */
async function getAiSession() {
  if (aiStatus === 'uninitialized') {
    await initializeAI();
  }

  if (typeof LanguageModel === 'undefined') {
    aiStatus = 'unavailable';
    return null;
  }

  // If model needs user gesture or is downloading, do not auto-create
  if (aiStatus === 'downloadable' || aiStatus === 'downloading') {
    return null;
  }

  if (aiStatus !== 'available') {
    // Try to refresh once
    await initializeAI();
    if (aiStatus !== 'available') return null;
  }

  if (!aiSessionPromise) {
    aiSessionPromise = LanguageModel.create(LM_OPTIONS)
      .then(session => {
        if (!isValidSession(session)) {
          console.error('Created AI session is invalid.');
          aiSessionPromise = null;
          aiStatus = 'unavailable';
          return null;
        }
        return session;
      })
      .catch(err => {
        console.error('Failed to create AI session:', err);
        aiSessionPromise = null;
        // Common DOMExceptions for blocked downloads/from policies may indicate download required
        try {
          if (err && (err.name === 'NotAllowedError' || err.name === 'SecurityError')) {
            aiStatus = 'downloadable';
          } else {
            aiStatus = 'unavailable';
          }
        } catch (_) {
          aiStatus = 'unavailable';
        }
        return null;
      });
  }

  return aiSessionPromise;
}

/*
 * Must be called from a user gesture (click/tap) to allow the model to download and create a session.
 * monitorCallback(progress: number 0..1) receives download progress events.
 */
async function requestModelDownload(monitorCallback) {
  if (typeof LanguageModel === 'undefined') {
    throw new Error('Prompt API (LanguageModel) not available in this environment.');
  }

  // If already have a ready session, return it.
  if (aiStatus === 'available' && aiSessionPromise) {
    return aiSessionPromise;
  }

  // Avoid racing downloads
  if (aiSessionPromise) return aiSessionPromise;

  downloadMonitorCallback = typeof monitorCallback === 'function' ? monitorCallback : null;

  try {
    aiSessionPromise = LanguageModel.create({
      ...LM_OPTIONS,
      monitor(m) {
        // listen to downloadprogress events; some builds use e.loaded fraction
        m.addEventListener('downloadprogress', (e) => {
          const progress = typeof e?.loaded === 'number' ? e.loaded : 0;
          try { downloadMonitorCallback?.(progress); } catch (_) {}
        });
      },
    });

    const session = await aiSessionPromise;

    if (!isValidSession(session)) {
      throw new Error('Downloaded session is invalid.');
    }

    aiStatus = 'available';
    return session;
  } catch (err) {
    console.error('Model download/create failed:', err);
    aiSessionPromise = null;
    aiStatus = 'downloadable';
    throw err;
  } finally {
    // keep monitor callback so UI can still read progress; UI may clear it later
  }
}

async function destroyAiSession() {
  if (!aiSessionPromise) return;

  try {
    const session = await aiSessionPromise;
    if (session?.destroy) {
      await session.destroy();
    }
  } catch (err) {
    console.warn('Error destroying AI session:', err);
  } finally {
    aiSessionPromise = null;
    aiStatus = 'uninitialized';
    downloadMonitorCallback = null;
  }
}

/* ---------- High-level helpers (unchanged intents, now ensure they await prompt correctly) ---------- */
async function suggestTaskType(questText) {
  try {
    if (!questText || !questText.trim()) return 'Admin'; // Default to Admin for empty tasks
    const session = await getAiSession();
    if (!session) return 'Admin'; // Default if AI is unavailable

    const prompt = `Analyze the task and classify it into one of the following categories: Study, Health, Habit, Admin, Project, Creative, Social. If the task is nonsensical, gibberish, or not a real task, respond with only the word "Invalid".
- 'Study': Learning, research, or reviewing educational material.
- 'Health': Physical or mental wellness activities like exercise or meditation.
- 'Habit': A small, recurring task for building a routine.
- 'Admin': Household, administrative, or routine maintenance tasks.
- 'Project': A task that is part of a larger professional or personal goal.
- 'Creative': Artistic or imaginative activities.
- 'Social': Interacting with friends, family, or colleagues.

Here are some examples:
Task: "Read chapter 5 of history book"
Classification: Study

Task: "Go for a 30-minute run"
Classification: Health

Task: "Daily journal entry"
Classification: Habit

Task: "Pay electricity bill"
Classification: Admin

Task: "Prepare slides for the quarterly review meeting"
Classification: Project

Task: "Sketch a new character design"
Classification: Creative

Task: "Call mom"
Classification: Social

Task: "asdf ghjkl"
Classification: Invalid

Now, classify the following task. Respond with only one word.
Task: "${questText}"
Classification:`;
    const result = await session.prompt(prompt);
    const type = (typeof result === 'string' ? result : String(result || '')).trim();
    const validTypes = ['Study', 'Health', 'Habit', 'Admin', 'Project', 'Creative', 'Social', 'Invalid'];
    if (validTypes.includes(type)) return type;
    return 'Admin'; // Fallback to a sensible default
  } catch (error) {
    console.error('AI task type error:', error);
    return 'Admin';
  }
}

async function getDifficultyMultiplier(taskText, duration, deadline) {
  try {
    const session = await getAiSession();
    if (!session) {
      return { difficulty: 'Medium', multiplier: 1.0 };
    }
    
    const prompt = `Analyze the difficulty of the following task based on its description, estimated duration, and deadline. If the task is nonsensical, gibberish, or not a real task, respond with only the word "Invalid".
Respond with only one word: Easy, Medium, or Hard.

- 'Easy': Low effort, short duration (e.g., < 30m). Not urgent.
- 'Medium': Moderate effort, medium duration (e.g., 30-90m). May have a deadline that is not immediate.
- 'Hard': High effort, long duration (e.g., > 90m), or any task with a very urgent deadline (e.g., due today).

Examples:
Task: "Reply to one email", Duration: "5m", Deadline: "None"
Difficulty: Easy

Task: "Write a 1-hour presentation", Duration: "1h", Deadline: "Next week"
Difficulty: Medium

Task: "Finish report", Duration: "3h", Deadline: "Today"
Difficulty: Hard

Task Details:
- Description: "${taskText}"
- Estimated Duration: "${duration || 'Not specified'}"
- Deadline: "${deadline ? new Date(deadline).toDateString() : 'Not specified'}"

Based on these details, what is the difficulty?
Difficulty:`;
    
    const result = await session.prompt(prompt);
    const difficulty = result.trim();
    
    const multipliers = {
      'Easy': 0.5,
      'Medium': 1.0,
      'Hard': 2.0
    };
    
    return {
      difficulty: difficulty in multipliers || difficulty === 'Invalid' ? difficulty : 'Medium',
      multiplier: multipliers[difficulty] || 1.0
    };
  } catch (error) {
    console.error('AI difficulty error:', error);
    return { difficulty: 'Medium', multiplier: 1.0 };
  }
}

async function suggestRitualTimeOfDay(ritualText) {
  try {
    const session = await getAiSession();
    if (!session) return 'any';

    const prompt = `Analyze the daily ritual and determine the best time of day to perform it.
Respond with only one word: 'morning', 'evening', or 'any'.

- 'morning': For rituals related to starting the day, planning, or energizing.
- 'evening': For rituals related to winding down, reflection, review, or preparing for the next day.
- 'any': For rituals that can be done at any time, like hydration or a short walk.

Examples:
Ritual: "Drink a glass of water"
Time: any

Ritual: "10 minutes of meditation"
Time: morning

Ritual: "Review today's accomplishments and plan tomorrow"
Time: evening

Ritual: "Go for a walk"
Time: any

Now, analyze the following ritual.
Ritual: "${ritualText}"
Time:`;
    const result = (await session.prompt(prompt)).trim().toLowerCase();
    const validTimes = ['morning', 'evening', 'any'];
    return validTimes.includes(result) ? result : 'any';
  } catch (error) {
    console.error('AI ritual time error:', error);
    return 'any'; // Fallback to a sensible default
  }
}

async function generateStreakFlavorText(streakCount) {
  try {
    const session = await getAiSession();
    if (!session) {
      return `You're on a ${streakCount}-day streak! Keep it up!`;
    }
    
    const prompt = `You are Flow Assistant. Generate a short, calm, and motivating message for a user on a ${streakCount}-day focus streak. Keep it under 20 words. Example: "Your focus is consistent. A ${streakCount}-day flow is impressive."`;
    
    const result = await session.prompt(prompt);
    return result.trim();
  } catch (error) {
    console.error('AI streak text error:', error);
    return `You're on a ${streakCount}-day streak! Keep it up!`;
  }
}

async function generateMotivation() {
  try {
    const session = await getAiSession();
    if (!session) {
      return 'Maintain your flow.';
    }
    
    const prompt = 'You are Flow Assistant. Generate a very short, calm, motivational message about achieving a state of flow. Keep it under 15 words. Example: "Clarity is near. Find your focus."';
    
    const result = await session.prompt(prompt);
    return result.trim();
  } catch (error) {
    console.error('AI motivation error:', error);
    return 'Maintain your flow.';
  }
}

async function generateAnomalyDialogue(anomalyName, isDefeated = false) {
  try {
    const session = await getAiSession();
    if (!session) {
      return isDefeated 
        ? `Anomaly ${anomalyName} has been stabilized.` 
        : `Anomaly detected: ${anomalyName}. Focus is required.`;
    }
    
    const prompt = isDefeated
      ? `You are Flow Assistant. Generate a short, calm, congratulatory message for stabilizing a system anomaly called "${anomalyName}". Keep it under 20 words. Example: "System integrity restored. The ${anomalyName} is neutralized."`
      : `You are Flow Assistant. Generate a short, calm, alert message for a new system anomaly called "${anomalyName}". Keep it under 20 words. Example: "A new distortion has emerged: ${anomalyName}. Prioritize stabilization."`;
    
    const result = await session.prompt(prompt);
    return result.trim();
  } catch (error) {
    console.error('AI boss dialogue error:', error);
    return isDefeated 
      ? `Anomaly ${anomalyName} has been stabilized.` 
      : `Anomaly detected: ${anomalyName}. Focus is required.`;
  }
}

async function streamSummarizeText(textToSummarize) {
  const session = await getAiSession();
  if (!session) throw new Error('AI is not available. Please try again after the model has downloaded.');
  
  if (!textToSummarize || textToSummarize.trim().length < 20) {
    throw new Error('Please enter a longer text to summarize.');
  }

  const prompt = `You are an AI Study Companion. Summarize the given content (text, video transcript, or audio transcript) for *efficient studying*. 

Output must be *structured, concise, and easy to read*, following this exact format:

📚 Title: <Title of the content or topic>
📝 Summary:
- <Key point 1>
- <Key point 2>
- <Key point 3>
... (3-7 bullet points maximum)

💡 Key Insights / Takeaways:
- <Insight 1>
- <Insight 2>
- <Insight 3>

🧠 Important Terms / Concepts:
- <Term 1>: <Brief explanation>
- <Term 2>: <Brief explanation>

🛠 Suggested Actions / Study Tips:
- <Tip 1>
- <Tip 2>

Rules:
1. Keep bullet points concise and to the point.  
2. Highlight only *highly relevant information* for learning.  
3. Use simple language unless a technical term is necessary.  
4. If a section is not relevant, write "N/A".  
5. Output exactly in this format — no extra commentary or explanation.

Now, process the following text:

Text: "${textToSummarize}"
`;
  return session.promptStreaming(prompt);
}

async function streamGenerateQuiz(textToQuiz) {
  const session = await getAiSession();
  if (!session) throw new Error('AI is not available. Please try again after the model has downloaded.');

  if (!textToQuiz || textToQuiz.trim().length < 50) {
    throw new Error('Please enter a longer text to generate a quiz.');
  }

  const prompt = `You are an AI Study Companion. Generate *quiz questions and flashcards* from the provided study notes or content summary.

Input: Study notes or summary in text form (bullet points, key insights, terms).

Output must follow this *exact structured format* for easy display in a popup panel:

📝 Quiz Questions
1. <Question 1>
   - A) <Option A>
   - B) <Option B>
   - C) <Option C>
   - D) <Option D>
   Answer: <Correct option letter>

2. <Question 2>
   - A) ...
   - B) ...
   Answer: ...

🃏 Flashcards
- Front: <Question or Term>
  Back: <Answer or Explanation>

- Front: <Question or Term>
  Back: <Answer or Explanation>

Rules:
1. Generate *3–5 multiple-choice questions* and *3–5 flashcards* per summary.
2. Use only information from the provided summary; do not invent facts.
3. Questions should focus on key points and important terms.
4. Keep flashcard explanations *short and precise* (1–2 sentences).
5. Format exactly as shown; do not add extra commentary or instructions.

Now, process the following text:

Text: "${textToQuiz}"
`;
  return session.promptStreaming(prompt);
}

async function summarizeText(textToSummarize) {
  try {
    const session = await getAiSession();
    if (!session) return 'AI is not available. Please try again after the model has downloaded.';

    if (!textToSummarize || textToSummarize.trim().length < 20) {
      return 'Please enter a longer text to summarize.';
    }

    const prompt = `You are an AI Study Companion. Summarize the given content (text, video transcript, or audio transcript) for *efficient studying*. 

Output must be *structured, concise, and easy to read*, following this exact format:

📚 Title: <Title of the content or topic>
📝 Summary:
- <Key point 1>
- <Key point 2>
- <Key point 3>
... (3-7 bullet points maximum)

💡 Key Insights / Takeaways:
- <Insight 1>
- <Insight 2>
- <Insight 3>

🧠 Important Terms / Concepts:
- <Term 1>: <Brief explanation>
- <Term 2>: <Brief explanation>

🛠 Suggested Actions / Study Tips:
- <Tip 1>
- <Tip 2>

Rules:
1. Keep bullet points concise and to the point.  
2. Highlight only *highly relevant information* for learning.  
3. Use simple language unless a technical term is necessary.  
4. If a section is not relevant, write "N/A".  
5. Output exactly in this format — no extra commentary or explanation.

Now, process the following text:

Text: "${textToSummarize}"
`;
    const result = await session.prompt(prompt);
    return result.trim();
  } catch (error) {
    console.error('AI summarization error:', error);
    return 'An error occurred while summarizing the text.';
  }
}

async function generateQuiz(textToQuiz) {
  try {
    const session = await getAiSession();
    if (!session) return 'AI is not available. Please try again after the model has downloaded.';

    if (!textToQuiz || textToQuiz.trim().length < 50) {
      return 'Please enter a longer text to generate a quiz.';
    }

    const prompt = `You are an AI Study Companion. Generate *quiz questions and flashcards* from the provided study notes or content summary.

Input: Study notes or summary in text form (bullet points, key insights, terms).

Output must follow this *exact structured format* for easy display in a popup panel:

📝 Quiz Questions
1. <Question 1>
   - A) <Option A>
   - B) <Option B>
   - C) <Option C>
   - D) <Option D>
   Answer: <Correct option letter>

2. <Question 2>
   - A) ...
   - B) ...
   Answer: ...

🃏 Flashcards
- Front: <Question or Term>
  Back: <Answer or Explanation>

- Front: <Question or Term>
  Back: <Answer or Explanation>

Rules:
1. Generate *3–5 multiple-choice questions* and *3–5 flashcards* per summary.
2. Use only information from the provided summary; do not invent facts.
3. Questions should focus on key points and important terms.
4. Keep flashcard explanations *short and precise* (1–2 sentences).
5. Format exactly as shown; do not add extra commentary or instructions.

Now, process the following text:

Text: "${textToQuiz}"
`;
    const result = await session.prompt(prompt);
    return result.trim();
  } catch (error) {
    console.error('AI quiz generation error:', error);
    return 'An error occurred while generating the quiz.';
  }
}

async function checkGrammar(textToCheck) {
  try {
    const session = await getAiSession();
    if (!session) return 'AI is not available. Please try again after the model has downloaded.';

    if (!textToCheck || textToCheck.trim().length === 0) {
      return 'Please enter some text to check.';
    }

    const prompt = `Please act as a grammar and spelling checker. Review the following text. If there are no errors, respond with only "No errors found.". Otherwise, list the corrections needed.\n\nText: "${textToCheck}"`;
    const result = await session.prompt(prompt);
    return result.trim();
  } catch (error) {
    console.error('AI grammar check error:', error);
    return 'An error occurred while checking the grammar.';
  }
}

/* ---------- Compatibility / Exports ---------- */

/*
 * Provide legacy-compatible window.ai and a global helper for other contexts.
 * - canCreateTextSession(): returns 'readily' | 'after-download' | 'unavailable'
 * - createTextSession(): returns object with prompt/promptStreaming/destroy
 * - requestModelDownload(monitorCallback): user-gesture download
 */
(function () {
  async function canCreateTextSessionCompat() {
    await initializeAI();
    if (aiStatus === 'available') return 'readily';
    if (aiStatus === 'downloadable' || aiStatus === 'downloading') return 'after-download';
    return 'unavailable';
  }

  function createSessionWrapper(session) {
    return {
      prompt: async (input, options) => {
        if (!session || typeof session.prompt !== 'function') {
          throw new Error('Underlying session is not available');
        }
        return session.prompt(input, options);
      },
      promptStreaming: (input, options) => {
        if (session && typeof session.promptStreaming === 'function') {
          return session.promptStreaming(input, options);
        }
        // fallback: single-shot async iterable that yields the final text once
        return (async function* () {
          const res = await session.prompt(input, options);
          yield res;
        })();
      },
      destroy: () => {
        try { return session.destroy?.(); } catch (_) {}
      },
    };
  }

  async function createTextSessionCompat() {
    const status = await canCreateTextSessionCompat();
    if (status === 'after-download') {
      throw new Error('Model requires download. Call requestModelDownload() from a user gesture.');
    }
    const session = await getAiSession();
    if (!session) throw new Error('AI session unavailable');
    return createSessionWrapper(session);
  }

  async function requestModelDownloadCompat(monitorCallback) {
    return requestModelDownload(monitorCallback);
  }

  const compat = {
    canCreateTextSession: canCreateTextSessionCompat,
    createTextSession: createTextSessionCompat,
    requestModelDownload: requestModelDownloadCompat,
    // expose helpers so existing code can call window.ai.summarizeText(...)
    suggestTaskType,
    suggestRitualTimeOfDay,
    getDifficultyMultiplier,
    generateStreakFlavorText,
    generateMotivation,
    generateAnomalyDialogue,
    summarizeText,
    generateQuiz,
    streamSummarizeText, // Expose streaming version
    streamGenerateQuiz,  // Expose streaming version
    checkGrammar,
    destroyAiSession,
    getAiStatus,
  };

  try {
    if (typeof window !== 'undefined') {
      window.ai = {
        ...(window.ai || {}),
        ...compat,
      };
    }
  } catch (_) {}

  try {
    globalThis.questflowAI = {
      ...(globalThis.questflowAI || {}),
      ...compat,
    };
  } catch (_) {}
})();

// Optionally expose helpers individually on globalThis for imports/use in other modules
try {
  globalThis.suggestTaskType = suggestTaskType;
  globalThis.suggestRitualTimeOfDay = suggestRitualTimeOfDay;
  globalThis.getDifficultyMultiplier = getDifficultyMultiplier;
  globalThis.summarizeText = summarizeText;
  globalThis.generateQuiz = generateQuiz;
  globalThis.streamSummarizeText = streamSummarizeText; // Expose streaming version
  globalThis.streamGenerateQuiz = streamGenerateQuiz;  // Expose streaming version
  globalThis.checkGrammar = checkGrammar;
} catch (_) {}

/* End of ai.js */

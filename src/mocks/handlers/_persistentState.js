import { users } from '../../data/mockUsers.js';
import { courses } from '../../data/mockCourses.js';
import { auditLogs } from '../../data/mockReports.js';
import {
  assignmentsCatalog,
  audios,
  flashcards,
  liveSessions,
  quizzes,
  readingLessons,
  roleplays,
  sequenceQuizzes,
  surveys,
  videos,
} from '../../data/mockContent.js';

const DB_NAME = 'starlent_mock_db';
const DB_VERSION = 1;
const STORE_NAME = 'kv';
const STATE_KEY = 'management_state_v1';
const SCHEMA_VERSION = 3;
const STATE_SYNC_KEY = 'starlent_state_sync_v1';
const STATE_SYNC_EVENT = 'starlent:state-sync';
const STATE_SYNC_CHANNEL = 'starlent_state_sync_channel';

const deepClone = (value) => JSON.parse(JSON.stringify(value));
const replaceArray = (target, next) => {
  target.splice(0, target.length, ...(Array.isArray(next) ? next : []));
};
const replaceObject = (target, next) => {
  Object.keys(target).forEach((key) => delete target[key]);
  Object.assign(target, next && typeof next === 'object' ? next : {});
};

const seedUsers = deepClone(users);
const seedCourses = deepClone(courses);
const seedAuditLogs = deepClone(auditLogs);
const seedFlashcards = deepClone(flashcards);
const seedVideos = deepClone(videos);
const seedAudios = deepClone(audios);
const seedQuizzes = deepClone(quizzes);
const seedSequenceQuizzes = deepClone(sequenceQuizzes);
const seedRoleplays = deepClone(roleplays);
const seedReadingLessons = deepClone(readingLessons);
const seedAssignmentsCatalog = deepClone(assignmentsCatalog);
const seedSurveys = deepClone(surveys);
const seedLiveSessions = deepClone(liveSessions);

const assignments = [];
const reminders = [];

let hydrated = false;
let hydratePromise = null;
let lastAppliedRevision = 0;
let syncChannel = null;

function canUseIndexedDB() {
  return typeof indexedDB !== 'undefined';
}

function getSyncChannel() {
  if (typeof window === 'undefined') return null;
  if (!('BroadcastChannel' in window)) return null;
  if (!syncChannel) {
    syncChannel = new BroadcastChannel(STATE_SYNC_CHANNEL);
  }
  return syncChannel;
}

function announceStateSync(revision) {
  if (typeof window === 'undefined') return;
  const payload = { revision: Number(revision || Date.now()), at: Date.now() };
  try {
    window.dispatchEvent(new CustomEvent(STATE_SYNC_EVENT, { detail: payload }));
  } catch {
    // ignore
  }
  try {
    window.localStorage.setItem(STATE_SYNC_KEY, JSON.stringify(payload));
    window.localStorage.removeItem(STATE_SYNC_KEY);
  } catch {
    // ignore
  }
  try {
    getSyncChannel()?.postMessage(payload);
  } catch {
    // ignore
  }
}

function defaultState() {
  return {
    schemaVersion: SCHEMA_VERSION,
    stateRevision: Date.now(),
    users: deepClone(seedUsers),
    courses: deepClone(seedCourses),
    auditLogs: deepClone(seedAuditLogs),
    assignments: [],
    reminders: [],
    contents: {
      flashcards: deepClone(seedFlashcards),
      videos: deepClone(seedVideos),
      audios: deepClone(seedAudios),
      quizzes: deepClone(seedQuizzes),
      sequenceQuizzes: deepClone(seedSequenceQuizzes),
      roleplays: deepClone(seedRoleplays),
      readingLessons: deepClone(seedReadingLessons),
      assignmentsCatalog: deepClone(seedAssignmentsCatalog),
      surveys: deepClone(seedSurveys),
      liveSessions: deepClone(seedLiveSessions),
    },
  };
}

function isValidState(state) {
  return !!state
    && Array.isArray(state.users)
    && Array.isArray(state.courses)
    && Array.isArray(state.auditLogs)
    && Array.isArray(state.assignments)
    && Array.isArray(state.reminders);
}

function normalizeState(state) {
  const seeded = defaultState();
  if (!state || !isValidState(state)) return seeded;
  return {
    ...seeded,
    ...state,
    stateRevision: Number(state.stateRevision || 0) || seeded.stateRevision,
    users: Array.isArray(state.users) ? state.users : seeded.users,
    courses: Array.isArray(state.courses) ? state.courses : seeded.courses,
    auditLogs: Array.isArray(state.auditLogs) ? state.auditLogs : seeded.auditLogs,
    assignments: Array.isArray(state.assignments) ? state.assignments : seeded.assignments,
    reminders: Array.isArray(state.reminders) ? state.reminders : seeded.reminders,
    contents: {
      flashcards: state.contents?.flashcards && typeof state.contents.flashcards === 'object' ? state.contents.flashcards : seeded.contents.flashcards,
      videos: state.contents?.videos && typeof state.contents.videos === 'object' ? state.contents.videos : seeded.contents.videos,
      audios: state.contents?.audios && typeof state.contents.audios === 'object' ? state.contents.audios : seeded.contents.audios,
      quizzes: state.contents?.quizzes && typeof state.contents.quizzes === 'object' ? state.contents.quizzes : seeded.contents.quizzes,
      sequenceQuizzes: state.contents?.sequenceQuizzes && typeof state.contents.sequenceQuizzes === 'object' ? state.contents.sequenceQuizzes : seeded.contents.sequenceQuizzes,
      roleplays: state.contents?.roleplays && typeof state.contents.roleplays === 'object' ? state.contents.roleplays : seeded.contents.roleplays,
      readingLessons: state.contents?.readingLessons && typeof state.contents.readingLessons === 'object' ? state.contents.readingLessons : seeded.contents.readingLessons,
      assignmentsCatalog: state.contents?.assignmentsCatalog && typeof state.contents.assignmentsCatalog === 'object' ? state.contents.assignmentsCatalog : seeded.contents.assignmentsCatalog,
      surveys: state.contents?.surveys && typeof state.contents.surveys === 'object' ? state.contents.surveys : seeded.contents.surveys,
      liveSessions: state.contents?.liveSessions && typeof state.contents.liveSessions === 'object' ? state.contents.liveSessions : seeded.contents.liveSessions,
    },
  };
}

function toOrderingQuizFromLegacy(legacy) {
  const rawItems = Array.isArray(legacy?.items) ? legacy.items : [];
  const sorted = [...rawItems]
    .map((item, idx) => ({
      id: String(item?.id || `s${idx + 1}`),
      text: String(item?.text || ''),
      order: Number(item?.order || idx + 1),
    }))
    .sort((a, b) => a.order - b.order)
    .map((item, idx) => ({ ...item, order: idx + 1 }));
  return {
    id: String(legacy?.id || `qz_${Date.now()}`),
    title: String(legacy?.title || 'Ordering Quiz'),
    type: 'ordering',
    passScore: 70,
    attemptLimit: 3,
    timeLimit: 300,
    availableFrom: null,
    dueAt: null,
    tags: [],
    skills: [],
    estimatedDuration: 10,
    difficulty: 'beginner',
    description: String(legacy?.description || ''),
    explanation: String(legacy?.explanation || ''),
    items: sorted,
    questions: [{
      id: 'ordering_1',
      questionType: 'ordering',
      prompt: String(legacy?.description || ''),
      items: sorted.map((item) => ({ id: item.id, text: item.text })),
      correctOrder: sorted.map((item) => item.id),
      explanation: String(legacy?.explanation || ''),
    }],
  };
}

function normalizeQuizQuestions(quiz) {
  if (!Array.isArray(quiz?.questions)) return quiz;
  return {
    ...quiz,
    questions: quiz.questions.map((question, idx) => {
      const questionType = String(question?.questionType || 'single_choice');
      return {
        ...question,
        id: String(question?.id || `q${idx + 1}`),
        questionType,
        correctIndices: Array.isArray(question?.correctIndices)
          ? question.correctIndices.map((x) => Number(x)).filter((x) => Number.isInteger(x))
          : [],
      };
    }),
  };
}

function migrateStateToV3(state) {
  const next = deepClone(state);
  if (!next.contents) next.contents = {};
  if (!next.contents.quizzes || typeof next.contents.quizzes !== 'object') next.contents.quizzes = {};
  if (!next.contents.sequenceQuizzes || typeof next.contents.sequenceQuizzes !== 'object') next.contents.sequenceQuizzes = {};

  // Merge legacy sequence quizzes into canonical quiz store as ordering questions.
  Object.values(next.contents.sequenceQuizzes).forEach((legacy) => {
    const id = String(legacy?.id || '');
    if (!id) return;
    if (!next.contents.quizzes[id]) {
      next.contents.quizzes[id] = toOrderingQuizFromLegacy(legacy);
    }
  });
  next.contents.sequenceQuizzes = {};

  // Normalize existing quizzes question metadata.
  Object.keys(next.contents.quizzes).forEach((key) => {
    next.contents.quizzes[key] = normalizeQuizQuestions(next.contents.quizzes[key]);
  });

  // Normalize course item types to `quiz`.
  next.courses = (next.courses || []).map((course) => ({
    ...course,
    modules: (course.modules || []).map((module) => ({
      ...module,
      items: (module.items || []).map((item) => ({
        ...item,
        type: (item.type === 'quiz_mc' || item.type === 'quiz_sequence') ? 'quiz' : item.type,
      })),
    })),
  }));

  next.schemaVersion = SCHEMA_VERSION;
  return next;
}

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Failed to open IndexedDB'));
    request.onblocked = () => reject(new Error('IndexedDB open is blocked by another tab'));
  });
}

async function readState() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(STATE_KEY);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error || new Error('Failed to read IndexedDB state'));

    tx.oncomplete = () => db.close();
    tx.onerror = () => db.close();
    tx.onabort = () => db.close();
  });
}

async function writeState(state) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(state, STATE_KEY);

    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error || new Error('Failed to write IndexedDB state'));
    };
    tx.onabort = () => {
      db.close();
      reject(tx.error || new Error('IndexedDB write aborted'));
    };
  });
}

function applyState(state) {
  replaceArray(users, state.users);
  replaceArray(courses, state.courses);
  replaceArray(auditLogs, state.auditLogs);
  replaceArray(assignments, state.assignments);
  replaceArray(reminders, state.reminders);
  replaceObject(flashcards, state.contents?.flashcards || {});
  replaceObject(videos, state.contents?.videos || {});
  replaceObject(audios, state.contents?.audios || {});
  replaceObject(quizzes, state.contents?.quizzes || {});
  replaceObject(sequenceQuizzes, state.contents?.sequenceQuizzes || {});
  replaceObject(roleplays, state.contents?.roleplays || {});
  replaceObject(readingLessons, state.contents?.readingLessons || {});
  replaceObject(assignmentsCatalog, state.contents?.assignmentsCatalog || {});
  replaceObject(surveys, state.contents?.surveys || {});
  replaceObject(liveSessions, state.contents?.liveSessions || {});
  lastAppliedRevision = Number(state?.stateRevision || 0) || Date.now();
}

function snapshotState() {
  return {
    schemaVersion: SCHEMA_VERSION,
    stateRevision: Date.now(),
    users: deepClone(users),
    courses: deepClone(courses),
    auditLogs: deepClone(auditLogs),
    assignments: deepClone(assignments),
    reminders: deepClone(reminders),
    contents: {
      flashcards: deepClone(flashcards),
      videos: deepClone(videos),
      audios: deepClone(audios),
      quizzes: deepClone(quizzes),
      sequenceQuizzes: deepClone(sequenceQuizzes),
      roleplays: deepClone(roleplays),
      readingLessons: deepClone(readingLessons),
      assignmentsCatalog: deepClone(assignmentsCatalog),
      surveys: deepClone(surveys),
      liveSessions: deepClone(liveSessions),
    },
  };
}

async function syncFromPersistedStateIfNewer() {
  if (!canUseIndexedDB()) return;
  try {
    const persisted = await readState();
    if (!persisted) return;
    const normalized = migrateStateToV3(normalizeState(persisted));
    const revision = Number(normalized.stateRevision || 0);
    if (revision > lastAppliedRevision) {
      applyState(normalized);
    }
  } catch {
    // ignore sync failures
  }
}

export async function ensureStateHydrated() {
  if (hydrated) {
    await syncFromPersistedStateIfNewer();
    return;
  }
  if (hydratePromise) return hydratePromise;

  hydratePromise = (async () => {
    let state = defaultState();
    if (canUseIndexedDB()) {
      try {
        const persisted = await readState();
        state = migrateStateToV3(normalizeState(persisted));
        await writeState(state);
      } catch {
        // fallback to in-memory state
      }
    } else {
      state = migrateStateToV3(state);
    }

    applyState(state);
    hydrated = true;
  })();

  try {
    await hydratePromise;
  } finally {
    hydratePromise = null;
  }
}

export async function persistState() {
  await ensureStateHydrated();
  if (!canUseIndexedDB()) return;
  const snapshot = snapshotState();
  try {
    await writeState(snapshot);
    announceStateSync(snapshot.stateRevision);
  } catch {
    // ignore persistence failure and keep app functional
  }
}

export async function resetStateToSeed() {
  const seeded = defaultState();
  applyState(seeded);
  hydrated = true;
  if (!canUseIndexedDB()) return;
  try {
    await writeState(seeded);
    announceStateSync(seeded.stateRevision);
  } catch {
    // ignore
  }
}

export { assignments, reminders };

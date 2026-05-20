import { users } from '../../data/mockUsers.js';
import { courses } from '../../data/mockCourses.js';
import { auditLogs } from '../../data/mockReports.js';
import { audios, flashcards, quizzes, roleplays, sequenceQuizzes, videos } from '../../data/mockContent.js';

const DB_NAME = 'starlent_mock_db';
const DB_VERSION = 1;
const STORE_NAME = 'kv';
const STATE_KEY = 'management_state_v1';
const SCHEMA_VERSION = 2;

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

const assignments = [];
const reminders = [];

let hydrated = false;
let hydratePromise = null;

function canUseIndexedDB() {
  return typeof indexedDB !== 'undefined';
}

function defaultState() {
  return {
    schemaVersion: SCHEMA_VERSION,
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
    },
  };
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
}

function snapshotState() {
  return {
    schemaVersion: SCHEMA_VERSION,
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
    },
  };
}

export async function ensureStateHydrated() {
  if (hydrated) return;
  if (hydratePromise) return hydratePromise;

  hydratePromise = (async () => {
    let state = defaultState();
    if (canUseIndexedDB()) {
      try {
        const persisted = await readState();
        state = normalizeState(persisted);
        await writeState(state);
      } catch {
        // fallback to in-memory state
      }
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
  try {
    await writeState(snapshotState());
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
  } catch {
    // ignore
  }
}

export { assignments, reminders };

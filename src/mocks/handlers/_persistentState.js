import { users } from '../../data/mockUsers.js';
import { courses } from '../../data/mockCourses.js';
import { auditLogs } from '../../data/mockReports.js';
import { tenants as seedTenantRecords } from '../../data/mockTenants.js';
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
const seedTenants = deepClone(seedTenantRecords);

const assignments = [];
const reminders = [];
const tenants = deepClone(seedTenants);

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
    tenants: deepClone(seedTenants),
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
    && Array.isArray(state.reminders)
    && Array.isArray(state.tenants);
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
    tenants: Array.isArray(state.tenants) ? state.tenants : seeded.tenants,
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

function looksMojibake(value) {
  if (!value) return false;
  const text = String(value);
  return /Ã|Â|Ä|Æ|á»|âœ|â€|ðŸ|\uFFFD/.test(text);
}

function normalizeFlashcardContent(flashcard, fallbackId) {
  const id = String(flashcard?.id || fallbackId || `fc_${Date.now()}`);
  const seedFlashcard = seedFlashcards?.[id];
  const hasBrokenText = looksMojibake(flashcard?.title)
    || (Array.isArray(flashcard?.cards) && flashcard.cards.some((card) => (
      looksMojibake(card?.front)
      || looksMojibake(card?.explanation)
      || (Array.isArray(card?.options) && card.options.some((option) => looksMojibake(option)))
    )));
  const source = (seedFlashcard && hasBrokenText) ? seedFlashcard : flashcard;
  return {
    ...flashcard,
    id,
    title: String(source?.title || ''),
    cards: Array.isArray(source?.cards)
      ? source.cards.map((card, idx) => ({
        id: String(card?.id || `${id}_${idx + 1}`),
        front: String(card?.front || ''),
        options: Array.isArray(card?.options) ? card.options.map((option) => String(option || '')) : [],
        correctIndex: Math.max(0, Number(card?.correctIndex || 0)),
        explanation: String(card?.explanation || ''),
      }))
      : [],
  };
}

function normalizeQuizContent(quiz, fallbackId) {
  const id = String(quiz?.id || fallbackId || `qz_${Date.now()}`);
  const seedQuiz = seedQuizzes?.[id] || (seedSequenceQuizzes?.[id] ? toOrderingQuizFromLegacy(seedSequenceQuizzes[id]) : null);
  const hasBrokenText = looksMojibake(quiz?.title)
    || (Array.isArray(quiz?.questions) && quiz.questions.some((question) => (
      looksMojibake(question?.question)
      || looksMojibake(question?.prompt)
      || looksMojibake(question?.explanation)
      || looksMojibake(question?.sampleAnswer)
      || (Array.isArray(question?.options) && question.options.some((option) => looksMojibake(option)))
      || (Array.isArray(question?.items) && question.items.some((item) => looksMojibake(item?.text)))
    )));
  const source = (seedQuiz && hasBrokenText) ? seedQuiz : quiz;
  return normalizeQuizQuestions({
    ...source,
    id,
    title: String(source?.title || ''),
    questions: Array.isArray(source?.questions)
      ? source.questions.map((question, idx) => ({
        ...question,
        id: String(question?.id || `q${idx + 1}`),
        question: String(question?.question || ''),
        prompt: String(question?.prompt || ''),
        explanation: String(question?.explanation || ''),
        sampleAnswer: String(question?.sampleAnswer || ''),
        options: Array.isArray(question?.options) ? question.options.map((option) => String(option || '')) : [],
        items: Array.isArray(question?.items)
          ? question.items.map((item, itemIdx) => ({
            id: String(item?.id || `s${itemIdx + 1}`),
            text: String(item?.text || ''),
          }))
          : [],
      }))
      : [],
  });
}

function normalizeRoleplayContent(roleplay, fallbackId) {
  const id = String(roleplay?.id || fallbackId || `rp_${Date.now()}`);
  const seedRoleplay = seedRoleplays?.[id];
  const hasBrokenText = looksMojibake(roleplay?.title)
    || looksMojibake(roleplay?.scenario)
    || looksMojibake(roleplay?.suggestedResponse)
    || (Array.isArray(roleplay?.tips) && roleplay.tips.some((tip) => looksMojibake(tip)));
  const source = (seedRoleplay && hasBrokenText) ? seedRoleplay : roleplay;
  return {
    ...roleplay,
    id,
    title: String(source?.title || ''),
    scenario: String(source?.scenario || ''),
    suggestedResponse: String(source?.suggestedResponse || ''),
    tips: Array.isArray(source?.tips) ? source.tips.map((tip) => String(tip || '')) : [],
  };
}
function normalizeVideoContent(video, fallbackId) {
  const id = String(video?.id || fallbackId || `vd_${Date.now()}`);
  const seedVideo = seedVideos?.[id];
  const hasLegacyShape = (
    (!Array.isArray(video?.transcriptSegments) || video.transcriptSegments.length <= 1)
    && (!Array.isArray(video?.checkpoints) || video.checkpoints.length === 0)
  );
  const hasBrokenText = looksMojibake(video?.title)
    || looksMojibake(video?.transcript)
    || (Array.isArray(video?.transcriptSegments) && video.transcriptSegments.some((segment) => looksMojibake(segment?.text)))
    || (Array.isArray(video?.checkpoints) && video.checkpoints.some((checkpoint) => (
      looksMojibake(checkpoint?.question)
      || (Array.isArray(checkpoint?.options) && checkpoint.options.some((option) => looksMojibake(option)))
    )));
  const source = (seedVideo && (hasLegacyShape || hasBrokenText)) ? seedVideo : video;
  const transcript = String(source?.transcript || '');
  const duration = Math.max(0, Number(source?.duration || 0));
  const transcriptSegments = Array.isArray(source?.transcriptSegments)
    ? source.transcriptSegments.map((segment, idx) => ({
      id: String(segment?.id || `seg_${idx + 1}`),
      startSec: Math.max(0, Number(segment?.startSec || 0)),
      endSec: Math.max(0, Number(segment?.endSec || 0)),
      text: String(segment?.text || ''),
    }))
    : [];
  return {
    ...video,
    id,
    title: String(source?.title || video?.title || ''),
    videoUrl: String(source?.videoUrl || ''),
    youtubeId: String(source?.youtubeId || ''),
    progressMode: String(source?.progressMode || video?.progressMode || 'lesson_duration') === 'full_video_duration' ? 'full_video_duration' : 'lesson_duration',
    duration,
    transcript,
    captions: String(source?.captions || ''),
    transcriptSegments: transcriptSegments.length > 0
      ? transcriptSegments
      : [{
        id: 'seg_1',
        startSec: 0,
        endSec: duration,
        text: transcript,
      }],
    checkpoints: Array.isArray(source?.checkpoints)
      ? source.checkpoints.map((checkpoint, idx) => ({
        id: String(checkpoint?.id || `cp_${idx + 1}`),
        atSec: Math.max(0, Number(checkpoint?.atSec || 0)),
        question: String(checkpoint?.question || ''),
        options: Array.isArray(checkpoint?.options)
          ? checkpoint.options.map((option) => String(option || ''))
          : [],
        correctIndex: Math.max(0, Number(checkpoint?.correctIndex || 0)),
      }))
      : [],
  };
}

function normalizeAudioContent(audio, fallbackId) {
  const id = String(audio?.id || fallbackId || `ad_${Date.now()}`);
  const seedAudio = seedAudios?.[id];
  const hasLegacyShape = (
    (!Array.isArray(audio?.transcriptSegments) || audio.transcriptSegments.length <= 1)
    && (!Array.isArray(audio?.checkpoints) || audio.checkpoints.length === 0)
  );
  const hasBrokenText = looksMojibake(audio?.title)
    || looksMojibake(audio?.transcript)
    || (Array.isArray(audio?.transcriptSegments) && audio.transcriptSegments.some((segment) => looksMojibake(segment?.text)))
    || (Array.isArray(audio?.checkpoints) && audio.checkpoints.some((checkpoint) => (
      looksMojibake(checkpoint?.question)
      || (Array.isArray(checkpoint?.options) && checkpoint.options.some((option) => looksMojibake(option)))
    )));
  const source = (seedAudio && (hasLegacyShape || hasBrokenText)) ? seedAudio : audio;
  const transcript = String(source?.transcript || '');
  const duration = Math.max(0, Number(source?.duration || audio?.duration || 0));
  const transcriptSegments = Array.isArray(source?.transcriptSegments)
    ? source.transcriptSegments.map((segment, idx) => ({
      id: String(segment?.id || `seg_${idx + 1}`),
      startSec: Math.max(0, Number(segment?.startSec || 0)),
      endSec: Math.max(0, Number(segment?.endSec || 0)),
      text: String(segment?.text || ''),
    }))
    : [];
  return {
    ...audio,
    id,
    audioUrl: source?.audioUrl == null ? null : String(source.audioUrl),
    duration: Math.max(0, Number(source?.duration || duration)),
    transcript: String(source?.transcript || transcript),
    transcriptSegments: transcriptSegments.length > 0
      ? transcriptSegments
      : [{
        id: 'seg_1',
        startSec: 0,
        endSec: duration,
        text: transcript,
      }],
    checkpoints: Array.isArray(source?.checkpoints)
      ? source.checkpoints.map((checkpoint, idx) => ({
        id: String(checkpoint?.id || `cp_${idx + 1}`),
        atSec: Math.max(0, Number(checkpoint?.atSec || 0)),
        question: String(checkpoint?.question || ''),
        options: Array.isArray(checkpoint?.options)
          ? checkpoint.options.map((option) => String(option || ''))
          : [],
        correctIndex: Math.max(0, Number(checkpoint?.correctIndex || 0)),
      }))
      : [],
  };
}

function ensureC1HasLiveSession(state) {
  if (!Array.isArray(state?.courses)) return;
  const course = state.courses.find((item) => item?.id === 'c1');
  if (!course || !Array.isArray(course.modules)) return;
  const module1 = course.modules.find((item) => item?.id === 'm1');
  if (!module1) return;
  if (!Array.isArray(module1.items)) module1.items = [];
  const exists = module1.items.some((item) => item?.id === 'i3_ls1' || (item?.type === 'live_session' && item?.contentId === 'ls1'));
  if (exists) return;
  module1.items.push({
    id: 'i3_ls1',
    type: 'live_session',
    title: 'Live Session: Workshop Q&A trá»±c tuyáº¿n',
    contentId: 'ls1',
  });
}

function normalizeLiveSessionContent(session, fallbackId) {
  const id = String(session?.id || fallbackId || `ls_${Date.now()}`);
  const seedSession = seedLiveSessions?.[id];
  const hasBrokenText = looksMojibake(session?.title) || looksMojibake(session?.notes);
  const shouldUseSeed = !!seedSession && (
    !session
    || String(session?.meetingUrl || '').includes('meet.example.com/starlent-live')
    || hasBrokenText
  );
  const source = shouldUseSeed ? seedSession : session;
  return {
    ...session,
    id,
    title: String(source?.title || ''),
    meetingUrl: String(source?.meetingUrl || ''),
    startAt: source?.startAt || null,
    endAt: source?.endAt || null,
    host: String(source?.host || ''),
    notes: String(source?.notes || ''),
  };
}

function migrateStateToV3(state) {
  const next = deepClone(state);
  if (!next.contents) next.contents = {};
  if (!next.contents.videos || typeof next.contents.videos !== 'object') next.contents.videos = {};
  if (!next.contents.flashcards || typeof next.contents.flashcards !== 'object') next.contents.flashcards = {};
  if (!next.contents.quizzes || typeof next.contents.quizzes !== 'object') next.contents.quizzes = {};
  if (!next.contents.sequenceQuizzes || typeof next.contents.sequenceQuizzes !== 'object') next.contents.sequenceQuizzes = {};
  if (!next.contents.roleplays || typeof next.contents.roleplays !== 'object') next.contents.roleplays = {};
  if (!next.contents.audios || typeof next.contents.audios !== 'object') next.contents.audios = {};
  if (!next.contents.liveSessions || typeof next.contents.liveSessions !== 'object') next.contents.liveSessions = {};

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
    next.contents.quizzes[key] = normalizeQuizContent(next.contents.quizzes[key], key);
  });

  // Normalize video schema so legacy persisted records stay in sync with learner/editor.
  Object.keys(next.contents.videos).forEach((key) => {
    next.contents.videos[key] = normalizeVideoContent(next.contents.videos[key], key);
  });

  // Normalize flashcard text to recover persisted mojibake.
  Object.keys(next.contents.flashcards).forEach((key) => {
    next.contents.flashcards[key] = normalizeFlashcardContent(next.contents.flashcards[key], key);
  });

  // Normalize audio schema so legacy persisted records stay in sync with learner/editor.
  Object.keys(next.contents.audios).forEach((key) => {
    next.contents.audios[key] = normalizeAudioContent(next.contents.audios[key], key);
  });

  // Normalize roleplay text to recover persisted mojibake.
  Object.keys(next.contents.roleplays).forEach((key) => {
    next.contents.roleplays[key] = normalizeRoleplayContent(next.contents.roleplays[key], key);
  });

  // Normalize live session schema and backfill official meeting links.
  Object.keys(next.contents.liveSessions).forEach((key) => {
    next.contents.liveSessions[key] = normalizeLiveSessionContent(next.contents.liveSessions[key], key);
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
  ensureC1HasLiveSession(next);

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
  replaceArray(tenants, state.tenants);
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
    tenants: deepClone(tenants),
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

export { assignments, reminders, tenants };



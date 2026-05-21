export const CONTENT_TYPES = {
  LESSON_VIDEO: 'video',
  LESSON_AUDIO: 'audio',
  LESSON_READING: 'lesson_reading',
  FLASHCARD: 'flashcard',
  QUIZ: 'quiz',
  QUIZ_SEQUENCE_LEGACY: 'quiz_sequence',
  ROLEPLAY: 'roleplay',
  ASSIGNMENT: 'assignment',
  SURVEY: 'survey',
  LIVE_SESSION: 'live_session',
};

export const QUIZ_QUESTION_TYPES = {
  SINGLE_CHOICE: 'single_choice',
  MULTIPLE_SELECT: 'multiple_select',
  TRUE_FALSE: 'true_false',
  SHORT_ANSWER: 'short_answer',
  ORDERING: 'ordering',
};

export const CONTENT_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
};

export const DIFFICULTY_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
};

export function createContentMetadataDefaults() {
  return {
    status: CONTENT_STATUS.DRAFT,
    version: 1,
    estimatedDuration: 10,
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    tags: [],
    skills: [],
    availableFrom: null,
    dueAt: null,
    createdBy: null,
    updatedBy: null,
    createdAt: null,
    updatedAt: null,
  };
}


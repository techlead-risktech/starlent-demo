import { authHandlers } from './authHandlers.js';
import { learnerHandlers } from './learnerHandlers.js';
import { coursesHandlers } from './coursesHandlers.js';
import { learningHandlers } from './learningHandlers.js';
import { engagementHandlers } from './engagementHandlers.js';
import { managementHandlers } from './managementHandlers.js';

export const handlers = [...authHandlers, ...learnerHandlers, ...coursesHandlers, ...learningHandlers, ...engagementHandlers, ...managementHandlers];

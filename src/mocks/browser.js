import { setupWorker } from 'msw/browser';
import { handlers } from './handlers/index.js';

const worker = setupWorker(...handlers);

export async function enableMocking() {
  const disabled = import.meta.env.VITE_ENABLE_MOCK_API === 'false';
  if (disabled) return;

  await worker.start({
    onUnhandledRequest: 'bypass',
  });
}


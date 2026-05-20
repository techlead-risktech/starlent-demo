import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './app/App.jsx'
import './styles/global.css'

async function bootstrap() {
  if (import.meta.env.VITE_ENABLE_MOCK_API !== 'false') {
    const { enableMocking } = await import('./mocks/browser.js');
    await enableMocking();
  }

  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>,
  );
}

bootstrap();

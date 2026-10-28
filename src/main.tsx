import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import '@fontsource/tinos/400.css'
import '@fontsource/tinos/700.css'
import '@fontsource/tinos/700-italic.css'
import '@fontsource/tinos/400-italic.css'
import '@fontsource/carlito/400.css'
import '@fontsource/carlito/700.css'
import '@fontsource-variable/playfair-display'
import '@fontsource-variable/oswald'
import '@fontsource/pinyon-script/400.css'
import './styles/index.css'

import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

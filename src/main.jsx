import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import HabitTracker from './HabitTracker'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HabitTracker />
  </StrictMode>
)

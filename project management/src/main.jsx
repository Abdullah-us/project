// src/main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from './contexts/AuthContext'
import { TeamProvider } from './contexts/TeamContext'      // Add this import
import { ProjectProvider } from './contexts/ProjectContext'
import { TaskProvider } from './contexts/TaskContext'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <TeamProvider>                                      {/* Add this provider */}
        <ProjectProvider>
          <TaskProvider>
            <App />
          </TaskProvider>
        </ProjectProvider>
      </TeamProvider>                                     {/* Add this provider */}
    </AuthProvider>
  </StrictMode>,
)
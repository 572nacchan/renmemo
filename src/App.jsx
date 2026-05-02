import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import AuthGuard from './components/auth/AuthGuard'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import PiecesPage from './pages/PiecesPage'
import RecordsPage from './pages/RecordsPage'
import CalendarPage from './pages/CalendarPage'
import ToolsPage from './pages/ToolsPage'

function PrivateRoutes() {
  return (
    <AuthGuard>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/pieces" element={<PiecesPage />} />
        <Route path="/records" element={<RecordsPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/tools" element={<ToolsPage />} />
      </Routes>
    </AuthGuard>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/*" element={<PrivateRoutes />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

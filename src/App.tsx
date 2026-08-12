import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './portal-app/lib/AuthContext'
import { ThemeProvider } from './portal-app/lib/ThemeContext'
import ProtectedRoute from './portal-app/lib/ProtectedRoute'
import Login from './portal-app/screens/Login'
import Dashboard from './portal-app/screens/Dashboard'
import Questionnaire from './portal-app/screens/enrollment/Questionnaire'
import PlanEnrollment from './portal-app/screens/enrollment/PlanEnrollment'
import Statements from './portal-app/screens/Statements'
import Investments from './portal-app/screens/Investments'
import Transactions from './portal-app/screens/Transactions'
import Profile from './portal-app/screens/Profile'

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/enrollment" element={<Questionnaire />} />
              <Route path="/enroll" element={<PlanEnrollment />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/statements" element={<Statements />} />
              <Route path="/investments" element={<Investments />} />
            </Route>

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

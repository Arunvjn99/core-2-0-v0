import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { AuthProvider } from './portal-app/lib/AuthContext'
import { ThemeProvider } from './portal-app/lib/ThemeContext'
import { ToastProvider } from './ui-kit/lib/ToastContext'
import ProtectedRoute from './portal-app/lib/ProtectedRoute'
import Login from './portal-app/screens/Login'
import Dashboard from './portal-app/screens/Dashboard'
import EnrollmentHub from './portal-app/screens/enrollment/EnrollmentHub'
import ManagePlan from './portal-app/screens/enrollment/ManagePlan'
import Questionnaire from './portal-app/screens/enrollment/Questionnaire'
import PlanEnrollment from './portal-app/screens/enrollment/PlanEnrollment'
import Statements from './portal-app/screens/Statements'
import Investments from './portal-app/screens/Investments'
import TransactionsHub from './portal-app/screens/transactions/TransactionsHub'
import LoanSummary from './portal-app/screens/transactions/LoanSummary'
import NewTransferRequest from './portal-app/screens/transactions/NewTransferRequest'
import TransferSummary from './portal-app/screens/transactions/TransferSummary'
import NewRolloverRequest from './portal-app/screens/transactions/NewRolloverRequest'
import RolloverSummary from './portal-app/screens/transactions/RolloverSummary'
import Profile from './portal-app/screens/Profile'
import AdminClients from './admin-app/screens/Clients'
import AdminThemeEditor from './admin-app/screens/ThemeEditor'
import AdminModuleToggles from './admin-app/screens/ModuleToggles'

function AnimatedRoutes() {
  const location = useLocation()
  const reduce = useReducedMotion()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={reduce ? undefined : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduce ? undefined : { opacity: 0, y: -8 }}
        transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
      >
        <Routes location={location}>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/enrollment" element={<EnrollmentHub />} />
            <Route path="/enrollment/questionnaire" element={<Questionnaire />} />
            <Route path="/enrollment/manage-plan" element={<ManagePlan />} />
            <Route path="/my-plans" element={<Navigate to="/enrollment" replace />} />
            <Route path="/enroll" element={<PlanEnrollment />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/transactions" element={<TransactionsHub />} />
            <Route path="/transactions/loan" element={<LoanSummary />} />
            <Route path="/transactions/new-transfer" element={<NewTransferRequest />} />
            <Route path="/transactions/transfer-summary" element={<TransferSummary />} />
            <Route path="/transactions/new-rollover" element={<NewRolloverRequest />} />
            <Route path="/transactions/rollover-summary" element={<RolloverSummary />} />
            <Route path="/statements" element={<Statements />} />
            <Route path="/investments" element={<Investments />} />

            <Route path="/admin/clients" element={<AdminClients />} />
            <Route path="/admin/theme" element={<AdminThemeEditor />} />
            <Route path="/admin/modules" element={<AdminModuleToggles />} />
            <Route path="/admin" element={<Navigate to="/admin/clients" replace />} />
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <AnimatedRoutes />
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute.jsx';
import { useAuth } from '../hooks/useAuth.js';

// ── Pages imported here as each ticket is completed ──────────────────────────
// MI-29: import LoginPage from '../pages/Login/LoginPage.jsx';
// MI-33: import DashboardPage from '../pages/Dashboard/DashboardPage.jsx';
// MI-30: import ItemsPage from '../pages/Items/ItemsPage.jsx';
// MI-31: import NewTransactionPage from '../pages/Transactions/NewTransactionPage.jsx';
// MI-32: import TransactionsPage from '../pages/Transactions/TransactionsPage.jsx';
// MI-34: import AdminsPage from '../pages/Admins/AdminsPage.jsx';
// MI-35: import ReportsPage from '../pages/Reports/ReportsPage.jsx';
// MI-35: import AuditPage from '../pages/Audit/AuditPage.jsx';
// MI-35: import EventLogPage from '../pages/EventLog/EventLogPage.jsx';

const Placeholder = ({ label }) => (
  <div className="d-flex justify-content-center align-items-center min-vh-100">
    <div className="text-center text-muted">
      <h4>{label}</h4>
      <small>Ticket not yet implemented</small>
    </div>
  </div>
);

export default function AppRoutes() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border" role="status" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public */}
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <Placeholder label="Login — MI-29" />}
      />

      {/* Protected — any role */}
      <Route path="/" element={
        <ProtectedRoute><Placeholder label="Dashboard — MI-33" /></ProtectedRoute>
      } />
      <Route path="/transactions" element={
        <ProtectedRoute><Placeholder label="Transactions — MI-32" /></ProtectedRoute>
      } />
      <Route path="/transactions/new" element={
        <ProtectedRoute><Placeholder label="New Transaction — MI-31" /></ProtectedRoute>
      } />

      {/* Protected — Super only */}
      <Route path="/items" element={
        <ProtectedRoute requiredRole="Super"><Placeholder label="Items — MI-30" /></ProtectedRoute>
      } />
      <Route path="/admins" element={
        <ProtectedRoute requiredRole="Super"><Placeholder label="Admins — MI-34" /></ProtectedRoute>
      } />
      <Route path="/reports" element={
        <ProtectedRoute requiredRole="Super"><Placeholder label="Reports — MI-35" /></ProtectedRoute>
      } />
      <Route path="/audit" element={
        <ProtectedRoute requiredRole="Super"><Placeholder label="Audit Log — MI-35" /></ProtectedRoute>
      } />
      <Route path="/eventlog" element={
        <ProtectedRoute requiredRole="Super"><Placeholder label="Event Log — MI-35" /></ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

// Core Pages
import { LandingPage } from './pages/LandingPage';
import { DashboardRouter } from './pages/dashboards/DashboardRouter';
import { MapPage } from './pages/MapPage';
import { PfzExplorerPage } from './pages/PfzExplorerPage';
import { PfzDetailPage } from './pages/PfzDetailPage';
import { AllocationPage } from './pages/AllocationPage';
import { AgentsPage } from './pages/AgentsPage';
import { AgentDetailPage } from './pages/AgentDetailPage';
import { TasksPage } from './pages/TasksPage';
import { TaskDetailPage } from './pages/TaskDetailPage';
import { CasesPage } from './pages/CasesPage';
import { CaseDetailPage } from './pages/CaseDetailPage';
import { SosPage } from './pages/SosPage';
import { SosDetailPage } from './pages/SosDetailPage';
import { ChatPage } from './pages/ChatPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ReportsPage } from './pages/ReportsPage';
import { UsersPage } from './pages/UsersPage';
import { ZonesPage } from './pages/ZonesPage';
import { DataSourcesPage } from './pages/DataSourcesPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { SettingsPage } from './pages/SettingsPage';
import { HelpPage } from './pages/HelpPage';
import { ProfilePage } from './pages/ProfilePage';
import { VoyagePlannerPage } from './pages/VoyagePlannerPage';
import { SafetyMonitorPage } from './pages/SafetyMonitorPage';

// Auth Pages
import { LoginPage } from './pages/Auth/LoginPage';
import { RegisterPage } from './pages/Auth/RegisterPage';
import { ForgotPasswordPage } from './pages/Auth/ForgotPasswordPage';

export const App: React.FC = () => {
  return (
    <Routes>
      {/* Public / Non-Layout Auth Pages */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Main Operations Portal with Navigation Shell */}
      <Route path="/" element={<AppLayout />}>
        <Route index element={<LandingPage />} />
        
        {/* Core unprotected (or all roles) routes */}
        <Route path="dashboard" element={<DashboardRouter />} />
        <Route path="map" element={<MapPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="help" element={<HelpPage />} />

        {/* PFZ Advisories */}
        <Route element={<ProtectedRoute allowedRoles={['fisherman', 'agent', 'supervisor', 'researcher', 'analyst', 'admin']} />}>
          <Route path="pfz" element={<PfzExplorerPage />} />
          <Route path="pfz/:id" element={<PfzDetailPage />} />
        </Route>

        {/* Voyage Planner */}
        <Route element={<ProtectedRoute allowedRoles={['fisherman', 'admin']} />}>
          <Route path="voyage-planner" element={<VoyagePlannerPage />} />
        </Route>

        {/* Safety Monitor */}
        <Route element={<ProtectedRoute allowedRoles={['supervisor', 'disaster_authority', 'admin']} />}>
          <Route path="safety-monitor" element={<SafetyMonitorPage />} />
        </Route>

        {/* Emergency SOS */}
        <Route element={<ProtectedRoute allowedRoles={['fisherman', 'agent', 'supervisor', 'disaster_authority', 'admin']} />}>
          <Route path="sos" element={<SosPage />} />
          <Route path="sos/:id" element={<SosDetailPage />} />
        </Route>

        {/* ORCA Assistant */}
        <Route element={<ProtectedRoute allowedRoles={['fisherman', 'agent', 'admin']} />}>
          <Route path="chat" element={<ChatPage />} />
        </Route>

        {/* Agent Allocation & Field Agents */}
        <Route element={<ProtectedRoute allowedRoles={['supervisor', 'admin']} />}>
          <Route path="allocation" element={<AllocationPage />} />
          <Route path="agents" element={<AgentsPage />} />
          <Route path="agents/:id" element={<AgentDetailPage />} />
        </Route>

        {/* Cases & Requests */}
        <Route element={<ProtectedRoute allowedRoles={['agent', 'supervisor', 'disaster_authority', 'admin']} />}>
          <Route path="cases" element={<CasesPage />} />
          <Route path="cases/:id" element={<CaseDetailPage />} />
        </Route>

        {/* Field Tasks */}
        <Route element={<ProtectedRoute allowedRoles={['fisherman', 'agent', 'supervisor', 'admin']} />}>
          <Route path="tasks" element={<TasksPage />} />
          <Route path="tasks/:id" element={<TaskDetailPage />} />
        </Route>

        {/* Reports & Analytics */}
        <Route element={<ProtectedRoute allowedRoles={['supervisor', 'researcher', 'analyst', 'disaster_authority', 'admin']} />}>
          <Route path="reports" element={<ReportsPage />} />
        </Route>

        {/* Operational Zones */}
        <Route element={<ProtectedRoute allowedRoles={['supervisor', 'researcher', 'analyst', 'disaster_authority', 'admin']} />}>
          <Route path="zones" element={<ZonesPage />} />
        </Route>

        {/* Data Sources */}
        <Route element={<ProtectedRoute allowedRoles={['researcher', 'analyst', 'admin']} />}>
          <Route path="data-sources" element={<DataSourcesPage />} />
        </Route>

        {/* Admin only */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="users" element={<UsersPage />} />
          <Route path="audit-logs" element={<AuditLogsPage />} />
        </Route>

        {/* Fallback Catch-All */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

export default App;

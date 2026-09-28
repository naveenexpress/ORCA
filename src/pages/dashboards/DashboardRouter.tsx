import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { FishermanDashboard } from './FishermanDashboard';
import { DisasterDashboard } from './DisasterDashboard';
import { ResearchDashboard } from './ResearchDashboard';
import { AgentDashboard } from './AgentDashboard';
import { SupervisorDashboard } from './SupervisorDashboard';
import { AdminDashboard } from './AdminDashboard';
import { AnalystDashboard } from './AnalystDashboard';

export const DashboardRouter: React.FC = () => {
  const { activeRole } = useAuthStore();

  switch (activeRole) {
    case 'fisherman':
      return <FishermanDashboard />;
    case 'disaster_authority':
      return <DisasterDashboard />;
    case 'researcher':
      return <ResearchDashboard />;
    case 'agent':
      return <AgentDashboard />;
    case 'supervisor':
      return <SupervisorDashboard />;
    case 'admin':
      return <AdminDashboard />;
    case 'analyst':
      return <AnalystDashboard />;
    default:
      return <FishermanDashboard />;
  }
};

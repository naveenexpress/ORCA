import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import { Header } from '../common/Header';
import { Sidebar } from '../common/Sidebar';
import { MobileNav } from '../common/MobileNav';
import { SosTriggerModal } from '../sos/SosTriggerModal';
import { ToastContainer } from '../common/ToastContainer';
import { OrcaAssistantModal } from '../chat/OrcaAssistantModal';

export const AppLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { language } = useAuthStore();
  const { i18n } = useTranslation();

  return (
    <div key={`${language}-${i18n.language}`} className="h-screen max-h-screen bg-[#F7FBFE] text-[#123B6D] dark:bg-[#140C14] dark:text-[#FFF6EE] flex flex-col antialiased overflow-hidden transition-colors duration-200">
      {/* Top Navigation Header */}
      <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex-1 flex overflow-hidden min-h-0 relative">
        {/* Left Sidebar Navigation */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 relative min-h-0">
          <Outlet />
        </main>
      </div>

      {/* Bottom Navigation for Mobile */}
      <MobileNav />

      {/* Global Emergency Distress Trigger Modal */}
      <SosTriggerModal />

      {/* Global Floating Toast Notifications */}
      <ToastContainer />

      {/* Global AI Marine Chatbot Floating Widget */}
      <OrcaAssistantModal />
    </div>
  );
};

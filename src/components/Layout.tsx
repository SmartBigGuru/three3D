import React from 'react';
import { LayoutDashboard, FolderKanban, Settings, LogOut, Users } from 'lucide-react';
import { TeamManagement } from './TeamManagement';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [showTeamManagement, setShowTeamManagement] = React.useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200">
        <div className="flex items-center h-16 px-6 border-b border-gray-200">
          <FolderKanban className="w-8 h-8 text-indigo-600" />
          <span className="ml-3 text-lg font-semibold">3D Studio</span>
        </div>
        <nav className="p-4 space-y-1">
          <a
            href="#dashboard"
            className="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100"
          >
            <LayoutDashboard className="w-5 h-5 mr-3" />
            Dashboard
          </a>
          <button
            onClick={() => setShowTeamManagement(true)}
            className="w-full flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100"
          >
            <Users className="w-5 h-5 mr-3" />
            Teams
          </button>
          <a
            href="#settings"
            className="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100"
          >
            <Settings className="w-5 h-5 mr-3" />
            Settings
          </a>
          <button
            onClick={() => {}}
            className="flex items-center w-full px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </nav>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <header className="h-16 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between h-full px-6">
            <h1 className="text-lg font-semibold">Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">admin@example.com</span>
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                A
              </div>
            </div>
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
      
      {showTeamManagement && (
        <TeamManagement onClose={() => setShowTeamManagement(false)} />
      )}
    </div>
  );
}
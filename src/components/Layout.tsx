import React from 'react';
import {
  LayoutDashboard,
  FolderKanban,
  LogOut,
  Users,
} from 'lucide-react';
import { TeamManagement } from './TeamManagement';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [currentHash, setCurrentHash] = React.useState(window.location.hash);

  React.useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash);
    };
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200">
        <div className="flex items-center h-16 px-6 border-b border-gray-200">
          <FolderKanban className="w-8 h-8 text-indigo-600" />
          <span className="ml-3 text-lg font-semibold">3D Studio</span>
        </div>
        <nav className="p-4 space-y-1">
          {/* Dashboard Button */}
          <button
            onClick={() => {
              // Update the URL to remove query parameters and set #dashboard
              window.location.href = `${window.location.origin}/#dashboard`;
            }}
            className="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100"
          >
            <LayoutDashboard className="w-5 h-5 mr-3" />
            Dashboard
          </button>
          <button
            onClick={() => {}}
            className="w-full flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100"
          >
            <Users className="w-5 h-5 mr-3" />
            Teams
          </button>
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
            <div className="flex items-center h-16 px-6 border-b border-gray-200">
              <span className="ml-3 text-lg font-semibold">Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">admin@example.com</span>
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                A
              </div>
            </div>
          </div>
        </header>
        <main className="p-6">
          {/* Render content based on hash */}
          {currentHash === '#dashboard' && <div>Dashboard Content</div>}
          {currentHash === '#teams' && <TeamManagement />}
          {children}
        </main>
      </div>
    </div>
  );
}
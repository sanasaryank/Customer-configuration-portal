import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { FilterPanel } from './FilterPanel';
import { FilterProvider } from '../../providers/FilterProvider';

export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <FilterProvider>
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen((v) => !v)} />

        {/* Main area */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <TopBar onMenuToggle={() => setSidebarOpen((v) => !v)} />
          <div className="flex flex-1 min-h-0 overflow-hidden">
            <main className="flex-1 overflow-y-auto p-6">
              <Outlet />
            </main>
            <FilterPanel />
          </div>
        </div>
      </div>
    </FilterProvider>
  );
}

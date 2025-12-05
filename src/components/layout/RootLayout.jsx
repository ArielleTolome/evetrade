import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar, MobileNav } from '../common/Sidebar';
import { AnimatedBackground } from './AnimatedBackground';
import Header from './Header';
import { useKeyboardShortcuts, KeyboardShortcutsHelp } from '../../hooks/useKeyboardShortcuts.jsx';

/**
 * Root Layout Component
 * Uses sidebar navigation for desktop and bottom nav for mobile
 */
export function RootLayout() {
  const { showHelp, setShowHelp } = useKeyboardShortcuts();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const stored = localStorage.getItem('evetrade_sidebar_collapsed');
    return stored ? JSON.parse(stored) : false;
  });

  // Persist sidebar state
  useEffect(() => {
    localStorage.setItem('evetrade_sidebar_collapsed', JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  return (
    <div className="min-h-screen bg-space-black">
      <AnimatedBackground />

      {/* Desktop Sidebar */}
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content Area */}
      <div
        className={`
          transition-all duration-300
          ${sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'}
        `}
      >
        <Header />
        <main
          className={`
            min-h-screen
            pb-[calc(5rem+env(safe-area-inset-bottom))] lg:pb-0
          `}
        >
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />

      {/* Keyboard Shortcuts Help Modal */}
      <KeyboardShortcutsHelp isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </div>
  );
}

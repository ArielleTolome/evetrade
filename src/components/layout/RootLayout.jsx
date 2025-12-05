import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { SectionErrorBoundary } from '../common/ErrorBoundary';
import { Sidebar, MobileNav } from '../common/Sidebar';
import { AnimatedBackground } from './AnimatedBackground';
import Header from './Header';
import { useKeyboardShortcuts, KeyboardShortcutsHelp } from '../../hooks/useKeyboardShortcuts.jsx';
import useSidebar from '../../hooks/useSidebar';

/**
 * Root Layout Component
 * Uses sidebar navigation for desktop and bottom nav for mobile
 */
export function RootLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showHelp, setShowHelp } = useKeyboardShortcuts(undefined, undefined, {
    navigate,
    pathname: location.pathname,
  });
  const { isCollapsed, isHovering, setIsHovering, toggleSidebar } = useSidebar();
  const showMiniMode = isCollapsed && !isHovering;

  return (
    <div className="min-h-screen bg-space-black">
      <AnimatedBackground />

      {/* Desktop Sidebar */}
      <SectionErrorBoundary name="Sidebar">
        <Sidebar
          isCollapsed={isCollapsed}
          isHovering={isHovering}
          setIsHovering={setIsHovering}
          onToggle={toggleSidebar}
        />
      </SectionErrorBoundary>

      {/* Main Content Area */}
      <div
        className={`
          transition-all duration-300
          ${isCollapsed && !isHovering ? 'lg:pl-[60px]' : 'lg:pl-64'}
        `}
      >
        <Header />
        <main
          className={`
            min-h-screen
            pb-[calc(5rem+env(safe-area-inset-bottom))] lg:pb-0
          `}
        >
          <SectionErrorBoundary name="MainContent">
            <Outlet />
          </SectionErrorBoundary>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <SectionErrorBoundary name="MobileNav">
        <MobileNav />
      </SectionErrorBoundary>

      {/* Keyboard Shortcuts Help Modal */}
      <KeyboardShortcutsHelp isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </div>
  );
}

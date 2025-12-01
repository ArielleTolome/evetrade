import { RouterProvider } from 'react-router-dom';
import { ResourceProvider } from './hooks/useResources';
import { ThemeProvider } from './store/ThemeContext';
import { EveAuthProvider } from './hooks/useEveAuth';
import { router } from './router';

/**
 * Main App Component
 */
function App() {
  return (
    <ThemeProvider>
      <EveAuthProvider>
        <ResourceProvider>
          <RouterProvider router={router} />
        </ResourceProvider>
      </EveAuthProvider>
    </ThemeProvider>
  );
}

export default App;

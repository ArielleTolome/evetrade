import { RouterProvider } from 'react-router-dom';
import { ResourceProvider } from '@hooks/useResources';
import { ThemeProvider } from '@store/ThemeContext';
import { router } from '@/router';

/**
 * Main App Component
 */
function App() {
  return (
    <ThemeProvider>
      <ResourceProvider>
        <RouterProvider router={router} />
      </ResourceProvider>
    </ThemeProvider>
  );
}

export default App;

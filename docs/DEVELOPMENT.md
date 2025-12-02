# Development Guide

This guide covers setting up and developing the EVETrade frontend application.

## Prerequisites

- **Node.js** 18.x or higher
- **npm** 9.x or higher
- **Git** for version control

## Quick Start

```bash
# Clone the repository
git clone https://github.com/awhipp/evetrade.git
cd evetrade

# Install dependencies
npm install

# Start development server
npm run dev
```

The development server runs at `http://localhost:5173` with hot module replacement (HMR).

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite development server with HMR |
| `npm run build` | Build for production (outputs to `dist/`) |
| `npm run preview` | Preview production build locally |
| `npm run test` | Run Vitest in watch mode |
| `npm run test:run` | Run tests once |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run lint` | Run ESLint |

## Project Structure

```
evetrade/
├── src/                    # Application source code
│   ├── api/               # API client layer
│   ├── components/        # React components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Third-party integrations
│   ├── pages/             # Page components
│   ├── store/             # Global state (Context)
│   └── utils/             # Utility functions
├── api/                    # Vercel serverless functions
├── public/                 # Static assets
├── docs/                   # Documentation
└── dist/                   # Production build output
```

## Environment Variables

Create a `.env.local` file in the project root:

```bash
# Optional: Supabase configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Sentry configuration
VITE_SENTRY_DSN=your_sentry_dsn
```

The application works without these variables, using S3 as the default data source.

## Development Workflow

### Creating a New Page

1. Create the page component in `src/pages/`:

```jsx
// src/pages/MyFeaturePage.jsx
import { PageLayout } from '../components/layout/PageLayout';

export default function MyFeaturePage() {
  return (
    <PageLayout
      title="My Feature"
      description="Description of the feature"
    >
      {/* Page content */}
    </PageLayout>
  );
}
```

2. Add the route in `src/router.jsx`:

```jsx
const MyFeaturePage = lazy(() => import('./pages/MyFeaturePage'));

// In the routes array:
{
  path: 'my-feature',
  element: (
    <LazyPage>
      <MyFeaturePage />
    </LazyPage>
  ),
}
```

### Creating a New Component

1. Create the component in the appropriate directory:

```jsx
// src/components/common/MyComponent.jsx
export function MyComponent({ title, children }) {
  return (
    <div className="bg-space-dark/50 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      {children}
    </div>
  );
}
```

2. Export from the directory index if applicable:

```jsx
// src/components/common/index.js
export { MyComponent } from './MyComponent';
```

### Creating a Custom Hook

```jsx
// src/hooks/useMyHook.js
import { useState, useCallback } from 'react';

export function useMyHook(initialValue) {
  const [value, setValue] = useState(initialValue);

  const updateValue = useCallback((newValue) => {
    setValue(newValue);
  }, []);

  return { value, updateValue };
}
```

### Adding API Endpoints

1. For client-side API calls, add to `src/api/`:

```jsx
// src/api/myFeature.js
import client from './client';

export async function fetchMyData(params) {
  const response = await client.get('/api/my-endpoint', { params });
  return response.data;
}
```

2. For serverless functions, add to `api/`:

```javascript
// api/my-endpoint.js
export default async function handler(req, res) {
  // Handle the request
  res.json({ data: 'result' });
}
```

## Styling

The project uses Tailwind CSS with a custom space theme.

### Custom Colors

```css
/* Available in tailwind.config.js */
space-black: '#0a0a0f'
space-dark: '#12121a'
accent-cyan: '#00d4ff'
accent-purple: '#8b5cf6'
```

### Common Patterns

```jsx
// Card with glassmorphism effect
<div className="bg-space-dark/50 backdrop-blur-sm border border-white/10 rounded-lg p-6">

// Primary button
<button className="px-4 py-2 bg-accent-cyan hover:bg-accent-cyan/80 text-space-black font-semibold rounded-lg">

// Secondary button
<button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20">

// Input field
<input className="w-full px-4 py-2 bg-space-dark/50 border border-white/20 rounded-lg text-white placeholder:text-gray-500 focus:border-accent-cyan focus:outline-none" />
```

## Testing

Tests are written using Vitest and React Testing Library.

### Running Tests

```bash
# Watch mode
npm run test

# Single run
npm run test:run

# With coverage
npm run test:coverage
```

### Writing Tests

```jsx
// src/components/common/MyComponent.test.jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('renders title', () => {
    render(<MyComponent title="Test Title">Content</MyComponent>);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });
});
```

## Code Quality

### ESLint

```bash
# Run linter
npm run lint

# Fix auto-fixable issues
npm run lint -- --fix
```

### Prettier

```bash
# Format code
npx prettier --write src/
```

## Debugging

### React DevTools

Install the React DevTools browser extension for component inspection.

### Vite DevTools

Vite provides detailed error overlays and HMR status in the browser.

### Sentry (Production)

Errors in production are automatically captured by Sentry.

## Common Issues

### CORS Errors

The development server proxies API requests. If you encounter CORS issues:

1. Check that the API endpoint is correctly configured
2. Verify the backend service is running
3. Check the Vite proxy configuration

### Module Not Found

```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
```

### Build Failures

```bash
# Clear cache and rebuild
rm -rf dist node_modules/.vite
npm run build
```

## Performance Tips

1. **Use lazy loading** for new pages via `React.lazy()`
2. **Memoize expensive calculations** with `useMemo`
3. **Avoid unnecessary re-renders** with `useCallback` and `React.memo`
4. **Keep bundle size small** - check imports carefully

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Run tests and linting
4. Submit a pull request

See the main README for full contribution guidelines.

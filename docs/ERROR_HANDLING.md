# Error Handling Patterns

This document describes the standardized error handling approach used throughout the EVETrade application.

## Overview

All error handling uses `src/utils/errorHandler.js` for consistent error message extraction and display.

## Core Functions

### `formatErrorForDisplay(error, fallbackMessage?)`

Returns a user-friendly error message string for display in the UI.

```jsx
import { formatErrorForDisplay } from '../utils/errorHandler';

// In components
{error && <div>{formatErrorForDisplay(error)}</div>}
```

### `extractErrorMessage(error)`

Extracts standardized error object from any error type.

### Helper Functions

- `isNetworkError(error)` - Check if network error
- `isAuthError(error)` - Check if 401 auth error
- `isRateLimitError(error)` - Check if 429 rate limit error
- `getErrorStatusCode(error)` - Extract HTTP status code

## Usage

### In React Components

```jsx
import { formatErrorForDisplay } from '../utils/errorHandler';

{error && (
  <div className="error">
    <strong>Error:</strong> {formatErrorForDisplay(error)}
  </div>
)}
```

### In API Client

```javascript
import { formatErrorForDisplay } from '../utils/errorHandler';

try {
  const response = await apiClient.get(url, options);
  return response.data;
} catch (error) {
  throw new Error(formatErrorForDisplay(error, 'Failed to fetch data'));
}
```

## Error Response Format

Backend APIs should return:

```json
{
  "error": "Brief description",
  "message": "Detailed message for user"
}
```

## Best Practices

1. Always use `formatErrorForDisplay()` for user-facing messages
2. Use `logError()` for debugging with context
3. Backend APIs return `{ error, message }` format
4. Don't manually check `error.message` or `error.response`

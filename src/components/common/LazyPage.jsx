import { Suspense } from 'react';
import { SkeletonPage } from './components/common/SkeletonLoader';

/**
 * Lazy page wrapper with loading fallback
 */
export function LazyPage({ children }) {
  return (
    <Suspense fallback={<SkeletonPage />}>
      {children}
    </Suspense>
  );
}

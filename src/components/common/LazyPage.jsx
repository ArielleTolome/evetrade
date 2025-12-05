import { Suspense } from 'react';
import { PageErrorBoundary } from './ErrorBoundary';
import { SkeletonPage } from './SkeletonLoader';

/**
 * Lazy page wrapper with loading fallback
 */
export function LazyPage({ children }) {
    return (
        <PageErrorBoundary>
            <Suspense fallback={<SkeletonPage />}>
                {children}
            </Suspense>
        </PageErrorBoundary>
    );
}

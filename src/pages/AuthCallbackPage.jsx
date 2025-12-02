import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEveAuth } from '../hooks/useEveAuth';
import PageLayout from '../components/layout/PageLayout';
import { GlassmorphicCard } from '../components/common/GlassmorphicCard';
import { Button } from '../components/common/Button';

/**
 * EVE SSO OAuth Callback Page
 * Handles the redirect from EVE SSO and then redirects to portfolio
 */
function AuthCallbackPage() {
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useEveAuth();

  useEffect(() => {
    // Wait for auth to process the callback
    if (!loading) {
      // Redirect to portfolio after a brief delay to show status
      const timer = setTimeout(() => {
        navigate('/portfolio', { replace: true });
      }, isAuthenticated ? 1000 : 2000);
      return () => clearTimeout(timer);
    }
  }, [loading, isAuthenticated, navigate]);

  return (
    <PageLayout
      title="EVE SSO Login"
      subtitle="Processing authentication..."
    >
      <GlassmorphicCard className="max-w-md mx-auto">
        <div className="text-center py-8">
          {loading && (
            <>
              <div className="w-12 h-12 mx-auto mb-4 border-3 border-accent-cyan/30 border-t-accent-cyan rounded-full animate-spin" />
              <h3 className="text-lg font-medium text-text-primary mb-2">
                Authenticating with EVE Online...
              </h3>
              <p className="text-text-secondary text-sm">
                Please wait while we verify your credentials.
              </p>
            </>
          )}

          {!loading && isAuthenticated && (
            <>
              <div className="w-12 h-12 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-text-primary mb-2">
                Authentication Successful!
              </h3>
              <p className="text-text-secondary text-sm">
                Redirecting to your portfolio...
              </p>
            </>
          )}

          {!loading && !isAuthenticated && (
            <>
              <div className="w-12 h-12 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-text-primary mb-2">
                Authentication Failed
              </h3>
              <p className="text-text-secondary text-sm mb-4">
                {error || 'Unable to authenticate with EVE Online.'}
              </p>
              <Button
                onClick={() => navigate('/portfolio', { replace: true })}
                variant="secondary"
                className="px-4 py-2"
              >
                Return to Portfolio
              </Button>
            </>
          )}
        </div>
      </GlassmorphicCard>
    </PageLayout>
  );
}

export default AuthCallbackPage;

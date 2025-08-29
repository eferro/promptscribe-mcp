import { useState, useEffect, Suspense, lazy } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { getSession, onAuthStateChange, signOut } from "@/services/authService";
import AuthForm from "@/components/auth/AuthForm";
// Lazy load Dashboard to reduce initial bundle size
const Dashboard = lazy(() => import("@/pages/Dashboard"));
import PasswordChangeForm from "@/components/auth/PasswordChangeForm";
import { logger } from '@/lib/logger';

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPasswordChange, setShowPasswordChange] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const initializeAuth = async () => {
      try {
        // Get initial session first
        const { data, error } = await getSession() as {
          data: { session: Session | null } | null;
          error: { message: string } | null;
        };

        if (error) throw error;

        if (isMounted) {
          setUser(data?.session?.user ?? null);
          setLoading(false);
        }
      } catch (error) {
        logger.error('Auth initialization error:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Check if this is a password reset URL
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('access_token');
    const refreshToken = urlParams.get('refresh_token');
    const type = urlParams.get('type');
    
    // If we have tokens and type is recovery, this is a password reset
    if (accessToken && refreshToken && type === 'recovery') {
      setShowPasswordChange(true);
      // Clean up the URL by removing the query parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Set up auth state listener
    const { data: { subscription } } = onAuthStateChange(
      (event, session) => {
        if (isMounted) {
          setUser(session?.user ?? null);
          setLoading(false);
        }

        // If this is a password recovery event, show the password change form
        if (event === 'PASSWORD_RECOVERY' && isMounted) {
          setShowPasswordChange(true);
        }
      }
    );

    // Initialize auth state after listener is set up
    initializeAuth();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleAuthSuccess = () => {
    // Auth state will be updated automatically via the listener
  };

  const handleSignOut = async () => {
    await signOut();
    // Auth state will be updated automatically via the listener
  };

  const handlePasswordChanged = () => {
    setShowPasswordChange(false);
    // User will now proceed to the dashboard
  };

  const handlePasswordChangeCancel = () => {
    setShowPasswordChange(false);
    // Sign out the user if they cancel password change
    signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm onAuthSuccess={handleAuthSuccess} />;
  }

  // Show password change form if user came from password reset link
  if (showPasswordChange) {
    return (
      <PasswordChangeForm 
        onPasswordChanged={handlePasswordChanged}
        onCancel={handlePasswordChangeCancel}
      />
    );
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    }>
      <Dashboard user={user} onSignOut={handleSignOut} />
    </Suspense>
  );
};

export default Index;

import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from "@/integrations/supabase/client";
import AuthForm from "@/components/auth/AuthForm";
import Dashboard from "@/pages/Dashboard";
import PasswordChangeForm from "@/components/auth/PasswordChangeForm";

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPasswordChange, setShowPasswordChange] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const initializeAuth = async () => {
      try {
        // Get initial session first
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (isMounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (isMounted) {
          setSession(session);
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
    await supabase.auth.signOut();
    // Auth state will be updated automatically via the listener
  };

  const handlePasswordChanged = () => {
    setShowPasswordChange(false);
    // User will now proceed to the dashboard
  };

  const handlePasswordChangeCancel = () => {
    setShowPasswordChange(false);
    // Sign out the user if they cancel password change
    supabase.auth.signOut();
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

  return <Dashboard user={user} onSignOut={handleSignOut} />;
};

export default Index;

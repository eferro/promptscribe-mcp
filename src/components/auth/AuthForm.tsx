import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { signUp, signIn, resetPassword } from "@/services/authService";

interface AuthFormProps {
  onAuthSuccess: () => void;
}

export default function AuthForm({ onAuthSuccess }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [showResetForm, setShowResetForm] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const { toast } = useToast();

  // Check username availability with debouncing
  const checkUsernameAvailability = async (usernameToCheck: string) => {
    if (usernameToCheck.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    setCheckingUsername(true);
    try {
      // Import UserProfileService dynamically to avoid circular dependencies
      const { UserProfileService } = await import('@/services/userProfileService');
      const { data: isAvailable } = await UserProfileService.isUsernameAvailable(usernameToCheck);
      setUsernameAvailable(isAvailable);
    } catch {
      setUsernameAvailable(null);
    } finally {
      setCheckingUsername(false);
    }
  };

  // Debounced username check
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (username.trim()) {
        checkUsernameAvailability(username.trim());
      } else {
        setUsernameAvailable(null);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [username]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate username
    if (!username.trim()) {
      toast({
        variant: "destructive",
        title: "Username required",
        description: "Please enter a username"
      });
      return;
    }

    if (username.trim().length < 3) {
      toast({
        variant: "destructive",
        title: "Username too short",
        description: "Username must be at least 3 characters long"
      });
      return;
    }

    if (usernameAvailable === false) {
      toast({
        variant: "destructive",
        title: "Username unavailable",
        description: "Please choose a different username"
      });
      return;
    }

    setLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await signUp(email, password, username.trim(), redirectUrl);

      if (error) {
        toast({
          variant: "destructive",
          title: "Sign up failed",
          description: error.message
        });
      } else {
        toast({
          title: "Check your email",
          description: "We've sent you a confirmation link to complete your registration."
        });
        // Reset form
        setEmail('');
        setUsername('');
        setPassword('');
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signIn(email, password);

      if (error) {
        toast({
          variant: "destructive",
          title: "Sign in failed",
          description: error.message
        });
      } else {
        onAuthSuccess();
      }
      } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await resetPassword(resetEmail, `${window.location.origin}/`);

      if (error) {
        toast({
          variant: "destructive",
          title: "Reset failed",
          description: error.message
        });
      } else {
        toast({
          title: "Reset email sent",
          description: "Check your email for password reset instructions."
        });
        setShowResetForm(false);
        setResetEmail('');
      }
      } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl gradient-text">MCP Prompt Manager</CardTitle>
          <CardDescription>
            Create and manage your MCP prompt templates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              {!showResetForm ? (
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                  <div className="text-center">
                    <Button 
                      type="button"
                      variant="link" 
                      className="text-sm text-muted-foreground"
                      onClick={() => setShowResetForm(true)}
                    >
                      Forgot your password?
                    </Button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email">Email</Label>
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="Enter your email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Sending reset email..." : "Send Reset Email"}
                  </Button>
                  <div className="text-center">
                    <Button 
                      type="button"
                      variant="link" 
                      className="text-sm text-muted-foreground"
                      onClick={() => {
                        setShowResetForm(false);
                        setResetEmail('');
                      }}
                    >
                      Back to sign in
                    </Button>
                  </div>
                </form>
              )}
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-username">Username</Label>
                  <Input
                    id="signup-username"
                    type="text"
                    placeholder="Choose a username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    minLength={3}
                    maxLength={20}
                    pattern="[a-zA-Z0-9_-]+"
                    title="Username can only contain letters, numbers, underscores, and hyphens"
                  />
                  {username.length > 0 && (
                    <div className="text-sm">
                      {checkingUsername ? (
                        <span className="text-muted-foreground">Checking availability...</span>
                      ) : usernameAvailable === true ? (
                        <span className="text-green-600">✓ Username available</span>
                      ) : usernameAvailable === false ? (
                        <span className="text-red-600">✗ Username already taken</span>
                      ) : username.length < 3 ? (
                        <span className="text-muted-foreground">Username must be at least 3 characters</span>
                      ) : null}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading || usernameAvailable === false}>
                  {loading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
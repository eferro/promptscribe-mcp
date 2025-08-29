import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signUp } from '@/services/authService';
import useAuthForm from '@/hooks/useAuthForm';

export default function SignUpForm() {
  const { loading, setLoading, toast, showError } = useAuthForm();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  const checkUsernameAvailability = async (usernameToCheck: string) => {
    if (usernameToCheck.length < 3) {
      setUsernameAvailable(null);
      return;
    }
    setCheckingUsername(true);
    try {
      const { UserProfileService } = await import('@/services/userProfileService');
      const { data: isAvailable } = await UserProfileService.isUsernameAvailable(usernameToCheck);
      setUsernameAvailable(isAvailable);
    } catch {
      setUsernameAvailable(null);
    } finally {
      setCheckingUsername(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (username.trim()) {
        checkUsernameAvailability(username.trim());
      } else {
        setUsernameAvailable(null);
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      showError('Username required', 'Please enter a username');
      return;
    }
    if (username.trim().length < 3) {
      showError('Username too short', 'Username must be at least 3 characters long');
      return;
    }
    if (usernameAvailable === false) {
      showError('Username unavailable', 'Please choose a different username');
      return;
    }

    setLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/`;
      const { error } = await signUp(email, password, username.trim(), redirectUrl);
      if (error) {
        showError('Sign up failed', error.message);
      } else {
        toast({
          title: 'Check your email',
          description: "We've sent you a confirmation link to complete your registration.",
        });
        setEmail('');
        setUsername('');
        setPassword('');
      }
    } catch {
      showError('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
        {loading ? 'Creating account...' : 'Create Account'}
      </Button>
    </form>
  );
}

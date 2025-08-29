import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signIn } from '@/services/authService';
import useAuthForm from '@/hooks/useAuthForm';

interface SignInFormProps {
  onSuccess: () => void;
  onForgotPassword: () => void;
}

export default function SignInForm({ onSuccess, onForgotPassword }: SignInFormProps) {
  const { loading, setLoading, showError } = useAuthForm();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) {
        showError('Sign in failed', error.message);
      } else {
        onSuccess();
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
        {loading ? 'Signing in...' : 'Sign In'}
      </Button>
      <div className="text-center">
        <Button
          type="button"
          variant="link"
          className="text-sm text-muted-foreground"
          onClick={onForgotPassword}
        >
          Forgot your password?
        </Button>
      </div>
    </form>
  );
}

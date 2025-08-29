import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { resetPassword } from '@/services/authService';
import useAuthForm from '@/hooks/useAuthForm';

interface PasswordResetFormProps {
  onBack: () => void;
}

export default function PasswordResetForm({ onBack }: PasswordResetFormProps) {
  const { loading, setLoading, toast, showError } = useAuthForm();
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await resetPassword(email, `${window.location.origin}/`);
      if (error) {
        showError('Reset failed', error.message);
      } else {
        toast({
          title: 'Reset email sent',
          description: 'Check your email for password reset instructions.',
        });
        onBack();
        setEmail('');
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
        <Label htmlFor="reset-email">Email</Label>
        <Input
          id="reset-email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Sending reset email...' : 'Send Reset Email'}
      </Button>
      <div className="text-center">
        <Button
          type="button"
          variant="link"
          className="text-sm text-muted-foreground"
          onClick={onBack}
        >
          Back to sign in
        </Button>
      </div>
    </form>
  );
}

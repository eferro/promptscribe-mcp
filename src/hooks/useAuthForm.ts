import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export function useAuthForm() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const showError = (title: string, description: string) => {
    toast({ variant: 'destructive', title, description });
  };

  return { loading, setLoading, toast, showError };
}

export default useAuthForm;

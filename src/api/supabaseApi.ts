import { toast } from '@/hooks/use-toast';

// Type for Supabase errors
interface SupabaseError {
  message: string;
  code?: string;
  details?: string;
  hint?: string;
}

export async function handleRequest<T>(
  request: Promise<{ data: T | null; error: SupabaseError | null }>,
  errorMessage: string
): Promise<{ data: T | null; error: SupabaseError | null }>
{
  try {
    const { data, error } = await request;
    if (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Error', description: errorMessage });
    }
    return { data: data ?? null, error };
  } catch (error: unknown) {
    console.error(error);
    toast({ variant: 'destructive', title: 'Error', description: errorMessage });
    return { 
      data: null, 
      error: error instanceof Error 
        ? { message: error.message }
        : { message: 'Unknown error occurred' }
    };
  }
}

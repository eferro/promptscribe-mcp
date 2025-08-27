import { toast } from '@/hooks/use-toast';

// Type for Supabase errors
interface SupabaseError {
  message: string;
  code?: string;
  details?: string;
  hint?: string;
}

export async function handleRequest<T, E extends { message: string } = SupabaseError>(
  request: Promise<{ data: T | null; error: E | null }>,
  errorMessage: string
): Promise<{ data: T | null; error: E | null }>
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
      error: (error instanceof Error
        ? { message: error.message }
        : { message: 'Unknown error occurred' }) as E
    };
  }
}

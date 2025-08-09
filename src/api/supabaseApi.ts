import { toast } from '@/hooks/use-toast';

export async function handleRequest<T>(
  request: Promise<{ data: T | null; error: any }>,
  errorMessage: string
): Promise<{ data: T | null; error: any }>
{
  try {
    const { data, error } = await request;
    if (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Error', description: errorMessage });
    }
    return { data: data ?? null, error };
  } catch (error) {
    console.error(error);
    toast({ variant: 'destructive', title: 'Error', description: errorMessage });
    return { data: null, error } as any;
  }
}

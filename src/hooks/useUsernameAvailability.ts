import { useCallback, useEffect, useState } from 'react';
import { UserProfileService } from '@/services/userProfileService';
import { MIN_USERNAME_LENGTH } from '@/lib/username';

export function useUsernameAvailability(username: string, excludeUserId?: string, currentUsername?: string) {
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  const checkUsernameAvailability = useCallback(async (usernameToCheck: string) => {
    if (usernameToCheck.length < MIN_USERNAME_LENGTH) {
      setUsernameAvailable(null);
      return;
    }

    if (currentUsername && usernameToCheck === currentUsername) {
      setUsernameAvailable(true);
      return;
    }

    setCheckingUsername(true);
    try {
      const { data: isAvailable } = await UserProfileService.isUsernameAvailable(usernameToCheck, excludeUserId);
      setUsernameAvailable(isAvailable);
    } catch {
      setUsernameAvailable(null);
    } finally {
      setCheckingUsername(false);
    }
  }, [excludeUserId, currentUsername]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (username.trim()) {
        checkUsernameAvailability(username.trim());
      } else {
        setUsernameAvailable(null);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [username, checkUsernameAvailability]);

  return { usernameAvailable, checkingUsername };
}

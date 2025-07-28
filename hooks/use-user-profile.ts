
import { useState, useEffect } from 'react';
// import { userProfiles } from '@/lib/mock-data';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  created_at: string;
  updated_at: string;
}

export function useUserProfile(userId?: string) {
  const [data, setData] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 200));

        let profile: UserProfile | null = null;
        
        if (userId) {
          profile = null; // userProfiles.find((p: any) => p.id === userId) || null;
        } else {
          // Return first profile as default logged-in user
          profile = null;
        }

        setData(profile);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
        setError(err instanceof Error ? err : new Error('Failed to load user profile'));
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [userId]);

  return {
    profile: data,
    isLoading,
    isError: !!error,
    error
  };
}

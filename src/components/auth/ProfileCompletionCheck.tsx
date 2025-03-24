import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

interface ProfileCompletionCheckProps {
  children: React.ReactNode;
}

export const ProfileCompletionCheck: React.FC<ProfileCompletionCheckProps> = ({ children }) => {
  const { profile, isLoading, isInitialized } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isInitialized && profile) {
      const isProfileComplete = checkProfileCompletion(profile);
      
      if (!isProfileComplete) {
        // Store the current path to return to after profile completion
        sessionStorage.setItem('returnTo', window.location.pathname);
        
        // Navigate to profile settings
        navigate('/profile/settings', { 
          state: { 
            from: window.location.pathname,
            isNewUser: true 
          }
        });
        
        toast({
          title: "Complete Your Profile",
          description: "Please complete your profile to continue.",
        });
      }
    }
  }, [profile, isLoading, isInitialized, navigate]);

  const checkProfileCompletion = (profile: any): boolean => {
    const requiredFields = [
      'artist_name',
      'genres',
      'daw',
      'bio'
    ];

    return requiredFields.every(field => {
      if (field === 'genres') {
        return Array.isArray(profile[field]) && profile[field].length > 0;
      }
      return profile[field] !== null && profile[field] !== undefined && profile[field] !== '';
    });
  };

  if (isLoading || !isInitialized) {
    return null; // Or a loading spinner
  }

  return <>{children}</>;
}; 
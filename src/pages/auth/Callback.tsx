import { useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Callback = () => {
  console.log('Callback component mounted');
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          toast.error('Authentication failed');
          navigate('/login');
          return;
        }

        if (!session?.user) {
          // No session found, redirect to login
          toast.error('Authentication failed', {
            description: 'Please try logging in again'
          });
          navigate('/login');
          return;
        }

        // Check if profile exists
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Profile fetch error:', profileError);
          toast.error('Failed to fetch profile');
          navigate('/login');
          return;
        }
        
        // If no profile exists, create one
        if (!profile) {
          const { error: createError } = await supabase
            .from('profiles')
            .insert([
              {
                id: session.user.id,
                name: session.user.user_metadata.name || session.user.email?.split('@')[0] || 'User',
                email: session.user.email,
                join_date: new Date().toISOString(),
                timezone: 'UTC'
              }
            ]);
          
          if (createError) {
            console.error('Profile creation error:', createError);
            toast.error('Profile setup failed', {
              description: 'Please try updating your profile later'
            });
          } else {
            toast.success('Profile created successfully');
          }
        }

        // Redirect to home page instead of profile
        toast.success('Authentication successful');
        navigate('/');
      } catch (error) {
        console.error('Error in callback:', error);
        toast.error('Authentication error');
        navigate('/login');
      }
    };

    // Add a small delay to ensure Supabase has time to process the authentication
    const timer = setTimeout(() => {
      handleCallback();
    }, 1000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="text-lg">Verifying your account...</p>
        <p className="text-sm text-muted-foreground">Please wait while we complete the process.</p>
      </div>
    </div>
  );
};

export default Callback;

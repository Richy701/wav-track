import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Callback = () => {
  console.log('Callback component mounted');
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the current URL parameters
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        const type = params.get('type');
        const refreshToken = params.get('refresh_token');

        // If we have token and type, handle email verification
        if (token && type) {
          console.log('Verifying email with token...');
          const { error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: type as any
          });

          if (verifyError) {
            console.error('Verification error:', verifyError);
            toast.error('Email verification failed');
            navigate('/login');
            return;
          }

          // After verification, try to get the session
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError || !session) {
            console.error('Session error after verification:', sessionError);
            toast.success('Email verified successfully. Please log in.');
            navigate('/login');
            return;
          }

          // Session exists after verification
          console.log('Session established after verification');
          toast.success('Email verified and logged in successfully');
          navigate('/');
          return;
        }

        // If no token/type, check for existing session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          console.error('No session found:', sessionError);
          toast.error('Authentication failed');
          navigate('/login');
          return;
        }

        // Existing session found
        console.log('Existing session found');
        toast.success('Authentication successful');
        navigate('/');
      } catch (error) {
        console.error('Error in callback:', error);
        toast.error('Authentication error');
        navigate('/login');
      }
    };

    handleCallback();
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

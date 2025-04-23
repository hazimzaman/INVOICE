import { supabase } from './supabase';

export const checkAuth = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('Auth check error:', error);
    throw error;
  }

  if (!session) {
    throw new Error('No active session');
  }

  return session;
}; 
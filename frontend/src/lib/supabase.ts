import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xafelfovnsjuqlhcqnmr.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhZmVsZm92bnNqdXFsaGNxbm1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYxMjE5MDMsImV4cCI6MjA1MTY5NzkwM30.30TLSUKtlwFL9Y9fVsHzLYEg8R3PQKBB5s3J2JE0VW0'

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'x-my-custom-header': 'my-app-name'
    }
  }
})

export const checkAuth = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('Auth error:', error);
    throw error;
  }
  
  if (!session) {
    console.error('No session found');
    throw new Error('Authentication required');
  }

  console.log('Current session:', {
    userId: session.user.id,
    email: session.user.email
  });

  return session;
};

// Add this to check auth state
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth state changed:', event, session);
}); 
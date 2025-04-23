import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

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
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

console.log('Initializing Supabase client with:', {
  url: supabaseUrl,
  hasAnonKey: !!supabaseAnonKey
})

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Auth state listener
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth state changed:', event)
  if (session) {
    console.log('Session:', {
      user: session.user.email,
      role: session.user.role
    })
  }
})

// Test connection and storage
const testConnection = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.log('No active session - authentication required');
      return;
    }

    // Test settings table access
    const { error: settingsError } = await supabase
      .from('settings')
      .select('id')
      .limit(1);

    if (settingsError && settingsError.code !== 'PGRST116') {
      throw settingsError;
    }

    // Test storage bucket access
    const { data: buckets, error: storageError } = await supabase
      .storage
      .listBuckets();

    if (storageError) {
      throw storageError;
    }

    const businessLogosBucket = buckets?.find(b => b.id === 'business-logos');
    if (!businessLogosBucket) {
      console.warn('Business logos bucket not found');
    } else {
      console.log('Storage bucket configured correctly');
    }

    console.log('Database connection successful');
  } catch (error) {
    console.error('Connection test failed:', error);
  }
};

testConnection()

// Helper function to check auth status
export const checkAuth = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Auth error:', error)
      return null
    }
    
    if (!session) {
      console.log('No active session')
      return null
    }

    return session
  } catch (error) {
    console.error('Auth check failed:', error)
    return null
  }
} 
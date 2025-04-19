export default function EnvCheck() {
  console.log('Environment variables:', {
    SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    HAS_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  })
  return null
} 
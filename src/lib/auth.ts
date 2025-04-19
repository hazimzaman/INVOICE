import { supabase } from './supabase'
import { clearState } from '@/redux/features/authSlice'
import { store } from '@/redux/store'

export const handleLogout = async () => {
  try {
    // First clear any stored session
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error logging out:', error)
      throw error
    }
    
    // Clear Redux state and localStorage
    store.dispatch(clearState())
    
    // Redirect to login page after logout
    window.location.replace('/login')
    
    // As a fallback, also clear the URL immediately
    history.pushState({}, '', '/login')
  } catch (error) {
    console.error('Logout failed:', error)
    throw error
  }
} 
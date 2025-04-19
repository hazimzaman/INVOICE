import { supabase } from '../lib/supabase'
import { UserSettings } from '../types/settings'

export const settingsService = {
  // Get user settings
  async getUserSettings(userId: string) {
    console.log('Fetching settings for user:', userId)
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') { // Ignore "no rows returned" error
      console.error('Error fetching settings:', error)
      throw error
    }
    return data
  },

  // Save or update user settings
  async saveSettings(settings: UserSettings) {
    if (!settings.user_id) {
      throw new Error('User ID is required')
    }

    console.log('Saving settings:', settings)
    const { data, error } = await supabase
      .from('settings')
      .upsert(settings, {
        onConflict: 'user_id',
        returning: true,
      })
      .single()

    if (error) {
      console.error('Error saving settings:', error)
      throw error
    }
    return data
  },
} 
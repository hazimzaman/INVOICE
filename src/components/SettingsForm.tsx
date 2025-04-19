import { useState, useEffect } from 'react'
import { useUser } from '@supabase/auth-helpers-react'
import { settingsService } from '../services/settingsService'
import type { UserSettings } from '../types/settings'

export default function SettingsForm() {
  const user = useUser()
  console.log('Current user session:', user)
  const [settings, setSettings] = useState<UserSettings>({
    user_id: user?.id || '',
    company_name: '',
    company_address: '',
    company_phone: '',
    company_email: '',
    tax_number: '',
    currency: 'USD',
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  // Load existing settings when component mounts
  useEffect(() => {
    if (user) {
      loadSettings()
    } else {
      console.log('No user found')
    }
  }, [user])

  const loadSettings = async () => {
    try {
      setLoading(true)
      console.log('Loading settings for user:', user!.id)
      const data = await settingsService.getUserSettings(user!.id)
      if (data) {
        console.log('Loaded settings:', data)
        setSettings({ ...data, user_id: user!.id })
      } else {
        console.log('No existing settings found, using defaults')
        setSettings({ ...settings, user_id: user!.id })
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      console.log('Saving settings:', { ...settings, user_id: user!.id })
      const savedSettings = await settingsService.saveSettings({
        ...settings,
        user_id: user!.id
      })
      console.log('Settings saved:', savedSettings)
      setMessage('Settings saved successfully!')
    } catch (error) {
      console.error('Error saving settings:', error)
      setMessage('Error saving settings: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setSettings(prev => ({
      ...prev,
      [name]: value
    }))
  }

  if (!user) {
    return <div>Please login to access settings</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Company Settings</h2>
      {message && (
        <div className={`p-4 mb-4 rounded ${
          message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
        }`}>
          {message}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Company Name
          </label>
          <input
            type="text"
            name="company_name"
            value={settings.company_name || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Company Address
          </label>
          <input
            type="text"
            name="company_address"
            value={settings.company_address || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Company Phone
          </label>
          <input
            type="tel"
            name="company_phone"
            value={settings.company_phone || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Company Email
          </label>
          <input
            type="email"
            name="company_email"
            value={settings.company_email || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Tax Number
          </label>
          <input
            type="text"
            name="tax_number"
            value={settings.tax_number || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Currency
          </label>
          <input
            type="text"
            name="currency"
            value={settings.currency || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  )
} 
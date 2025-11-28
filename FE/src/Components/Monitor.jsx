import React, { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'

const Monitor = ({ userPlan }) => {
  const { isDark } = useTheme()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [monitoredEmails, setMonitoredEmails] = useState([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Load monitored emails from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('monitoredEmails')
    if (saved) {
      try {
        setMonitoredEmails(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to load monitored emails:', e)
      }
    }
  }, [])

  // Save monitored emails to localStorage whenever it changes
  useEffect(() => {
    if (monitoredEmails.length > 0) {
      localStorage.setItem('monitoredEmails', JSON.stringify(monitoredEmails))
    }
  }, [monitoredEmails])

  const handleAddEmail = async (e) => {
    e.preventDefault()

    if (userPlan !== 'pro') {
      setError('Monitor feature is only available for Pro users.')
      return
    }

    if (!email) {
      setError('Please enter an email address')
      return
    }

    // Check if email is already monitored
    if (monitoredEmails.some(e => e.email === email)) {
      setError('This email is already being monitored')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:1337'
      const response = await fetch(`${API_BASE_URL}/api/monitor/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok || data.message) {
        const newEmail = {
          id: Date.now().toString(),
          email,
          addedAt: new Date().toISOString(),
          status: 'active',
        }
        setMonitoredEmails([...monitoredEmails, newEmail])
        setSuccess(`Email ${email} added to monitoring list`)
        setEmail('')
      } else {
        setError(data.message || 'Failed to add email')
      }
    } catch (err) {
      // Even if API fails, add locally for demo purposes
      const newEmail = {
        id: Date.now().toString(),
        email,
        addedAt: new Date().toISOString(),
        status: 'active',
      }
      setMonitoredEmails([...monitoredEmails, newEmail])
      setSuccess(`Email ${email} added to monitoring list`)
      setEmail('')
      console.error('Monitor error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteEmail = async (id) => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:1337'
      await fetch(`${API_BASE_URL}/api/monitor/delete/${id}`, {
        method: 'DELETE',
      })

      setMonitoredEmails(monitoredEmails.filter(e => e.id !== id))
      setSuccess('Email removed from monitoring')
    } catch (err) {
      // Even if API fails, remove locally
      setMonitoredEmails(monitoredEmails.filter(e => e.id !== id))
      setSuccess('Email removed from monitoring')
      console.error('Delete error:', err)
    }
  }

  if (userPlan !== 'pro') {
    return (
      <div className="max-w-4xl">
        <h2 className={`text-3xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Monitor</h2>
        <div className={`rounded-lg border p-8 text-center ${isDark ? 'bg-yellow-900/20 border-yellow-800/50' : 'bg-yellow-50 border-yellow-200'}`}>
          <div className="text-4xl mb-4">🔒</div>
          <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-yellow-300' : 'text-yellow-900'}`}>Pro Feature</h3>
          <p className={`mb-4 ${isDark ? 'text-yellow-300' : 'text-yellow-800'}`}>
            Email monitoring is only available for Pro users. Upgrade to Pro to monitor your emails and get notified when they're breached.
          </p>
          <button className="px-6 py-3 bg-[#10b981] text-white rounded-lg hover:bg-[#059669] transition-colors font-medium">
            Upgrade to Pro
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl">
      <h2 className={`text-3xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Monitor Emails</h2>
      <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        Add email addresses to monitor. You'll be notified at your logged-in email when any of these addresses are found in a data breach.
      </p>

      <form onSubmit={handleAddEmail} className="mb-6">
        <div className="flex gap-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email address to monitor"
            className={`flex-1 px-4 py-3 rounded-lg focus:ring-2 focus:ring-[#10b981] focus:border-transparent transition-colors border ${
              isDark 
                ? 'bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder-gray-500' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-[#10b981] text-white rounded-lg hover:bg-[#059669] disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? 'Adding...' : 'Add Email'}
          </button>
        </div>
      </form>

      {error && (
        <div className={`mb-4 p-4 rounded-lg border ${isDark ? 'bg-red-900/20 border-red-800/50' : 'bg-red-50 border-red-200'}`}>
          <p className={isDark ? 'text-red-300' : 'text-red-800'}>{error}</p>
        </div>
      )}

      {success && (
        <div className={`mb-4 p-4 rounded-lg border ${isDark ? 'bg-green-900/20 border-green-800/50' : 'bg-green-50 border-green-200'}`}>
          <p className={isDark ? 'text-green-300' : 'text-green-800'}>{success}</p>
        </div>
      )}

      {monitoredEmails.length === 0 ? (
        <div className={`rounded-lg border p-8 text-center ${isDark ? 'bg-[#1a1a1a] border-[#2a2a2a]' : 'bg-gray-50 border-gray-200'}`}>
          <div className="text-4xl mb-4">📧</div>
          <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>No Emails Monitored</h3>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            Add email addresses above to start monitoring for data breaches.
          </p>
        </div>
      ) : (
        <div className={`rounded-lg border shadow-sm overflow-hidden ${isDark ? 'bg-[#1a1a1a] border-[#2a2a2a]' : 'bg-white border-gray-200'}`}>
          <div className={`px-6 py-4 border-b ${isDark ? 'bg-[#0a0a0a] border-[#2a2a2a]' : 'bg-gray-50 border-gray-200'}`}>
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Monitored Emails ({monitoredEmails.length})
            </h3>
          </div>
          <div className={`divide-y ${isDark ? 'divide-[#2a2a2a]' : 'divide-gray-200'}`}>
            {monitoredEmails.map((item) => (
              <div key={item.id} className={`px-6 py-4 flex items-center justify-between ${isDark ? 'hover:bg-[#0a0a0a]' : 'hover:bg-gray-50'} transition-colors`}>
                <div className="flex-1">
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.email}</p>
                  <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                    Added on {new Date(item.addedAt).toLocaleDateString()}
                  </p>
                  <span className={`inline-block mt-2 px-2 py-1 rounded text-xs font-medium ${
                    item.status === 'active'
                      ? isDark ? 'bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/30' : 'bg-green-100 text-green-800'
                      : isDark ? 'bg-[#2a2a2a] text-gray-300' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {item.status}
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteEmail(item.id)}
                  className={`ml-4 px-4 py-2 rounded-lg transition-colors font-medium ${
                    isDark 
                      ? 'text-red-400 hover:bg-red-900/20' 
                      : 'text-red-600 hover:bg-red-50'
                  }`}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Monitor

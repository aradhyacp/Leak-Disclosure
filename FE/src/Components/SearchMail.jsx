import React, { useState } from 'react'
import { useTheme } from '../context/ThemeContext'

const SearchMail = ({ canSearch, userPlan, searchCount, onSearch }) => {
  const { isDark } = useTheme()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const handleSearch = async (e) => {
    e.preventDefault()
    
    if (!canSearch) {
      setError('You have reached your search limit. Upgrade to Pro for unlimited searches.')
      return
    }

    if (!email) {
      setError('Please enter an email address')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:1337'
      const response = await fetch(`${API_BASE_URL}/api/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (data.message && data.message.includes('No breaches')) {
        setResult({
          email,
          isLeaked: false,
          message: data.message,
        })
      } else if (data.breaches && data.breaches.length > 0) {
        setResult({
          email,
          isLeaked: true,
          message: data.message,
          breaches: data.breaches,
        })
      } else {
        setResult({
          email,
          isLeaked: false,
          message: data.message || 'No breaches found',
        })
      }

      onSearch()
    } catch (err) {
      setError('Failed to search. Please try again.')
      console.error('Search error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl">
      <h2 className={`text-3xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Search Mail</h2>
      <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        Check if an email address has been leaked in any data breaches.
      </p>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email address"
            className={`flex-1 px-4 py-3 rounded-lg focus:ring-2 focus:ring-[#10b981] focus:border-transparent transition-colors ${
              isDark 
                ? 'bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder-gray-500' 
                : 'bg-white border-gray-300 text-gray-900'
            } border`}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !canSearch}
            className="px-6 py-3 bg-[#10b981] text-white rounded-lg hover:bg-[#059669] disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {!canSearch && userPlan === 'free' && (
        <div className={`mb-4 p-4 rounded-lg border ${isDark ? 'bg-yellow-900/20 border-yellow-800/50' : 'bg-yellow-50 border-yellow-200'}`}>
          <p className={isDark ? 'text-yellow-300' : 'text-yellow-800'}>
            You've used all 10 free searches. <strong>Upgrade to Pro</strong> for unlimited searches.
          </p>
        </div>
      )}

      {error && (
        <div className={`mb-4 p-4 rounded-lg border ${isDark ? 'bg-red-900/20 border-red-800/50' : 'bg-red-50 border-red-200'}`}>
          <p className={isDark ? 'text-red-300' : 'text-red-800'}>{error}</p>
        </div>
      )}

      {result && (
        <div className={`p-6 rounded-lg border-2 ${
          result.isLeaked 
            ? isDark ? 'bg-red-900/20 border-red-800/50' : 'bg-red-50 border-red-200'
            : isDark ? 'bg-green-900/20 border-green-800/50' : 'bg-green-50 border-green-200'
        }`}>
          <div className="flex items-start gap-3">
            <div className={`text-2xl ${result.isLeaked ? 'text-red-500' : 'text-[#10b981]'}`}>
              {result.isLeaked ? '⚠️' : '✓'}
            </div>
            <div className="flex-1">
              <h3 className={`text-xl font-semibold mb-2 ${
                result.isLeaked 
                  ? isDark ? 'text-red-300' : 'text-red-900'
                  : isDark ? 'text-green-300' : 'text-green-900'
              }`}>
                {result.isLeaked ? 'Email Leaked' : 'Email Safe'}
              </h3>
              <p className={`mb-2 ${result.isLeaked ? (isDark ? 'text-red-300' : 'text-red-800') : (isDark ? 'text-green-300' : 'text-green-800')}`}>
                <strong>Email:</strong> {result.email}
              </p>
              <p className={result.isLeaked ? (isDark ? 'text-red-300' : 'text-red-800') : (isDark ? 'text-green-300' : 'text-green-800')}>
                {result.message}
              </p>
              {result.isLeaked && result.breaches && (
                <div className="mt-4">
                  <p className={`font-semibold mb-2 ${result.isLeaked ? (isDark ? 'text-red-300' : 'text-red-900') : ''}`}>
                    Found in {result.breaches?.[0]?.length || 0} breach(es)
                  </p>
                  <ul className={`list-disc list-inside space-y-1 ${result.isLeaked ? (isDark ? 'text-red-300' : 'text-red-800') : ''}`}>
                    {result.breaches?.[0]?.map((breach, index) => (
                      <li key={index}>{breach}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SearchMail

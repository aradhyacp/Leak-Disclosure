import { UserButton, useUser, useAuth } from '@clerk/clerk-react'
import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import SearchMail from '../Components/SearchMail'
import Details from '../Components/Details'
import Monitor from '../Components/Monitor'
import { useTheme } from '../context/ThemeContext'

const Dashboard = () => {
  const { user } = useUser()
  const { isSignedIn, getToken, isLoaded } = useAuth()
  const navigate = useNavigate()
  const { isDark, toggleTheme } = useTheme()
  const [activeTab, setActiveTab] = useState('search')
  const [userPlan, setUserPlan] = useState('free') // 'free' or 'pro'
  const [searchCount, setSearchCount] = useState(0)
  const [loadingUserData, setLoadingUserData] = useState(true)

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoaded){return}
    if (!isSignedIn) {
      navigate('/login')
    }
  }, [isSignedIn, navigate,isLoaded])

  // Fetch user data from backend
  useEffect(() => {
    const fetchUserData = async () => {
      if (!isSignedIn) return

      try {
        const token = await getToken()
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:1337'
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          // Set user plan from backend (subscription field)
          setUserPlan(data.user?.subscription || 'free')
          // Set search count from backend (search_count_today field)
          setSearchCount(data.searchData?.search_count_today-1 || 0)
          if(data.searchData?.search_count_today===0){
            setSearchCount(0)
          }
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error)
      } finally {
        setLoadingUserData(false)
      }
    }

    fetchUserData()
  }, [isSignedIn, getToken])

  const refreshSearchCount = async () => {
    if (!isSignedIn) return

    try {
      const token = await getToken()
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:1337'
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setSearchCount(data.searchData?.search_count_today-1 || 0)
      }
    } catch (error) {
      console.error('Failed to refresh search count:', error)
    }
  }

  const canSearch = () => {
    if (userPlan === 'pro') return true
    return searchCount < 10
  }

  // Don't render if not authenticated
  if (!isSignedIn) {
    return null
  }

  if (loadingUserData) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#10b981] mx-auto mb-4"></div>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50'} transition-colors duration-300`}>
      {/* Header */}
      <header className={`${isDark ? 'bg-[#1a1a1a] border-[#2a2a2a]' : 'bg-white border-gray-200'} shadow-sm border-b transition-colors duration-300`}>
        <div className="min-w-screen px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
                <span className={`h-10 w-10 ${isDark ? 'text-white':'text-black'}`}><svg fill="currentColor" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">

<g id="Cyber_security">

<path d="M80.9175,377.0605H202V439.16H139a9.8965,9.8965,0,1,0,0,19.7929H373a9.8965,9.8965,0,1,0,0-19.7929H310V377.0605H431.0869A49.9019,49.9019,0,0,0,480.64,332.9351H31.36A49.9094,49.9094,0,0,0,80.9175,377.0605Z"/>

<path d="M431.0869,53.0474H80.9175A49.9181,49.9181,0,0,0,31,102.9637V313.1421H481V102.9637A49.9144,49.9144,0,0,0,431.0869,53.0474ZM337,179.5835a83.01,83.01,0,0,1-43.1807,72.8317L256,273.0947l-37.8149-20.6795A83.0054,83.0054,0,0,1,175,179.5835V118.9324l81-25.8377,81,25.8377Z"/>

<path d="M223.6035,165.0991a32.3247,32.3247,0,0,0,22.5,30.6881V223.59a9.8965,9.8965,0,1,0,19.793,0V195.7872a32.3292,32.3292,0,1,0-42.293-30.6881Z"/>

</g>

</svg></span>
              <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Leak Disclosure</h1>
            </div>
            <div className="flex items-center gap-4">
              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-colors ${
                  isDark 
                    ? 'hover:bg-[#2a2a2a] text-gray-300' 
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
                aria-label="Toggle theme"
              >
                {isDark ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
              {userPlan === 'free' && (
                <Link
                  className="px-4 py-2 bg-[#10b981] text-white rounded-lg hover:bg-[#059669] transition-colors font-medium"
                 to="/upgrade">
                  Upgrade to Pro
                </Link>
              )}
              {userPlan === 'pro' && (
                <span className="px-3 py-1 bg-[#10b981]/20 text-[#10b981] rounded-full text-sm font-medium border border-[#10b981]/30">
                  Pro Plan
                </span>
              )}

            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Modern Sidebar */}
        <aside className={`w-64 ${isDark ? 'bg-[#1a1a1a] border-[#2a2a2a]' : 'bg-white border-gray-200'} shadow-sm min-h-[calc(100vh-4rem)] border-r transition-colors duration-300`}>
          <nav className="p-4 space-y-1">
            <button
              onClick={() => setActiveTab('search')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                activeTab === 'search'
                  ? `${isDark ? 'bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/30 shadow-lg shadow-[#10b981]/10' : 'bg-blue-50 text-blue-700 border border-blue-200'} font-medium`
                  : `${isDark ? 'text-gray-300 hover:bg-[#2a2a2a] hover:text-white' : 'text-gray-700 hover:bg-gray-50'}`
              }`}
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Search Mail</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('details')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                activeTab === 'details'
                  ? `${isDark ? 'bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/30 shadow-lg shadow-[#10b981]/10' : 'bg-blue-50 text-blue-700 border border-blue-200'} font-medium`
                  : `${isDark ? 'text-gray-300 hover:bg-[#2a2a2a] hover:text-white' : 'text-gray-700 hover:bg-gray-50'}`
              }`}
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Details</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('monitor')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                activeTab === 'monitor'
                  ? `${isDark ? 'bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/30 shadow-lg shadow-[#10b981]/10' : 'bg-blue-50 text-blue-700 border border-blue-200'} font-medium`
                  : `${isDark ? 'text-gray-300 hover:bg-[#2a2a2a] hover:text-white' : 'text-gray-700 hover:bg-gray-50'}`
              } ${userPlan !== 'pro' ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={userPlan !== 'pro'}
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span>Monitor {userPlan !== 'pro' && '(Pro Only)'}</span>
              </div>
            </button>
          </nav>
          
          <div className={`px-4 mt-4 border-t ${isDark ? 'border-[#2a2a2a]' : 'border-gray-200'}`}>
            <div className="flex flex-row-reverse items-center justify-end gap-4 py-4"><span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{user.fullName}</span>
                <UserButton 
                  appearance={{
                    elements: {
                      avatarBox: "w-30 h-30"
                    }
                  }}
                />
                </div>
                </div>
          {userPlan === 'free' && (
            <div className={`py-2 px-4 ${isDark ? 'border-[#2a2a2a]' : 'border-gray-200'}`}>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <p className="font-medium mb-1">Search Limit</p>
                <p>{searchCount}/10 searches used today</p>
                <div className={`mt-2 w-full ${isDark ? 'bg-[#2a2a2a]' : 'bg-gray-200'} rounded-full h-2`}>
                  <div
                    className="bg-[#10b981] h-2 rounded-full transition-all"
                    style={{ width: `${Math.min((searchCount / 10) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {activeTab === 'search' && (
            <SearchMail 
              canSearch={canSearch()} 
              userPlan={userPlan}
              searchCount={searchCount}
              onSearch={refreshSearchCount}
            />
          )}
          {activeTab === 'details' && (
            <Details 
              canSearch={canSearch()} 
              userPlan={userPlan}
              searchCount={searchCount}
              onSearch={refreshSearchCount}
            />
          )}
          {activeTab === 'monitor' && (
            <Monitor userPlan={userPlan} />
          )}
        </main>
      </div>
    </div>
  )
}

export default Dashboard

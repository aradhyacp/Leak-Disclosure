import React, { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

const Root = () => {
  const { isDark } = useTheme()
  const heroRef = useRef(null)
  const featuresRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.pageYOffset
      const hero = heroRef.current
      const features = featuresRef.current

      if (hero) {
        hero.style.transform = `translateY(${scrolled * 0.5}px)`
        hero.style.opacity = 1 - scrolled / 500
      }

      if (features) {
        const featuresTop = features.offsetTop
        const featuresHeight = features.offsetHeight
        const windowHeight = window.innerHeight
        const scrollPosition = scrolled + windowHeight

        if (scrollPosition > featuresTop && scrolled < featuresTop + featuresHeight) {
          features.style.transform = `translateY(${(scrollPosition - featuresTop) * 0.3}px)`
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0a0a0a]' : 'bg-white'} transition-colors duration-300`}>
      {/* Hero Section with Parallax */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a]"></div>
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#10b981] opacity-10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#10b981] opacity-10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-50 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-[#10b981] to-[#34d399] bg-clip-text text-transparent animate-fade-in">
              Leak Disclosure
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-4 max-w-3xl mx-auto">
              Protect your digital identity. Check if your email has been compromised in data breaches.
            </p>
            <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
              Get instant alerts when your email appears in new breaches. Monitor multiple accounts and stay one step ahead of cyber threats.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 relative z-50">
            <Link
              to="/signup"
              className="px-8 py-4 bg-[#10b981] hover:bg-[#059669] text-white rounded-lg font-semibold text-lg transition-all transform hover:scale-105 shadow-lg shadow-[#10b981]/50 relative z-50"
            >
              Get Started Free
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 border-2 border-[#10b981] text-[#10b981] hover:bg-[#10b981] hover:text-white rounded-lg font-semibold text-lg transition-all transform hover:scale-105 relative z-50"
            >
              Sign In
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="p-6 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a]">
              <div className="text-4xl font-bold text-[#10b981] mb-2">10+</div>
              <div className="text-gray-400">Free Searches</div>
            </div>
            <div className="p-6 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a]">
              <div className="text-4xl font-bold text-[#10b981] mb-2">∞</div>
              <div className="text-gray-400">Pro Features</div>
            </div>
            <div className="p-6 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a]">
              <div className="text-4xl font-bold text-[#10b981] mb-2">24/7</div>
              <div className="text-gray-400">Monitoring</div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-[#10b981] rounded-full flex justify-center">
            <div className="w-1 h-3 bg-[#10b981] rounded-full mt-2"></div>
          </div>
        </div>
      </section>

      {/* Features Section with Parallax */}
      <section
        ref={featuresRef}
        className={`py-24 ${isDark ? 'bg-[#1a1a1a]' : 'bg-gray-50'} transition-colors duration-300 relative z-10`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            <span className={isDark ? 'text-white' : 'text-gray-900'}>Why Choose </span>
            <span className="bg-gradient-to-r from-[#10b981] to-[#34d399] bg-clip-text text-transparent">
              Leak Disclosure?
            </span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className={`p-8 rounded-lg border ${isDark ? 'bg-[#0a0a0a] border-[#2a2a2a]' : 'bg-white border-gray-200'} transition-all hover:border-[#10b981] hover:shadow-lg hover:shadow-[#10b981]/20`}>
              <div className="text-5xl mb-4">🔍</div>
              <h3 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Instant Search</h3>
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                Quickly check if your email has been exposed in any known data breaches. Get results in seconds.
              </p>
            </div>

            <div className={`p-8 rounded-lg border ${isDark ? 'bg-[#0a0a0a] border-[#2a2a2a]' : 'bg-white border-gray-200'} transition-all hover:border-[#10b981] hover:shadow-lg hover:shadow-[#10b981]/20`}>
              <div className="text-5xl mb-4">📊</div>
              <h3 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Detailed Analytics</h3>
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                Get comprehensive breach details including severity, industry, and timeline. Understand your risk profile.
              </p>
            </div>

            <div className={`p-8 rounded-lg border ${isDark ? 'bg-[#0a0a0a] border-[#2a2a2a]' : 'bg-white border-gray-200'} transition-all hover:border-[#10b981] hover:shadow-lg hover:shadow-[#10b981]/20`}>
              <div className="text-5xl mb-4">🔔</div>
              <h3 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Pro Monitoring</h3>
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                Monitor multiple email addresses and receive instant notifications when new breaches are detected.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`py-24 ${isDark ? 'bg-[#0a0a0a]' : 'bg-white'} transition-colors duration-300`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className={isDark ? 'text-white' : 'text-gray-900'}>Ready to Protect Your </span>
            <span className="bg-gradient-to-r from-[#10b981] to-[#34d399] bg-clip-text text-transparent">
              Digital Identity?
            </span>
          </h2>
          <p className={`text-xl mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Start checking your email security today. It's free to get started.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="px-8 py-4 bg-[#10b981] hover:bg-[#059669] text-white rounded-lg font-semibold text-lg transition-all transform hover:scale-105 shadow-lg shadow-[#10b981]/50"
            >
              Create Free Account
            </Link>
            <Link
              to="/dashboard"
              className="px-8 py-4 border-2 border-[#10b981] text-[#10b981] hover:bg-[#10b981] hover:text-white rounded-lg font-semibold text-lg transition-all transform hover:scale-105"
            >
              View Dashboard
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Root

import React from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '@clerk/clerk-react'
import { animated, useSpring } from '@react-spring/web'

const PricingSection = () => {
  const { isDark } = useTheme()
  const { isSignedIn } = useAuth()

  const fadeIn = useSpring({
    from: { opacity: 0, transform: 'translateY(30px)' },
    to: { opacity: 1, transform: 'translateY(0px)' },
    config: { tension: 300, friction: 30 }
  })

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for individuals getting started',
      features: [
        '10 searches per day',
        'Basic breach detection',
        'Email leak alerts',
        'Community support',
        'Standard response time'
      ],
      cta: isSignedIn ? 'Current Plan' : 'Get Started',
      ctaLink: isSignedIn ? '#' : '/signup',
      popular: false,
      color: 'gray'
    },
    {
      name: 'Pro',
      price: '$9.99',
      period: 'per month',
      description: 'For power users and professionals',
      features: [
        'Unlimited searches',
        'Detailed breach analytics',
        'Email monitoring (multiple emails)',
        'Priority support',
        'Advanced risk scoring',
        'Industry breakdown',
        'Year-wise breach analysis',
        'Password strength insights'
      ],
      cta: isSignedIn ? 'Upgrade to Pro' : 'Start Free Trial',
      ctaLink: isSignedIn ? '#' : '/signup',
      popular: true,
      color: 'green'
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'For teams and organizations',
      features: [
        'Everything in Pro',
        'Team management',
        'API access',
        'Custom integrations',
        'Dedicated account manager',
        'SLA guarantee',
        'Advanced security features',
        'Custom reporting',
        'On-premise deployment option'
      ],
      cta: 'Contact Sales',
      ctaLink: 'mailto:sales@leakdisclosure.com',
      popular: false,
      color: 'purple'
    }
  ]

  return (
    <section className={`py-24 ${isDark ? 'bg-[#0a0a0a]' : 'bg-white'} transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Simple, Transparent Pricing
          </h2>
          <p className={`text-xl ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Choose the plan that's right for you. Upgrade or downgrade at any time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {plans.map((plan, index) => (
            <animated.div
              key={plan.name}
              style={{
                ...fadeIn,
                transitionDelay: `${index * 100}ms`
              }}
              className={`relative rounded-2xl border-2 transition-all duration-300 ${
                plan.popular
                  ? isDark
                    ? 'border-[#10b981] bg-[#1a1a1a] shadow-2xl shadow-[#10b981]/20 scale-105'
                    : 'border-[#10b981] bg-white shadow-2xl shadow-[#10b981]/20 scale-105'
                  : isDark
                  ? 'border-[#2a2a2a] bg-[#1a1a1a] hover:border-[#10b981]/50'
                  : 'border-gray-200 bg-white hover:border-[#10b981]/50'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="px-4 py-1 bg-[#10b981] text-white text-sm font-semibold rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="p-8">
                <div className="mb-6">
                  <h3 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {plan.name}
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {plan.description}
                  </p>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className={`text-5xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className={`ml-2 text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        /{plan.period}
                      </span>
                    )}
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <svg
                        className={`w-5 h-5 mr-3 mt-0.5 flex-shrink-0 ${
                          plan.popular ? 'text-[#10b981]' : isDark ? 'text-gray-500' : 'text-gray-400'
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {plan.ctaLink === '#' ? (
                  <button
                    disabled
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${
                      plan.popular
                        ? 'bg-[#10b981] text-white cursor-not-allowed opacity-75'
                        : isDark
                        ? 'bg-[#2a2a2a] text-gray-400 cursor-not-allowed'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {plan.cta}
                  </button>
                ) : plan.ctaLink.startsWith('mailto:') ? (
                  <a
                    href={plan.ctaLink}
                    className={`block w-full py-3 px-6 rounded-lg font-semibold text-center transition-all ${
                      plan.popular
                        ? 'bg-[#10b981] text-white hover:bg-[#059669]'
                        : isDark
                        ? 'bg-[#2a2a2a] text-white hover:bg-[#10b981] hover:text-white'
                        : 'bg-gray-900 text-white hover:bg-[#10b981]'
                    }`}
                  >
                    {plan.cta}
                  </a>
                ) : (
                  <Link
                    to={plan.ctaLink}
                    className={`block w-full py-3 px-6 rounded-lg font-semibold text-center transition-all ${
                      plan.popular
                        ? 'bg-[#10b981] text-white hover:bg-[#059669] transform hover:scale-105'
                        : isDark
                        ? 'bg-[#2a2a2a] text-white hover:bg-[#10b981] hover:text-white'
                        : 'bg-gray-900 text-white hover:bg-[#10b981]'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                )}
              </div>
            </animated.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            All plans include a 14-day money-back guarantee. No credit card required for free plan.
          </p>
        </div>
      </div>
    </section>
  )
}

export default PricingSection


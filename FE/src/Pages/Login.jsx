import { SignIn } from '@clerk/clerk-react'
import React from 'react'
import { useTheme } from '../context/ThemeContext'

const Login = () => {
  const { isDark } = useTheme()
  
  return (
    <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50'} transition-colors duration-300`}>
      <div className="w-full max-w-md">
        <SignIn 
          appearance={{
            baseTheme: isDark ? 'dark' : 'light',
            elements: {
              rootBox: "mx-auto",
              card: isDark ? "bg-[#1a1a1a] border-[#2a2a2a]" : "",
              headerTitle: isDark ? "text-white" : "",
              headerSubtitle: isDark ? "text-gray-400" : "",
              socialButtonsBlockButton: isDark ? "bg-[#2a2a2a] border-[#2a2a2a] text-white hover:bg-[#10b981] hover:border-[#10b981]" : "",
              formButtonPrimary: "bg-[#10b981] hover:bg-[#059669]",
              formFieldInput: isDark ? "bg-[#0a0a0a] border-[#2a2a2a] text-white" : "",
              footerActionLink: "text-[#10b981] hover:text-[#059669]",
            }
          }}
        />
      </div>
    </div>
  )
}

export default Login

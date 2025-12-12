import React from 'react'
import { useAuth } from '@clerk/clerk-react'
import { Navigate,Outlet } from 'react-router-dom'

const ProtectedRoute = () => {
    const{ isLoaded,isSignedIn } = useAuth()
    if(!isLoaded)return null
    if(isSignedIn){
        return <Outlet/>
    }
  return <Navigate to="/login" replace/>
}

export default ProtectedRoute
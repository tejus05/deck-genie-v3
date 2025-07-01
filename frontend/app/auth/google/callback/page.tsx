'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useAuth } from '@/app/(presentation-generator)/context/AuthContext'
import Cookies from 'js-cookie'
import { Loader2 } from 'lucide-react'

export default function GoogleCallback() {
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setGoogleAuth } = useAuth()
  
  // Extract token, user id, and error from URL params
  const token = searchParams.get('token')
  const userId = searchParams.get('user_id')
  const urlError = searchParams.get('error')
  
  useEffect(() => {
    const handleGoogleCallback = async () => {
      // If there's an error from the backend redirect
      if (urlError) {
        setError(decodeURIComponent(urlError))
        return
      }
      
      // Process OAuth redirect with token
      if (token) {
        try {
          // Store token in cookie
          Cookies.set('auth-token', token, { expires: 7, path: '/' })
          
          // Call setGoogleAuth to update auth context
          if (setGoogleAuth) {
            await setGoogleAuth(token, userId || '')
            // Redirect to home page
            router.push('/')
          } else {
            setError('Authentication context not available')
            console.error('Authentication context or setGoogleAuth function not available')
          }
        } catch (error) {
          console.error('Error handling Google callback:', error)
          setError('Failed to authenticate with Google')
        }
      } else {
        // No token, could be a cancellation or error
        const redirectDelay = setTimeout(() => {
          router.push('/auth/login')
        }, 3000)
        
        setError('Authentication was cancelled or failed')
        
        // Cleanup the timeout if component unmounts
        return () => clearTimeout(redirectDelay)
      }
    }
    
    handleGoogleCallback()
  }, [token, userId, urlError, router, setGoogleAuth])
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      {error ? (
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Authentication Error</h1>
          <p className="text-gray-700 mb-4">{error}</p>
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => router.push('/auth/login')}
          >
            Back to Login
          </button>
        </div>
      ) : (
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600" />
          <h1 className="mt-4 text-xl font-semibold">Completing your sign-in...</h1>
          <p className="mt-2 text-gray-600">Please wait while we authenticate you</p>
        </div>
      )}
    </div>
  )
}

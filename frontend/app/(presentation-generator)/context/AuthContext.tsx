'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import Cookies from 'js-cookie'
import { authApi } from '@/services/auth'

interface User {
  id: number
  email: string
  full_name: string
  is_active: boolean
  created_at: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, fullName: string) => Promise<void>
  logout: () => void
  updateUser: (userData: Partial<User>) => void
  loginWithGoogle: () => void
  setGoogleAuth: (token: string, userId?: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = !!user && !!token

  // Load user from token on app start
  useEffect(() => {
    const loadUser = async () => {
      const savedToken = Cookies.get('auth-token')
      
      if (savedToken) {
        try {
          setToken(savedToken)
          const userData = await authApi.getCurrentUser(savedToken)
          setUser(userData)
        } catch (error) {
          console.error('Failed to load user:', error)
          // Remove invalid token
          Cookies.remove('auth-token')
        }
      }
      
      setIsLoading(false)
    }

    loadUser()
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      console.log('Starting login process...')
      const response = await authApi.login(email, password)
      console.log('Login API response:', response)
      
      // Save token to cookie
      Cookies.set('auth-token', response.access_token, { 
        expires: 7, // 7 days
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      })
      
      setToken(response.access_token)
      console.log('Token saved, fetching user data...')
      
      // Get full user data after login
      const fullUserData = await authApi.getCurrentUser(response.access_token)
      console.log('User data fetched:', fullUserData)
      setUser(fullUserData)
    } catch (error: unknown) {
      console.error('Login failed:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      if (error && typeof error === 'object' && 'response' in error && 
          error.response && typeof error.response === 'object' && 
          'status' in error.response && 'data' in error.response) {
        console.error('Response status:', error.response.status)
        console.error('Response data:', error.response.data)
      }
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (email: string, password: string, fullName: string) => {
    setIsLoading(true)
    try {
      // Register the user
      await authApi.register(email, password, fullName)
      
      // After successful registration, automatically log in
      await login(email, password)
    } catch (error) {
      console.error('Registration failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    // Remove token from cookie
    Cookies.remove('auth-token')
    
    // Clear state
    setToken(null)
    setUser(null)
    
    // Redirect to homepage instead of login page
    window.location.href = '/'
  }

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData })
    }
  }
  
  const loginWithGoogle = () => {
    // Redirect to backend's Google OAuth endpoint
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    window.location.href = `${backendUrl}/auth/google/login`
  }
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const setGoogleAuth = async (token: string, userId?: string) => {
    try {
      // Save token to cookie
      Cookies.set('auth-token', token, { 
        expires: 7, // 7 days
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      })
      
      setToken(token)
      // Get user data using the token
      const userData = await authApi.getCurrentUser(token)
      setUser(userData)
      // We're using the token to get user data, userId is optional
    } catch (error) {
      console.error('Error setting Google auth:', error)
      throw error
    }
  }

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    loginWithGoogle,
    setGoogleAuth
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

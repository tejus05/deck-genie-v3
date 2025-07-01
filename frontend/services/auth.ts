import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? 
      document.cookie.split('; ').find(row => row.startsWith('auth-token='))?.split('=')[1] : 
      null
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Remove invalid token and redirect to login
      document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
      window.location.href = '/auth/login'
    }
    return Promise.reject(error)
  }
)

export interface LoginResponse {
  access_token: string
  token_type: string
  user: {
    id: number
    email: string
    full_name: string
  }
}

export interface User {
  id: number
  email: string
  full_name: string
  is_active: boolean
  created_at: string
}

export interface UserFile {
  created_at: string | number | Date
  id: number
  filename: string
  file_type: string
  file_size: number
  uploaded_at: string
  owner_id: number
  file_path: string
}

export interface Presentation {
  id: number
  title: string
  description?: string
  created_at: string
  updated_at: string
  owner_id: number
  file_path: string
  thumbnail_path?: string
}

export const authApi = {
  // Authentication endpoints
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const formData = new FormData()
    formData.append('username', email) // FastAPI OAuth2PasswordRequestForm expects 'username'
    formData.append('password', password)
    
    const response = await api.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    
    return response.data
  },

  register: async (email: string, password: string, fullName: string): Promise<User> => {
    const response = await api.post('/auth/register', {
      email,
      password,
      full_name: fullName,
      is_active: true,
    })
    
    return response.data
  },

  getCurrentUser: async (token?: string): Promise<User> => {
    const config = token ? {
      headers: { Authorization: `Bearer ${token}` }
    } : {}
    
    const response = await api.get('/auth/me', config)
    return response.data
  },

  updateProfile: async (userData: Partial<User>): Promise<User> => {
    const response = await api.put('/auth/me', userData)
    return response.data
  },

  // File management endpoints
  uploadFile: async (file: File): Promise<UserFile> => {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    
    return response.data
  },

  getUserFiles: async (): Promise<UserFile[]> => {
    const response = await api.get('/files/my-files')
    return response.data
  },

  getUserPresentations: async (): Promise<Presentation[]> => {
    const response = await api.get('/files/my-presentations')
    return response.data
  },

  downloadFile: async (fileId: number): Promise<Blob> => {
    const response = await api.get(`/files/download/${fileId}`, {
      responseType: 'blob',
    })
    
    return response.data
  },

  deleteFile: async (fileId: number): Promise<void> => {
    await api.delete(`/files/delete/${fileId}`)
  },

  deletePresentation: async (presentationId: number): Promise<void> => {
    await api.delete(`/files/presentations/${presentationId}`)
  },
}

export default api

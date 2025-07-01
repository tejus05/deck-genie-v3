'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/(presentation-generator)/context/AuthContext'
import { authApi, Presentation } from '@/services/auth'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Presentation as PresentationIcon, Trash2, Plus } from 'lucide-react'
import Header from './components/Header'

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}

function DashboardContent() {
  const { user } = useAuth()
  const router = useRouter()
  const [presentations, setPresentations] = useState<Presentation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load user presentations
  useEffect(() => {
    const loadData = async () => {
      try {
        const userPresentations = await authApi.getUserPresentations()
        setPresentations(userPresentations)
      } catch (error) {
        console.error('Failed to load presentations:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const handleDeletePresentation = async (presentationId: number) => {
    const confirmed = confirm('Are you sure you want to delete this presentation?')
    if (!confirmed) return
    
    try {
      await authApi.deletePresentation(presentationId)
      setPresentations(prev => prev.filter(p => p.id !== presentationId))
    } catch (error) {
      console.error('Delete failed:', error)
      alert('Failed to delete presentation. Please try again.')
    }
  }



  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.full_name}</p>
        </div>


        
        {/* Main Content */}
        <Tabs defaultValue="presentations" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="presentations">My Presentations</TabsTrigger>
          </TabsList>
          
          <TabsContent value="presentations">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle>Presentations</CardTitle>
                  <CardDescription>Your generated presentations</CardDescription>
                </div>
                <Button onClick={() => router.push('/')} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" /> Create New
                </Button>
              </CardHeader>
              <CardContent>
                {presentations.length === 0 ? (
                  <div className="text-center py-8">
                    <PresentationIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No presentations yet</h3>
                    <p className="text-gray-500 mb-6">Create your first presentation to get started</p>
                    <Button onClick={() => router.push('/')}>Create Presentation</Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {presentations.map(presentation => (
                      <Card key={presentation.id} className="overflow-hidden hover:shadow-md transition-shadow">
                        <div className="bg-gray-100 h-32 flex items-center justify-center">
                          <PresentationIcon className="h-12 w-12 text-gray-400" />
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-medium text-gray-900 mb-1 truncate">{presentation.title || 'Untitled'}</h3>
                          <p className="text-xs text-gray-500 mb-2">
                            Created: {new Date(presentation.created_at).toLocaleDateString()}
                          </p>
                          <div className="flex justify-between items-center">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex items-center gap-1"
                              onClick={() => router.push(`/presentation/${presentation.id}`)}
                            >
                              <PresentationIcon className="h-3 w-3" /> View
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-600 hover:text-red-800"
                              onClick={() => handleDeletePresentation(presentation.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

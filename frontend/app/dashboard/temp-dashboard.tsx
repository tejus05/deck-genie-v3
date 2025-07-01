'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/(presentation-generator)/context/AuthContext'
import { authApi, UserFile, Presentation } from '@/services/auth'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Upload, FileText, Presentation as PresentationIcon, Download, Trash2, Plus } from 'lucide-react'
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
  const [files, setFiles] = useState<UserFile[]>([])
  const [presentations, setPresentations] = useState<Presentation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [uploadingFile, setUploadingFile] = useState(false)

  // Load user files and presentations
  useEffect(() => {
    const loadData = async () => {
      try {
        const [userFiles, userPresentations] = await Promise.all([
          authApi.getUserFiles(),
          authApi.getUserPresentations()
        ])
        
        setFiles(userFiles)
        setPresentations(userPresentations)
      } catch (error) {
        console.error('Failed to load data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return
    
    const file = event.target.files[0]
    
    try {
      setUploadingFile(true)
      const uploadedFile = await authApi.uploadFile(file)
      setFiles(prev => [...prev, uploadedFile])
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Failed to upload file. Please try again.')
    } finally {
      setUploadingFile(false)
      // Reset file input
      if (event.target) {
        event.target.value = ''
      }
    }
  }

  const handleDeleteFile = async (fileId: number) => {
    const confirmed = confirm('Are you sure you want to delete this file?')
    if (!confirmed) return
    
    try {
      await authApi.deleteFile(fileId)
      setFiles(prev => prev.filter(f => f.id !== fileId))
    } catch (error) {
      console.error('Delete failed:', error)
      alert('Failed to delete file. Please try again.')
    }
  }

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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Files</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{files.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Presentations</CardTitle>
              <PresentationIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{presentations.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
              <Upload className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatFileSize(files.reduce((total, file) => total + file.file_size, 0))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content */}
        <Tabs defaultValue="presentations" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="presentations">My Presentations</TabsTrigger>
            <TabsTrigger value="files">My Files</TabsTrigger>
          </TabsList>
          
          <TabsContent value="presentations">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle>Presentations</CardTitle>
                  <CardDescription>Your generated presentations</CardDescription>
                </div>
                <Button onClick={() => router.push('/create')} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" /> Create New
                </Button>
              </CardHeader>
              <CardContent>
                {presentations.length === 0 ? (
                  <div className="text-center py-8">
                    <PresentationIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No presentations yet</h3>
                    <p className="text-gray-500 mb-6">Create your first presentation to get started</p>
                    <Button onClick={() => router.push('/create')}>Create Presentation</Button>
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
          
          <TabsContent value="files">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle>Files</CardTitle>
                  <CardDescription>Your uploaded files</CardDescription>
                </div>
                <div>
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Button disabled={uploadingFile} className="flex items-center gap-2">
                      {uploadingFile ? (
                        <>
                          <div className="animate-spin h-4 w-4 border-b-2 border-white rounded-full mr-2"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4" /> Upload File
                        </>
                      )}
                    </Button>
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={uploadingFile}
                  />
                </div>
              </CardHeader>
              <CardContent>
                {files.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No files uploaded</h3>
                    <p className="text-gray-500 mb-4">Upload files to use in your presentations</p>
                    <label htmlFor="empty-file-upload" className="cursor-pointer">
                      <Button disabled={uploadingFile}>
                        {uploadingFile ? 'Uploading...' : 'Upload a file'}
                      </Button>
                    </label>
                    <input
                      id="empty-file-upload"
                      type="file"
                      className="hidden"
                      onChange={handleFileUpload}
                      disabled={uploadingFile}
                    />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Upload Date</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {files.map(file => (
                          <tr key={file.id}>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center">
                                <FileText className="h-4 w-4 text-gray-400 mr-2" />
                                <span className="truncate max-w-[200px]">{file.filename}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">{formatFileSize(file.file_size)}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">{new Date(file.created_at).toLocaleDateString()}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-blue-600 hover:text-blue-800 mr-2"
                                onClick={() => window.open(file.file_path, '_blank')}
                              >
                                <Download className="h-3.5 w-3.5" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-red-600 hover:text-red-800"
                                onClick={() => handleDeleteFile(file.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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

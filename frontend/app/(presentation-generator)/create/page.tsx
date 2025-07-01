import React from 'react'
import CreatePage from './components/CreatePage'
import Header from '@/app/dashboard/components/Header'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Outline Presentation",
  description: "Customize and organize your presentation outline. Drag and drop slides, add charts, and generate your presentation with ease.",
  keywords: [
    "presentation generator",
    "AI presentations",
    "data visualization",
    "automatic presentation maker",
    "professional slides",
    "data-driven presentations",
    "document to presentation",
    "presentation automation",
    "smart presentation tool",
    "business presentations"
  ]
}

const page = () => {
  return (
    <ProtectedRoute>
      <div className='relative min-h-screen'>
        <Header />
        <CreatePage />
      </div>
    </ProtectedRoute>
  )
}

export default page

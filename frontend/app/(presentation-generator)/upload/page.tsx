import React from 'react'

import UploadPage from './components/UploadPage'
import Header from '@/app/dashboard/components/Header'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: "DeckGenie | AI-Powered Presentation Generator & Design tool",
    description: "Transform your ideas into investor-ready decks",
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
                {/* Modern gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/30 to-accent/10"></div>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-accent/5"></div>
                
                <Header />
                <div className='relative flex flex-col items-center justify-center py-12 px-6'>
                    <div className="text-center space-y-4 mb-8">
                        <h1 className='text-4xl md:text-5xl lg:text-6xl font-bold font-display text-gradient leading-tight pb-2'>
                            Transform your ideas into 
                        </h1>
                        <h2 className='text-3xl md:text-4xl lg:text-5xl font-bold font-display text-foreground leading-tight'>
                            investor-ready decks
                        </h2>
                        <p className='text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mt-6 font-body'>
                            AI-designed presentations that elevate your vision and unlock investor funding.
                        </p>
                    </div>
                </div>
                <UploadPage />
            </div>
        </ProtectedRoute>
    )

}
export default page


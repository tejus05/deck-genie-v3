import React from 'react'
import { Metadata } from 'next'
import dynamic from 'next/dynamic'

// Dynamically import client components to prevent SSR conflicts
const HomePage = dynamic(() => import('./components/HomePage'), {
    ssr: false
})

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
        <div className='relative min-h-screen overflow-hidden'>
            {/* Professional animated background */}
            <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/30 to-accent/10"></div>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-accent/5"></div>
            
            {/* Floating geometric shapes for professional atmosphere */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Large primary orb */}
                <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-gradient-to-br from-primary/10 to-accent/5 rounded-full blur-3xl animate-pulse-slow"></div>
                
                {/* Secondary accent orb */}
                <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-gradient-to-bl from-accent/8 to-secondary/5 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '2s'}}></div>
                
                {/* Small floating element */}
                <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-gradient-to-tr from-secondary/8 to-primary/5 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '1s'}}></div>
                
                {/* Additional subtle floating elements */}
                <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-gradient-to-bl from-primary/5 to-accent/3 rounded-full blur-2xl animate-float-slow"></div>
                <div className="absolute bottom-1/3 right-1/5 w-32 h-32 bg-gradient-to-tr from-accent/6 to-secondary/4 rounded-full blur-xl animate-float" style={{animationDelay: '3s'}}></div>
            </div>
            
            {/* Subtle animated grid pattern */}
            <div className="absolute inset-0 opacity-[0.02]">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(var(--foreground),0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(var(--foreground),0.05)_1px,transparent_1px)] bg-[size:4rem_4rem] animate-pulse-slow"></div>
            </div>
            
            <div className="relative z-10">
                <HomePage />
            </div>
        </div>
    )
}

export default page

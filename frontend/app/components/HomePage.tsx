"use client"

import React from 'react'
import Header from '@/app/dashboard/components/Header'
import UploadPage from '@/app/(presentation-generator)/upload/components/UploadPage'

const HomePage = () => {
    return (
        <>
            <Header />
            <div className='flex flex-col items-center justify-center py-12 px-6'>
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
        </>
    )
}

export default HomePage

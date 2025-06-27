import React from 'react'

import UploadPage from './components/UploadPage'
import Header from '@/app/dashboard/components/Header'
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
        <div className='relative'>

            <Header />
            <div className='flex flex-col items-center justify-center  py-4'>
                <h1 className='text-3xl font-semibold font-instrument_sans text-center px-6'>Transform your ideas into investor-ready decks </h1>
            </div>
            <UploadPage />
        </div>)

}
export default page


'use client';
import { ArrowLeftIcon } from '@radix-ui/react-icons'
import React from 'react'
import { useRouter } from 'next/navigation';

const BackBtn = () => {
    const router = useRouter();
    return (
        <button 
            onClick={() => router.back()} 
            className='glass border-2 border-white/30 rounded-xl p-3 hover:bg-white/20 hover:border-white/50 transition-all duration-200 hover:scale-105 active:scale-95 group'
        >
            <ArrowLeftIcon className="w-5 h-5 text-white group-hover:text-white/90 transition-colors" />
        </button>
    )
}

export default BackBtn

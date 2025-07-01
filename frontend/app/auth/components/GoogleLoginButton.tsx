'use client'

import { useAuth } from '@/app/(presentation-generator)/context/AuthContext'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

export default function GoogleLoginButton() {
  const { loginWithGoogle } = useAuth()
  
  return (
    <Button
      type="button"
      variant="outline"
      className="w-full flex items-center justify-center gap-2 py-6 bg-white border border-gray-300 shadow-sm hover:bg-gray-50"
      onClick={loginWithGoogle}
    >
      <Image
        src="/google-logo.svg"
        alt="Google"
        width={20}
        height={20}
      />
      <span>Continue with Google</span>
    </Button>
  )
}

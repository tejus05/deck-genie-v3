"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const page = () => {
  const router = useRouter();
  
  useEffect(() => {
    router.push('/upload');
  }, [router]);

  return null;
}

export default page

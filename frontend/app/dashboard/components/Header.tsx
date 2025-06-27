"use client";

import Wrapper from "@/components/Wrapper";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import UserAccount from "@/app/(presentation-generator)/components/UserAccount";
import BackBtn from "@/components/BackBtn";
import { usePathname } from "next/navigation";
const Header = () => {
  const pathname = usePathname();
  return (
    <div className="glass border-b-2 border-white/20 w-full shadow-modern-xl sticky top-0 z-50 backdrop-blur-md">
      <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary opacity-90"></div>
      <Wrapper>
        <div className="relative flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            {pathname !== '/upload' && <BackBtn />}
            <Link href="/dashboard" className="transition-transform hover:scale-105">
              <img
                src="/logo-white.png"
                alt="Presentation logo"
                width={162}
                height={32}
                className="drop-shadow-lg"
              />
            </Link>
          </div>
          <div className="flex items-center gap-3 sm:gap-5 md:gap-10">
            <UserAccount />
          </div>
        </div>
      </Wrapper>
    </div>
  );
};

export default Header;

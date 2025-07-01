"use client";
import { ChevronDown, LayoutDashboard, User, LogOut } from "lucide-react";
import { AvatarFallback } from "@/components/ui/avatar";
import { Avatar } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import React from "react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";

const UserAccount = () => {
  const { user, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/auth/login"
          className="px-4 py-2 text-sm font-medium text-white hover:text-gray-200 transition-colors"
        >
          Login
        </Link>
        <Link
          href="/auth/register"
          className="px-4 py-2 text-sm font-medium bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
        >
          Sign Up
        </Link>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-1 cursor-pointer focus:outline-none">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials(user.full_name)}
            </AvatarFallback>
          </Avatar>

          <div className="hidden sm:flex items-center">
            <span className="text-white text-sm font-medium mr-1 px-2">
              {user.full_name.split(' ')[0]}
            </span>
            <ChevronDown className="w-4 h-4 ml-1 text-white" />
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[250px] p-0"
        align="end"
        side="bottom"
        sideOffset={8}
      >
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="text-sm font-medium text-gray-900">{user.full_name}</p>
          <p className="text-xs text-gray-500">{user.email}</p>
        </div>
        
        <nav className="flex flex-col py-2" role="menu" tabIndex={-1}>
          <Link
            href="/profile"
            prefetch={false}
            className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 transition-colors outline-none focus:bg-gray-50"
            role="menuitem"
          >
            <User className="w-4 h-4 text-gray-500" />
            <span className="text-gray-700 text-sm font-medium font-inter">
              Profile
            </span>
          </Link>
          
          <Link
            href="/dashboard"
            prefetch={false}
            className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 transition-colors outline-none focus:bg-gray-50"
            role="menuitem"
          >
            <LayoutDashboard className="w-4 h-4 text-gray-500" />
            <span className="text-gray-700 text-sm font-medium font-inter">
              Dashboard
            </span>
          </Link>
          
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 transition-colors outline-none focus:bg-gray-50 text-left w-full"
            role="menuitem"
          >
            <LogOut className="w-4 h-4 text-gray-500" />
            <span className="text-gray-700 text-sm font-medium font-inter">
              Logout
            </span>
          </button>
        </nav>
      </PopoverContent>
    </Popover>
  );
};

export default UserAccount;

"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white flex flex-col text-slate-900">

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-[1440px] mx-auto px-10 h-20 flex items-center justify-between">

          {/* Logo */}
          <Link href="/homepage" className="relative w-32 h-34">
            <Image
              src="/images/logo.png"
              alt="Novella Logo"
              fill
              className="object-contain object-left"
              priority
            />
          </Link>

          {/* Nav */}
          <div className="flex items-center gap-10">
            <Link href="/homepage" className="text-xs font-semibold text-blue-900 uppercase tracking-wider">
              Home
            </Link>
            <Link href="/library" className="text-xs font-medium text-blue-700 hover:text-blue-900 transition">
              My Library
            </Link>
            <Link href="/history" className="text-xs font-medium text-blue-700 hover:text-blue-900 transition">
              History
            </Link>
          </div>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="relative w-9 h-9 rounded-full overflow-hidden border border-gray-300 hover:border-blue-900 transition"
            >
              <Image
                src="/images/profile.jpg"  
                alt="User Profile"
                fill
                className="object-cover"
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-3 w-48 bg-white border border-gray-200 shadow-xl rounded-xl py-2">
                <Link href="/profile" className="block px-4 py-2 text-sm font-semibold hover:bg-gray-50">
                  Edit Profile
                </Link>
                <Link href="/settings" className="block px-4 py-2 text-sm font-semibold hover:bg-gray-50">
                  Activity Overview
                </Link>
                <Link href="/rentals" className="block px-4 py-2 text-sm font-semibold hover:bg-gray-50">
                  Account Details
                </Link>
                <hr className="my-2 border-gray-100" />
                <button className="w-full text-left px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50">
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow">{children}</main>


            {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-[1440px] mx-auto px-10 py-5 flex flex-col md:flex-row items-center justify-between gap-2 md:gap-0">
          
          <p className="text-xs md:text-sm font-semibold text-gray-500 uppercase tracking-wider">
            © 2025 Novella
          </p>

          <p className="text-xs md:text-sm font-semibold text-gray-600">
            Contact: hello@novella.com
          </p>

          <Link
            href="/privacy"
            className="text-xs md:text-sm font-semibold text-blue-900 hover:text-blue-800 transition uppercase tracking-wider"
          >
            Privacy Policy
          </Link>

        </div>
      </footer>
    </div>
  );
}

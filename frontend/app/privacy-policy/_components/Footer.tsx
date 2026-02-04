"use client";

import Link from "next/link";

export default function Footer() { 
    return (
        <footer className="bg-white border-t border-gray-200">
        <div className="max-w-[1440px] mx-auto px-10 py-5 flex flex-col md:flex-row items-center justify-between gap-2 md:gap-0">
          
          <p className="text-xs md:text-sm font-semibold text-gray-500 uppercase tracking-wider">
            © 2025 Novella
          </p>

          <p className="text-xs md:text-sm font-semibold text-gray-600">
            Contact: novella@gmail.com
          </p>

          <Link
            href="/privacy-policy"
            className="text-xs md:text-sm font-semibold text-blue-900 hover:text-blue-800 transition uppercase tracking-wider"
          >
            Privacy Policy
          </Link>

        </div>
      </footer>
    );
}
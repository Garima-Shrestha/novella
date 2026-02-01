"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation";

const NAV_LINKS = [
    { href: "/homepage", label: "Home" },
    { href: "/library", label: "My Library" },
    { href: "/history", label: "History" },
];

export default function Header() { 
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const pathname = usePathname();
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { logout, user } = useAuth();
    const router = useRouter();


    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setIsDropdownOpen(false);
        }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);


    const isActiveLink = (href: string) => pathname === href || pathname.startsWith(href + "/");

    // Logout
    const handleLogout = () => {
        logout(); 
        router.replace("/login"); 
    };

    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5050/";

    return (
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-[1440px] mx-auto px-10 h-19 flex items-center justify-between">

            {/* logo */}
            <Link href="/homepage" className="relative w-32 h-34">
            <img
                src="/images/logo.png"
                alt="Novella Logo"
                className="object-contain object-left w-full h-full"
            />
            </Link>

            {/* nav */}
            <div className="flex items-center gap-10">
            {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href;
                return (
                <Link
                    key={link.href}
                    href={link.href}
                    className={`text-xs uppercase tracking-wider transition ${
                    isActive
                        ? "font-semibold text-blue-900"
                        : "font-normal text-blue-700 hover:text-blue-900"
                    }`}
                >
                    {link.label}
                </Link>
                );
            })}
            </div>

            {/* profile */}
            <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="relative w-9 h-9 rounded-full overflow-hidden border border-gray-300 hover:border-blue-900 transition flex items-center justify-center bg-gray-200"
                aria-haspopup="true"
                aria-expanded={isDropdownOpen}
            >
                {user?.imageUrl ?  (
                <img src={`${BASE_URL.replace(/\/$/, "")}${user.imageUrl}`} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6 text-gray-600"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
                )}
            </button>

            {isDropdownOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-white border border-gray-200 shadow-xl rounded-xl py-2">
                <Link href="/user/editprofile" className="block px-4 py-2 text-sm font-semibold hover:bg-gray-50">
                    Edit Profile
                </Link>
                <Link href="/settings" className="block px-4 py-2 text-sm font-semibold hover:bg-gray-50">
                    Activity Overview
                </Link>
                <Link href="/rentals" className="block px-4 py-2 text-sm font-semibold hover:bg-gray-50">
                    Account Details
                </Link>
                <hr className="my-2 border-gray-100" />
                <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                >
                    Logout
                </button>

                </div>
            )}
            </div>
        </div>
        </header>
    );
}

"use client";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function Header() {
    const { logout, user } = useAuth();

    return (
        <header className="sticky top-0 z-50 bg-white border-b border-blue-100">
            <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Global">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-3">
                            <Link href="/admin" className="group">
                                <img 
                                    src="/images/logo.png" 
                                    alt="Novella Logo" 
                                    className="h-14 w-auto object-contain group-hover:opacity-80 transition-opacity"
                                />
                            </Link>
                            <div className="h-6 w-[1px] bg-slate-200 mx-1" />
                            <span className="text-sm font-bold tracking-tight text-slate-900">
                                Admin
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-6 flex items-center justify-center text-xs font-bold text-blue-600">
                            {user?.email || 'Admin'}
                        </div>
                        <span className="text-sm font-medium sm:inline">
                            <button
                                onClick={() => {
                                    logout();
                                }}
                                className="w-full border border-red-200 flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-red-50 text-red-600 transition-colors text-left"
                            >
                                Logout
                            </button>
                        </span>
                    </div>
                </div>
            </nav>
        </header>
    );
}
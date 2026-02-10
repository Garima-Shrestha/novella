"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ADMIN_LINKS = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/users", label: "Users" },
    { href: "/admin/books-before-renting", label: "Books" },
    { href: "/admin/categories", label: "Categories" },
];

export default function Sidebar() {
    const pathname = usePathname();
    const isActive = (href: string) => href === "/admin" ? pathname === href : pathname?.startsWith(href);

    return (
        <aside className="fixed top-0 left-0 h-screen w-56 bg-[#001F2B] border-r border-white/10 z-40 overflow-y-auto">
            <div className="h-16 flex items-center px-4 border-b border-white/10">
                <Link href="/admin" className="flex items-center gap-3">
                    <img 
                        src="/images/logo.png" 
                        alt="Logo" 
                        className="h-14 w-auto object-contain mix-blend-screen brightness-150 contrast-125"
                    />
                    <span className="text-base font-bold text-white tracking-tight">
                        Admin
                    </span>
                </Link>
            </div>

            <nav className="p-3 space-y-1.5">
                {ADMIN_LINKS.map(link => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={`group flex items-center px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                            isActive(link.href)
                                ? 'bg-blue-500/20 text-white'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        <span>{link.label}</span>
                    </Link>
                ))}
            </nav>
        </aside>
    );
}
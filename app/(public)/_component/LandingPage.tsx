"use client";

import Link from 'next/link';
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      
      {/* 1. HERO SECTION */}
      <section className="relative py-12 lg:py-20 bg-[#F1F5F9] overflow-hidden">
        <div className="container mx-auto px-6 relative z-10 flex flex-col lg:flex-row items-center gap-12">
          
          <div className="w-full lg:w-3/5"> 
            <span className="text-[11px] font-bold text-[#2563EB] uppercase tracking-[0.25em] mb-4 block">
              New Way of Reading
            </span>
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-[#1E3A8A] mb-4 leading-tight">
              Rent Books. Read Fully. <br />
              <span className="text-[#3B82F6] italic">Save Quotes.</span>
            </h1>
            <p className="text-lg text-slate-600 mb-10 leading-relaxed max-w-xl">
              Access any book for a limited time at a fraction of the price. 
              Keep your favorite quotes forever, even after the rental ends.
            </p>
            <div className="flex">
              <Link href="/register" className="px-10 py-4 bg-[#1E3A8A] text-white rounded-lg font-bold text-center hover:bg-[#111827] transition-all shadow-lg">
                Create Account
              </Link>
            </div>
          </div>

          {/* IMAGE CONTAINER */}
          <div className="w-full lg:w-2/5 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md aspect-square rounded-3xl overflow-hidden shadow-2xl border-[3px] border-[#3B82F6]">
              <Image 
                src="/images/landing.png" 
                alt="Person reading" 
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#1E3A8A] mb-4">How It Works</h2>
            <div className="h-1.5 w-16 bg-[#3B82F6] mx-auto rounded-full"></div>
          </div>
          
          <div className="grid md:grid-cols-4 gap-12">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-50 text-[#2563EB] rounded-2xl flex items-center justify-center mx-auto mb-6 font-bold text-3xl border border-blue-100">1</div>
              <h3 className="font-bold mb-2 text-[#1E3A8A] text-lg">Choose</h3>
              <p className="text-sm text-slate-500 px-4">Pick a book and your preferred rental period.</p>
            </div>
            {/* Step 2 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-50 text-[#2563EB] rounded-2xl flex items-center justify-center mx-auto mb-6 font-bold text-3xl border border-blue-100">2</div>
              <h3 className="font-bold mb-2 text-[#1E3A8A] text-lg">Pay Securely</h3>
              <p className="text-sm text-slate-500 px-4">Fast and secure payments via Khalti.</p>
            </div>
            {/* Step 3 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-50 text-[#2563EB] rounded-2xl flex items-center justify-center mx-auto mb-6 font-bold text-3xl border border-blue-100">3</div>
              <h3 className="font-bold mb-2 text-[#1E3A8A] text-lg">Read Fully</h3>
              <p className="text-sm text-slate-500 px-4">Enjoy the full content during your rental time.</p>
            </div>
            {/* Step 4 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-50 text-[#2563EB] rounded-2xl flex items-center justify-center mx-auto mb-6 font-bold text-3xl border border-blue-100">4</div>
              <h3 className="font-bold mb-2 text-[#1E3A8A] text-lg">Save Quotes</h3>
              <p className="text-sm text-slate-500 px-4">Access your saved quotes anytime forever.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. WHY RENT WITH US */}
      <section className="py-16 bg-[#001F2B] text-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-12 text-left border-l-[4px] border-[#1e60ff] pl-6">
            Why Rent With Us?
          </h2>
          
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="flex flex-col gap-10">
              {/* Feature 1 */}
              <div className="flex gap-6">
                <div className="mt-1">
                  <div className="w-6 h-6 border-2 border-[#1e60ff] rounded-full flex items-center justify-center">
                    <div className="w-2.5 h-2.5 bg-[#1e60ff] rounded-full"></div>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-2">Quotes Stay Forever</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">Your saved highlights are accessible even after the rental expires.</p>
                </div>
              </div>
              {/* Feature 2 */}
              <div className="flex gap-6">
                <div className="mt-1">
                  <div className="w-6 h-6 border-2 border-[#1e60ff] rounded-full flex items-center justify-center">
                    <div className="w-2.5 h-2.5 bg-[#1e60ff] rounded-full"></div>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-2">Affordable Access</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">Pay less than the book's full price for temporary access.</p>
                </div>
              </div>
              {/* Feature 3 */}
              <div className="flex gap-6">
                <div className="mt-1">
                  <div className="w-6 h-6 border-2 border-[#1e60ff] rounded-full flex items-center justify-center">
                    <div className="w-2.5 h-2.5 bg-[#1e60ff] rounded-full"></div>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-2">Flexible Reading</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">Re-rent anytime to continue reading where you left off.</p>
                </div>
              </div>
            </div>

            <div className="bg-[#002a3a] p-12 rounded-2xl border border-slate-700/50 relative overflow-hidden shadow-2xl">
              <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#1e60ff]"></div>
              <p className="italic text-slate-300 text-base mb-8 leading-relaxed">
                "The ability to keep my highlights after the rental ended was a game changer. I didn't have to buy the whole book just for a few vital quotes."
              </p>
              <div className="font-bold text-[#1e60ff] text-xs uppercase tracking-[0.2em]">
                Verified Reader
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FINAL CALL TO ACTION */}
      <section className="py-24 bg-[#F8FAFC] text-center">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-[#1E3A8A] mb-6">Start Reading Today</h2>
          <p className="text-slate-500 mb-10 max-w-lg mx-auto text-base leading-relaxed">
            Pay Less, Keep Knowledge. Join a community of readers who capture what matters.
          </p>
          <div className="flex justify-center">
            <Link href="/register" className="px-12 py-4 bg-[#2563EB] text-white rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-[#1E3A8A] transition-all shadow-xl shadow-blue-100">
              Create Account
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-6 bg-white border-t border-slate-100 text-center text-slate-400 text-[10px] uppercase tracking-[0.3em]">
        <p>&copy; 2025 Novella. All rights reserved.</p>
      </footer>
    </div>
  );
}
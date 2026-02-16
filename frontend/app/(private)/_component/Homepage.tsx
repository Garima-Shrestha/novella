"use client";
import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  const categories = ['Fiction', 'Fantasy', 'Non Fiction', 'Children', 'History'];

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-6">
      
      {/* 1. COMPACT HERO (Height Reduced) */}
      <section className="flex items-center justify-between gap-8 mb-8">
        <div className="flex-grow max-w-md">
          <h1 className="text-2xl font-black text-slate-900 mb-4">Discover your next read</h1>
          <div className="relative group">
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full h-12 pl-12 bg-white border border-slate-200 rounded-xl focus:border-blue-500 outline-none transition-all"
            />
            <span className="absolute left-4 top-3 text-lg opacity-30">🔍</span>
          </div>
        </div>

        {/* <div className="bg-blue-50 rounded-2xl p-6 flex items-center justify-between border border-blue-100 flex-grow max-w-xl h-32">
          <div>
            <h2 className="text-xl font-black text-blue-900 leading-tight">Rent 5 books & get <span className="text-red-700">30% off!</span></h2>
            <button className="mt-2 px-6 py-2 bg-red-900 text-white rounded-lg text-sm font-bold">Order Now</button>
          </div>
          <span className="text-5xl">📚</span>
        </div> */}
      </section>

      {/* 2. COMPACT CATEGORIES (Height Reduced) */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">
            Categories
          </h2>

          <Link 
            href="/category"
            className="text-sm font-bold text-blue-600 hover:underline"
          >
            See All
          </Link>
        </div>
        
        <div className="flex gap-3">
          {categories.map((cat) => (
            <Link
              key={cat}
              href={`/category?scrollTo=${encodeURIComponent(cat)}`}
              className="px-6 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:border-blue-600 transition-all"
            >
              {cat}
            </Link>
          ))}
        </div>
      </section>

      {/* 3. READING NOW (Detailed & Prominent) */}
      {/* <section className="mb-16">
        <h2 className="text-2xl font-black text-slate-900 mb-6">Reading Now</h2>
        <div className="bg-white border border-slate-100 rounded-[2rem] p-8 flex flex-col md:flex-row items-center gap-10 shadow-sm ring-1 ring-slate-100">
           <div className="relative w-40 h-56 bg-teal-700 rounded-xl shadow-2xl flex-shrink-0 flex items-center justify-center text-white font-bold p-4 text-center">
             The Names
           </div>

           <div className="flex-grow w-full">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-3xl font-black text-blue-950">The Names</h3>
                  <p className="text-slate-500 font-bold">Don DeLillo • 339 Pages</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-blue-600">Progress: 62%</span>
                  <span className="text-slate-400 italic">3 days remaining</span>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full w-[62%] bg-blue-600 rounded-full"></div>
                </div>
              </div>
           </div>

           <button className="px-10 py-4 bg-blue-950 text-white rounded-2xl font-bold hover:bg-blue-800 transition-colors shadow-lg">
             Continue Reading
           </button>
        </div>
      </section> */}

      {/* 4. BEST SELLERS (Professional Grid) */}
      {/* <section className="mb-20">
        <h2 className="text-2xl font-black text-slate-900 mb-8">Best Sellers</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {[
            { title: "The Design of Books", author: "Debbie Berne", color: "bg-orange-500" },
            { title: "Charlotte's Web", author: "E.B. White", color: "bg-amber-50 border border-amber-100" },
            { title: "Atomic Habits", author: "James Clear", color: "bg-slate-50 border border-slate-200" },
            { title: "Psychology of Money", author: "Morgan Housel", color: "bg-white border border-slate-200" },
            { title: "Never Ending Sky", author: "Joseph Kirkland", color: "bg-teal-700" }
          ].map((book, i) => (
            <div key={i} className="group cursor-pointer">
              <div className={`aspect-[2/3] rounded-2xl mb-4 shadow-sm group-hover:shadow-xl group-hover:-translate-y-2 transition-all duration-300 flex items-center justify-center p-6 text-center font-bold text-xs ${book.color}`}>
                {book.title}
              </div>
              <h4 className="font-bold text-slate-900 text-sm truncate">{book.title}</h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">{book.author}</p>
            </div>
          ))}
        </div>
      </section> */}

    </div>
  );
}
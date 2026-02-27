"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { handleInitiateKhaltiPayment } from "@/lib/actions/book-access-action";

interface Genre {
  _id: string;
  name: string;
}

interface Book {
  _id: string;
  title: string;
  author: string;
  price: number;
  pages: number;
  description: string;
  publishedDate: string;
  genre: Genre;
  coverImageUrl: string;
}

interface Props {
  book: Book;
}

export default function BookDetailsCard({ book }: Props) {
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";

  const [renting, setRenting] = useState(false);
  const [expiresAt, setExpiresAt] = useState("");
  const [paying, setPaying] = useState(false);

  const todayStr = new Date().toISOString().split("T")[0];

  const calculateDays = () => {
    if (!expiresAt) return 0;
    const diff = new Date(expiresAt).getTime() - new Date(todayStr).getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
    return days > 0 ? days : 0;
  };

  const pay = async () => {
    if (!expiresAt) return toast.error("Please select expiry date");
    setPaying(true);
    try {
      sessionStorage.setItem("khalti_expiresAt", expiresAt);
      sessionStorage.setItem("khalti_bookId", book._id);

      // Amount in paisa (1 Rs = 100 paisa)
      const amountInPaisa = Math.round(book.price * 100);

      const result = await handleInitiateKhaltiPayment({
        bookId: book._id,
        amount: amountInPaisa,
        purchase_order_id: book._id,
        purchase_order_name: book.title,
      });

      if (result.success && result.data?.payment_url) {
        window.location.href = result.data.payment_url;
      } else {
        toast.error(result.message || "Failed to initiate payment");
      }
    } catch (err: any) {
      toast.error(err.message || "Payment failed");
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto bg-white p-8">
      <div className="flex flex-col lg:flex-row gap-12">

        {/* LEFT SIDE */}
        <div className="shrink-0">
          <div className="w-[200px] h-[300px] overflow-hidden rounded-lg border border-slate-200 shadow-sm">
            {book.coverImageUrl ? (
              <img
                src={`${BASE_URL}${book.coverImageUrl}`}
                alt={book.title}
                className="block w-[200px] h-[300px] object-cover"
                style={{ width: 200, height: 300, objectFit: "cover" }}
              />
            ) : (
              <div className="w-[200px] h-[300px] flex items-center justify-center text-slate-400 font-semibold">
                No Cover
              </div>
            )}
          </div>

          <div className="mt-6 text-sm text-slate-600">
            <span className="font-semibold text-slate-800">Genre:</span>{" "}
            {book.genre?.name}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-extrabold text-blue-900 leading-tight break-words">
            {book.title}
          </h1>

          <div className="mt-3 text-base text-slate-600">
            <span className="font-semibold">Author:</span> {book.author}
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              Description:
            </h2>
            <p className="text-slate-600 leading-relaxed text-sm break-words">
              {book.description}
            </p>
          </div>

          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div className="bg-slate-50 rounded-xl p-6 text-center">
              <div className="text-[11px] uppercase tracking-wider text-blue-600 font-semibold">
                Pages
              </div>
              <div className="mt-2 text-xl font-bold text-slate-900">
                {book.pages}
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-6 text-center">
              <div className="text-[11px] uppercase tracking-wider text-blue-600 font-semibold">
                Price
              </div>
              <div className="mt-2 text-xl font-bold text-slate-900">
                Rs {book.price}
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-6 text-center">
              <div className="text-[11px] uppercase tracking-wider text-blue-600 font-semibold">
                Published Date
              </div>
              <div className="mt-2 text-xs font-bold text-slate-900">
                {book.publishedDate}
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-6 text-center">
              <div className="text-[11px] uppercase tracking-wider text-blue-600 font-semibold">
                Genre
              </div>
              <div className="mt-2 text-xs font-bold text-slate-900">
                {book.genre?.name}
              </div>
            </div>
          </div>

          {/* RENT BUTTON */}
          {!renting && (
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() => setRenting(true)}
                className="px-7 py-2.5 bg-red-800 text-white rounded-lg font-semibold hover:bg-red-800 transition text-sm"
              >
                Rent
              </button>
            </div>
          )}

          {/* RENT SECTION */}
          {renting && (
            <div className="mt-6 p-8 border border-slate-200 rounded-xl bg-white shadow-sm space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rented Date
                </label>
                <input
                  type="date"
                  value={todayStr}
                  readOnly
                  className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm bg-slate-50 text-slate-800 cursor-not-allowed shadow-inner"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date
                </label>
                <input
                  type="date"
                  value={expiresAt}
                  min={todayStr}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                />
              </div>

              <div className="text-sm">
                <span className="font-semibold">Number of Days: </span>
                {calculateDays()}
              </div>

              <div className="text-sm">
                <span className="font-semibold">Total Price: </span>
                Rs {book.price}
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={pay}
                  disabled={paying || !expiresAt}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-70 transition text-sm"
                >
                  {paying ? "Redirecting to Khalti..." : "Continue & Pay with Khalti"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



// "use client";

// import { useState, useMemo } from "react";
// import { toast } from "react-toastify";
// import { handleRentBook } from "@/lib/actions/book-access-action";

// interface Genre {
//   _id: string;
//   name: string;
// }

// interface Book {
//   _id: string;
//   title: string;
//   author: string;
//   price: number;
//   pages: number;
//   description: string;
//   publishedDate: string;
//   genre: Genre;
//   coverImageUrl: string;
// }

// interface Props {
//   book: Book;
// }

// export default function BookDetailsCard({ book }: Props) {
//   const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";

//   const [renting, setRenting] = useState(false);
//   const [rented, setRented] = useState(false);
//   const [expiresAt, setExpiresAt] = useState("");
//   const [rentingNow, setRentingNow] = useState(false);

//   const todayStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

//   const calculateDays = () => {
//     if (!expiresAt) return 0;
//     const diff = new Date(expiresAt).getTime() - new Date(todayStr).getTime();
//     const days = Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1; 
//     return days > 0 ? days : 0;
//   };

//   const rentBook = async () => {
//     if (!expiresAt) return toast.error("Please select expiry date");
//     setRentingNow(true);
//     try {
//       const result = await handleRentBook(book._id, { expiresAt });
//       if (result.success) {
//         toast.success("Book rented successfully!");
//         setRented(true);
//       } else {
//         toast.error(result.message || "Rent failed");
//       }
//     } catch (err: any) {
//       toast.error(err.message || "Rent failed");
//     } finally {
//       setRentingNow(false);
//     }
//   };

//   return (
//     <div className="max-w-6xl mx-auto bg-white p-8">
//       <div className="flex flex-col lg:flex-row gap-12">

//         {/* LEFT SIDE */}
//         <div className="shrink-0">

//           <div className="w-[200px] h-[300px] overflow-hidden rounded-lg border border-slate-200 shadow-sm">
//             {book.coverImageUrl ? (
//               <img
//                 src={`${BASE_URL}${book.coverImageUrl}`}
//                 alt={book.title}
//                 className="block w-[200px] h-[300px] object-cover"
//                 style={{ width: 200, height: 300, objectFit: "cover" }}
//               />
//             ) : (
//               <div className="w-[200px] h-[300px] flex items-center justify-center text-slate-400 font-semibold">
//                 No Cover
//               </div>
//             )}
//           </div>

//           {/* KEEP THIS SAME (not reduced) */}
//           <div className="mt-6 text-sm text-slate-600">
//             <span className="font-semibold text-slate-800">Genre:</span>{" "}
//             {book.genre?.name}
//           </div>

//         </div>

//         {/* RIGHT SIDE */}
//         <div className="flex-1 min-w-0">
//           <h1 className="text-3xl font-extrabold text-blue-900 leading-tight break-words">
//             {book.title}
//           </h1>

//           <div className="mt-3 text-base text-slate-600">
//             <span className="font-semibold">Author:</span> {book.author}
//           </div>

//           <div className="mt-8">
//             <h2 className="text-xl font-bold text-slate-900 mb-4">
//               Description:
//             </h2>

//             <p className="text-slate-600 leading-relaxed text-sm break-words">
//               {book.description}
//             </p>
//           </div>

//           <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-6">

//             <div className="bg-slate-50 rounded-xl p-6 text-center">
//               <div className="text-[11px] uppercase tracking-wider text-blue-600 font-semibold">
//                 Pages
//               </div>
//               <div className="mt-2 text-xl font-bold text-slate-900">
//                 {book.pages}
//               </div>
//             </div>

//             <div className="bg-slate-50 rounded-xl p-6 text-center">
//               <div className="text-[11px] uppercase tracking-wider text-blue-600 font-semibold">
//                 Price
//               </div>
//               <div className="mt-2 text-xl font-bold text-slate-900">
//                 ${book.price}
//               </div>
//             </div>

//             <div className="bg-slate-50 rounded-xl p-6 text-center">
//               <div className="text-[11px] uppercase tracking-wider text-blue-600 font-semibold">
//                 Published Date
//               </div>
//               <div className="mt-2 text-xs font-bold text-slate-900">
//                 {book.publishedDate}
//               </div>
//             </div>

//             <div className="bg-slate-50 rounded-xl p-6 text-center">
//               <div className="text-[11px] uppercase tracking-wider text-blue-600 font-semibold">
//                 Genre
//               </div>
//               <div className="mt-2 text-xs font-bold text-slate-900">
//                 {book.genre?.name}
//               </div>
//             </div>
//           </div>

//           {/* RENT BUTTON */}
//           {!renting && !rented && (
//             <div className="mt-6 flex justify-center">
//               <button
//                 type="button"
//                 onClick={() => setRenting(true)}
//                 className="px-7 py-2.5 bg-red-800 text-white rounded-lg font-semibold hover:bg-red-800 transition text-sm"
//               >
//                 Rent
//               </button>
//             </div>
//           )}

//           {/* RENT SECTION */}
//           {renting && !rented && (
//             <div className="mt-6 p-8 border border-slate-200 rounded-xl bg-white shadow-sm space-y-5">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Rented Date</label>
//                 <input
//                   type="date"
//                   value={todayStr}
//                   readOnly
//                   className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm bg-slate-50 text-slate-800 cursor-not-allowed shadow-inner"
//                 />
//               </div>

//               {/* Expiry Date */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
//                 <input
//                   type="date"
//                   value={expiresAt}
//                   min={todayStr}
//                   onChange={(e) => setExpiresAt(e.target.value)}
//                   className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
//                 />
//               </div>

//               {/* Number of Days */}
//               <div className="text-sm">
//                 <span className="font-semibold">Number of Days: </span>
//                 {calculateDays()}
//               </div>

//               {/* Total Price */}
//               <div className="text-sm">
//                 <span className="font-semibold">Total Price: </span>${book.price}
//               </div>

//               {/* Continue Button */}
//               <div className="mt-4 flex justify-end">
//                 <button
//                   type="button"
//                   onClick={rentBook}
//                   disabled={rentingNow || !expiresAt}
//                   className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-70 transition text-sm"
//                 >
//                   {rentingNow ? "Renting..." : "Continue & Pay"}
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* After rented */}
//           {rented && (
//             <div className="mt-6 p-6 border rounded-lg bg-green-50 text-green-800 font-semibold">
//               Book rented successfully!
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
// "use client";

// import { useEffect, useState } from "react";
// import Link from "next/link";
// import {
//   fetchUsers as fetchUsersAPI,
//   deleteUser as deleteUserAPI,
// } from "@/lib/api/admin/user";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// interface User {
//   _id: string;
//   username: string;
//   email: string;
//   countryCode: string;
//   phone: string;
//   imageUrl?: string;
// }

// export default function UserTable() {
//   const [users, setUsers] = useState<User[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const fetchUsers = async () => {
//     try {
//       setLoading(true);
//       const response = await fetchUsersAPI();
//       if (response.success) {
//         console.log("Fetched users:", response.data);
//         setUsers(response.data);
//       } else {
//         setError("Failed to fetch users");
//       }
//     } catch (err: any) {
//       setError(err.message || "Failed to fetch users");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchUsers();
//   }, []);

//   const deleteUser = async (id: string) => {
//     // if (!confirm("Are you sure you want to delete this user?")) return;
//     try {
//       await deleteUserAPI(id);
//       setUsers((prev) => prev.filter((u) => u._id !== id));
//       toast.success("User deleted successfully"); 
//     } catch (err: any) {
//       toast.error(err.message || "Delete failed");
//     }
//   };

//   const handleCountryCodeChange = (id: string, newCode: string) => {
//     setUsers((prev) =>
//       prev.map((u) => (u._id === id ? { ...u, countryCode: newCode } : u))
//     );
//   };

//   const BASE_URL = "http://localhost:5050";
//   return (
//     <div className="p-6 bg-white min-h-screen w-full font-sans antialiased">
//       <ToastContainer />
//       {/* Action Buttons */}
//       <div className="mb-4">
//         <Link
//           href="/admin/users/create"
//           className="text-sm text-white bg-[#00A859] px-4 py-2 rounded font-bold inline-block"
//         >
//           + Create
//         </Link>
//       </div>

//       {/* Error */}
//       {error && <div className="text-red-500 mb-4">{error}</div>}

//       {/* Loading */}
//       {loading ? (
//         <div className="font-medium">Loading users...</div>
//       ) : (
//         <div className="w-full overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
//           <table className="w-full border-collapse">
//             <thead>
//               <tr className="bg-gray-50 border-b border-gray-200">
//                 <th className="p-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">Image</th>
//                 <th className="p-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">Username</th>
//                 <th className="p-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">Email</th>
//                 <th className="p-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">Country Code</th>
//                 <th className="p-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">Phone</th>
//                 <th className="p-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {users.map((user) => (
//                 <tr key={user._id} className="border-b border-gray-100 hover:bg-gray-50/50">
//                   <td className="p-4">
//                     {user.imageUrl ? (
//                       <img
//                       // src={user.imageUrl}
//                         src={user.imageUrl ? `${BASE_URL}${user.imageUrl}` : "/default-avatar.png"}
//                         alt={user.username}
//                         className="w-10 h-10 rounded-full object-cover"
//                       />
//                     ) : (
//                       <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 text-xs font-bold">
//                         {user.username ? user.username.charAt(0).toUpperCase() : "?"}
//                       </div>
//                     )}
//                   </td>
//                   <td className="p-4 text-sm text-gray-800">{user.username}</td>
//                   <td className="p-4 text-sm text-gray-600">{user.email}</td>
//                   <td className="p-4">
//                     <select
//                       value={user.countryCode}
//                       onChange={(e) => handleCountryCodeChange(user._id, e.target.value)}
//                       className="border border-gray-300 rounded px-2 py-1 text-sm bg-white text-gray-900 font-medium focus:ring-1 focus:ring-blue-500 outline-none cursor-pointer"
//                     >
//                       <option value="+977">NP +977</option>
//                       <option value="+91">IN +91</option>
//                       <option value="+1">US +1</option>
//                       <option value="+44">GB +44</option>
//                       <option value="+86">CN +86</option>
//                     </select>
//                   </td>
//                   <td className="p-4 text-sm text-gray-600">{user.phone}</td>
//                   <td className="p-4 space-x-2">
//                     {/* <Link
//                       href="/admin/users/create"
//                       className="text-sm text-white bg-green-500 px-2 py-1 rounded"
//                     >
//                       + Create
//                     </Link> */}
//                     <Link
//                       href={`/admin/users/${user._id}/edit`}
//                       className="text-xs text-white bg-[#2563eb] px-3 py-1.5 rounded font-bold uppercase"
//                     >
//                       Edit
//                     </Link>
//                     <button
//                       onClick={() => deleteUser(user._id)}
//                       className="text-xs text-white bg-[#ef4444] px-3 py-1.5 rounded font-bold uppercase"
//                     >
//                       Delete
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//               {users.length === 0 && (
//               <tr>
//                 <td colSpan={6} className="text-center p-4">
//                   No users found.
//                 </td>
//               </tr>
//             )}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// }



"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { deleteUser as deleteUserAPI } from "@/lib/api/admin/user";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DeleteModal from "@/app/_components/DeleteModal";

interface User {
  _id: string;
  username: string;
  email: string;
  countryCode: string;
  phone: string;
  imageUrl?: string;
}

export default function UserTable(
  { users, pagination, search }: { users: User[]; pagination: any; search?: string }
) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState(search || "");

  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (searchTerm === "" && (search || "") !== "") {
      router.push(`/admin/users?page=1&size=${pagination.size}`);
    }
  }, [searchTerm, search, pagination.size, router]);

  const deleteUser = async (id: string) => {
    try {
      await deleteUserAPI(id);
      toast.success("User deleted successfully");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Delete failed");
    }
  };

  const onDeleteConfirm = async () => {
    if (!deleteId) return;
    await deleteUser(deleteId);
    setDeleteId(null);
  };

  const handleSearchChange = () => {
    router.push(
      `/admin/users?page=1&size=${pagination.size}` +
        (searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : "")
    );
  };

  const makePagination = (): React.ReactElement[] => {
    const pages = [];
    const currentPage = pagination.page;
    const totalPages = pagination.totalPages;
    const delta = 2;

    const prevHref =
      `/admin/users?page=${currentPage - 1}&size=${pagination.size}` +
      (search ? `&search=${encodeURIComponent(search)}` : "");
    pages.push(
      <Link
        key="prev"
        className={`px-3 py-1 border rounded-md 
                    ${
                      currentPage === 1
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed pointer-events-none"
                        : "bg-white text-blue-500 hover:bg-blue-100"
                    }`}
        href={currentPage === 1 ? "#" : prevHref}
      >
        Previous
      </Link>
    );

    let startPage = Math.max(1, currentPage - delta);
    let endPage = Math.min(totalPages, currentPage + delta);

    if (startPage > 1) {
      const href =
        `/admin/users?page=1&size=${pagination.size}` +
        (search ? `&search=${encodeURIComponent(search)}` : "");
      pages.push(
        <Link
          key={1}
          className="px-3 py-1 border rounded-md bg-white text-blue-500 hover:bg-blue-100"
          href={href}
        >
          1
        </Link>
      );
      if (startPage > 2) {
        pages.push(
          <span key="ellipsis1" className="px-2 text-gray-500">
            ...
          </span>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      const href =
        `/admin/users?page=${i}&size=${pagination.size}` +
        (search ? `&search=${encodeURIComponent(search)}` : "");
      pages.push(
        <Link
          key={i}
          className={`px-3 py-1 border rounded-md 
                        ${
                          i === currentPage
                            ? "bg-blue-500 text-white"
                            : "bg-white text-blue-500 hover:bg-blue-100"
                        }`}
          href={href}
        >
          {i}
        </Link>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="ellipsis2" className="px-2 text-gray-500">
            ...
          </span>
        );
      }
      const href =
        `/admin/users?page=${totalPages}&size=${pagination.size}` +
        (search ? `&search=${encodeURIComponent(search)}` : "");
      pages.push(
        <Link
          key={totalPages}
          className="px-3 py-1 border rounded-md bg-white text-blue-500 hover:bg-blue-100"
          href={href}
        >
          {totalPages}
        </Link>
      );
    }

    const nextHref =
      `/admin/users?page=${currentPage + 1}&size=${pagination.size}` +
      (search ? `&search=${encodeURIComponent(search)}` : "");
    pages.push(
      <Link
        key="next"
        className={`px-3 py-1 border rounded-md 
                    ${
                      currentPage === totalPages
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed pointer-events-none"
                        : "bg-white text-blue-500 hover:bg-blue-100"
                    }`}
        href={currentPage === totalPages ? "#" : nextHref}
      >
        Next
      </Link>
    );

    return pages;
  };

  const BASE_URL = "http://localhost:5050";

  return (
    <div className="p-6 bg-white min-h-screen w-full font-sans antialiased">
      <ToastContainer />

      <DeleteModal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={onDeleteConfirm}
        title="Delete Confirmation"
        description="This user will be permanently removed. Are you sure you want to continue?"
      />

      <div className="mb-4 flex items-center justify-between">
        <Link
          href="/admin/users/create"
          className="text-sm text-white bg-[#00A859] px-4 py-2 rounded font-bold inline-block"
        >
          + Create
        </Link>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearchChange();
              }
            }}
            placeholder="Search users..."
            className="border border-gray-300 rounded px-3 py-2 text-sm bg-white text-gray-900 font-medium focus:ring-1 focus:ring-blue-500 outline-none"
          />
          <button
            onClick={handleSearchChange}
            className="text-sm text-white bg-[#2563eb] px-4 py-2 rounded font-bold inline-block"
          >
            Search
          </button>
        </div>
      </div>

      <div className="w-full overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">Image</th>
              <th className="p-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">Username</th>
              <th className="p-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">Email</th>
              <th className="p-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">Country Code</th>
              <th className="p-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">Phone</th>
              <th className="p-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="border-b border-gray-100">
                <td className="p-4">
                  {user.imageUrl ? (
                    <img
                      src={user.imageUrl ? `${BASE_URL}${user.imageUrl}` : "/default-avatar.png"}
                      alt={user.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 text-xs font-bold">
                      {user.username ? user.username.charAt(0).toUpperCase() : "?"}
                    </div>
                  )}
                </td>
                <td className="p-4 text-sm text-gray-800">{user.username}</td>
                <td className="p-4 text-sm text-gray-800">{user.email}</td>
                <td className="p-4 text-sm text-gray-800">
                  {user.countryCode}
                </td>

                <td className="p-4 text-sm text-gray-800">{user.phone}</td>
                <td className="p-4 space-x-2">
                  <Link
                    href={`/admin/users/${user._id}`}
                    className="text-xs text-blue-600 border border-blue-600 px-3 py-1.5 rounded font-bold uppercase hover:bg-blue-50"
                  >
                    View
                  </Link>

                  <Link
                    href={`/admin/users/${user._id}/edit`}
                    className="text-xs text-white bg-blue-600 px-3 py-1.5 rounded font-bold uppercase hover:bg-blue-700"
                  >
                    Edit
                  </Link>

                  <button
                    onClick={() => setDeleteId(user._id)}
                    className="text-xs text-white bg-red-600 px-3 py-1.5 rounded font-bold uppercase hover:bg-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center p-4">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="p-4 flex justify-between items-center bg-gray-50">
          <div className="text-sm text-gray-700">
            Page {pagination.page} of {pagination.totalPages}
          </div>
          <div className="space-x-2">{makePagination()}</div>
        </div>
      </div>
    </div>
  );
}
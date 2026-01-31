// import Link from "next/link";

// export default function Page() {
//     return (
//         <div>
//             <Link className="text-blue-500 border border-blue-500 p-2 rounded inline-block"
//              href="/admin/users/create">Create User</Link>
//         </div>
//     );
// }


"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";

interface User {
  _id: string;
  username: string;
  email: string;
  phone: string;
  role: string;
}

export default function Page() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch users from backend
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/admin/users");
      if (response.data.success) {
        setUsers(response.data.data);
      } else {
        setError("Failed to fetch users");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const deleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await axios.delete(`/api/admin/users/${id}`);
      setUsers(prev => prev.filter(u => u._id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || "Delete failed");
    }
  };

  return (
    <div className="p-6">
      {/* Create User Link */}
      <div className="mb-4">
        <Link
          className="text-blue-500 border border-blue-500 p-2 rounded inline-block"
          href="/admin/users/create"
        >
          Create User
        </Link>
      </div>

      {/* Error */}
      {error && <div className="text-red-500 mb-4">{error}</div>}

      {/* Loading */}
      {loading ? (
        <div>Loading users...</div>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-left">Username</th>
              <th className="border p-2 text-left">Email</th>
              <th className="border p-2 text-left">Phone</th>
              <th className="border p-2 text-left">Role</th>
              <th className="border p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id} className="hover:bg-gray-50">
                <td className="border p-2">{user.username}</td>
                <td className="border p-2">{user.email}</td>
                <td className="border p-2">{user.phone}</td>
                <td className="border p-2">{user.role}</td>
                <td className="border p-2 space-x-2">
                  <Link
                    href={`/admin/users/${user._id}/edit`}
                    className="text-sm text-white bg-blue-500 px-2 py-1 rounded"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => deleteUser(user._id)}
                    className="text-sm text-white bg-red-500 px-2 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center p-4">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  fetchUsers as fetchUsersAPI,
  deleteUser as deleteUserAPI,
} from "@/lib/api/admin/user";

interface User {
  _id: string;
  username: string;
  email: string;
  countryCode: string;
  phone: string;
  role: string;
}

export default function UserTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetchUsersAPI();
      if (response.success) {
        setUsers(response.data);
      } else {
        setError("Failed to fetch users");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch users");
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
      await deleteUserAPI(id);
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err: any) {
      alert(err.message || "Delete failed");
    }
  };

  const handleCountryCodeChange = (id: string, newCode: string) => {
    setUsers((prev) =>
      prev.map((u) => (u._id === id ? { ...u, countryCode: newCode } : u))
    );
  };

  return (
    <div className="p-6">

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
              <th className="border p-2 text-left">Country Code</th>
              <th className="border p-2 text-left">Phone</th>
              <th className="border p-2 text-left">Role</th>
              <th className="border p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50">
                <td className="border p-2">{user.username}</td>
                <td className="border p-2">{user.email}</td>

                {/* Separate Country Code column */}
                <td className="border p-2">
                  <select
                    value={user.countryCode}
                    onChange={(e) =>
                      handleCountryCodeChange(user._id, e.target.value)
                    }
                    className="border p-1 rounded text-sm w-full"
                  >
                    <option value="+977">🇳🇵 +977</option>
                    <option value="+91">🇮🇳 +91</option>
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+44">🇬🇧 +44</option>
                    <option value="+86">🇨🇳 +86</option>
                  </select>
                </td>

                <td className="border p-2">{user.phone}</td>
                <td className="border p-2">{user.role}</td>
                <td className="border p-2 space-x-2">
                   <Link
                    href="/admin/users/create"
                    className="text-sm text-white bg-green-500 px-2 py-1 rounded"
                  >
                    + Create
                  </Link>
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
                <td colSpan={6} className="text-center p-4">
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

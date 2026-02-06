import { handleGetOneUser } from "@/lib/actions/admin/user-action";
import Link from "next/link";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const response = await handleGetOneUser(id);
  if (!response.success) {
    throw new Error(response.message || "Failed to load user");
  }

  const user = response.data;
  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";
  const imageSrc = user?.imageUrl ? `${BASE_URL}${user.imageUrl}` : null;

  return (
    <div className="bg-white w-full font-sans antialiased">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/admin/users"
          className="text-sm text-blue-700 hover:text-blue-800 font-bold"
        >
          ← Back to Users
        </Link>

        <Link
          href={`/admin/users/${id}/edit`}
          className="text-sm text-white bg-[#2563eb] px-4 py-2 rounded font-bold inline-block"
        >
          Edit User
        </Link>
      </div>

      <div className="w-full border border-gray-200 rounded-lg shadow-sm bg-white">
        <div className="p-7 border-b border-gray-200 bg-[#eef3ff]">
          <div className="flex items-center gap-4">
            {imageSrc ? (
              <img
                src={imageSrc}
                alt={user.username}
                className="w-14 h-14 rounded-full object-cover border border-blue-200"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-xl font-black text-blue-700">
                {user?.username ? user.username.charAt(0).toUpperCase() : "?"}
              </div>
            )}

            <div>
              <h1 className="text-xl font-black text-blue-900 leading-6">
                User Profile
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                View user profile information
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <p className="text-[11px] font-black text-slate-600 uppercase tracking-wide">
                Username
              </p>
              <p className="mt-1 text-sm text-gray-900 font-semibold">
                {user.username}
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <p className="text-[11px] font-black text-slate-600 uppercase tracking-wide">
                Email
              </p>
              <p className="mt-1 text-sm text-gray-900 font-semibold break-all">
                {user.email}
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <p className="text-[11px] font-black text-slate-600 uppercase tracking-wide">
                Country Code
              </p>
              <p className="mt-1 text-sm text-gray-900 font-semibold">
                {user.countryCode}
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <p className="text-[11px] font-black text-slate-600 uppercase tracking-wide">
                Phone Number
              </p>
              <p className="mt-1 text-sm text-gray-900 font-semibold">
                {user.phone}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

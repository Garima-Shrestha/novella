interface DashboardProps {
  totalUsers: number;
  totalBooks: number;
  totalCategories: number;
  totalRentals: number;
  recentAccesses: any[];
}

export default function Dashboard({
  totalUsers,
  totalBooks,
  totalCategories,
  totalRentals,
  recentAccesses,
}: DashboardProps) {
  return (
    <div className="p-6 bg-white min-h-screen w-full font-sans antialiased space-y-8">
      
      {/* STATS SECTION */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Total Users" value={totalUsers} />
        <StatCard title="Total Books" value={totalBooks} />
        <StatCard title="Total Categories" value={totalCategories} />
        <StatCard title="Total Rentals" value={totalRentals} />
      </div>

      {/* RECENT RENTALS */}
      <div className="w-full overflow-x-auto border border-gray-200 rounded-lg shadow-sm bg-white">
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50">
          <h2 className="text-xl font-black text-blue-900 leading-6">
            Recent Rentals
          </h2>
          <p className="text-sm text-gray-600 mt-2">
            Latest 5 rentals
          </p>
        </div>

        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-white border-b border-gray-200">
              <th className="p-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">
                Book
              </th>
              <th className="p-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">
                User Email
              </th>
              <th className="p-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">
                Rented At
              </th>
            </tr>
          </thead>

          <tbody>
            {recentAccesses
              .sort(
                (a, b) =>
                  new Date(b?.rentedAt || 0).getTime() -
                  new Date(a?.rentedAt || 0).getTime()
              )
              .slice(0, 5)
              .map((a) => (
                <tr key={a._id} className="border-b border-gray-100">
                  <td className="p-4 text-sm text-gray-800">
                    {a.book?.title || "—"}
                  </td>
                  <td className="p-4 text-sm text-gray-800">
                    {a.user?.email || "—"}
                  </td>
                  <td className="p-4 text-sm text-gray-800">
                    {a.rentedAt
                      ? new Date(a.rentedAt).toLocaleString()
                      : "—"}
                  </td>
                </tr>
              ))}

            {recentAccesses.length === 0 && (
              <tr>
                <td colSpan={3} className="text-center p-8 text-sm text-gray-600">
                  No rentals found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="border border-gray-200 rounded-xl shadow-sm bg-white p-6">
      <p className="text-xs font-black text-blue-900 uppercase tracking-wider">
        {title}
      </p>
      <p className="mt-2 text-3xl font-black text-slate-900">
        {value}
      </p>
    </div>
  );
}
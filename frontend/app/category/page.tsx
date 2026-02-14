import CategoryPage from "./_components/CategoryPage";
import { handleFetchAllCategories } from "@/lib/actions/category-action";

export default async function Page() {
  const result = await handleFetchAllCategories();

  if (!result.success || !result.data) {
    return (
      <div className="p-6 text-red-600">
        Failed to load categories
      </div>
    );
  }

  return (
    <div className="p-6">
      <CategoryPage categories={result.data} />
    </div>
  );
}

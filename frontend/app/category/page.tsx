import CategoryPage from "./_components/CategoryPage";
import { handleFetchAllCategories } from "@/lib/actions/category-action";
import { handleFetchAllBooks } from "@/lib/actions/books-before-renting-action";

export default async function Page() {
  const categoriesRes = await handleFetchAllCategories();
  const booksRes = await handleFetchAllBooks({ page: 1, size: 50 });

  if (!categoriesRes.success || !categoriesRes.data) {
    return <div className="p-6 text-red-600">Failed to load categories</div>;
  }

  if (!booksRes.success || !booksRes.data) {
    return <div className="p-6 text-red-600">Failed to load books</div>;
  }

  return (
    <div className="p-6">
      <CategoryPage categories={categoriesRes.data} books={booksRes.data} />
    </div>
  );
}

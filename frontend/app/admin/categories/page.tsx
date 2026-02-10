import { handleGetAllCategories } from "@/lib/actions/admin/category-action";
import CategoryList from "./_components/CategoryList";

export default async function Page() {
  const response = await handleGetAllCategories();

  if (!response.success) {
    throw new Error(response.message || "Failed to load categories");
  }

  return <CategoryList categories={response.categories} />;
}

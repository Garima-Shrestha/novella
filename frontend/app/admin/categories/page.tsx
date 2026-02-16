import { handleGetAllCategories } from "@/lib/actions/admin/category-action";
import CategoryList from "./_components/CategoryList";
import { redirect } from "next/navigation";


export default async function Page() {
  const response = await handleGetAllCategories();

  if (!response.success) {
    redirect("/login");
  }

  return <CategoryList categories={response.categories} />;
}

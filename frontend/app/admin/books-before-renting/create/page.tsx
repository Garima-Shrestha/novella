import { handleGetAllCategories } from "@/lib/actions/admin/category-action"; // Adjust path as needed
import CreateBookForm from "../_components/CreateBookForm";

export default async function Page() {
    const response = await handleGetAllCategories();
    const categories = response.success ? response.categories : [];

    return (
        <div>
            <CreateBookForm categories={categories} />
        </div>
    );
}
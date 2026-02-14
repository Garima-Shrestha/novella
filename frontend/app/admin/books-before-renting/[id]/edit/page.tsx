import { handleGetOneBook } from "@/lib/actions/admin/books-before-renting-action";
import UpdateBookForm from "../../_components/UpdateBookForm";
import { handleGetAllCategories } from "@/lib/actions/admin/category-action";

export default async function Page({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params; 

    if (!id) {
        throw new Error("Book id missing in route.");
    }

    const [bookRes, catRes] = await Promise.all([
        handleGetOneBook(id),
        handleGetAllCategories()
    ]);

    if (!bookRes.success) throw new Error(bookRes.message || "Failed to load book");

    const categories = catRes.success ? catRes.categories : [];

    return (
        <div>
            <UpdateBookForm book={bookRes.data} categories={categories} />
        </div>
    );
}

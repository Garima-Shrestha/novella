import { handleGetOneBook } from "@/lib/actions/admin/books-before-renting-action";
import UpdateBookForm from "../../_components/UpdateBookForm";

export default async function Page({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params; 

    if (!id) {
        throw new Error("Book id missing in route.");
    }

    const response = await handleGetOneBook(id);

    if (!response.success) {
        throw new Error(response.message || "Failed to load book");
    }

    return (
        <div>
            <UpdateBookForm book={response.data} />;
        </div>
    );
}

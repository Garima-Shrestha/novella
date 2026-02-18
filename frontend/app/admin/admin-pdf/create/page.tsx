import CreateAdminPdfForm from "../_components/CreateAdminPdfForm";
import { redirect } from "next/navigation";

import { handleGetAllAdminPdfs } from "@/lib/actions/admin/admin-pdf-action";
import { handleGetAllBooks } from "@/lib/actions/admin/books-before-renting-action";

export default async function Page() {
    const booksRes = await handleGetAllBooks({
        page: 1,
        size: 1000,
        searchTerm: "",
    });

    if (!booksRes.success) {
        redirect("/login");
    }

    const pdfRes = await handleGetAllAdminPdfs({
        page: 1,
        size: 1000,
        searchTerm: "",
    });

    if (!pdfRes.success) {
        redirect("/login");
    }

    const usedBookIds = new Set<string>(
        (pdfRes.pdfs || []).map((p: any) => p.book?._id || p.book)
    );

    const availableBooks = (booksRes.books || []).filter(
        (b: any) => !usedBookIds.has(b._id)
    );

    return (
        <div>
        <CreateAdminPdfForm books={availableBooks} />
        </div>
    );
}

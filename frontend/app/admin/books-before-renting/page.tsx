import { handleGetAllBooks } from "@/lib/actions/admin/books-before-renting-action";
import BookTable from "./_components/BookTable";

export default async function Page({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams;
    const page = (params.page as string) || "1";
    const size = (params.size as string) || "10";
    const search = (params.search as string) || "";

    const response = await handleGetAllBooks({
        page: Number(page),
        size: Number(size),
        searchTerm: search
    });

    if (!response.success) {
        throw new Error("Failed to load books");
    }

    return (
        <BookTable
            books={response.books}
            pagination={response.pagination}
            search={search}
        />
    );
}

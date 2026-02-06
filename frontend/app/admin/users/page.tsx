import { handleGetAllUsers } from "@/lib/actions/admin/user-action";
import UserTable from "./_components/UserTable";

export default async function Page({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams;
    const page = (params.page as string) || "1";
    const size = (params.size as string) || "10";
    const search = (params.search as string) || "";

    const response = await handleGetAllUsers({
        page: Number(page),
        size: Number(size),
        searchTerm: search
    });

    if (!response.success) {
        throw new Error("Failed to load users");
    }

    return (
        <UserTable users={response.users} pagination={response.pagination} search={search} />
    );
}
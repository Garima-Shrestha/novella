import { redirect } from "next/navigation";
import MyLibraryList from "./_components/MyLibraryList";
import { handleFetchMyLibrary } from "@/lib/actions/my-library-action";

export const dynamic = "force-dynamic"; // always fetch fresh data 

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;

  const page = (params.page as string) || "1";
  const size = (params.size as string) || "10";

  const response = await handleFetchMyLibrary({
    page: Number(page),
    size: Number(size),
  });

  if (!response.success) {
    redirect("/login");
  }

  return (
    <MyLibraryList
      items={response.data || []}
      pagination={response.pagination}
    />
  );
}
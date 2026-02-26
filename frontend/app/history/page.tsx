import { handleFetchMyHistory } from "@/lib/actions/history-action";
import HistoryList from "./_components/HistoryList";
import { redirect } from "next/navigation";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;

  const page = (params.page as string) || "1";
  const size = (params.size as string) || "10";

  const response = await handleFetchMyHistory({
    page: Number(page),
    size: Number(size),
  });

  if (!response.success) {
    redirect("/login");
  }

  return <HistoryList items={response.data} pagination={response.pagination} />;
}
import { handleGetOneBookAccess } from "@/lib/actions/admin/book-access-action";
import UpdateBookAccessForm from "../../_components/UpdateBookAccessForm";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const response = await handleGetOneBookAccess(id);

  if (!response.success) {
    throw new Error(response.message || "Failed to load book access");
  }

  return (
    <div>
      <UpdateBookAccessForm access={response.data} />
    </div>
  );
}
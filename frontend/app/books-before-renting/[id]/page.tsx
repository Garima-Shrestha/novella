import { notFound } from "next/navigation";
import BookDetailsCard from "../_components/BookDetailsCard";
import { handleFetchBookById } from "@/lib/actions/books-before-renting-action";

interface BookPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function BookPage({ params }: BookPageProps) {
  const { id } = await params;

  const response = await handleFetchBookById(id);

  if (!response?.success || !response.data) {
    return notFound();
  }

  return (
    <div className="p-6">
      <BookDetailsCard book={response.data} />
    </div>
  );
}

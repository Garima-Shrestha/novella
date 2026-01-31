import { handleWhoAmI } from "@/lib/actions/auth-action";
import { notFound } from "next/navigation";
import EditProfileForm from "../_components/EditProfileForm";

export default async function Page() {
  const result = await handleWhoAmI();

  if (!result.success) {
    throw new Error("Error fetching user data");
  }

  if (!result.data) {
    notFound();
  }

  return (
    <div>
      <EditProfileForm user={result.data} />
    </div>
  );
}

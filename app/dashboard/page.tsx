import { redirect } from "next/navigation";
import { getCurrentUserContext } from "@/lib/data/queries";

export const dynamic = "force-dynamic";

export default async function DashboardRedirectPage() {
  const ctx = await getCurrentUserContext();
  if (!ctx.user) {
    redirect("/login");
  }
  if (!ctx.activeUniversity) {
    redirect("/onboarding/university");
  }
  redirect(`/${ctx.activeUniversity.slug}/dashboard`);
}

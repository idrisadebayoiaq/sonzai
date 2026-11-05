import { redirect } from "next/navigation";

export default async function JobRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/dashboard/jobs/${id}`);
}

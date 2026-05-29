import { redirect } from "next/navigation";

// Responses moved into the (protected) dashboard. Keep old links working.
export default async function SubmissionsRedirect({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    redirect(`/dashboard/forms/${id}/responses`);
}

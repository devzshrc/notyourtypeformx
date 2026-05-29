import { redirect } from "next/navigation";

// Templates now live inside the dashboard. Keep this path working for old links.
export default function TemplatesRedirect() {
    redirect("/dashboard/templates");
}

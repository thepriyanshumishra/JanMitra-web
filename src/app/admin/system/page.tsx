import { redirect } from "next/navigation";

export default function SystemAdminIndex() {
    redirect("/admin/system/departments");
}

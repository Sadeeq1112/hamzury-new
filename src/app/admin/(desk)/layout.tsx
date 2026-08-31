import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { Lockup } from "@/components/Lockup";
import { LogoutButton } from "@/components/admin/LogoutButton";

export const metadata = { title: "Desk — Hamzury" };
export const dynamic = "force-dynamic";

export default async function DeskLayout({ children }: { children: React.ReactNode }) {
  if (!(await getAdminSession())) redirect("/admin/login");
  return (
    <div className="desk">
      <aside className="rail">
        <Link href="/admin" aria-label="Desk home">
          <Lockup compact />
        </Link>
        <nav>
          <Link href="/admin">Overview</Link>
          <Link href="/admin/applications">Applications</Link>
          <Link href="/admin/receipts">Receipts</Link>
          <Link href="/admin/enquiries">Enquiries</Link>
          <Link href="/" target="_blank" rel="noreferrer">
            Public site
          </Link>
        </nav>
        <LogoutButton />
      </aside>
      <div className="desk-main">{children}</div>
    </div>
  );
}

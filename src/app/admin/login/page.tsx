import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { Lockup } from "@/components/Lockup";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata = { title: "Staff — Hamzury" };

export default async function LoginPage() {
  if (await getAdminSession()) redirect("/admin");
  return (
    <div className="login">
      <div className="login-box">
        <Lockup />
        <div className="label accent" style={{ marginTop: 28 }}>
          Staff
        </div>
        <h1>The desk.</h1>
        <p className="sub">Applications, receipts and enquiries.</p>
        <div style={{ marginTop: 32 }}>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}

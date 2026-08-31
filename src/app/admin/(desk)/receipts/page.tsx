import Link from "next/link";
import { prisma } from "@/lib/db";
import { when, money } from "@/lib/format";
import { pill, label } from "@/lib/status";

export default async function ReceiptsPage() {
  const payments = await prisma.payment.findMany({
    where: { receiptPath: { not: null } },
    orderBy: { createdAt: "desc" },
    include: { application: true }
  });

  return (
    <>
      <div className="label accent">Desk</div>
      <h1>Receipts</h1>
      <p className="sub">{payments.length} on file.</p>
      {payments.length === 0 ? (
        <div className="empty" style={{ marginTop: 24 }}>
          No receipts uploaded yet.
        </div>
      ) : (
        <div className="receipt-grid">
          {payments.map((p) => (
            <Link className="receipt-card" href={`/admin/applications/${p.application.ref}`} key={p.id}>
              {p.receiptMime === "application/pdf" ? (
                <div className="receipt-frame">PDF · {p.receiptName}</div>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={`/api/admin/receipts/${p.id}`} alt="" />
              )}
              <div className="meta">
                <strong>{p.application.ref}</strong>
                <div>{p.application.name}</div>
                <div>
                  {p.type === "APPLICATION_FEE" ? "Application fee" : "Programme fee"} · {money(p.amount)}
                </div>
                <div style={{ marginTop: 6 }}>
                  <span className={pill(p.status)}>{label(p.status)}</span>
                </div>
                <div className="tiny" style={{ marginTop: 8 }}>
                  {when(p.createdAt)}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}

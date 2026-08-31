import Link from "next/link";
import { prisma } from "@/lib/db";
import { when } from "@/lib/format";
import { pill, label } from "@/lib/status";
import { ROUTE_LABELS, type RouteId } from "@/lib/catalog";

export default async function DeskHome() {
  const [applications, pendingPayments, verified, enquiries, recent] = await Promise.all([
    prisma.application.count(),
    prisma.payment.count({ where: { status: "PENDING", receiptPath: { not: null } } }),
    prisma.application.count({ where: { status: "VERIFIED" } }),
    prisma.enquiry.count(),
    prisma.application.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { payments: true }
    })
  ]);

  return (
    <>
      <div className="label accent">Desk</div>
      <h1>Overview</h1>
      <p className="sub">What needs a person.</p>
      <div className="kpis">
        <div className="kpi">
          <div className="label">Applications</div>
          <b>{applications}</b>
        </div>
        <div className="kpi">
          <div className="label">Receipts to check</div>
          <b>{pendingPayments}</b>
        </div>
        <div className="kpi">
          <div className="label">Verified</div>
          <b>{verified}</b>
        </div>
        <div className="kpi">
          <div className="label">Enquiries</div>
          <b>{enquiries}</b>
        </div>
      </div>
      <div className="label">Latest applications</div>
      {recent.length === 0 ? (
        <div className="empty" style={{ marginTop: 18 }}>
          Nothing in yet.
        </div>
      ) : (
        <table className="atable">
          <thead>
            <tr>
              <th>Reference</th>
              <th>Name</th>
              <th>Route</th>
              <th>Status</th>
              <th>When</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((a) => (
              <tr key={a.id}>
                <td>
                  <Link href={`/admin/applications/${a.ref}`}>{a.ref}</Link>
                </td>
                <td>{a.name}</td>
                <td>{ROUTE_LABELS[a.route as RouteId] || a.route}</td>
                <td>
                  <span className={pill(a.status)}>{label(a.status)}</span>
                </td>
                <td className="tiny">{when(a.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}

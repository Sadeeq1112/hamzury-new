import Link from "next/link";
import { prisma } from "@/lib/db";
import { when, money } from "@/lib/format";
import { pill, label } from "@/lib/status";
import { ROUTE_LABELS, type RouteId } from "@/lib/catalog";
import type { ApplicationStatus } from "@prisma/client";

export default async function ApplicationsPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q, status } = await searchParams;
  const where = {
    ...(status && ["PENDING", "VERIFIED", "REJECTED"].includes(status)
      ? { status: status as ApplicationStatus }
      : {}),
    ...(q
      ? {
          OR: [
            { ref: { contains: q.trim().toUpperCase(), mode: "insensitive" as const } },
            { name: { contains: q.trim(), mode: "insensitive" as const } },
            { email: { contains: q.trim(), mode: "insensitive" as const } },
            { phone: { contains: q.trim(), mode: "insensitive" as const } }
          ]
        }
      : {})
  };

  const rows = await prisma.application.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { payments: true }
  });

  return (
    <>
      <div className="label accent">Desk</div>
      <h1>Applications</h1>
      <p className="sub">{rows.length} on record.</p>
      <form className="filters" method="get">
        <input name="q" defaultValue={q || ""} placeholder="Search name, email, reference" />
        <select name="status" defaultValue={status || ""}>
          <option value="">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="VERIFIED">Verified</option>
          <option value="REJECTED">Rejected</option>
        </select>
        <button className="btn quiet" type="submit">
          Filter
        </button>
      </form>
      {rows.length === 0 ? (
        <div className="empty">No applications match.</div>
      ) : (
        <table className="atable">
          <thead>
            <tr>
              <th>Reference</th>
              <th>Name</th>
              <th>Route</th>
              <th>Programme</th>
              <th>Fee</th>
              <th>Status</th>
              <th>When</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => {
              const fee = a.payments.find((p) => p.type === "APPLICATION_FEE");
              return (
                <tr key={a.id}>
                  <td>
                    <Link href={`/admin/applications/${a.ref}`}>{a.ref}</Link>
                  </td>
                  <td>
                    {a.name}
                    <span className="m" style={{ display: "block", fontSize: 12, color: "var(--dim)" }}>
                      {a.phone}
                    </span>
                  </td>
                  <td>{ROUTE_LABELS[a.route as RouteId] || a.route}</td>
                  <td>{a.programmeLabel || "—"}</td>
                  <td>
                    <span className={pill(fee?.status || "PENDING")}>{label(fee?.status || "PENDING")}</span>
                    <span className="m" style={{ display: "block", fontSize: 12, color: "var(--dim)", marginTop: 4 }}>
                      {money(fee?.amount)}
                    </span>
                  </td>
                  <td>
                    <span className={pill(a.status)}>{label(a.status)}</span>
                  </td>
                  <td className="tiny">{when(a.createdAt)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </>
  );
}

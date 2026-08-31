import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { when, money } from "@/lib/format";
import { pill, label } from "@/lib/status";
import { ROUTE_LABELS, type RouteId } from "@/lib/catalog";
import { setApplicationStatus, setPaymentStatus } from "@/app/admin/actions";

export default async function ApplicationDetail({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  const app = await prisma.application.findUnique({
    where: { ref: ref.toUpperCase() },
    include: { payments: { orderBy: { createdAt: "asc" } } }
  });
  if (!app) notFound();

  const rows: [string, string][] = [
    ["Name", app.name],
    ["Email", app.email],
    ["Phone", app.phone],
    ["Gender", app.gender || "—"],
    ["Age", app.age || "—"],
    ["State", app.state || "—"],
    ["City", app.location],
    ["Occupation", app.occupation || "—"],
    ["Education", app.education || "—"],
    ["Heard about us", app.heardAbout || "—"],
    ["Route", ROUTE_LABELS[app.route as RouteId] || app.route],
    ["Track", app.track || "—"],
    ["Programme", `${app.programmeLabel || "—"} · ${money(app.programmeFee)}`],
    ["Level", app.level === "needs" ? "Foundation first" : app.level === "ready" ? "Straight to track" : "—"],
    ["Submitted", when(app.submittedAt)]
  ];

  if (app.route === "junior") {
    rows.push(
      ["Date of birth", app.dob || "—"],
      ["School", [app.school, app.cls].filter(Boolean).join(" · ") || "—"],
      ["Interests", app.interests || "—"],
      ["Guardian", [app.guardianName, app.guardianRel].filter(Boolean).join(" · ") || "—"],
      ["Guardian phone", app.guardianPhone || "—"],
      ["Guardian email", app.guardianEmail || "—"],
      ["Emergency", app.emergency || "—"],
      ["Consent", app.consent ? "Yes" : "No"]
    );
  }

  return (
    <>
      <div className="crumbs">
        <Link href="/admin/applications">Applications</Link>
        <span>/</span>
        <span>{app.ref}</span>
      </div>
      <div className="label accent">{app.ref}</div>
      <h1>{app.name}</h1>
      <p className="sub">
        <span className={pill(app.status)}>{label(app.status)}</span>
      </p>

      <dl className="facts">
        {rows.map(([k, v]) => (
          <div className="fact" key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>

      <div className="label" style={{ marginTop: 40 }}>
        Payments & receipts
      </div>
      {app.payments.length === 0 ? (
        <div className="empty" style={{ marginTop: 16 }}>
          No payments yet.
        </div>
      ) : (
        app.payments.map((p) => (
          <div className="pay-card" key={p.id}>
            <div className="payrow">
              <span className="pk">{p.type === "APPLICATION_FEE" ? "Application fee" : "Programme fee"}</span>
              <span className="pv">{money(p.amount)}</span>
            </div>
            <div className="payrow">
              <span className="pk">Status</span>
              <span className="pv">
                <span className={pill(p.status)}>{label(p.status)}</span>
              </span>
            </div>
            <div className="payrow">
              <span className="pk">Received</span>
              <span className="pv">{when(p.createdAt)}</span>
            </div>
            {p.receiptPath ? (
              p.receiptMime === "application/pdf" ? (
                <iframe className="receipt-frame" src={`/api/admin/receipts/${p.id}`} title={p.receiptName || "Receipt"} />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={`/api/admin/receipts/${p.id}`} alt={p.receiptName || "Receipt"} />
              )
            ) : (
              <div className="note">No receipt uploaded yet.</div>
            )}
            <form action={setPaymentStatus} className="actions" style={{ marginTop: 8 }}>
              <input type="hidden" name="id" value={p.id} />
              <input type="hidden" name="notes" value={p.notes || ""} />
              <button className="btn primary" name="status" value="VERIFIED" type="submit">
                Verify payment
              </button>
              <button className="btn quiet" name="status" value="REJECTED" type="submit">
                Reject
              </button>
              <button className="btn quiet" name="status" value="PENDING" type="submit">
                Hold
              </button>
            </form>
          </div>
        ))
      )}

      <div className="label" style={{ marginTop: 40 }}>
        Application decision
      </div>
      <form action={setApplicationStatus} style={{ marginTop: 16 }}>
        <input type="hidden" name="ref" value={app.ref} />
        <div className="field">
          <label htmlFor="notes">Notes</label>
          <textarea id="notes" name="notes" rows={3} defaultValue={app.notes || ""} />
        </div>
        <div className="actions">
          <button className="btn primary" name="status" value="VERIFIED" type="submit">
            Verify application
          </button>
          <button className="btn quiet" name="status" value="REJECTED" type="submit">
            Reject
          </button>
          <button className="btn quiet" name="status" value="PENDING" type="submit">
            Hold
          </button>
        </div>
      </form>
    </>
  );
}

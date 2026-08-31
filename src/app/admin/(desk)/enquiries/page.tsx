import { prisma } from "@/lib/db";
import { when } from "@/lib/format";

export default async function EnquiriesPage() {
  const rows = await prisma.enquiry.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <>
      <div className="label accent">Desk</div>
      <h1>Enquiries</h1>
      <p className="sub">{rows.length} partnership and sponsorship requests.</p>
      {rows.length === 0 ? (
        <div className="empty" style={{ marginTop: 24 }}>
          None yet.
        </div>
      ) : (
        rows.map((e) => (
          <article key={e.id} style={{ borderBottom: "1px solid var(--line)", padding: "28px 0" }}>
            <div className="label accent">{e.kind === "PARTNER" ? "Partnership" : "Sponsorship"}</div>
            <h3 style={{ margin: "10px 0 4px" }}>{e.org}</h3>
            <p className="tiny">{when(e.createdAt)}</p>
            <dl className="facts">
              {e.orgType ? (
                <div className="fact">
                  <dt>Type</dt>
                  <dd>{e.orgType}</dd>
                </div>
              ) : null}
              {e.contact ? (
                <div className="fact">
                  <dt>Contact</dt>
                  <dd>{e.contact}</dd>
                </div>
              ) : null}
              <div className="fact">
                <dt>Phone</dt>
                <dd>{e.phone}</dd>
              </div>
              {e.email ? (
                <div className="fact">
                  <dt>Email</dt>
                  <dd>{e.email}</dd>
                </div>
              ) : null}
              {e.does ? (
                <div className="fact">
                  <dt>They do</dt>
                  <dd>{e.does}</dd>
                </div>
              ) : null}
              {e.why ? (
                <div className="fact">
                  <dt>Why</dt>
                  <dd>{e.why}</dd>
                </div>
              ) : null}
              {e.bring ? (
                <div className="fact">
                  <dt>They bring</dt>
                  <dd>{e.bring}</dd>
                </div>
              ) : null}
              {e.want ? (
                <div className="fact">
                  <dt>They want</dt>
                  <dd>{e.want}</dd>
                </div>
              ) : null}
              {e.outcome ? (
                <div className="fact">
                  <dt>Outcome</dt>
                  <dd>{e.outcome}</dd>
                </div>
              ) : null}
              {e.area ? (
                <div className="fact">
                  <dt>Impact area</dt>
                  <dd>{e.area}</dd>
                </div>
              ) : null}
              {e.support ? (
                <div className="fact">
                  <dt>Support</dt>
                  <dd>{e.support}</dd>
                </div>
              ) : null}
              {e.report ? (
                <div className="fact">
                  <dt>Report</dt>
                  <dd>{e.report}</dd>
                </div>
              ) : null}
            </dl>
          </article>
        ))
      )}
    </>
  );
}

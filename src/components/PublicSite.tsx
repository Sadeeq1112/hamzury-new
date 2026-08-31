"use client";

import { useEffect } from "react";
import { Lockup } from "./Lockup";
import { bootHamzury } from "@/lib/public-app";

export function PublicSite() {
  useEffect(() => {
    document.body.classList.add("site");
    const api = bootHamzury();
    window.app = api;
    return () => {
      api.destroy();
      document.body.classList.remove("site", "locked");
    };
  }, []);

  return (
    <div className="site">
      <a className="skip" href="#main">
        Skip to content
      </a>

      <header className="top">
        <button onClick={() => window.app?.top()} aria-label="Hamzury">
          <Lockup />
        </button>
        <nav className="topnav" aria-label="Primary">
          <button onClick={() => window.app?.open("treasury")}>Treasury</button>
          <button onClick={() => window.app?.open("life")}>Life</button>
          <button className="keep" onClick={() => window.app?.open("guide")}>
            Guide Me
          </button>
        </nav>
      </header>

      <main id="main" className="site-main">
        <section className="hero">
          <div className="label accent">Hamzury Innovation Hub</div>
          <h1 className="display">
            LEARN<span>WHAT WORKS.</span>
          </h1>
          <div className="actions">
            <button className="btn primary" onClick={() => window.app?.open("paths")}>
              Find my path
            </button>
            <button className="btn quiet" onClick={() => window.app?.open("guide")}>
              Guide me
            </button>
          </div>
        </section>

        <section className="stance">
          <div className="label">The difference</div>
          <h2 style={{ marginTop: 16 }}>
            NOT JUST LEARNING.<span>BUILDING WHAT WORKS.</span>
          </h2>
          <div className="flow" id="stance-flow" />
          <div className="compare">
            <div>
              <div className="cl">Traditional learning</div>
              <ul>
                <li>Learn first</li>
                <li>Take notes</li>
                <li>Complete a course</li>
                <li>Attendance</li>
                <li>Certificate</li>
              </ul>
            </div>
            <div>
              <div className="cl">Hamzury</div>
              <ul>
                <li>Discover first</li>
                <li>Build</li>
                <li>Apply</li>
                <li>Evidence</li>
                <li>Achievement</li>
                <li>Business</li>
              </ul>
            </div>
          </div>
          <p className="core">
            We don&apos;t ask you to learn everything first. <em>We help you learn what works, then use it.</em>
          </p>
        </section>

        <div className="group">
          <div className="label">Where do you want to go?</div>
          <div className="index" id="index" />
        </div>
      </main>

      <footer className="foot">
        <Lockup compact />
        <div className="footlinks">
          <button onClick={() => window.app?.open("questions")}>Questions</button>
          <button onClick={() => window.app?.open("fees")}>Fees</button>
          <button onClick={() => window.app?.open("apply")}>Apply</button>
          <button onClick={() => window.app?.open("resume")}>Continue my application</button>
          <a href="/admin/login" className="tiny">
            Staff
          </a>
        </div>
      </footer>

      <div className="modal" id="modal" role="dialog" aria-modal="true" aria-labelledby="mt" hidden>
        <div className="panel" id="panel" tabIndex={-1}>
          <div className="panelbar">
            <button className="iconbtn wide" id="backbtn" onClick={() => window.app?.back()} hidden>
              ← Back
            </button>
            <span />
            <button className="iconbtn" onClick={() => window.app?.close()} aria-label="Close">
              ✕
            </button>
          </div>
          <div id="content" />
        </div>
      </div>
      <div className="toast" id="toast" role="status" aria-live="polite" />
    </div>
  );
}

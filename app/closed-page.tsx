import React from "react";

const styles: Record<string, React.CSSProperties> = {
  body: {
    minHeight: "100vh",
    background: "#f7f7f5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'DM Sans', sans-serif",
    padding: "2rem",
  },
  card: {
    background: "#ffffff",
    borderRadius: "28px",
    padding: "3.5rem 3rem",
    maxWidth: "580px",
    width: "100%",
    textAlign: "center",
    border: "1px solid rgba(0,0,0,0.07)",
    boxShadow:
      "0 2px 4px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.08), 0 24px 64px rgba(0,0,0,0.07)",
  },
  iconWrap: {
    width: "56px",
    height: "56px",
    background: "#f0faf5",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 1.75rem",
    fontSize: "26px",
  },
  heading: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: "2.4rem",
    color: "#18a558",
    lineHeight: 1.2,
    marginBottom: "1.5rem",
  },
  divider: {
    width: "40px",
    height: "2px",
    background: "#c6eedd",
    borderRadius: "99px",
    margin: "0 auto 1.5rem",
  },
  paragraph: {
    fontSize: "1rem",
    color: "#555555",
    lineHeight: 1.75,
    marginBottom: "1rem",
  },
  lastParagraph: {
    fontSize: "1rem",
    color: "#555555",
    lineHeight: 1.75,
    marginBottom: "2rem",
  },
  tag: {
    display: "inline-block",
    background: "#f0faf5",
    color: "#18a558",
    border: "1px solid #c6eedd",
    padding: "0.55rem 1.5rem",
    borderRadius: "999px",
    fontSize: "0.9rem",
    fontWeight: 600,
    letterSpacing: "0.02em",
  },
};

export default function AchieveXClosed(): React.ReactElement {
  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600&display=swap"
        rel="stylesheet"
      />
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes rise {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .achievex-card {
          animation: rise 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        /* Mobile: compact centered square-ish card */
        @media (max-width: 480px) {
          .achievex-body {
            padding: 1rem !important;
            align-items: center !important;
          }
          .achievex-card {
            padding: 1.5rem 1.25rem !important;
            border-radius: 20px !important;
            max-width: 260px !important;
            width: 260px !important;
          }
          .achievex-heading {
            font-size: 1.3rem !important;
            margin-bottom: 1rem !important;
          }
          .achievex-paragraph {
            font-size: 0.78rem !important;
            line-height: 1.55 !important;
            margin-bottom: 0.6rem !important;
          }
          .achievex-icon {
            width: 40px !important;
            height: 40px !important;
            font-size: 18px !important;
            margin-bottom: 1rem !important;
          }
          .achievex-tag {
            font-size: 0.75rem !important;
            padding: 0.4rem 1rem !important;
          }
          .achievex-last-p {
            margin-bottom: 1.25rem !important;
          }
        }
      `}</style>
      <main className="achievex-body" style={styles.body}>
        <div className="achievex-card" style={styles.card}>
          <div className="achievex-icon" style={styles.iconWrap}>🎓</div>
          <h1 className="achievex-heading" style={styles.heading}>
            AchieveX Submissions Closed
          </h1>
          <div style={styles.divider} />
          <p className="achievex-paragraph" style={styles.paragraph}>
            Thank you to all students for submitting your achievements and
            participating in the AchieveX portal.
          </p>
          <p className="achievex-paragraph" style={styles.paragraph}>
            The submission deadline is now officially over.
          </p>
          <p className="achievex-paragraph achievex-last-p" style={styles.lastParagraph}>
            We appreciate everyone's efforts and enthusiasm. Looking forward
            to seeing you all on Annual Day 🎉
          </p>
          <div className="achievex-tag" style={styles.tag}>— Team AchieveX</div>
        </div>
      </main>
    </>
  );
}

import React from "react";

export const maintenanceHtmlString = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Lincolnshire Knee Clinic — Site Update in Progress</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #030712;
      color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
    }
    .card {
      background-color: #0f172a;
      border: 1px solid #1e293b;
      border-radius: 1.25rem;
      padding: 2.5rem 2rem;
      max-width: 32rem;
      margin: 1.5rem;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }
    .logo-container {
      width: 4rem;
      height: 4rem;
      background: rgba(6, 182, 212, 0.1);
      border: 1px solid rgba(6, 182, 212, 0.3);
      border-radius: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem auto;
    }
    .logo {
      width: 2.5rem;
      height: 2.5rem;
      object-fit: contain;
    }
    h1 {
      font-size: 1.25rem;
      font-weight: 700;
      color: #ffffff;
      margin-top: 0;
      margin-bottom: 0.5rem;
    }
    .badge {
      display: inline-block;
      background-color: rgba(6, 182, 212, 0.1);
      border: 1px solid rgba(6, 182, 212, 0.3);
      color: #22d3ee;
      font-size: 0.65rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      margin-bottom: 1.25rem;
    }
    p {
      font-size: 0.9375rem;
      line-height: 1.625;
      color: #cbd5e1;
      margin: 0;
    }
    a {
      color: #38bdf8;
      font-weight: 600;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo-container">
      <img src="/brand/lkc-logo-k-transparent.png" alt="Lincolnshire Knee Clinic" class="logo" />
    </div>
    <span class="badge">Notice</span>
    <h1>Lincolnshire Knee Clinic</h1>
    <p>
      Lincolnshire Knee Clinic &mdash; our website is currently being updated. For appointments or enquiries, please call <a href="tel:07770473437">07770 473437</a> or email <a href="mailto:admin@lincsknee.com">admin@lincsknee.com</a>.
    </p>
  </div>
</body>
</html>`;

export function MaintenancePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex items-center justify-center p-6 text-center">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full shadow-2xl space-y-5">
        <div className="w-16 h-16 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl flex items-center justify-center mx-auto">
          <img src="/brand/lkc-logo-k-transparent.png" alt="Lincolnshire Knee Clinic" className="w-10 h-10 object-contain" />
        </div>
        <span className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full inline-block">
          Notice
        </span>
        <h1 className="font-serif text-xl font-bold text-white">Lincolnshire Knee Clinic</h1>
        <p className="text-sm text-slate-300 leading-relaxed">
          Lincolnshire Knee Clinic — our website is currently being updated. For appointments or enquiries, please call{" "}
          <a href="tel:07770473437" className="text-cyan-400 font-semibold hover:underline">
            07770 473437
          </a>{" "}
          or email{" "}
          <a href="mailto:admin@lincsknee.com" className="text-cyan-400 font-semibold hover:underline">
            admin@lincsknee.com
          </a>
          .
        </p>
      </div>
    </div>
  );
}

export default MaintenancePage;

// Temporary presentation data.
// These will later be replaced by the JSON response from Metabase Query 514 and 551.

const query514Data = [
  { due_month: "2025-04-01", quarter: "FY26 Q1", dues: 6852, done_out_of_dues: 1005, renewal_rate: 14.7 },
  { due_month: "2025-05-01", quarter: "FY26 Q1", dues: 3410, done_out_of_dues: 618, renewal_rate: 18.1 },
  { due_month: "2025-06-01", quarter: "FY26 Q1", dues: 2748, done_out_of_dues: 546, renewal_rate: 19.9 },
  { due_month: "2025-07-01", quarter: "FY26 Q2", dues: 5020, done_out_of_dues: 750, renewal_rate: 14.9 },
  { due_month: "2025-08-01", quarter: "FY26 Q2", dues: 2147, done_out_of_dues: 620, renewal_rate: 28.9 },
  { due_month: "2025-09-01", quarter: "FY26 Q2", dues: 3628, done_out_of_dues: 850, renewal_rate: 23.4 },
  { due_month: "2025-10-01", quarter: "FY26 Q3", dues: 3975, done_out_of_dues: 967, renewal_rate: 24.3 },
  { due_month: "2025-11-01", quarter: "FY26 Q3", dues: 4540, done_out_of_dues: 918, renewal_rate: 20.2 },
  { due_month: "2025-12-01", quarter: "FY26 Q3", dues: 6297, done_out_of_dues: 1373, renewal_rate: 21.8 },
  { due_month: "2026-01-01", quarter: "FY26 Q4", dues: 3255, done_out_of_dues: 790, renewal_rate: 24.3 },
  { due_month: "2026-02-01", quarter: "FY26 Q4", dues: 3162, done_out_of_dues: 834, renewal_rate: 26.4 },
  { due_month: "2026-03-01", quarter: "FY26 Q4", dues: 5087, done_out_of_dues: 1209, renewal_rate: 23.8 },

  { due_month: "2026-04-01", quarter: "FY27 Q1", dues: 8701, done_out_of_dues: 1982, renewal_rate: 22.8 },
  { due_month: "2026-05-01", quarter: "FY27 Q1", dues: 5032, done_out_of_dues: 1308, renewal_rate: 26.0 },
  { due_month: "2026-06-01", quarter: "FY27 Q1", dues: 3400, done_out_of_dues: 929, renewal_rate: 27.3 },
  { due_month: "2026-07-01", quarter: "FY27 Q2", dues: 4166, done_out_of_dues: 968, renewal_rate: 23.3 },
  { due_month: "2026-08-01", quarter: "FY27 Q2", dues: 2863, done_out_of_dues: 603, renewal_rate: 21.1 }
];

const query551Data = [
  { FY: "1. Till FY25 (Up to 31-Mar-25)", Deployments: 55566, "Active out of Deployments": 5305, "% Active out of Deployed": "10%" },
  { FY: "2. In FY26", Deployments: 52254, "Active out of Deployments": 17533, "% Active out of Deployed": "34%" },
  { FY: "3. In FY27", Deployments: 18989, "Active out of Deployments": 18989, "% Active out of Deployed": "100%" },
  { FY: "TOTAL", Deployments: 126801, "Active out of Deployments": 41827, "% Active out of Deployed": "33%" }
];

const formatter = new Intl.NumberFormat("en-IN");

function number(value) {
  const n = Number(value);
  return Number.isFinite(n) ? formatter.format(n) : "-";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function monthName(value) {
  return new Date(value + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    year: "numeric"
  });
}

function quarterlyAverage(rows) {
  const rates = rows
    .map(r => Number(r.renewal_rate))
    .filter(Number.isFinite);

  if (!rates.length) return null;

  return Math.round((rates.reduce((a, b) => a + b, 0) / rates.length) * 10) / 10;
}

function renderRecharge() {
  const root = document.getElementById("recharge-years");
  const years = {};

  query514Data.forEach(row => {
    const match = String(row.quarter).match(/^FY\d+/);
    if (!match) return;
    if (!years[match[0]]) years[match[0]] = [];
    years[match[0]].push(row);
  });

  root.innerHTML = Object.keys(years).sort().map(fy => {
    const rows = years[fy].sort((a, b) =>
      new Date(a.due_month) - new Date(b.due_month)
    );

    const quarters = {};
    rows.forEach(row => {
      if (!quarters[row.quarter]) quarters[row.quarter] = [];
      quarters[row.quarter].push(row);
    });

    let html = "";

    Object.entries(quarters).forEach(([quarter, quarterRows]) => {
      const qRate = quarterlyAverage(quarterRows);

      quarterRows.forEach((row, index) => {
        html += `
          <tr>
            <td class="month">${escapeHtml(monthName(row.due_month))}</td>
            <td>${number(row.dues)}</td>
            <td>${number(row.done_out_of_dues)}</td>
            <td class="rate">${Number(row.renewal_rate).toFixed(1)}%</td>
            ${
              index === 0
                ? `<td class="quarter-rate" rowspan="${quarterRows.length}">
                     ${qRate === null ? "-" : qRate.toFixed(1) + "%"}
                   </td>`
                : ""
            }
          </tr>
        `;
      });
    });

    const totalDues = rows.reduce((s, r) => s + Number(r.dues || 0), 0);
    const totalDone = rows.reduce((s, r) => s + Number(r.done_out_of_dues || 0), 0);
    const totalRate = totalDues ? (totalDone / totalDues) * 100 : 0;

    html += `
      <tr class="total-row">
        <td class="month">Total</td>
        <td>${number(totalDues)}</td>
        <td>${number(totalDone)}</td>
        <td class="rate">${totalRate.toFixed(1)}%</td>
        <td>-</td>
      </tr>
    `;

    return `
      <div class="fy-card">
        <div class="fy-title">
          <span class="fy-title-main">${escapeHtml(fy)}</span>
          <span class="fy-title-sub">${rows.length} months reported</span>
        </div>

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Due Month</th>
                <th>Total Dues</th>
                <th>Done out of Dues</th>
                <th>Monthly Renewal Rate</th>
                <th>Quarterly Rate</th>
              </tr>
            </thead>
            <tbody>${html}</tbody>
          </table>
        </div>
      </div>
    `;
  }).join("");
}

function renderKpisAndDeployment() {
  const total = query551Data.find(r => String(r.FY).toUpperCase() === "TOTAL");

  const cards = [
    {
      icon: "01",
      label: "Total Deployments",
      value: number(total.Deployments),
      subtitle: "Total deployment base"
    },
    {
      icon: "02",
      label: "Under Active Subscription",
      value: number(total["Active out of Deployments"]),
      subtitle: "Active out of deployments"
    },
    {
      icon: "03",
      label: "Active out of Deployed",
      value: total["% Active out of Deployed"],
      subtitle: "Overall active percentage"
    }
  ];

  document.getElementById("kpi-cards").innerHTML = cards.map(card => `
    <div class="kpi-card">
      <div class="kpi-top">
        <div class="kpi-label">${escapeHtml(card.label)}</div>
        <div class="kpi-icon">${escapeHtml(card.icon)}</div>
      </div>
      <div class="kpi-value">${escapeHtml(card.value)}</div>
      <div class="kpi-subtitle">${escapeHtml(card.subtitle)}</div>
    </div>
  `).join("");

  const columns = [
    "FY",
    "Deployments",
    "Active out of Deployments",
    "% Active out of Deployed"
  ];

  document.querySelector("#deployment-table thead").innerHTML = `
    <tr>${columns.map(c => `<th>${escapeHtml(c)}</th>`).join("")}</tr>
  `;

  document.querySelector("#deployment-table tbody").innerHTML =
    query551Data.map(row => {
      const totalRow = String(row.FY).toUpperCase() === "TOTAL";

      return `
        <tr class="${totalRow ? "total-row" : ""}">
          <td>${escapeHtml(row.FY)}</td>
          <td>${number(row.Deployments)}</td>
          <td>${number(row["Active out of Deployments"])}</td>
          <td>${escapeHtml(row["% Active out of Deployed"])}</td>
        </tr>
      `;
    }).join("");
}

document.getElementById("report-date").textContent =
  `Prepared ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}`;

renderRecharge();
renderKpisAndDeployment();

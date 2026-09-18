/*
  Monthly Business Dashboard
  --------------------------
  Temporary data below mirrors the structure of:
    Metabase Query 514 -> Recharge Rate Summary
    Metabase Query 551 -> Deployment / Active Subscription

  Later, these two arrays can be replaced by API responses from a
  secure backend without changing the dashboard layout.
*/

// -------------------------
// TEMPORARY QUERY 514 DATA
// -------------------------
const query514Data = [
  { due_month: "2025-04-01", quarter: "FY26 Q1", recharges_in_month: 1005, dues: 6852, done_out_of_dues: 1005, pending_out_of_dues: 5847, renewal_rate: 14.7 },
  { due_month: "2025-05-01", quarter: "FY26 Q1", recharges_in_month: 618,  dues: 3410, done_out_of_dues: 618,  pending_out_of_dues: 2792, renewal_rate: 18.1 },
  { due_month: "2025-06-01", quarter: "FY26 Q1", recharges_in_month: 546,  dues: 2748, done_out_of_dues: 546, pending_out_of_dues: 2202, renewal_rate: 19.9 },

  { due_month: "2025-07-01", quarter: "FY26 Q2", recharges_in_month: 750,  dues: 5020, done_out_of_dues: 750, pending_out_of_dues: 4270, renewal_rate: 14.9 },
  { due_month: "2025-08-01", quarter: "FY26 Q2", recharges_in_month: 620,  dues: 2147, done_out_of_dues: 620, pending_out_of_dues: 1527, renewal_rate: 28.9 },
  { due_month: "2025-09-01", quarter: "FY26 Q2", recharges_in_month: 850,  dues: 3628, done_out_of_dues: 850, pending_out_of_dues: 2778, renewal_rate: 23.4 },

  { due_month: "2025-10-01", quarter: "FY26 Q3", recharges_in_month: 967,  dues: 3975, done_out_of_dues: 967, pending_out_of_dues: 3008, renewal_rate: 24.3 },
  { due_month: "2025-11-01", quarter: "FY26 Q3", recharges_in_month: 918,  dues: 4540, done_out_of_dues: 918, pending_out_of_dues: 3622, renewal_rate: 20.2 },
  { due_month: "2025-12-01", quarter: "FY26 Q3", recharges_in_month: 1373, dues: 6297, done_out_of_dues: 1373, pending_out_of_dues: 4924, renewal_rate: 21.8 },

  { due_month: "2026-01-01", quarter: "FY26 Q4", recharges_in_month: 790,  dues: 3255, done_out_of_dues: 790, pending_out_of_dues: 2465, renewal_rate: 24.3 },
  { due_month: "2026-02-01", quarter: "FY26 Q4", recharges_in_month: 834,  dues: 3162, done_out_of_dues: 834, pending_out_of_dues: 2328, renewal_rate: 26.4 },
  { due_month: "2026-03-01", quarter: "FY26 Q4", recharges_in_month: 1209, dues: 5087, done_out_of_dues: 1209, pending_out_of_dues: 3878, renewal_rate: 23.8 },

  { due_month: "2026-04-01", quarter: "FY27 Q1", recharges_in_month: 1982, dues: 8701, done_out_of_dues: 1982, pending_out_of_dues: 6719, renewal_rate: 22.8 },
  { due_month: "2026-05-01", quarter: "FY27 Q1", recharges_in_month: 1308, dues: 5032, done_out_of_dues: 1308, pending_out_of_dues: 3724, renewal_rate: 26.0 },
  { due_month: "2026-06-01", quarter: "FY27 Q1", recharges_in_month: 929,  dues: 3400, done_out_of_dues: 929, pending_out_of_dues: 2471, renewal_rate: 27.3 },

  { due_month: "2026-07-01", quarter: "FY27 Q2", recharges_in_month: 968, dues: 4166, done_out_of_dues: 968, pending_out_of_dues: 3198, renewal_rate: 23.3 },
  { due_month: "2026-08-01", quarter: "FY27 Q2", recharges_in_month: 603, dues: 2863, done_out_of_dues: 603, pending_out_of_dues: 2260, renewal_rate: 21.1 }
];

// -------------------------
// TEMPORARY QUERY 551 DATA
// -------------------------
const query551Data = [
  { FY: "1. Till FY25 (Up to 31-Mar-25)", Deployments: 55566, "Active out of Deployments": 5305, "% Active out of Deployed": "10%" },
  { FY: "2. In FY26", Deployments: 52254, "Active out of Deployments": 17533, "% Active out of Deployed": "34%" },
  { FY: "3. In FY27", Deployments: 18989, "Active out of Deployments": 18989, "% Active out of Deployed": "100%" },
  { FY: "TOTAL", Deployments: 126801, "Active out of Deployments": 41827, "% Active out of Deployed": "33%" }
];

// -------------------------
// HELPERS
// -------------------------
const numberFormatter = new Intl.NumberFormat("en-IN");

function formatNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? numberFormatter.format(number) : "-";
}

function formatMonth(dateString) {
  const date = new Date(dateString + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric"
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// -------------------------
// QUERY 514 RENDERING
// -------------------------
function calculateQuarterlyRate(rows) {
  // This intentionally uses the arithmetic average of the monthly
  // renewal_rate values because that reproduces the reference report.
  if (!rows.length) return null;

  const validRates = rows
    .map(row => Number(row.renewal_rate))
    .filter(rate => Number.isFinite(rate));

  if (!validRates.length) return null;

  const average = validRates.reduce((sum, rate) => sum + rate, 0) / validRates.length;
  return Math.round(average * 10) / 10;
}

function groupByFinancialYear(rows) {
  const groups = {};

  rows.forEach(row => {
    const match = String(row.quarter).match(/^FY(\d+)/);
    if (!match) return;

    const fy = `FY${match[1]}`;

    if (!groups[fy]) {
      groups[fy] = [];
    }

    groups[fy].push(row);
  });

  return groups;
}

function renderRechargeTables() {
  const container = document.getElementById("recharge-years");
  const groups = groupByFinancialYear(query514Data);

  const fiscalYears = Object.keys(groups).sort();

  if (!fiscalYears.length) {
    container.innerHTML = `<div class="fy-card"><div class="fy-title">No data</div></div>`;
    return;
  }

  container.innerHTML = fiscalYears.map(fy => {
    const rows = groups[fy];

    // Preserve the returned monthly row order.
    rows.sort((a, b) => new Date(a.due_month) - new Date(b.due_month));

    const quarterGroups = {};

    rows.forEach(row => {
      if (!quarterGroups[row.quarter]) {
        quarterGroups[row.quarter] = [];
      }
      quarterGroups[row.quarter].push(row);
    });

    let body = "";

    Object.entries(quarterGroups).forEach(([quarter, quarterRows]) => {
      const quarterlyRate = calculateQuarterlyRate(quarterRows);

      quarterRows.forEach((row, index) => {
        body += `
          <tr>
            <td class="month">${escapeHtml(formatMonth(row.due_month))}</td>
            <td>${formatNumber(row.dues)}</td>
            <td>${formatNumber(row.done_out_of_dues)}</td>
            <td>${Number(row.renewal_rate).toFixed(1)}%</td>
            ${
              index === 0
                ? `<td class="quarter-rate" rowspan="${quarterRows.length}">
                     ${quarterlyRate === null ? "-" : quarterlyRate.toFixed(1) + "%"}
                   </td>`
                : ""
            }
          </tr>
        `;
      });
    });

    // Total is calculated only for presentation of the displayed rows.
    // It does not replace any value coming from Metabase.
    const totalDues = rows.reduce((sum, row) => sum + Number(row.dues || 0), 0);
    const totalDone = rows.reduce((sum, row) => sum + Number(row.done_out_of_dues || 0), 0);
    const totalRate = totalDues ? (totalDone / totalDues) * 100 : 0;

    body += `
      <tr class="total-row">
        <td class="month">Total</td>
        <td>${formatNumber(totalDues)}</td>
        <td>${formatNumber(totalDone)}</td>
        <td>${totalRate.toFixed(1)}%</td>
        <td>-</td>
      </tr>
    `;

    return `
      <div class="fy-card">
        <div class="fy-title">${escapeHtml(fy)}</div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Due Month</th>
                <th>Total Dues</th>
                <th>Done out of Dues</th>
                <th>Monthly Renewal Rate (%)</th>
                <th>Quarterly Renewal Rate (%)</th>
              </tr>
            </thead>
            <tbody>${body}</tbody>
          </table>
        </div>
      </div>
    `;
  }).join("");
}

// -------------------------
// QUERY 551 RENDERING
// -------------------------
function renderDeploymentSection() {
  const totalRow =
    query551Data.find(row => String(row.FY).toUpperCase() === "TOTAL") ||
    query551Data[query551Data.length - 1];

  const cards = [
    {
      label: "Total Deployments",
      value: totalRow?.Deployments ?? 0,
      subtitle: "Total row"
    },
    {
      label: "Under Active Subscription",
      value: totalRow?.["Active out of Deployments"] ?? 0,
      subtitle: "Active out of Deployments"
    },
    {
      label: "% Active out of Deployed",
      value: totalRow?.["% Active out of Deployed"] ?? "0%",
      subtitle: "Total row"
    }
  ];

  document.getElementById("kpi-cards").innerHTML = cards.map(card => `
    <div class="kpi-card">
      <div class="kpi-label">${escapeHtml(card.label)}</div>
      <div class="kpi-value">${formatNumberOrPercent(card.value)}</div>
      <div class="kpi-subtitle">${escapeHtml(card.subtitle)}</div>
    </div>
  `).join("");

  const columns = ["FY", "Deployments", "Active out of Deployments", "% Active out of Deployed"];

  document.querySelector("#deployment-table thead").innerHTML = `
    <tr>
      ${columns.map(column => `<th>${escapeHtml(column)}</th>`).join("")}
    </tr>
  `;

  document.querySelector("#deployment-table tbody").innerHTML =
    query551Data.map(row => {
      const isTotal = String(row.FY).toUpperCase() === "TOTAL";

      return `
        <tr class="${isTotal ? "total-row" : ""}">
          <td>${escapeHtml(row.FY)}</td>
          <td>${formatNumber(row.Deployments)}</td>
          <td>${formatNumber(row["Active out of Deployments"])}</td>
          <td>${escapeHtml(row["% Active out of Deployed"])}</td>
        </tr>
      `;
    }).join("");
}

function formatNumberOrPercent(value) {
  if (typeof value === "string" && value.includes("%")) {
    return escapeHtml(value);
  }

  return formatNumber(value);
}

// -------------------------
// INITIALIZE
// -------------------------
renderRechargeTables();
renderDeploymentSection();

document.getElementById("last-updated").textContent =
  `Temporary test data • ${new Date().toLocaleDateString("en-IN")}`;

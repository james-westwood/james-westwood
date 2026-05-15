/* ============================================================
   Explainability charts — pure SVG.
   Three figures: feature importance, calibration, residuals.
   ============================================================ */

(function () {
  const css = getComputedStyle(document.documentElement);
  const accent = css.getPropertyValue('--accent').trim() || '#FCC30B';
  const GRID = css.getPropertyValue('--border-1').trim() || '#1E2630';
  const AXIS = css.getPropertyValue('--fg-3').trim() || '#7D8B9B';
  const FG2  = css.getPropertyValue('--fg-2').trim() || '#B6C2CF';
  const COL_LOW  = '#4FD1A1';
  const COL_HIGH = '#F47B60';

  // ---------- Fig 1: Feature importance (horizontal bar) ----------
  function renderImportance() {
    const svg = document.getElementById('plotImportance');
    if (!svg) return;
    const W = 920, H = 320;
    const PAD = { l: 200, r: 32, t: 12, b: 36 };
    const data = [
      { name: 'demand_lag_30m',     gain: 0.31 },
      { name: 'wind_forecast_3h',   gain: 0.27 },
      { name: 'demand_lag_60m',     gain: 0.11 },
      { name: 'solar_forecast_1h',  gain: 0.08 },
      { name: 'temp_forecast_2h',   gain: 0.06 },
      { name: 'hour_of_day_sin',    gain: 0.05 },
      { name: 'interconnector_fr',  gain: 0.04 },
      { name: 'day_of_week',        gain: 0.03 },
      { name: 'gas_price_lag_24h',  gain: 0.03 },
      { name: 'demand_lag_7d',      gain: 0.02 },
    ];
    const max = Math.max(...data.map(d => d.gain));
    const rowH = (H - PAD.t - PAD.b) / data.length;
    const barH = Math.min(rowH - 6, 18);

    let out = '';
    // x-axis ticks
    const xTicks = [0, 0.1, 0.2, 0.3];
    xTicks.forEach(t => {
      const x = PAD.l + (t / max) * (W - PAD.l - PAD.r);
      out += `<line x1="${x}" x2="${x}" y1="${PAD.t}" y2="${H - PAD.b}" stroke="${GRID}" stroke-width="1"/>`;
      out += `<text x="${x}" y="${H - 12}" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" fill="${AXIS}">${t.toFixed(2)}</text>`;
    });

    out += `<text x="${PAD.l + (W - PAD.l - PAD.r)/2}" y="${H - 0}" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" fill="${AXIS}">relative gain</text>`;

    data.forEach((d, i) => {
      const y = PAD.t + i * rowH + (rowH - barH) / 2;
      const w = (d.gain / max) * (W - PAD.l - PAD.r);
      // label
      out += `<text x="${PAD.l - 12}" y="${y + barH/2 + 4}" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="12" fill="${FG2}">${d.name}</text>`;
      // bar (top 2 = accent, others muted)
      const fill = i < 2 ? accent : `color-mix(in oklch, ${accent} 45%, ${GRID})`;
      const fillFallback = i < 2 ? accent : '#5A4F1E';
      out += `<rect x="${PAD.l}" y="${y}" width="${w}" height="${barH}" rx="2" fill="${fillFallback}"/>`;
      // value
      out += `<text x="${PAD.l + w + 6}" y="${y + barH/2 + 4}" font-family="JetBrains Mono, monospace" font-size="11" fill="${FG2}">${(d.gain*100).toFixed(0)}%</text>`;
    });

    svg.innerHTML = out;
  }

  // ---------- Fig 2: Calibration coverage by hour ----------
  function renderCalibration() {
    const svg = document.getElementById('plotCalibration');
    if (!svg) return;
    const W = 460, H = 280;
    const PAD = { l: 44, r: 16, t: 14, b: 36 };

    // Empirical coverage of P10–P90 band (target = 0.80) by hour-of-day
    const hours = Array.from({length: 24}, (_, i) => i);
    const coverage = [0.81,0.83,0.84,0.85,0.84,0.83,0.82,0.80,0.79,0.81,0.82,0.81,0.80,0.79,0.78,0.78,0.77,0.74,0.72,0.71,0.73,0.77,0.79,0.80];
    const yMin = 0.65, yMax = 0.90;
    const xAt = i => PAD.l + (i / (hours.length - 1)) * (W - PAD.l - PAD.r);
    const yAt = v => PAD.t + (1 - (v - yMin) / (yMax - yMin)) * (H - PAD.t - PAD.b);

    let out = '';
    // gridlines
    [0.70, 0.75, 0.80, 0.85, 0.90].forEach(v => {
      const y = yAt(v);
      out += `<line x1="${PAD.l}" x2="${W - PAD.r}" y1="${y}" y2="${y}" stroke="${GRID}" stroke-width="1"/>`;
      out += `<text x="${PAD.l - 8}" y="${y + 4}" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="11" fill="${AXIS}">${v.toFixed(2)}</text>`;
    });

    // target line at 0.80
    const yTarget = yAt(0.80);
    out += `<line x1="${PAD.l}" x2="${W - PAD.r}" y1="${yTarget}" y2="${yTarget}" stroke="${accent}" stroke-width="1.5" stroke-dasharray="4 4" opacity="0.7"/>`;
    out += `<text x="${W - PAD.r - 4}" y="${yTarget - 6}" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="11" fill="${accent}">target 0.80</text>`;

    // x-axis ticks (every 6h)
    [0, 6, 12, 18, 23].forEach(h => {
      const x = xAt(h);
      out += `<text x="${x}" y="${H - 14}" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" fill="${AXIS}">${String(h).padStart(2,'0')}:00</text>`;
    });

    // Bars (above/below target) — colour-coded by miss direction
    coverage.forEach((v, i) => {
      const x = xAt(i);
      const y = yAt(v);
      const yT = yAt(0.80);
      const top = Math.min(y, yT);
      const h = Math.abs(y - yT);
      const colour = v >= 0.80 ? COL_LOW : COL_HIGH;
      const barW = (W - PAD.l - PAD.r) / hours.length * 0.6;
      out += `<rect x="${x - barW/2}" y="${top}" width="${barW}" height="${h}" fill="${colour}" opacity="0.55"/>`;
      out += `<circle cx="${x}" cy="${y}" r="2.5" fill="${colour}"/>`;
    });

    // axis label
    out += `<text x="${PAD.l + (W - PAD.l - PAD.r)/2}" y="${H - 2}" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" fill="${AXIS}">hour of day (UTC)</text>`;

    svg.innerHTML = out;
  }

  // ---------- Fig 3: Residuals over horizon ----------
  function renderResiduals() {
    const svg = document.getElementById('plotResiduals');
    if (!svg) return;
    const W = 460, H = 280;
    const PAD = { l: 44, r: 16, t: 14, b: 36 };

    // Pinball loss (g/kWh) at each horizon — flat to ~4h then climbs
    const horizons = [0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10, 12];
    const loss = [3.1, 3.4, 3.6, 3.8, 4.1, 4.5, 5.4, 6.6, 9.2, 12.3, 15.1];

    const xMin = 0, xMax = 12;
    const yMin = 0, yMax = 16;
    const xAt = h => PAD.l + (h - xMin) / (xMax - xMin) * (W - PAD.l - PAD.r);
    const yAt = v => PAD.t + (1 - (v - yMin) / (yMax - yMin)) * (H - PAD.t - PAD.b);

    let out = '';
    // gridlines
    [0, 4, 8, 12, 16].forEach((v, i) => {
      const y = yAt(v);
      out += `<line x1="${PAD.l}" x2="${W - PAD.r}" y1="${y}" y2="${y}" stroke="${GRID}" stroke-width="1"/>`;
      out += `<text x="${PAD.l - 8}" y="${y + 4}" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="11" fill="${AXIS}">${v}</text>`;
    });
    // x-axis ticks
    [0, 2, 4, 6, 8, 10, 12].forEach(h => {
      const x = xAt(h);
      out += `<line x1="${x}" x2="${x}" y1="${PAD.t}" y2="${H - PAD.b}" stroke="${GRID}" stroke-width="1" opacity="0.5"/>`;
      out += `<text x="${x}" y="${H - 14}" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" fill="${AXIS}">${h}h</text>`;
    });

    // Highlight: the "good zone" up to 4h
    const goodX0 = xAt(0), goodX1 = xAt(4);
    out += `<rect x="${goodX0}" y="${PAD.t}" width="${goodX1 - goodX0}" height="${H - PAD.t - PAD.b}" fill="${COL_LOW}" opacity="0.06"/>`;
    out += `<text x="${goodX0 + 8}" y="${PAD.t + 16}" font-family="JetBrains Mono, monospace" font-size="10" fill="${COL_LOW}" opacity="0.85">≤ 4h: stable</text>`;

    // Line
    let d = '';
    horizons.forEach((h, i) => {
      const x = xAt(h), y = yAt(loss[i]);
      d += (i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`);
    });
    out += `<path d="${d}" fill="none" stroke="${accent}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`;
    horizons.forEach((h, i) => {
      out += `<circle cx="${xAt(h)}" cy="${yAt(loss[i])}" r="3.5" fill="${accent}"/>`;
    });

    // Axis labels
    out += `<text x="${PAD.l + (W - PAD.l - PAD.r)/2}" y="${H - 2}" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" fill="${AXIS}">forecast horizon</text>`;
    out += `<text x="14" y="${PAD.t + (H - PAD.t - PAD.b)/2}" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" fill="${AXIS}" transform="rotate(-90 14 ${PAD.t + (H - PAD.t - PAD.b)/2})">pinball loss (g/kWh)</text>`;

    svg.innerHTML = out;
  }

  function init() {
    renderImportance();
    renderCalibration();
    renderResiduals();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

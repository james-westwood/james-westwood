/* ============================================================
   Live forecast widget — renders quantile chart as SVG.
   Pure SVG path math; no chart library. Matches the upload's
   look (orange median line, dashed P10/P90, soft red band).
   ============================================================ */

(function () {
  const PAD = { l: 56, r: 24, t: 16, b: 36 };
  const W = 920, H = 360;

  // Read CSS variables
  const css = getComputedStyle(document.documentElement);
  const accent = css.getPropertyValue('--accent').trim() || '#FCC30B';
  const COL_LOW  = '#4FD1A1';   // P10 — green
  const COL_HIGH = '#F47B60';   // P90 — red
  const COL_MID  = accent;
  const BAND_FILL = 'rgba(244,123,96,0.16)';
  const GRID = css.getPropertyValue('--border-1').trim() || '#1E2630';
  const AXIS = css.getPropertyValue('--fg-3').trim() || '#7D8B9B';

  // Generate a gentle wave — anchored to the upload screenshot's shape
  // 8 settlement periods (4 hours), starting 10:36
  const BASE_TIMES = ['10:36','11:06','11:36','12:06','12:36','13:06','13:36','14:06'];

  // Series scaffolds keyed by horizon. Values from the screenshot for 4hrs.
  const SERIES = {
    2: {
      labels: ['12:36','13:06','13:36','14:06'],
      p10: [73, 71, 69, 67],
      p50: [80, 78, 76, 74],
      p90: [86, 84, 82, 80],
    },
    4: {
      labels: BASE_TIMES,
      p10: [74, 71, 69, 72, 75, 70, 67, 65],
      p50: [82, 79, 77, 80, 83, 78, 75, 73],
      p90: [89, 86, 84, 87, 90, 85, 82, 80],
    },
    8: {
      labels: ['10:36','11:36','12:36','13:36','14:36','15:36','16:36','17:36','18:36'],
      p10: [74, 70, 75, 67, 62, 60, 64, 72, 78],
      p50: [82, 78, 83, 75, 70, 68, 73, 84, 92],
      p90: [89, 84, 90, 82, 76, 75, 82, 96, 110],
    },
    12: {
      labels: ['10:36','12:36','14:36','16:36','18:36','20:36','22:36'],
      p10: [74, 75, 62, 64, 78, 86, 70],
      p50: [82, 83, 70, 73, 92, 102, 84],
      p90: [89, 90, 76, 82, 110, 122, 100],
    },
  };

  let activeHorizon = 4;
  let mounted = false;

  function smoothPath(points) {
    // Catmull-Rom to Bézier for nice rounded line
    if (points.length < 2) return '';
    const p = points;
    let d = `M ${p[0][0]} ${p[0][1]}`;
    for (let i = 0; i < p.length - 1; i++) {
      const p0 = p[i - 1] || p[i];
      const p1 = p[i];
      const p2 = p[i + 1];
      const p3 = p[i + 2] || p2;
      const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
      const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
      const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
      const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2[0]} ${p2[1]}`;
    }
    return d;
  }

  function render(horizon) {
    const svg = document.getElementById('forecastChart');
    if (!svg) return;
    const s = SERIES[horizon];
    const n = s.labels.length;

    // y-domain
    const allLow = Math.min(...s.p10);
    const allHigh = Math.max(...s.p90);
    const yMin = Math.floor((allLow - 4) / 5) * 5;
    const yMax = Math.ceil((allHigh + 4) / 5) * 5;

    const xAt = i => PAD.l + (i / (n - 1)) * (W - PAD.l - PAD.r);
    const yAt = v => PAD.t + (1 - (v - yMin) / (yMax - yMin)) * (H - PAD.t - PAD.b);

    const p10pts = s.p10.map((v,i) => [xAt(i), yAt(v)]);
    const p50pts = s.p50.map((v,i) => [xAt(i), yAt(v)]);
    const p90pts = s.p90.map((v,i) => [xAt(i), yAt(v)]);

    // Y-axis ticks (every 5g)
    const yTicks = [];
    for (let v = yMin; v <= yMax; v += 5) yTicks.push(v);

    // Build SVG content
    let out = '';

    // gridlines (horizontal)
    yTicks.forEach((v, i) => {
      const y = yAt(v);
      out += `<line x1="${PAD.l}" x2="${W - PAD.r}" y1="${y}" y2="${y}" stroke="${GRID}" stroke-width="1" ${i % 2 ? 'opacity="0.55"' : ''}/>`;
    });

    // y-axis labels
    yTicks.forEach(v => {
      const y = yAt(v);
      out += `<text x="${PAD.l - 10}" y="${y + 4}" text-anchor="end" font-family="JetBrains Mono, ui-monospace, monospace" font-size="12" fill="${AXIS}">${v} g</text>`;
    });

    // x-axis labels
    s.labels.forEach((lab, i) => {
      out += `<text x="${xAt(i)}" y="${H - 10}" text-anchor="middle" font-family="JetBrains Mono, ui-monospace, monospace" font-size="12" fill="${AXIS}">${lab}</text>`;
    });

    // Band (P10 -> P90 -> back)
    const bandTop = smoothPath(p90pts).replace('M ', 'M ');
    const bandBackPts = p10pts.slice().reverse();
    let bandD = smoothPath(p90pts);
    // append line to last p10 then smooth path back along p10 reversed
    bandD += ` L ${p10pts[p10pts.length-1][0]} ${p10pts[p10pts.length-1][1]} `;
    // path back: simpler — line segments along reversed p10 (smooth enough)
    const reverseSmooth = smoothPath(bandBackPts).replace(/^M [^ ]+ [^ ]+/, '');
    bandD += reverseSmooth + ' Z';

    out += `<path d="${bandD}" fill="${BAND_FILL}" stroke="none"/>`;

    // P90 dashed
    out += `<path d="${smoothPath(p90pts)}" fill="none" stroke="${COL_HIGH}" stroke-width="2" stroke-dasharray="6 4" stroke-linecap="round"/>`;
    // P10 dashed
    out += `<path d="${smoothPath(p10pts)}" fill="none" stroke="${COL_LOW}" stroke-width="2" stroke-dasharray="6 4" stroke-linecap="round"/>`;
    // P50 solid
    out += `<path d="${smoothPath(p50pts)}" fill="none" stroke="${COL_MID}" stroke-width="2.5" stroke-linecap="round"/>`;

    // Dots on every series
    p90pts.forEach(([x,y]) => out += `<circle cx="${x}" cy="${y}" r="3.5" fill="${COL_HIGH}"/>`);
    p10pts.forEach(([x,y]) => out += `<circle cx="${x}" cy="${y}" r="3.5" fill="${COL_LOW}"/>`);
    p50pts.forEach(([x,y]) => out += `<circle cx="${x}" cy="${y}" r="4" fill="${COL_MID}"/>`);

    svg.innerHTML = out;

    // Update quantile cards (use index 0 = "next period")
    const nextI = 0;
    document.querySelector('[data-val="p10"]').textContent = s.p10[nextI];
    document.querySelector('[data-val="p50"]').textContent = s.p50[nextI];
    document.querySelector('[data-val="p90"]').textContent = s.p90[nextI];
  }

  function init() {
    if (mounted) return;
    mounted = true;
    render(activeHorizon);
    document.querySelectorAll('.btn-horizon').forEach(btn => {
      btn.addEventListener('click', () => {
        const h = parseInt(btn.dataset.h, 10);
        document.querySelectorAll('.btn-horizon').forEach(b => b.setAttribute('aria-pressed', 'false'));
        btn.setAttribute('aria-pressed', 'true');
        activeHorizon = h;
        render(h);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

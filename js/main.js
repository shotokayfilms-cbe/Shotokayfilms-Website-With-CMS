// ===== Ticking timecode (decorative, broadcast monitor readout) =====
function initTimecode() {
  const tcEls = document.querySelectorAll(".tc");
  if (!tcEls.length) return;
  const start = Date.now();
  function pad(n) { return String(n).padStart(2, "0"); }
  setInterval(() => {
    const elapsed = Date.now() - start;
    const totalFrames = Math.floor(elapsed / (1000 / 24));
    const ff = totalFrames % 24;
    const totalSec = Math.floor(totalFrames / 24);
    const ss = totalSec % 60;
    const mm = Math.floor(totalSec / 60) % 60;
    const hh = Math.floor(totalSec / 3600);
    const tc = `${pad(hh)}:${pad(mm)}:${pad(ss)}:${pad(ff)}`;
    tcEls.forEach(el => el.textContent = tc);
  }, 1000 / 24);
}

// ===== Waveform bars — organic amplitude, cursor-reactive, with dynamic peak accents =====
function initWaveform() {
  const wf = document.getElementById("waveform");
  if (!wf) return;
  const BAR_COUNT = 72;

  const bars = [];
  for (let i = 0; i < BAR_COUNT; i++) {
    const bar = document.createElement("div");
    bar.className = "bar";
    // per-bar random seed so each bar's motion looks independent, not a single clean ripple
    bar.dataset.seed = (Math.random() * 100).toFixed(2);
    wf.appendChild(bar);
    bars.push(bar);
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) {
    bars.forEach((bar, i) => { bar.style.height = (5 + ((i * 7) % 13) * 2) + "px"; });
    return;
  }

  // Track the cursor's horizontal position relative to the waveform's width (0–1)
  let cursorX = null;
  function updateCursor(clientX) {
    const rect = wf.getBoundingClientRect();
    const relX = (clientX - rect.left) / rect.width;
    cursorX = (relX >= -0.15 && relX <= 1.15) ? relX : null;
  }
  window.addEventListener("mousemove", (e) => updateCursor(e.clientX));
  window.addEventListener("mouseleave", () => { cursorX = null; });
  window.addEventListener("touchmove", (e) => {
    if (e.touches && e.touches[0]) updateCursor(e.touches[0].clientX);
  }, { passive: true });

  function animateWaveform(t) {
    const scrollY = window.scrollY || 0;
    bars.forEach((bar, i) => {
      const seed = parseFloat(bar.dataset.seed);
      const basePhase = t * 0.0004 + scrollY * 0.01 + i * 0.35;
      // layer three offset sine waves per bar so the shape reads as irregular audio, not a clean ripple
      const wave =
        0.5 * Math.sin(basePhase) +
        0.3 * Math.sin(basePhase * 1.9 + seed) +
        0.2 * Math.sin(basePhase * 3.3 + seed * 2);
      let h = 5 + (wave + 1) * 15;

      // Cursor proximity — bars near the pointer rise higher, like the waveform is responding to a scrub
      let boosted = false;
      if (cursorX !== null) {
        const barPos = i / (BAR_COUNT - 1);
        const dist = Math.abs(barPos - cursorX);
        const influence = Math.max(0, 1 - dist / 0.12);
        if (influence > 0) {
          h += influence * 22;
          boosted = influence > 0.35;
        }
      }

      // Accent color follows the motion itself — genuine peaks and cursor-boosted bars light up,
      // instead of a fixed random set assigned once on load
      const isPeak = wave > 0.72;
      bar.classList.toggle("accent", isPeak || boosted);
      bar.style.height = h + "px";
    });
    requestAnimationFrame(animateWaveform);
  }
  requestAnimationFrame(animateWaveform);
}

// ===== Home page monitor wall — click a monitor to update the panel below =====
function initWallGrid() {
  const grid = document.querySelector(".wall-grid");
  const panel = document.querySelector(".wall-panel");
  if (!grid || !panel) return;

  grid.querySelectorAll(".monitor").forEach(item => {
    item.addEventListener("click", () => {
      grid.querySelectorAll(".monitor").forEach(el => {
        const isActive = el === item;
        el.classList.toggle("active", isActive);
        el.querySelector(".tally-dot").classList.toggle("on", isActive);
      });
      const name = item.querySelector(".sname").textContent;
      // Data attributes carry the headline/description/link, set server-side
      const headline = item.dataset.headline;
      const desc = item.dataset.desc;
      if (headline && desc) {
        panel.innerHTML = `
          <h3>${headline}</h3>
          <p>${desc}</p>
          <a href="/contact/?service=${encodeURIComponent(name)}" class="btn-rec">Quote this shoot</a>
        `;
      }
    });
  });
}

// ===== Contact page: quote form + WhatsApp send =====
function initQuoteForm() {
  const form = document.getElementById("quoteForm");
  if (!form) return;
  const serviceSelect = document.getElementById("service");
  const whatsappNumber = document.body.dataset.whatsapp;

  // Pre-fill from ?service= query param (arriving from Home/Services links)
  const params = new URLSearchParams(window.location.search);
  const preselect = params.get("service");
  if (preselect) {
    const match = Array.from(serviceSelect.options).find(o => o.value === preselect);
    if (match) serviceSelect.value = preselect;
  }

  document.getElementById("sendBtn").addEventListener("click", () => {
    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const service = serviceSelect.value;
    const budget = document.getElementById("budget").value;
    const message = document.getElementById("message").value.trim();

    if (!name || !phone) {
      alert("Please add your name and phone number so we can reach you.");
      return;
    }

    const text = `Hi Shot Okay Films, I'd like a quote.%0A%0AName: ${encodeURIComponent(name)}%0APhone: +91 ${encodeURIComponent(phone)}%0AService: ${encodeURIComponent(service)}%0ABudget: ${encodeURIComponent(budget)}${message ? "%0ANotes: " + encodeURIComponent(message) : ""}`;

    window.open(`https://wa.me/${whatsappNumber}?text=${text}`, "_blank");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initTimecode();
  initWaveform();
  initWallGrid();
  initQuoteForm();
});

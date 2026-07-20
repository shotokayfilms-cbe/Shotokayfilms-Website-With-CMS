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

// ===== Hero audio bars — realistic meter with scroll + cursor response =====
function initWaveform() {
  const wf = document.getElementById("waveform");
  if (!wf) return;

  const isMobile = window.matchMedia("(max-width: 760px)").matches;
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // Fewer bars on mobile for better performance
  const barCount = isMobile ? 32 : 48;
  const bars = [];

  // Irregular base pattern for a more realistic audio-meter shape
  const basePattern = [
    0.18, 0.28, 0.46, 0.72,
    0.91, 0.68, 0.43, 0.24,
    0.15, 0.11, 0.19, 0.38,
    0.66, 0.86, 0.74, 0.48
  ];

  // Clear existing bars
  wf.innerHTML = "";

  // Create waveform bars
  for (let i = 0; i < barCount; i++) {
    const bar = document.createElement("div");

    bar.className = "bar";

    // Random-looking accent bars
    if ([3, 13, 27, 39].includes(i)) {
      bar.classList.add("bar-accent");
    }

    wf.appendChild(bar);
    bars.push(bar);
  }


  // ========================================================
  // INTERACTION VARIABLES
  // ========================================================

  let pointerX = 0.5;
  let targetPointerX = 0.5;

  let scrollEnergy = 0;

  let lastScrollY =
    window.scrollY || 0;

  let lastFrame =
    performance.now();


  // ========================================================
  // DESKTOP CURSOR INTERACTION
  // ========================================================

  if (
    !isMobile &&
    !reduceMotion
  ) {

    wf.addEventListener(
      "pointermove",
      event => {

        const rect =
          wf.getBoundingClientRect();

        targetPointerX =
          Math.max(
            0,
            Math.min(
              1,
              (
                event.clientX -
                rect.left
              ) /
              rect.width
            )
          );

      },
      {
        passive: true
      }
    );


    wf.addEventListener(
      "pointerleave",
      () => {

        targetPointerX = 0.5;

      },
      {
        passive: true
      }
    );

  }


  // ========================================================
  // SCROLL ENERGY
  // ========================================================

  function handleScroll() {

    const currentY =
      window.scrollY || 0;

    const delta =
      Math.min(
        80,
        Math.abs(
          currentY -
          lastScrollY
        )
      );


    scrollEnergy =
      Math.min(
        1,
        scrollEnergy +
        delta / 45
      );


    lastScrollY =
      currentY;

  }


  window.addEventListener(
    "scroll",
    handleScroll,
    {
      passive: true
    }
  );


  // ========================================================
  // REDUCED MOTION
  // ========================================================

  function setStaticBars() {

    bars.forEach(
      (bar, i) => {

        const pattern =
          basePattern[
            i %
            basePattern.length
          ];


        bar.style.height =
          `${
            7 +
            pattern * 25
          }px`;

      }
    );

  }


  if (reduceMotion) {

    setStaticBars();

    return;

  }


  // ========================================================
  // MOBILE
  // Lightweight scroll-only response
  // No continuous animation loop
  // ========================================================

  if (isMobile) {

    let ticking = false;


    const renderMobile = () => {

      const scrollPhase =
        (
          window.scrollY ||
          0
        ) * 0.018;


      bars.forEach(
        (bar, i) => {

          const pattern =
            basePattern[
              i %
              basePattern.length
            ];


          const movement =
            (
              Math.sin(
                scrollPhase +
                i * 0.72
              ) +
              1
            ) *
            4;


          const height =
            6 +
            pattern * 21 +
            movement;


          bar.style.height =
            `${height.toFixed(1)}px`;

        }
      );


      ticking = false;

    };


    window.addEventListener(
      "scroll",
      () => {

        if (!ticking) {

          ticking = true;

          requestAnimationFrame(
            renderMobile
          );

        }

      },
      {
        passive: true
      }
    );


    renderMobile();

    return;

  }


  // ========================================================
  // DESKTOP LIVE AUDIO METER
  // ========================================================

  function animateWaveform(now) {

    const dt =
      Math.min(
        32,
        now -
        lastFrame
      );


    lastFrame =
      now;


    // Smooth cursor movement
    pointerX +=
      (
        targetPointerX -
        pointerX
      ) *
      0.075;


    // Scroll response fades naturally
    scrollEnergy *=
      Math.pow(
        0.94,
        dt /
        16.67
      );


    bars.forEach(
      (bar, i) => {

        const normalized =
          i /
          Math.max(
            1,
            bars.length -
            1
          );


        const distance =
          Math.abs(
            normalized -
            pointerX
          );


        // Bars near cursor become taller
        const pointerInfluence =
          Math.max(
            0,
            1 -
            distance /
            0.22
          );


        const pattern =
          basePattern[
            i %
            basePattern.length
          ];


        // Slow movement
        const slowWave =
          (
            Math.sin(
              now *
              0.0017 +
              i *
              0.61
            ) +
            1
          ) *
          0.5;


        // Smaller random-feeling movement
        const detailWave =
          (
            Math.sin(
              now *
              0.0031 +
              i *
              1.37
            ) +
            1
          ) *
          0.5;


        const height =

          5 +

          pattern *
          23 +

          slowWave *
          6 +

          detailWave *
          3 +

          pointerInfluence *
          16 +

          scrollEnergy *
          (
            5 +
            pattern *
            15
          );


        bar.style.height =
          `${
            Math.min(
              48,
              height
            ).toFixed(1)
          }px`;

      }
    );


    requestAnimationFrame(
      animateWaveform
    );

  }


  requestAnimationFrame(
    animateWaveform
  );

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

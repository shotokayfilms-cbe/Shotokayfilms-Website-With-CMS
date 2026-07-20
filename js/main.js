// ==========================================================
// SHOT OKAY FILMS — MAIN.JS
// ==========================================================


// ==========================================================
// AMBIENT BACKGROUND GLOW
// Desktop: cursor + scroll synced
// Mobile: static lightweight fallback
// ==========================================================

function initAmbientGlow() {
  const root = document.documentElement;

  const isMobile = window.matchMedia(
    "(max-width: 760px)"
  ).matches;

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;


  // Keep mobile and reduced-motion devices lightweight
  if (isMobile || reduceMotion) {

    root.style.setProperty(
      "--cursor-x",
      "50%"
    );

    root.style.setProperty(
      "--cursor-y",
      "30%"
    );

    root.style.setProperty(
      "--scroll-shift",
      "0px"
    );

    return;
  }


  let targetX =
    window.innerWidth * 0.5;

  let targetY =
    window.innerHeight * 0.3;


  let currentX =
    targetX;

  let currentY =
    targetY;


  let scrollShift = 0;

  let rafId = null;


  function render() {

    // Smooth cursor movement
    currentX +=
      (targetX - currentX) *
      0.09;

    currentY +=
      (targetY - currentY) *
      0.09;


    root.style.setProperty(
      "--cursor-x",
      `${currentX}px`
    );


    root.style.setProperty(
      "--cursor-y",
      `${currentY}px`
    );


    root.style.setProperty(
      "--scroll-shift",
      `${scrollShift}px`
    );


    const moving =

      Math.abs(
        targetX -
        currentX
      ) > 0.2 ||

      Math.abs(
        targetY -
        currentY
      ) > 0.2;


    if (moving) {

      rafId =
        requestAnimationFrame(
          render
        );

    } else {

      rafId = null;

    }

  }


  function requestRender() {

    if (!rafId) {

      rafId =
        requestAnimationFrame(
          render
        );

    }

  }


  // Desktop cursor tracking
  window.addEventListener(
    "pointermove",

    event => {

      targetX =
        event.clientX;

      targetY =
        event.clientY;

      requestRender();

    },

    {
      passive: true
    }
  );


  // Scroll-reactive ambient gradient
  window.addEventListener(
    "scroll",

    () => {

      scrollShift =
        Math.min(
          140,
          window.scrollY *
          0.06
        );


      root.style.setProperty(
        "--scroll-shift",
        `${scrollShift}px`
      );

    },

    {
      passive: true
    }
  );


  requestRender();
}



// ==========================================================
// TICKING TIMECODE
// ==========================================================

function initTimecode() {

  const tcEls =
    document.querySelectorAll(
      ".tc"
    );


  if (!tcEls.length) {
    return;
  }


  const start =
    Date.now();


  function pad(n) {

    return String(n)
      .padStart(
        2,
        "0"
      );

  }


  setInterval(
    () => {

      const elapsed =
        Date.now() -
        start;


      const totalFrames =
        Math.floor(
          elapsed /
          (1000 / 24)
        );


      const ff =
        totalFrames %
        24;


      const totalSec =
        Math.floor(
          totalFrames /
          24
        );


      const ss =
        totalSec %
        60;


      const mm =
        Math.floor(
          totalSec /
          60
        ) %
        60;


      const hh =
        Math.floor(
          totalSec /
          3600
        );


      const tc =

        `${pad(hh)}:` +
        `${pad(mm)}:` +
        `${pad(ss)}:` +
        `${pad(ff)}`;


      tcEls.forEach(
        el => {

          el.textContent =
            tc;

        }
      );

    },

    1000 / 24
  );

}



// ==========================================================
// WAVEFORM
// Organic audio bars
// Desktop: continuous + cursor + scroll
// Mobile: scroll response only
// ==========================================================

function initWaveform() {

  const wf =
    document.getElementById(
      "waveform"
    );


  if (!wf) {
    return;
  }


  const isMobile =
    window.matchMedia(
      "(max-width: 760px)"
    ).matches;


  const reduceMotion =
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;


  // Fewer bars on mobile
  const BAR_COUNT =
    isMobile
      ? 36
      : 72;


  const bars = [];


  // Remove existing bars
  wf.innerHTML = "";


  for (
    let i = 0;
    i < BAR_COUNT;
    i++
  ) {

    const bar =
      document.createElement(
        "div"
      );


    bar.className =
      "bar";


    // Independent movement seed
    bar.dataset.seed =
      (
        Math.random() *
        100
      ).toFixed(2);


    wf.appendChild(
      bar
    );


    bars.push(
      bar
    );

  }



  // ========================================================
  // REDUCED MOTION
  // ========================================================

  if (reduceMotion) {

    bars.forEach(
      (bar, i) => {

        bar.style.height =
          (
            5 +
            (
              (i * 7) %
              13
            ) *
            2
          ) +
          "px";

      }
    );


    return;

  }



  // ========================================================
  // MOBILE WAVEFORM
  // Scroll response only
  // No permanent animation loop
  // ========================================================

  if (isMobile) {

    let ticking =
      false;


    function renderMobileWaveform() {

      const scrollY =
        window.scrollY ||
        0;


      bars.forEach(
        (bar, i) => {

          const seed =
            parseFloat(
              bar.dataset.seed
            );


          const wave =
            Math.sin(

              scrollY *
              0.012 +

              i *
              0.55 +

              seed

            );


          const height =

            8 +

            (
              wave +
              1
            ) *

            9;


          bar.style.height =
            `${height}px`;


          // Sparse orange accent peaks
          bar.classList.toggle(

            "accent",

            wave >
            0.72

          );

        }
      );


      ticking =
        false;

    }


    window.addEventListener(
      "scroll",

      () => {

        if (!ticking) {

          ticking =
            true;


          requestAnimationFrame(
            renderMobileWaveform
          );

        }

      },

      {
        passive: true
      }
    );


    renderMobileWaveform();


    return;

  }



  // ========================================================
  // DESKTOP WAVEFORM
  // ========================================================

  let cursorX =
    null;


  function updateCursor(
    clientX
  ) {

    const rect =
      wf.getBoundingClientRect();


    const relX =

      (
        clientX -
        rect.left
      ) /

      rect.width;


    cursorX =

      (
        relX >=
        -0.15 &&

        relX <=
        1.15
      )

        ? relX

        : null;

  }


  window.addEventListener(
    "mousemove",

    event => {

      updateCursor(
        event.clientX
      );

    },

    {
      passive: true
    }
  );


  window.addEventListener(
    "mouseleave",

    () => {

      cursorX =
        null;

    }
  );


  function animateWaveform(
    t
  ) {

    const scrollY =
      window.scrollY ||
      0;


    bars.forEach(
      (bar, i) => {

        const seed =
          parseFloat(
            bar.dataset.seed
          );


        const basePhase =

          t *
          0.0004 +

          scrollY *
          0.01 +

          i *
          0.35;



        // Multiple frequencies create
        // a natural audio waveform

        const wave =

          0.5 *

          Math.sin(
            basePhase
          ) +


          0.3 *

          Math.sin(

            basePhase *
            1.9 +

            seed

          ) +


          0.2 *

          Math.sin(

            basePhase *
            3.3 +

            seed *
            2

          );


        let height =

          5 +

          (
            wave +
            1
          ) *

          15;



        // Cursor interaction

        let boosted =
          false;


        if (
          cursorX !==
          null
        ) {

          const barPosition =

            i /

            (
              BAR_COUNT -
              1
            );


          const distance =

            Math.abs(

              barPosition -
              cursorX

            );


          const influence =

            Math.max(

              0,

              1 -

              distance /
              0.12

            );


          if (
            influence >
            0
          ) {

            height +=

              influence *
              22;


            boosted =

              influence >
              0.35;

          }

        }



        // Orange accent on peaks
        // and cursor-reactive bars

        const isPeak =

          wave >
          0.72;


        bar.classList.toggle(

          "accent",

          isPeak ||
          boosted

        );


        bar.style.height =
          `${height}px`;

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



// ==========================================================
// HOME SERVICE MONITOR CARDS
// First card active by default
// Clicking another card changes description
// ==========================================================

function initWallGrid() {

  const grid =
    document.querySelector(
      ".wall-grid"
    );


  const panel =
    document.getElementById(
      "servicePanel"
    );


  if (
    !grid ||
    !panel
  ) {

    return;

  }


  const cards =
    Array.from(

      grid.querySelectorAll(
        ".monitor"
      )

    );


  if (!cards.length) {
    return;
  }



  // ========================================================
  // SELECT SERVICE
  // ========================================================

  function selectService(
    card,
    animate = true
  ) {


    // Reset every card

    cards.forEach(
      item => {

        item.classList.remove(
          "active"
        );


        const dot =
          item.querySelector(
            ".tally-dot"
          );


        if (dot) {

          dot.classList.remove(
            "on"
          );

        }

      }
    );



    // Activate selected card

    card.classList.add(
      "active"
    );


    const activeDot =
      card.querySelector(
        ".tally-dot"
      );


    if (activeDot) {

      activeDot.classList.add(
        "on"
      );

    }



    // Read service data

    const serviceName =

      card
        .querySelector(
          ".sname"
        )
        ?.textContent
        .trim() ||

      "";


    const headline =

      card.dataset.headline ||

      serviceName;


    const description =

      card.dataset.desc ||

      "";



    // Update description panel

    panel.innerHTML = `
      <div class="wall-panel-content">

        <div class="wall-panel-copy">

          <span class="wall-panel-label">
            NOW SELECTED
          </span>

          <h3>
            ${headline}
          </h3>

          <p>
            ${description}
          </p>

        </div>

        <a
          href="/contact/?service=${encodeURIComponent(serviceName)}"
          class="btn-rec"
        >
          <span class="rec-dot"></span>

          <span>
            QUOTE THIS SHOOT
          </span>
        </a>

      </div>
    `;


    panel.hidden =
      false;



    // Animate only when manually
    // changing service cards

    if (animate) {

      panel.classList.remove(
        "panel-visible"
      );


      requestAnimationFrame(
        () => {

          panel.classList.add(
            "panel-visible"
          );

        }
      );

    } else {

      // First card displays immediately

      panel.classList.add(
        "panel-visible"
      );

    }

  }



  // ========================================================
  // CARD CLICK EVENTS
  // ========================================================

  cards.forEach(
    card => {

      card.addEventListener(
        "click",

        () => {


          // If already selected,
          // keep it active

          if (
            card.classList.contains(
              "active"
            )
          ) {

            return;

          }


          selectService(
            card,
            true
          );

        }
      );

    }
  );



  // ========================================================
  // FIRST CARD ACTIVE BY DEFAULT
  // ========================================================

  selectService(
    cards[0],
    false
  );

}



// ==========================================================
// CONTACT PAGE
// Quote form + WhatsApp
// ==========================================================

function initQuoteForm() {

  const form =
    document.getElementById(
      "quoteForm"
    );


  if (!form) {
    return;
  }


  const serviceSelect =
    document.getElementById(
      "service"
    );


  const whatsappNumber =
    document.body.dataset.whatsapp;



  // ========================================================
  // PRE-FILL SERVICE FROM URL
  // ========================================================

  const params =
    new URLSearchParams(
      window.location.search
    );


  const preselect =
    params.get(
      "service"
    );


  if (
    preselect &&
    serviceSelect
  ) {

    const match =

      Array
        .from(
          serviceSelect.options
        )
        .find(

          option =>

            option.value ===
            preselect

        );


    if (match) {

      serviceSelect.value =
        preselect;

    }

  }



  // ========================================================
  // WHATSAPP SEND BUTTON
  // ========================================================

  const sendButton =
    document.getElementById(
      "sendBtn"
    );


  if (!sendButton) {
    return;
  }


  sendButton.addEventListener(
    "click",

    () => {


      const name =

        document
          .getElementById(
            "name"
          )
          .value
          .trim();



      const phone =

        document
          .getElementById(
            "phone"
          )
          .value
          .trim();



      const service =

        serviceSelect

          ? serviceSelect.value

          : "";



      const budget =

        document
          .getElementById(
            "budget"
          )
          .value;



      const message =

        document
          .getElementById(
            "message"
          )
          .value
          .trim();



      // Required fields

      if (
        !name ||
        !phone
      ) {

        alert(
          "Please add your name and phone number so we can reach you."
        );


        return;

      }



      // Build WhatsApp message

      const text =

        `Hi Shot Okay Films, I'd like a quote.` +

        `%0A%0AName: ${
          encodeURIComponent(
            name
          )
        }` +

        `%0APhone: +91 ${
          encodeURIComponent(
            phone
          )
        }` +

        `%0AService: ${
          encodeURIComponent(
            service
          )
        }` +

        `%0ABudget: ${
          encodeURIComponent(
            budget
          )
        }` +

        (

          message

            ? `%0ANotes: ${
                encodeURIComponent(
                  message
                )
              }`

            : ""

        );



      // Open WhatsApp

      window.open(

        `https://wa.me/${whatsappNumber}?text=${text}`,

        "_blank"

      );

    }
  );

}



// ==========================================================
// INITIALIZE WEBSITE
// ==========================================================

document.addEventListener(
  "DOMContentLoaded",

  () => {

    initAmbientGlow();

    initTimecode();

    initWaveform();

    initWallGrid();

    initQuoteForm();

  }
);

/*========================================== Home Page Scrolling text bar ==========================================*/
(function initHeroTicker() {
  const track = document.getElementById("zStripTrack");
  const group = document.getElementById("zStripGroup");
  if (!track || !group) return;

  // clonning
  const containerWidth = track.parentElement.getBoundingClientRect().width;

  // cleaning
  const measureAndClone = () => {
    // sizing
    [...track.querySelectorAll(".z-strip-group")].forEach((g, i) => {
      if (i !== 0) g.remove();
    });

    // Cloning 2
    while (track.scrollWidth < containerWidth * 2.5) {
      track.appendChild(group.cloneNode(true));
    }

    // width setter
    const firstGroupWidth = track
      .querySelector(".z-strip-group")
      .getBoundingClientRect().width;
    track.style.setProperty("--zLoopDistance", `${firstGroupWidth}px`);

    // speed tweek
    const seconds = Math.max(14, firstGroupWidth / 90);
    track.style.setProperty("--zLoopDur", `${seconds}s`);
  };

  // applly + run
  measureAndClone();
  window.addEventListener("resize", () => {
    clearTimeout(window.__zTickerT);
    window.__zTickerT = setTimeout(measureAndClone, 150);
  });
})();

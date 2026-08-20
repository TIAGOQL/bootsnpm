/**
 * Sininho + varinha: apresenta o drone no painel.
 * Ponteiro ao entrar inicia. Duplo-clique (botão comum) desliga.
 */

import { start, stop, isPlaying, onPlayingChange } from "./tonus-drone.js";

const MUTE_KEY = "rem-drone-off";
const SEEN_KEY = "rem-drone-popup-seen";

function $(sel) {
  return document.querySelector(sel);
}

function muted() {
  return localStorage.getItem(MUTE_KEY) === "1";
}

function setMuted(off) {
  if (off) localStorage.setItem(MUTE_KEY, "1");
  else localStorage.removeItem(MUTE_KEY);
}

function bind() {
  const sininho = $("[data-sininho]");
  const wand = $("[data-sininho-wand]");
  const popup = $("[data-sininho-popup]");
  const orb = $("[data-drone-orb]");
  const closeBtn = $("[data-sininho-close]");
  const playBtn = $("[data-sininho-play]");
  if (!sininho || !popup) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let greeted = sessionStorage.getItem(SEEN_KEY) === "1";
  let pointerArmed = false;

  function setUi(playing) {
    document.body.classList.toggle("is-drone-on", playing);
    sininho.setAttribute("aria-pressed", String(playing));
    sininho.classList.toggle("is-awake", playing);
    if (orb) {
      orb.hidden = !playing;
      orb.setAttribute("aria-hidden", String(!playing));
    }
  }

  onPlayingChange(setUi);
  setUi(isPlaying());

  function openPopup() {
    if (typeof popup.showModal === "function") popup.showModal();
    else popup.setAttribute("open", "");
    sessionStorage.setItem(SEEN_KEY, "1");
    greeted = true;
    sininho.classList.add("is-casting");
    window.setTimeout(() => sininho.classList.remove("is-casting"), 1200);
  }

  function closePopup() {
    if (typeof popup.close === "function" && popup.open) popup.close();
    else popup.removeAttribute("open");
  }

  function wakeDrone() {
    setMuted(false);
    const ok = start();
    setUi(isPlaying());
    return ok;
  }

  function sleepDrone() {
    setMuted(true);
    stop();
    setUi(false);
  }

  function onPointer(event) {
    if (event.pointerType === "touch" && event.type === "pointermove") return;
    if (!pointerArmed) {
      pointerArmed = true;
      sininho.hidden = false;
      if (!greeted) openPopup();
    }
    if (orb && isPlaying() && !reduceMotion) {
      orb.style.setProperty("--drone-x", `${event.clientX}px`);
      orb.style.setProperty("--drone-y", `${event.clientY}px`);
    }
    if (!muted() && !isPlaying() && event.type === "pointermove") {
      wakeDrone();
    }
  }

  document.addEventListener("pointermove", onPointer, { passive: true });
  document.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    onPointer(event);
    if (!muted() && !isPlaying()) wakeDrone();
  });

  document.addEventListener("dblclick", (event) => {
    if (event.button !== 0 && event.button !== undefined) return;
    if (popup.open && popup.contains(event.target)) return;
    sleepDrone();
  });

  sininho.addEventListener("click", (event) => {
    event.stopPropagation();
    if (isPlaying()) openPopup();
    else {
      wakeDrone();
      openPopup();
    }
  });

  if (wand) {
    wand.addEventListener("click", (event) => {
      event.stopPropagation();
      wakeDrone();
      openPopup();
    });
  }

  if (playBtn) {
    playBtn.addEventListener("click", () => {
      wakeDrone();
      closePopup();
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", () => closePopup());
  }

  popup.addEventListener("click", (event) => {
    if (event.target === popup) closePopup();
  });

  window.addEventListener("pagehide", () => {
    if (isPlaying()) stop();
  });
}

bind();

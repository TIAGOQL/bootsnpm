/**
 * Tônus page controls — uses the shared drone engine.
 */

import { start, stop, isPlaying, getVolume, setVolume, onPlayingChange } from "./tonus-drone.js";

function $(sel) {
  return document.querySelector(sel);
}

function render(playing) {
  const btn = $("[data-music-toggle]");
  const status = $("[data-music-status]");
  if (btn) {
    btn.textContent = playing ? "Pausar" : "Tocar";
    btn.setAttribute("aria-pressed", String(playing));
    btn.disabled = false;
  }
  if (status) {
    status.textContent = playing
      ? "Tocando · tônus baixo e constante"
      : "Parado · pronto quando você estiver";
  }
  document.body.classList.toggle("is-music-playing", playing);
}

function bind() {
  const btn = $("[data-music-toggle]");
  if (!btn) return;

  onPlayingChange(render);
  render(isPlaying());

  btn.addEventListener("click", () => {
    if (isPlaying()) {
      btn.textContent = "Pausar…";
      btn.disabled = true;
      const status = $("[data-music-status]");
      if (status) status.textContent = "Encerrando suave…";
      stop();
    } else {
      const ok = start();
      if (!ok) {
        const status = $("[data-music-status]");
        if (status) status.textContent = "Áudio não disponível neste navegador.";
      }
    }
  });

  const volume = $("[data-music-volume]");
  if (volume) {
    volume.value = String(getVolume());
    volume.addEventListener("input", () => {
      setVolume(volume.value);
    });
  }

  window.addEventListener("pagehide", () => {
    if (isPlaying()) stop();
  });
}

bind();

/**
 * Compartilhar página — Web Share quando existir; senão copia o link.
 */
(function () {
  const btn = document.querySelector("[data-share]");
  if (!btn) return;

  const feedback = btn.querySelector("[data-share-feedback]");
  let hideTimer = 0;

  function setFeedback(message) {
    if (!feedback) return;
    feedback.textContent = message;
    feedback.hidden = false;
    btn.setAttribute("aria-label", message);
    window.clearTimeout(hideTimer);
    hideTimer = window.setTimeout(() => {
      feedback.hidden = true;
      btn.setAttribute("aria-label", "Compartilhar esta página");
    }, 2200);
  }

  btn.addEventListener("click", async () => {
    const url = window.location.href;
    const title = document.title;
    const description =
      document.querySelector('meta[name="description"]')?.getAttribute("content") || title;
    const payload = { title, text: description, url };

    if (typeof navigator.share === "function") {
      try {
        await navigator.share(payload);
        return;
      } catch (err) {
        if (err && err.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setFeedback("Link copiado");
    } catch {
      setFeedback(url);
    }
  });
})();

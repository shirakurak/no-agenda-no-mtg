(() => {
  const PREFILL_TEXT = "アジェンダはこちら:";
  const TITLE_LABELS = ["タイトル", "Title"];
  const DESC_LABELS = ["説明", "Description"];
  const KEYWORDS = /(mtg)/i;

  const findInputByLabels = (labels) => {
    const selectors = [
      'input[aria-label]', 'textarea[aria-label]',
      'div[contenteditable="true"][aria-label]',
      '[role="textbox"][aria-label]'
    ];
    for (const sel of selectors) {
      const nodes = document.querySelectorAll(sel);
      for (const el of nodes) {
        const label = (el.getAttribute("aria-label") || "").toLowerCase();
        if (labels.some(l => label.includes(l.toLowerCase()))) return el;
      }
    }
    return null;
  };

  const getText = (el) => {
    if (!el) return "";
    if ("value" in el) return el.value || "";
    return (el.innerText || el.textContent || "").trim();
  };

  const setText = (el, text) => {
    if (!el) return;
    if ("value" in el) {
      el.value = text;
    } else {
      el.innerText = text;
    }
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  };

  const shouldPrefill = (title, desc) => {
    const hasKeyword = KEYWORDS.test(title || "");
    const descEmpty = !desc || desc.trim().length === 0;
    return hasKeyword && descEmpty;
  };

  const wireDialog = (container) => {
    if (container.__no_agenda_no_mtg_wired) return;
    container.__no_agenda_no_mtg_wired = true;

    const titleEl = findInputByLabels(TITLE_LABELS);
    const descEl  = findInputByLabels(DESC_LABELS);
    if (!titleEl || !descEl) return;

    const run = () => {
      const title = getText(titleEl);
      const desc  = getText(descEl);
      if (shouldPrefill(title, desc)) {
        setText(descEl, PREFILL_TEXT);
      }
    };

    setTimeout(run, 80);
    titleEl.addEventListener("input", run, { passive: true });
  };

  const observer = new MutationObserver(mutations => {
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (!(node instanceof HTMLElement)) continue;
        if (node.getAttribute && node.getAttribute("role") === "dialog") {
          wireDialog(node);
        }
        node.querySelectorAll?.('[role="dialog"]').forEach(wireDialog);
      }
    }
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });

  document.querySelectorAll('[role="dialog"]').forEach(wireDialog);
})();
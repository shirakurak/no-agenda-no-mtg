(() => {
  const DEFAULTS = {
    keyword: "meeting, mtg",
    prefillText: "アジェンダはこちら："
  };

  function getSettings() {
    return new Promise(resolve => {
      try {
        chrome.storage?.sync.get(DEFAULTS, (items) => {
          resolve({
            keyword: String(items.keyword || DEFAULTS.keyword),
            prefillText: String(items.prefillText || DEFAULTS.prefillText)
          });
        });
      } catch (e) {
        resolve(DEFAULTS);
      }
    });
  }

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

  const debounce = (fn, wait=120) => {
    let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
  };

  function wireDialogWithSettings(settings, container) {
    if (container.__no_agenda_no_mtg_wired) return;
    container.__no_agenda_no_mtg_wired = true;

    const TITLE_LABELS = ["タイトル", "Title"];
    const DESC_LABELS  = ["説明", "Description"];

    const titleEl = findInputByLabels(TITLE_LABELS);
    const descEl  = findInputByLabels(DESC_LABELS);
    if (!titleEl || !descEl) return;

    const MARK = "__no_agenda_prefilled__";
    const prefillText = settings.prefillText;
    const parts = settings.keyword.split(",").map(s => s.trim()).filter(Boolean);
    const regex = new RegExp(`(${parts.map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join("|")})`, "i");

    const run = () => {
      const title = getText(titleEl);
      const desc  = getText(descEl);
      if (!regex.test(title)) return;
      if (!desc || !desc.trim()) {
        if (descEl[MARK] === true) return;
        if (desc && desc.includes(prefillText)) return;
        setText(descEl, prefillText);
        descEl[MARK] = true;
      }
    };

    const runDebounced = debounce(run, 120);
    setTimeout(run, 100);
    titleEl.addEventListener("input", runDebounced, { passive: true });
  }

  (async () => {
    const settings = await getSettings();

    const observer = new MutationObserver(mutations => {
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          if (!(node instanceof HTMLElement)) continue;
          if (node.getAttribute && node.getAttribute("role") === "dialog") {
            wireDialogWithSettings(settings, node);
          }
          node.querySelectorAll?.('[role="dialog"]').forEach(el => wireDialogWithSettings(settings, el));
        }
      }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });

    document.querySelectorAll('[role="dialog"]').forEach(el => wireDialogWithSettings(settings, el));
  })();
})();
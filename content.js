(() => {
  const DEFAULTS = {
    keyword: "mtg",                   // デフォルト検知キーワード
    prefillText: "アジェンダはこちら:" // デフォルト挿入文言
  };

  // storage から設定取得（存在しなければ DEFAULTS）
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
        // 非Chrome環境や万一の失敗時はデフォルト
        resolve(DEFAULTS);
      }
    });
  }

  // ラベル名から入力要素を見つける
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

  // 連打防止の簡易debounce
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
    // カンマ区切りで複数指定可能に（例: "mtp,mtg,meeting"）
    const parts = settings.keyword.split(",").map(s => s.trim()).filter(Boolean);
    const regex = new RegExp(`(${parts.map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join("|")})`, "i");

    const run = () => {
      const title = getText(titleEl);
      const desc  = getText(descEl);
      if (!regex.test(title)) return;
      if (!desc || !desc.trim()) {
        if (descEl[MARK] === true) return;         // ユーザーが一度消した後は再挿入しない
        if (desc && desc.includes(prefillText)) return; // 多重挿入防止
        setText(descEl, prefillText);
        descEl[MARK] = true;
      }
    };

    const runDebounced = debounce(run, 120);
    setTimeout(run, 100);
    titleEl.addEventListener("input", runDebounced, { passive: true });
  }

  // 監視開始
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

    // 既に開いているダイアログにも適用
    document.querySelectorAll('[role="dialog"]').forEach(el => wireDialogWithSettings(settings, el));
  })();
})();
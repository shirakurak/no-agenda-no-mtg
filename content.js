(() => {
  const PREFILL_TEXT = "アジェンダはこちら:";
  const TITLE_LABELS = ["タイトル", "Title"];
  const DESC_LABELS = ["説明", "Description"];
  const KEYWORDS = /(mtg)/i; // ここに他のキーワードを追加可: /(mtg|会議|meeting)/i

  // 共通: 入力要素を見つける
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
    // contenteditable
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

    // 初回 & タイトル変更時にチェック
    setTimeout(run, 80);
    titleEl.addEventListener("input", run, { passive: true });
  };

  // ダイアログ(作成/編集UI)は動的生成なので監視
  const observer = new MutationObserver(mutations => {
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (!(node instanceof HTMLElement)) continue;
        if (node.getAttribute && node.getAttribute("role") === "dialog") {
          wireDialog(node);
        }
        // 新UIでサイドパネルの場合もあるので広めに
        node.querySelectorAll?.('[role="dialog"]').forEach(wireDialog);
      }
    }
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });

  // ページ読み込み時に既に開いているダイアログがあれば処理
  document.querySelectorAll('[role="dialog"]').forEach(wireDialog);
})();
(() => {
  const DEFAULTS = { keyword: "meeting, mtg", prefillText: "アジェンダはこちら:" };
  const $ = (id) => document.getElementById(id);

  function load() {
    chrome.storage.sync.get(DEFAULTS, (items) => {
      $("keyword").value = items.keyword || DEFAULTS.keyword;
      $("prefill").value = items.prefillText || DEFAULTS.prefillText;
    });
  }

  function save() {
    const keyword = $("keyword").value.trim() || DEFAULTS.keyword;
    const prefillText = $("prefill").value.trim() || DEFAULTS.prefillText;
    chrome.storage.sync.set({ keyword, prefillText }, () => {
      $("ok").style.display = "inline";
      setTimeout(() => $("ok").style.display = "none", 1500);
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    load();
    $("save").addEventListener("click", save);
  });
})();
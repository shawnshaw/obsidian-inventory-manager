var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// src/constants.js
var require_constants = __commonJS({
  "src/constants.js"(exports2, module2) {
    var INVENTORY_VIEW_TYPE = "inventory-manager-workbench";
    var DEFAULT_SETTINGS = {
      inventoryRoot: "\u5E93\u5B58",
      scriptsDir: "Scripts",
      pythonCommand: "python3",
      defaultOperator: "\u7CFB\u7EDF\u751F\u6210"
    };
    var ASSET_CATEGORY_OPTIONS = [
      "\u7B14\u8BB0\u672C\u7535\u8111",
      "\u663E\u793A\u5668",
      "\u53F0\u5F0F\u673A\u4E3B\u673A",
      "\u624B\u673A",
      "\u6253\u5370\u673A",
      "\u7F51\u7EDC\u8BBE\u5907",
      "\u670D\u52A1\u5668",
      "\u5176\u4ED6\u8BBE\u5907"
    ];
    var ASSET_TYPE_OPTIONS = [
      { label: "NB \xB7 \u7B14\u8BB0\u672C", value: "NB" },
      { label: "MO \xB7 \u663E\u793A\u5668", value: "MO" },
      { label: "PC \xB7 \u4E3B\u673A", value: "PC" },
      { label: "\u8017\u6750 \xB7 \u7B14/\u7EB8/\u7EBF\u7B49", value: "\u8017\u6750" }
    ];
    var ASSET_STATUS_OPTIONS = ["\u5728\u5E93", "\u5728\u7528", "\u501F\u51FA", "\u62A5\u5E9F"];
    var STATUS_OPTIONS = ["\u5728\u5E93", "\u5728\u7528", "\u501F\u51FA", "\u62A5\u5E9F"];
    var ACTION_OPTIONS = ["\u8D2D\u4E70", "\u5165\u5E93", "\u9886\u7528", "\u501F\u7528", "\u5F52\u8FD8", "\u62A5\u5E9F"];
    var PERSON_STATUS_OPTIONS = ["\u5728\u804C", "\u79BB\u804C"];
    var OFFICE_OPTIONS = ["\u6DF1\u5733", "\u9999\u6E2F"];
    var TAB_DEFS = [
      { key: "assets", label: "\u8BBE\u5907", icon: "monitor" },
      { key: "people", label: "\u4EBA\u5458", icon: "users" },
      { key: "transactions", label: "\u6D41\u8F6C", icon: "repeat" }
    ];
    var SUMMARY_CARD_ICONS = {
      all: "boxes",
      \u5728\u5E93: "archive",
      \u5728\u7528: "badge-check",
      \u501F\u51FA: "redo-2",
      \u62A5\u5E9F: "trash-2",
      anomaly: "triangle-alert"
    };
    var CONFIG_FILE_PATH = "\u5E93\u5B58/\u914D\u7F6E/\u5E93\u5B58\u7CFB\u7EDF\u914D\u7F6E.md";
    module2.exports = {
      CONFIG_FILE_PATH,
      INVENTORY_VIEW_TYPE,
      DEFAULT_SETTINGS,
      ASSET_CATEGORY_OPTIONS,
      ASSET_TYPE_OPTIONS,
      ASSET_STATUS_OPTIONS,
      STATUS_OPTIONS,
      ACTION_OPTIONS,
      PERSON_STATUS_OPTIONS,
      OFFICE_OPTIONS,
      TAB_DEFS,
      SUMMARY_CARD_ICONS
    };
  }
});

// src/utils.js
var require_utils = __commonJS({
  "src/utils.js"(exports2, module2) {
    function todayString() {
      return window.moment().format("YYYY-MM-DD");
    }
    function normalizeFrontmatterValue(value) {
      if (Array.isArray(value)) {
        return value.map((item) => normalizeFrontmatterValue(item)).filter(Boolean).join(", ");
      }
      if (value == null) return "";
      return String(value).replace(/\s*#.*$/, "").trim();
    }
    function parseLinkTarget(value) {
      const text = normalizeFrontmatterValue(value);
      const match = text.match(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/);
      return match ? (match[2] || match[1]).trim() : text;
    }
    function parseFrontmatterFromText(text) {
      const match = text.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
      if (!match) return {};
      const data = {};
      let currentKey = null;
      for (const rawLine of match[1].split("\n")) {
        const line = rawLine.trimEnd();
        if (!line.trim()) continue;
        if (/^\s*-\s+/.test(rawLine) && currentKey) {
          if (!Array.isArray(data[currentKey])) data[currentKey] = [];
          data[currentKey].push(line.replace(/^\s*-\s+/, "").trim());
          continue;
        }
        const idx = line.indexOf(":");
        if (idx === -1) continue;
        const key = line.slice(0, idx).trim();
        const value = line.slice(idx + 1).replace(/\s*#.*$/, "").trim();
        currentKey = value ? null : key;
        data[key] = value || [];
      }
      return data;
    }
    function debounce(fn, ms) {
      let timer = null;
      return function(...args) {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
          timer = null;
          fn.apply(this, args);
        }, ms);
      };
    }
    function formatYamlScalar(value) {
      if (value == null) return '""';
      const s = String(value).trim();
      if (!s) return '""';
      if (/[:#\n[\]{}]|^\s|^\d{4}-\d{2}-\d{2}$/.test(s)) return `"${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
      return s;
    }
    function applyFrontmatterUpdates(text, updates) {
      const match = text.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*(\r?\n?)([\s\S]*)$/);
      if (!match) throw new Error("\u6587\u4EF6\u7F3A\u5C11 YAML frontmatter\uFF08---\uFF09");
      const fmBody = match[1];
      const nlAfter = match[2];
      const rest = match[3];
      const keys = Object.keys(updates).filter((k) => updates[k] !== void 0);
      if (!keys.length) return text;
      const lines = fmBody.split(/\r?\n/);
      const touched = /* @__PURE__ */ new Set();
      const out = lines.map((line) => {
        const idx = line.indexOf(":");
        if (idx === -1) return line;
        const key = line.slice(0, idx).trim();
        if (!keys.includes(key)) return line;
        touched.add(key);
        return `${key}: ${formatYamlScalar(updates[key])}`;
      });
      for (const key of keys) {
        if (!touched.has(key)) out.push(`${key}: ${formatYamlScalar(updates[key])}`);
      }
      return `---
${out.join("\n")}
---${nlAfter}${rest}`;
    }
    module2.exports = {
      todayString,
      normalizeFrontmatterValue,
      parseLinkTarget,
      parseFrontmatterFromText,
      debounce,
      applyFrontmatterUpdates
    };
  }
});

// src/views/workbench.js
var require_workbench = __commonJS({
  "src/views/workbench.js"(exports2, module2) {
    var { ItemView, setIcon, Notice: Notice2 } = require("obsidian");
    var { INVENTORY_VIEW_TYPE, TAB_DEFS, PERSON_STATUS_OPTIONS, ASSET_STATUS_OPTIONS } = require_constants();
    var InventoryWorkbenchView = class extends ItemView {
      constructor(leaf, plugin) {
        super(leaf);
        this.plugin = plugin;
        this.searchTerm = "";
        this.statusFilter = "all";
        this.personFilter = "all";
        this.currentTab = "assets";
        this.selectedAsset = null;
        this.selectedPerson = null;
        this.statsExpanded = true;
        this.navExpanded = true;
      }
      getViewType() {
        return INVENTORY_VIEW_TYPE;
      }
      getDisplayText() {
        return "\u5E93\u5B58\u7BA1\u7406";
      }
      getIcon() {
        return "package-search";
      }
      async onOpen() {
        await this.render();
      }
      async refresh() {
        this.plugin.invalidateCache();
        await this.render();
      }
      async onClose() {
      }
      async render() {
        const container = this.containerEl.children[1];
        container.empty();
        container.addClass("iv");
        const summary = await this.plugin.collectFullSummary();
        this.renderTopbar(container, summary);
        this.renderShell(container, summary);
      }
      // ─── Top Bar ─────────────────────────────────────────────
      renderTopbar(container, summary) {
        const topbar = container.createDiv({ cls: "iv-topbar" });
        const brand = topbar.createDiv({ cls: "iv-brand" });
        const titleRow = brand.createDiv({ cls: "iv-brand-row" });
        setIcon(titleRow.createSpan({ cls: "iv-brand-icon" }), "package-search");
        titleRow.createEl("h2", { text: "\u5E93\u5B58\u7BA1\u7406", cls: "iv-brand-title" });
        brand.createDiv({
          cls: "iv-brand-sub",
          text: `${summary.assets.length} \u53F0\u8BBE\u5907 \xB7 ${summary.persons.length} \u4F4D\u4EBA\u5458 \xB7 ${summary.transactions.length} \u6761\u6D41\u6C34 \xB7 ${summary.anomalies.length} \u9879\u5F02\u5E38`
        });
        const actions = topbar.createDiv({ cls: "iv-actions" });
        const primary = actions.createDiv({ cls: "iv-actions-primary" });
        const secondary = actions.createDiv({ cls: "iv-actions-secondary" });
        const mkBtn = (parent, label, icon, onClick, isPrimary = false) => {
          const btn = parent.createEl("button", { cls: isPrimary ? "iv-btn iv-btn--primary" : "iv-btn" });
          if (icon) {
            const ic = btn.createSpan({ cls: "iv-btn-icon" });
            setIcon(ic, icon);
          }
          btn.createSpan({ text: label });
          this.registerDomEvent(btn, "click", () => void onClick());
        };
        mkBtn(primary, "\u65B0\u5EFA\u8BBE\u5907", "plus", () => this.plugin.openCreateAssetModal(), true);
        mkBtn(primary, "\u65B0\u589E\u4EBA\u5458", "user-plus", () => this.plugin.openCreatePersonModal(), true);
        mkBtn(secondary, "\u5BFC\u51FA", "download", () => void this._doExport());
        mkBtn(secondary, "\u5BA1\u8BA1", "shield-check", () => void this._doAudit());
        mkBtn(secondary, "\u91CD\u8F7D", "refresh-cw", () => void this.plugin.reloadSelf());
      }
      async _doExport() {
        try {
          await this.plugin.runExport();
        } catch (e) {
          new Notice2(`\u5BFC\u51FA\u5931\u8D25\uFF1A${e.message}`);
        }
      }
      async _doAudit() {
        try {
          await this.plugin.runAudit();
        } catch (e) {
          new Notice2(`\u5BA1\u8BA1\u5931\u8D25\uFF1A${e.message}`);
        }
      }
      // ─── Shell ────────────────────────────────────────────────
      renderShell(container, summary) {
        const shell = container.createDiv({ cls: "iv-shell" });
        if (!this.navExpanded) shell.addClass("iv-shell--collapsed");
        this.renderSidebar(shell.createDiv({ cls: "iv-sidebar" }), summary);
        this.renderWorkspace(shell.createDiv({ cls: "iv-main" }), summary);
        this.renderInspector(shell.createDiv({ cls: "iv-inspector iv-surface" }), summary);
      }
      // ─── Sidebar ─────────────────────────────────────────────
      renderSidebar(container, summary) {
        const dock = container.createDiv({ cls: "iv-sidebar-dock iv-surface" });
        if (!this.navExpanded) dock.addClass("is-collapsed");
        const head = dock.createDiv({ cls: "iv-sidebar-head" });
        const headLeft = head.createDiv({ cls: "iv-sidebar-head-left" });
        headLeft.createSpan({ cls: "iv-sidebar-title iv-sidebar-title--full", text: "\u5BFC\u822A\u4E0E\u7B5B\u9009" });
        headLeft.createSpan({ cls: "iv-sidebar-title iv-sidebar-title--short", text: "\u5BFC\u822A" });
        const colBtn = head.createEl("button", { cls: "iv-collapse-btn", attr: { "aria-label": this.navExpanded ? "\u6536\u8D77\u5BFC\u822A" : "\u5C55\u5F00\u5BFC\u822A" } });
        setIcon(colBtn.createSpan({ cls: "iv-collapse-chevron" }), "chevron-left");
        this.registerDomEvent(colBtn, "click", () => {
          this.navExpanded = !this.navExpanded;
          void this.render();
        });
        const panel = dock.createDiv({ cls: "iv-sidebar-panel" });
        const searchWrap = panel.createDiv({ cls: "iv-search" });
        setIcon(searchWrap.createSpan({ cls: "iv-search-icon" }), "search");
        const input = searchWrap.createEl("input", { type: "search", placeholder: "\u641C\u7D22\u7F16\u53F7\u3001\u540D\u79F0\u3001\u4EBA\u5458\u2026", value: this.searchTerm });
        this.registerDomEvent(input, "input", (e) => {
          this.searchTerm = e.target.value.trim().toLowerCase();
          void this.render();
        });
        if (this.currentTab === "assets") this._renderAssetChips(panel, summary);
        else if (this.currentTab === "people") this._renderPersonChips(panel, summary);
        this._renderQuickNav(panel);
      }
      _renderAssetChips(panel, summary) {
        const block = panel.createDiv({ cls: "iv-sidebar-block" });
        block.createDiv({ cls: "iv-block-label", text: "\u8BBE\u5907\u72B6\u6001" });
        const chips = block.createDiv({ cls: "iv-chip-group" });
        const entries = [
          ["all", "\u5168\u90E8", summary.assets.length],
          ["\u5728\u5E93", "\u5728\u5E93", summary.statusCounts["\u5728\u5E93"] || 0],
          ["\u5728\u7528", "\u5728\u7528", summary.statusCounts["\u5728\u7528"] || 0],
          ["\u501F\u51FA", "\u501F\u51FA", summary.statusCounts["\u501F\u51FA"] || 0],
          ["\u62A5\u5E9F", "\u62A5\u5E9F", summary.statusCounts["\u62A5\u5E9F"] || 0],
          ["anomaly", "\u5F02\u5E38", summary.anomalies.length]
        ];
        for (const [key, label, count] of entries) {
          const chip = chips.createEl("button", { cls: `iv-chip${this.statusFilter === key ? " is-active" : ""}`, text: `${label} ${count}`, attr: { "aria-pressed": this.statusFilter === key ? "true" : "false" } });
          this.registerDomEvent(chip, "click", () => {
            this.statusFilter = key;
            this.selectedAsset = null;
            void this.render();
          });
        }
      }
      _renderPersonChips(panel, summary) {
        const block = panel.createDiv({ cls: "iv-sidebar-block" });
        block.createDiv({ cls: "iv-block-label", text: "\u4EBA\u5458\u72B6\u6001" });
        const chips = block.createDiv({ cls: "iv-chip-group" });
        const pCounts = {};
        for (const p of summary.persons) {
          pCounts[p.status] = (pCounts[p.status] || 0) + 1;
        }
        const entries = [
          ["all", "\u5168\u90E8", summary.persons.length],
          ["\u5728\u804C", "\u5728\u804C", pCounts["\u5728\u804C"] || 0],
          ["\u79BB\u804C", "\u79BB\u804C", pCounts["\u79BB\u804C"] || 0]
        ];
        for (const [key, label, count] of entries) {
          const chip = chips.createEl("button", { cls: `iv-chip${this.personFilter === key ? " is-active" : ""}`, text: `${label} ${count}`, attr: { "aria-pressed": this.personFilter === key ? "true" : "false" } });
          this.registerDomEvent(chip, "click", () => {
            this.personFilter = key;
            this.selectedPerson = null;
            void this.render();
          });
        }
      }
      _renderQuickNav(panel) {
        const block = panel.createDiv({ cls: "iv-sidebar-block" });
        block.createDiv({ cls: "iv-block-label", text: "\u5FEB\u6377\u5165\u53E3" });
        for (const [label, filePath] of [
          ["\u7CFB\u7EDF\u8BBE\u8BA1", "\u5E93\u5B58/\u62A5\u8868/\u5E93\u5B58\u7CFB\u7EDF\u8BBE\u8BA1\u8BF4\u660E.md"],
          ["\u72B6\u6001\u673A\u5B9A\u4E49", "\u5E93\u5B58/\u62A5\u8868/\u5E93\u5B58\u72B6\u6001\u673A\u5B9A\u4E49.md"],
          ["\u5F02\u5E38\u6E05\u5355", "\u5E93\u5B58/\u62A5\u8868/\u5E93\u5B58\u95EE\u9898\u5206\u5E03\u603B\u89C8_20260322.md"]
        ]) {
          const link = block.createDiv({ cls: "iv-nav-link" });
          setIcon(link.createSpan({ cls: "iv-nav-link-icon" }), "file-text");
          link.createSpan({ text: label });
          this.registerDomEvent(link, "click", () => void this.plugin.openVaultPath(filePath));
        }
      }
      // ─── Workspace ───────────────────────────────────────────
      renderWorkspace(container, summary) {
        const tabBar = container.createDiv({ cls: "iv-tab-bar" });
        for (const tab of TAB_DEFS) {
          const tabBtn = tabBar.createEl("button", { cls: `iv-tab${this.currentTab === tab.key ? " is-active" : ""}`, attr: { "aria-pressed": this.currentTab === tab.key ? "true" : "false" } });
          setIcon(tabBtn.createSpan({ cls: "iv-tab-icon" }), tab.icon);
          tabBtn.createSpan({ text: tab.label });
          this.registerDomEvent(tabBtn, "click", () => {
            this.currentTab = tab.key;
            this.searchTerm = "";
            this.selectedAsset = null;
            this.selectedPerson = null;
            void this.render();
          });
        }
        const content = container.createDiv({ cls: "iv-content" });
        if (this.currentTab === "assets") this.renderAssetTab(content, summary);
        else if (this.currentTab === "people") this.renderPersonTab(content, summary);
        else if (this.currentTab === "transactions") this.renderTransactionTab(content, summary);
      }
      // ─── Asset Tab ───────────────────────────────────────────
      filteredAssets(summary) {
        const anomalyPaths = new Set(summary.anomalies.map((a) => a.path));
        return summary.assets.filter((a) => {
          if (this.statusFilter === "anomaly") return anomalyPaths.has(a.path);
          if (this.statusFilter !== "all" && a.status !== this.statusFilter) return false;
          if (!this.searchTerm) return true;
          return [a.assetId, a.name, a.category, a.status, a.currentUser, a.location].join(" ").toLowerCase().includes(this.searchTerm);
        }).slice(0, 80);
      }
      renderAssetTab(container, summary) {
        var _a;
        const items = this.filteredAssets(summary);
        const grid = container.createDiv({ cls: "iv-card-grid" });
        if (!items.length) {
          const empty = grid.createDiv({ cls: "iv-empty" });
          setIcon(empty.createSpan({ cls: "iv-empty-icon" }), "inbox");
          empty.createDiv({ text: "\u6CA1\u6709\u5339\u914D\u7684\u8BBE\u5907" });
          const btn = empty.createEl("button", { text: "\u65B0\u5EFA\u8BBE\u5907", cls: "iv-btn iv-btn--primary iv-btn--sm" });
          this.registerDomEvent(btn, "click", () => this.plugin.openCreateAssetModal());
        } else {
          for (const asset of items) {
            const card = grid.createDiv({ cls: `iv-asset-card${((_a = this.selectedAsset) == null ? void 0 : _a.path) === asset.path ? " is-selected" : ""}` });
            const isLow = asset.isConsumable && asset.quantity <= asset.minQuantity;
            const anomaly = summary.anomalies.find((a) => a.path === asset.path);
            this._renderAssetCard(card, asset, isLow, anomaly);
          }
        }
      }
      _renderAssetCard(card, asset, isLow, anomaly) {
        const header = card.createDiv({ cls: "iv-card-header" });
        const titleEl = header.createDiv({ cls: "iv-card-title" });
        titleEl.createSpan({ cls: "iv-card-id", text: asset.assetId || asset.name || "\u672A\u7F16\u53F7" });
        if (asset.isConsumable) {
          titleEl.createSpan({ cls: "iv-badge iv-badge--\u8017\u6750", text: "\u8017\u6750" });
        }
        header.createSpan({ cls: `iv-badge iv-badge--status iv-badge--${asset.status || "\u672A\u77E5"}`, text: asset.status || "\u672A\u77E5" });
        card.createDiv({ cls: "iv-card-meta", text: asset.category || "" });
        if (asset.isConsumable) {
          const qtyRow = card.createDiv({ cls: "iv-card-qty" });
          qtyRow.createSpan({ cls: isLow ? "iv-qty-num iv-qty-warn" : "iv-qty-num", text: String(asset.quantity) });
          qtyRow.createSpan({ cls: "iv-qty-unit", text: asset.unit || "\u4EF6" });
          if (isLow) qtyRow.createSpan({ cls: "iv-qty-alert", text: "\u26A0 \u4F4E\u4E8E\u9608\u503C" });
        }
        if (asset.currentUser) {
          card.createDiv({ cls: "iv-card-user", text: asset.currentUser });
        }
        if (anomaly) {
          card.createDiv({ cls: "iv-card-anomaly", text: anomaly.detail || anomaly.title });
        }
        const footer = card.createDiv({ cls: "iv-card-footer" });
        if (asset.isConsumable) {
          setIcon(footer.createSpan({ cls: "iv-card-foot-note" }), "info");
          footer.createSpan({ cls: "iv-card-foot-note", text: `\u9608\u503C ${asset.minQuantity}` });
        } else if (asset.status === "\u5728\u5E93") {
          const claimBtn = footer.createEl("button", { cls: "iv-btn iv-btn--primary iv-btn--sm", text: "\u9886\u7528" });
          this.registerDomEvent(claimBtn, "click", (e) => {
            e.stopPropagation();
            void this._openClaimModal(asset);
          });
        } else if (asset.status === "\u5728\u7528" || asset.status === "\u501F\u51FA") {
          const retBtn = footer.createEl("button", { cls: "iv-btn iv-btn--sm", text: "\u5F52\u8FD8" });
          this.registerDomEvent(retBtn, "click", (e) => {
            e.stopPropagation();
            void this._doReturn(asset);
          });
        }
        const openBtn = footer.createEl("button", { cls: "iv-btn iv-btn--ghost iv-btn--sm", text: "\u67E5\u770B\u8BE6\u60C5" });
        this.registerDomEvent(openBtn, "click", (e) => {
          e.stopPropagation();
          void this.plugin.openVaultPath(asset.path);
        });
        this.registerDomEvent(card, "click", () => {
          var _a;
          this.selectedAsset = ((_a = this.selectedAsset) == null ? void 0 : _a.path) === asset.path ? null : asset;
          this.selectedPerson = null;
          void this.render();
        });
      }
      // ─── Person Tab ──────────────────────────────────────────
      filteredPersons(summary) {
        return summary.persons.filter((p) => {
          if (this.personFilter !== "all" && p.status !== this.personFilter) return false;
          if (!this.searchTerm) return true;
          return [p.name, p.department, p.employeeId, p.office, p.contractEntity, p.position].join(" ").toLowerCase().includes(this.searchTerm);
        }).slice(0, 80);
      }
      renderPersonTab(container, summary) {
        var _a;
        const items = this.filteredPersons(summary);
        const grid = container.createDiv({ cls: "iv-card-grid" });
        if (!items.length) {
          const empty = grid.createDiv({ cls: "iv-empty" });
          setIcon(empty.createSpan({ cls: "iv-empty-icon" }), "users");
          empty.createDiv({ text: "\u6CA1\u6709\u5339\u914D\u7684\u4EBA\u5458" });
          const btn = empty.createEl("button", { text: "\u65B0\u589E\u4EBA\u5458", cls: "iv-btn iv-btn--primary iv-btn--sm" });
          this.registerDomEvent(btn, "click", () => this.plugin.openCreatePersonModal());
        } else {
          for (const person of items) {
            const card = grid.createDiv({ cls: `iv-person-card${((_a = this.selectedPerson) == null ? void 0 : _a.path) === person.path ? " is-selected" : ""}` });
            const deviceCount = this._personDeviceCount(person, summary.assets);
            this._renderPersonCard(card, person, deviceCount, summary);
          }
        }
      }
      _renderPersonCard(card, person, deviceCount, summary) {
        const header = card.createDiv({ cls: "iv-card-header" });
        header.createDiv({ cls: "iv-card-title", text: person.name });
        header.createSpan({ cls: `iv-badge iv-badge--person iv-badge--${person.status}`, text: person.status });
        card.createDiv({ cls: "iv-card-meta", text: [person.department, person.office, person.contractEntity].filter(Boolean).join(" \xB7 ") });
        const infoRow = card.createDiv({ cls: "iv-card-info-row" });
        if (person.employeeId) infoRow.createSpan({ cls: "iv-card-info-chip", text: `\u5DE5\u53F7 ${person.employeeId}` });
        if (person.position) infoRow.createSpan({ cls: "iv-card-info-chip", text: person.position });
        if (deviceCount > 0) infoRow.createSpan({ cls: "iv-card-info-chip iv-chip--primary", text: `${deviceCount} \u53F0\u8BBE\u5907` });
        if (person.status === "\u79BB\u804C") {
          card.createDiv({ cls: "iv-card-anomaly", text: "\u26A0 \u5DF2\u79BB\u804C\uFF0C\u8BF7\u786E\u8BA4\u540D\u4E0B\u8BBE\u5907\u662F\u5426\u5DF2\u5168\u90E8\u5F52\u8FD8" });
        }
        const footer = card.createDiv({ cls: "iv-card-footer" });
        const openBtn = footer.createEl("button", { cls: "iv-btn iv-btn--ghost iv-btn--sm", text: "\u67E5\u770B\u8BE6\u60C5" });
        this.registerDomEvent(openBtn, "click", (e) => {
          e.stopPropagation();
          void this.plugin.openVaultPath(person.path);
        });
        this.registerDomEvent(card, "click", () => {
          var _a;
          this.selectedPerson = ((_a = this.selectedPerson) == null ? void 0 : _a.path) === person.path ? null : person;
          this.selectedAsset = null;
          void this.render();
        });
      }
      _personDeviceCount(person, assets) {
        const stem = person.fileStem.toLowerCase();
        const name = person.name.toLowerCase();
        return assets.filter((a) => {
          if (!a.currentUser) return false;
          const u = a.currentUser.toLowerCase();
          return u === stem || u.includes(stem) || u.includes(name) || stem.includes(u);
        }).length;
      }
      // ─── Transaction Tab ─────────────────────────────────────
      renderTransactionTab(container, summary) {
        const section = container.createDiv({ cls: "iv-section iv-surface" });
        section.createDiv({ cls: "iv-section-header" }).createEl("h3", { text: "\u6D41\u8F6C\u5386\u53F2", cls: "iv-section-title" });
        const filtered = summary.transactions.filter((tx) => {
          if (!this.searchTerm) return true;
          return [tx.date, tx.action, tx.user, tx.operator, tx.remark, ...tx.assets].join(" ").toLowerCase().includes(this.searchTerm);
        }).slice(0, 60);
        const list = section.createDiv({ cls: "iv-list" });
        if (!filtered.length) {
          const empty = list.createDiv({ cls: "iv-empty" });
          setIcon(empty.createSpan({ cls: "iv-empty-icon" }), "repeat");
          empty.createDiv({ text: "\u6682\u65E0\u6D41\u8F6C\u8BB0\u5F55" });
        } else {
          for (const tx of filtered) {
            const row = list.createDiv({ cls: "iv-row" });
            const top = row.createDiv({ cls: "iv-row-top" });
            const badge = top.createSpan({ cls: `iv-badge iv-badge--${tx.action}`, text: tx.action || "\u672A\u5B9A\u4E49" });
            top.createEl("strong", { cls: "iv-row-title", text: tx.date || "-" });
            top.createSpan({ cls: "iv-badge", text: tx.user || "\u672A\u6307\u5B9A\u4EBA\u5458" });
            const meta = row.createDiv({ cls: "iv-row-meta" });
            if (tx.assets.length) meta.createSpan({ text: `\u8BBE\u5907\uFF1A${tx.assets.join("\u3001")}` });
            if (tx.operator) meta.createSpan({ text: `\u529E\u7406\uFF1A${tx.operator}` });
            if (tx.remark) meta.createSpan({ text: tx.remark });
            this.registerDomEvent(row, "click", () => void this.plugin.openVaultPath(tx.path));
          }
        }
      }
      // ─── Inspector ───────────────────────────────────────────
      renderInspector(container, summary) {
        if (this.currentTab === "assets") {
          if (this.selectedAsset) this._renderAssetInspector(container, summary);
          else this._renderTipsInspector(container);
        } else if (this.currentTab === "people") {
          if (this.selectedPerson) this._renderPersonInspector(container, summary);
          else this._renderTipsInspector(container);
        } else {
          this._renderTxTips(container);
        }
      }
      // ── Asset Inspector ──
      _renderAssetInspector(container, summary) {
        const asset = this.selectedAsset;
        container.createEl("h3", { text: asset.assetId || asset.name, cls: "iv-section-title" });
        const info = container.createDiv({ cls: "iv-info-grid" });
        const addRow = (label, value) => {
          if (!value) return;
          info.createDiv({ cls: "iv-info-label", text: label });
          info.createDiv({ cls: "iv-info-value", text: value });
        };
        addRow("\u54C1\u7C7B", asset.category);
        addRow("\u72B6\u6001", asset.status);
        addRow("\u4F7F\u7528\u4EBA", asset.currentUser || "\u2014");
        addRow("\u4F4D\u7F6E", asset.location);
        addRow("\u5E8F\u5217\u53F7", asset.serialNo || "\u2014");
        addRow("\u4F9B\u5E94\u5546", asset.vendor || "\u2014");
        addRow("\u91C7\u8D2D\u65E5\u671F", asset.purchaseDate || "\u2014");
        addRow("\u4FDD\u4FEE\u5230\u671F", asset.warrantyUntil || "\u2014");
        addRow("\u4EF7\u683C", asset.price || "\u2014");
        if (asset.isConsumable) {
          addRow("\u5B58\u91CF", `${asset.quantity}\uFF08\u9608\u503C ${asset.minQuantity}\uFF09`);
        }
        addRow("\u91C7\u8D2D\u5355\u636E", asset.bundle || "\u2014");
        const anomaly = summary.anomalies.find((a) => a.path === asset.path);
        if (anomaly) {
          const warnRow = container.createDiv({ cls: "iv-anomaly-row" });
          warnRow.createSpan({ cls: "iv-anomaly-icon", text: "\u26A0" });
          warnRow.createDiv({ cls: "iv-anomaly-text" }).createSpan({ text: anomaly.detail || anomaly.title });
        }
        const footer = container.createDiv({ cls: "iv-inspector-actions" });
        if (!asset.isConsumable && asset.status === "\u5728\u5E93") {
          const claimBtn = footer.createEl("button", { cls: "iv-btn iv-btn--primary", text: "\u9886\u7528\u8BBE\u5907" });
          this.registerDomEvent(claimBtn, "click", () => void this._openClaimModal(asset));
        }
        if (!asset.isConsumable && (asset.status === "\u5728\u7528" || asset.status === "\u501F\u51FA")) {
          const retBtn = footer.createEl("button", { cls: "iv-btn", text: "\u5F52\u8FD8\u5165\u5E93" });
          this.registerDomEvent(retBtn, "click", () => void this._doReturn(asset));
        }
        const openBtn = footer.createEl("button", { cls: "iv-btn iv-btn--ghost", text: "\u6253\u5F00\u8BBE\u5907\u6587\u4EF6" });
        this.registerDomEvent(openBtn, "click", () => void this.plugin.openVaultPath(asset.path));
      }
      // ── Person Inspector ──
      async _renderPersonInspector(container, summary) {
        const person = this.selectedPerson;
        container.createEl("h3", { text: person.name, cls: "iv-section-title" });
        const headMeta = container.createDiv({ cls: "iv-person-head-meta" });
        if (person.department) headMeta.createSpan({ text: `\u90E8\u95E8 ${person.department}` });
        if (person.employeeId) headMeta.createSpan({ text: ` \xB7 \u5DE5\u53F7 ${person.employeeId}` });
        const infoTop = container.createDiv({ cls: "iv-info-grid iv-info-grid--compact" });
        const addTop = (label, value) => {
          if (!value) return;
          infoTop.createDiv({ cls: "iv-info-label", text: label });
          infoTop.createDiv({ cls: "iv-info-value", text: value });
        };
        addTop("\u529E\u516C\u5730", person.office);
        addTop("\u5408\u540C\u4E3B\u4F53", person.contractEntity);
        const editBlock = container.createDiv({ cls: "iv-person-form" });
        editBlock.createDiv({ cls: "iv-block-label", text: "\u72B6\u6001\u4E0E\u804C\u4F4D" });
        const statusRow = editBlock.createDiv({ cls: "iv-form-row" });
        statusRow.createEl("label", { cls: "iv-form-label", text: "\u72B6\u6001", attr: { for: "iv-p-status" } });
        const statusSel = statusRow.createEl("select", { cls: "iv-input", id: "iv-p-status" });
        if (person.status && !PERSON_STATUS_OPTIONS.includes(person.status)) {
          statusSel.createEl("option", { text: person.status, value: person.status });
        }
        for (const s of PERSON_STATUS_OPTIONS) statusSel.createEl("option", { text: s, value: s });
        statusSel.value = person.status || "\u5728\u804C";
        const posRow = editBlock.createDiv({ cls: "iv-form-row" });
        posRow.createEl("label", { cls: "iv-form-label", text: "\u804C\u4F4D", attr: { for: "iv-p-position" } });
        const posInput = posRow.createEl("input", { cls: "iv-input", type: "text", attr: { id: "iv-p-position", placeholder: "\u9AD8\u7EA7\u5DE5\u7A0B\u5E08\uFF08\u9009\u586B\uFF09", value: person.position || "" } });
        const saveBtn = editBlock.createEl("button", { text: "\u4FDD\u5B58\u4FEE\u6539", cls: "iv-btn iv-btn--primary iv-btn--sm" });
        this.registerDomEvent(saveBtn, "click", async () => {
          const unreturned = this.plugin.checkPersonDevices(person.path, summary.assets);
          const willLeave = statusSel.value === "\u79BB\u804C" && person.status !== "\u79BB\u804C";
          if (willLeave && unreturned.length > 0) {
            const names = unreturned.map((a) => a.assetId || a.name).join("\u3001");
            if (!confirm(`\u300C${person.name}\u300D\u5373\u5C06\u6807\u8BB0\u4E3A\u79BB\u804C\uFF0C\u4F46\u4ECD\u6709 ${unreturned.length} \u53F0\u8BBE\u5907\u672A\u5F52\u8FD8\uFF1A${names}

\u786E\u8BA4\u7EE7\u7EED\u4FDD\u5B58\uFF1F`)) return;
          }
          saveBtn.disabled = true;
          try {
            const newPath = await this.plugin.updatePersonFields(person.path, {
              status: statusSel.value,
              position: posInput.value
            });
            this.selectedPerson = { ...person, path: newPath, status: statusSel.value, position: posInput.value.trim() };
            await this.render();
          } catch (e) {
            new Notice2(e.message || String(e));
          } finally {
            saveBtn.disabled = false;
          }
        });
        const myAssets = summary.assets.filter((a) => this._personMatches(a.currentUser, person));
        container.createEl("h4", { text: `\u540D\u4E0B\u8BBE\u5907\uFF08${myAssets.length}\uFF09`, cls: "iv-sub-title" });
        const devList = container.createDiv({ cls: "iv-list" });
        if (!myAssets.length) {
          devList.createDiv({ cls: "iv-empty iv-empty--compact", text: "\u6682\u65E0\u8BBE\u5907" });
        } else {
          for (const d of myAssets.slice(0, 10)) {
            const row = devList.createDiv({ cls: "iv-row iv-row--compact" });
            row.createDiv({ cls: "iv-row-top" }).createEl("strong", { text: d.assetId || d.name });
            row.createSpan({ cls: `iv-badge iv-badge--status iv-badge--${d.status}`, text: d.status });
            row.createDiv({ cls: "iv-row-meta" }).createSpan({ text: d.category || "" });
            this.registerDomEvent(row, "click", () => void this.plugin.openVaultPath(d.path));
          }
        }
        container.createEl("h4", { text: "\u6D41\u8F6C\u8BB0\u5F55", cls: "iv-sub-title" });
        const txList = container.createDiv({ cls: "iv-list" });
        const myTxs = summary.transactions.filter((tx) => this._personMatches(tx.user, person)).slice(0, 8);
        if (!myTxs.length) {
          txList.createDiv({ cls: "iv-empty iv-empty--compact", text: "\u6682\u65E0\u6D41\u8F6C\u8BB0\u5F55" });
        } else {
          for (const tx of myTxs) {
            const row = txList.createDiv({ cls: "iv-row iv-row--compact" });
            row.createDiv({ cls: "iv-row-top" }).createEl("strong", { text: `${tx.date} \xB7 ${tx.action}` });
            if (tx.assets.length) row.createSpan({ cls: "iv-badge", text: tx.assets.join("\u3001") });
            this.registerDomEvent(row, "click", () => void this.plugin.openVaultPath(tx.path));
          }
        }
        const openBtn = container.createEl("button", { text: "\u6253\u5F00\u4EBA\u5458\u6587\u4EF6", cls: "iv-btn iv-btn--primary iv-btn--sm iv-inspector-action" });
        this.registerDomEvent(openBtn, "click", () => void this.plugin.openVaultPath(person.path));
      }
      _personMatches(currentUserField, person) {
        if (!currentUserField || !person) return false;
        const u = currentUserField.toLowerCase();
        const stem = (person.fileStem || "").toLowerCase();
        const name = (person.name || "").toLowerCase();
        return u === stem || u.includes(stem) || u.includes(name) || stem.includes(u);
      }
      // ── Tips ──
      _renderTipsInspector(container) {
        const tips = container.createDiv({ cls: "iv-sidebar-block" });
        tips.createDiv({ cls: "iv-block-label", text: "\u64CD\u4F5C\u5EFA\u8BAE" });
        for (const text of [
          "\u70B9\u51FB\u8BBE\u5907\u5361\u7247\u67E5\u770B\u8BE6\u60C5\u5E76\u9886\u7528 / \u5F52\u8FD8",
          "\u79BB\u804C\u524D\u68C0\u67E5\u540D\u4E0B\u8BBE\u5907\u662F\u5426\u5DF2\u5168\u90E8\u5F52\u8FD8",
          "\u8BBE\u5907\u9886\u7528\u540E\u72B6\u6001\u81EA\u52A8\u53D8\u4E3A\u300C\u5728\u7528\u300D",
          "\u70B9\u51FB\u6D41\u8F6C\u5386\u53F2\u53EF\u67E5\u770B\u8BE6\u7EC6\u8BB0\u5F55"
        ]) {
          tips.createDiv({ cls: "iv-tip-line", text });
        }
      }
      _renderTxTips(container) {
        const tips = container.createDiv({ cls: "iv-sidebar-block" });
        tips.createDiv({ cls: "iv-block-label", text: "\u6D41\u8F6C\u8BB0\u5F55\u8BF4\u660E" });
        for (const text of [
          "\u6BCF\u6B21\u9886\u7528 / \u5F52\u8FD8\u81EA\u52A8\u751F\u6210\u6D41\u8F6C\u8BB0\u5F55",
          "\u8BB0\u5F55\u5305\u542B\u8BBE\u5907\u3001\u4F7F\u7528\u4EBA\u3001\u529E\u7406\u4EBA\u4FE1\u606F",
          "\u70B9\u51FB\u4EFB\u610F\u8BB0\u5F55\u53EF\u6253\u5F00\u8BE6\u7EC6\u6587\u4EF6"
        ]) {
          tips.createDiv({ cls: "iv-tip-line", text });
        }
      }
      // ─── Actions ────────────────────────────────────────────
      async _openClaimModal(asset) {
        const summary = await this.plugin.collectFullSummary();
        const freePersons = summary.persons.filter((p) => p.status === "\u5728\u804C");
        const modal = new ClaimModal(this.app, this.plugin, asset, freePersons, async (personPath) => {
          await this.plugin.applyDeviceClaim(asset.path, personPath);
        });
        modal.open();
      }
      async _doReturn(asset) {
        if (!confirm(`\u786E\u8BA4\u5C06\u300C${asset.assetId || asset.name}\u300D\u5F52\u8FD8\u5165\u5E93\uFF1F`)) return;
        try {
          await this.plugin.applyDeviceReturn(asset.path);
        } catch (e) {
          new Notice2(`\u5F52\u8FD8\u5931\u8D25\uFF1A${e.message}`);
        }
      }
    };
    var ClaimModal = class {
      constructor(app, plugin, asset, persons, onClaim) {
        this.app = app;
        this.plugin = plugin;
        this.asset = asset;
        this.persons = persons;
        this.onClaim = onClaim;
        this.overlay = document.createElement("div");
        this.overlay.addClass("iv-modal-overlay");
        this.overlay.onclick = (e) => {
          if (e.target === this.overlay) this.close();
        };
      }
      open() {
        document.body.appendChild(this.overlay);
        this.render();
      }
      close() {
        this.overlay.remove();
      }
      render() {
        this.overlay.empty();
        const dialog = this.overlay.createDiv({ cls: "iv-dialog iv-dialog--sm" });
        dialog.createDiv({ cls: "iv-dialog-title", text: `\u9886\u7528 \u2014 ${this.asset.assetId || this.asset.name}` });
        const info = dialog.createDiv({ cls: "iv-dialog-info" });
        info.createEl("p", { text: `\u54C1\u7C7B\uFF1A${this.asset.category || "\u2014"}` });
        info.createEl("p", { text: `\u4F4D\u7F6E\uFF1A${this.asset.location || "\u2014"}` });
        const label = dialog.createDiv({ cls: "iv-form-label", text: "\u9009\u62E9\u9886\u7528\u4EBA *" });
        const sel = dialog.createEl("select", { cls: "iv-input iv-select" });
        sel.createEl("option", { text: "\u2014 \u8BF7\u9009\u62E9 \u2014", value: "" });
        for (const p of this.persons) {
          sel.createEl("option", { text: `${p.name}\uFF08${p.department}\uFF09`, value: p.path });
        }
        const footer = dialog.createDiv({ cls: "iv-dialog-footer" });
        const cancelBtn = footer.createEl("button", { text: "\u53D6\u6D88", cls: "iv-btn" });
        const confirmBtn = footer.createEl("button", { text: "\u786E\u8BA4\u9886\u7528", cls: "iv-btn iv-btn--primary" });
        cancelBtn.addEventListener("click", () => this.close());
        confirmBtn.addEventListener("click", async () => {
          if (!sel.value) {
            new Notice2("\u8BF7\u9009\u62E9\u9886\u7528\u4EBA");
            return;
          }
          confirmBtn.disabled = true;
          confirmBtn.textContent = "\u5904\u7406\u4E2D\u2026";
          try {
            await this.onClaim(sel.value);
            this.close();
          } catch (e) {
            new Notice2(e.message || "\u9886\u7528\u5931\u8D25");
            confirmBtn.disabled = false;
            confirmBtn.textContent = "\u786E\u8BA4\u9886\u7528";
          }
        });
      }
    };
    module2.exports = InventoryWorkbenchView;
  }
});

// src/settings.js
var require_settings = __commonJS({
  "src/settings.js"(exports2, module2) {
    var { PluginSettingTab, Setting } = require("obsidian");
    var { DEFAULT_SETTINGS } = require_constants();
    var InventorySettingTab = class extends PluginSettingTab {
      constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
      }
      display() {
        const { containerEl } = this;
        containerEl.empty();
        containerEl.createEl("h2", { text: "Inventory Manager \u8BBE\u7F6E" });
        new Setting(containerEl).setName("\u5E93\u5B58\u6839\u76EE\u5F55").setDesc("\u9ED8\u8BA4 \u5E93\u5B58/").addText((t) => t.setValue(this.plugin.settings.inventoryRoot).onChange(async (v) => {
          this.plugin.settings.inventoryRoot = v.trim() || DEFAULT_SETTINGS.inventoryRoot;
          await this.plugin.saveSettings();
        }));
        new Setting(containerEl).setName("\u811A\u672C\u76EE\u5F55").setDesc("\u9ED8\u8BA4 Scripts").addText((t) => t.setValue(this.plugin.settings.scriptsDir).onChange(async (v) => {
          this.plugin.settings.scriptsDir = v.trim() || DEFAULT_SETTINGS.scriptsDir;
          await this.plugin.saveSettings();
        }));
        new Setting(containerEl).setName("Python \u547D\u4EE4").setDesc("\u8C03\u7528\u811A\u672C\u7684\u547D\u4EE4").addText((t) => t.setValue(this.plugin.settings.pythonCommand).onChange(async (v) => {
          this.plugin.settings.pythonCommand = v.trim() || DEFAULT_SETTINGS.pythonCommand;
          await this.plugin.saveSettings();
        }));
        new Setting(containerEl).setName("\u9ED8\u8BA4\u529E\u7406\u4EBA").setDesc("\u65B0\u5EFA\u6D41\u8F6C\u65F6\u9ED8\u8BA4\u586B\u5165").addText((t) => t.setValue(this.plugin.settings.defaultOperator).onChange(async (v) => {
          this.plugin.settings.defaultOperator = v.trim() || DEFAULT_SETTINGS.defaultOperator;
          await this.plugin.saveSettings();
        }));
      }
    };
    module2.exports = InventorySettingTab;
  }
});

// src/modals/base.js
var require_base = __commonJS({
  "src/modals/base.js"(exports2, module2) {
    var { Modal, Notice: Notice2, Setting } = require("obsidian");
    var InventoryBaseModal = class extends Modal {
      constructor(app, plugin, title) {
        super(app);
        this.plugin = plugin;
        this.title = title;
        this.values = {};
      }
      onOpen() {
        const { contentEl } = this;
        contentEl.empty();
        contentEl.addClass("iv-modal");
        contentEl.createEl("h2", { text: this.title, cls: "iv-modal-title" });
      }
      addTextSetting({ name, desc, key, placeholder = "", value = "", required = false }) {
        let inputRef = null;
        new Setting(this.contentEl).setName(name).setDesc(desc || "").addText((text) => {
          inputRef = text;
          text.setPlaceholder(placeholder).setValue(value || "");
          text.onChange((val) => {
            this.values[key] = val.trim();
          });
        });
        this.values[key] = value || "";
        if (required && (inputRef == null ? void 0 : inputRef.inputEl)) inputRef.inputEl.required = true;
      }
      addDropdownSetting({ name, desc, key, options, value }) {
        new Setting(this.contentEl).setName(name).setDesc(desc || "").addDropdown((dropdown) => {
          Object.entries(options).forEach(([v, l]) => dropdown.addOption(v, l));
          dropdown.setValue(value);
          dropdown.onChange((val) => {
            this.values[key] = val;
          });
        });
        this.values[key] = value;
      }
      addDatalistSetting({ name, desc, key, items, placeholder = "", value = "" }) {
        const id = `iv-datalist-${key}-${Date.now()}`;
        new Setting(this.contentEl).setName(name).setDesc(desc || "").addText((text) => {
          text.setPlaceholder(placeholder).setValue(value || "");
          text.inputEl.setAttribute("list", id);
          text.inputEl.addClass("iv-datalist-input");
          text.onChange((val) => {
            this.values[key] = val.trim();
          });
          const dl = document.createElement("datalist");
          dl.id = id;
          for (const item of items) {
            const opt = dl.createEl("option");
            opt.value = item.label;
            opt.setAttribute("data-key", item.value);
          }
          text.inputEl.parentElement.appendChild(dl);
          text.inputEl.addEventListener("change", () => {
            const selected = Array.from(dl.options).find((o) => o.value === text.inputEl.value);
            if (selected) {
              this.values[key] = selected.getAttribute("data-key");
              text.inputEl.value = selected.getAttribute("data-key");
            }
          });
        });
        this.values[key] = value || "";
      }
      addConfigLink(label, onClick) {
        const link = this.contentEl.createDiv({ cls: "iv-modal-config-link" });
        const a = link.createEl("a", { text: label, href: "#" });
        a.addEventListener("click", (e) => {
          e.preventDefault();
          onClick();
        });
      }
      addFooter(onSubmit) {
        const footer = this.contentEl.createDiv({ cls: "iv-modal-footer" });
        const cancel = footer.createEl("button", { text: "\u53D6\u6D88", cls: "iv-btn" });
        const submit = footer.createEl("button", { text: "\u6267\u884C", cls: "iv-btn iv-btn--primary" });
        cancel.addEventListener("click", () => this.close());
        submit.addEventListener("click", async () => {
          submit.disabled = true;
          submit.setText("\u6267\u884C\u4E2D\u2026");
          try {
            await onSubmit(this.values);
            this.close();
          } catch (error) {
            new Notice2(error.message || "\u6267\u884C\u5931\u8D25");
          } finally {
            submit.disabled = false;
            submit.setText("\u6267\u884C");
          }
        });
      }
    };
    module2.exports = InventoryBaseModal;
  }
});

// src/modals/create-asset.js
var require_create_asset = __commonJS({
  "src/modals/create-asset.js"(exports2, module2) {
    var { Setting } = require("obsidian");
    var InventoryBaseModal = require_base();
    var { ASSET_TYPE_OPTIONS, ASSET_CATEGORY_OPTIONS, ASSET_STATUS_OPTIONS } = require_constants();
    var CreateAssetModal = class extends InventoryBaseModal {
      constructor(app, plugin) {
        super(app, plugin, "\u65B0\u5EFA\u8BBE\u5907");
        this.isConsumable = false;
        this.selectedType = null;
        this._typeCards = [];
        this._config = null;
      }
      async onOpen() {
        super.onOpen();
        this._config = await this.plugin.loadConfig();
        this._renderTypeSelector();
        this.addTextSetting({
          name: "\u6807\u9898\uFF08\u6587\u4EF6\u540D\u5C3E\uFF09",
          desc: "\u53EF\u9009\uFF1B\u4E0D\u586B\u5219\u7528\u54C1\u7C7B\u540D",
          key: "title",
          placeholder: "\u5982 ThinkPad X1 Carbon\uFF0C\u7A7A\u5219\u81EA\u52A8\u7528\u54C1\u7C7B\u540D"
        });
        this._dynamicSection = this.contentEl.createDiv({ cls: "iv-dynamic-section" });
        this._selectType("NB");
        this.contentEl.createDiv({
          cls: "iv-modal-note",
          text: "\u7C7B\u578B / \u54C1\u7C7B / \u4F4D\u7F6E \u4E3A\u5FC5\u586B\uFF08\u8017\u6750\u56FA\u5B9A\u5728\u5E93\uFF09\u3002\u8BBE\u5907\u901A\u8FC7\u300C\u9886\u7528\u300D\u6D41\u7A0B\u5206\u914D\u4F7F\u7528\u4EBA\uFF0C\u65E0\u9700\u5728\u6B64\u586B\u5199\u3002"
        });
        this.addFooter(async (vals) => {
          const type = this.isConsumable ? "\u8017\u6750" : (vals.type || this.selectedType || "").trim();
          if (!type) throw new Error("\u8BF7\u9009\u62E9\u8BBE\u5907\u7C7B\u578B");
          const reqKeys = this.isConsumable ? ["category", "location"] : ["category", "location"];
          for (const k of reqKeys) {
            if (!vals[k]) throw new Error(`${k} \u4E3A\u5FC5\u586B\u9879`);
          }
          const title = vals.title || vals.category;
          const status = this.isConsumable ? "\u5728\u5E93" : vals.status || "\u5728\u5E93";
          const args = [
            "--type",
            type,
            "--title",
            title,
            "--category",
            vals.category,
            "--status",
            status,
            "--location",
            vals.location,
            "--purchase-date",
            vals.purchaseDate || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
          ];
          const optMap = {
            user: "--user",
            serialNo: "--serial-no",
            vendor: "--vendor",
            warrantyUntil: "--warranty-until",
            price: "--price",
            bundle: "--bundle",
            remark: "--remark"
          };
          if (this.isConsumable) {
            const qty = parseInt(String(vals.quantity), 10);
            const minQty = parseInt(String(vals.minQuantity), 10);
            args.push("--quantity", String(Number.isFinite(qty) && qty > 0 ? qty : 10));
            args.push("--min-quantity", String(Number.isFinite(minQty) && minQty >= 0 ? minQty : 2));
            args.push("--is-consumable", "true");
          }
          for (const [k, f] of Object.entries(optMap)) {
            if (vals[k]) args.push(f, vals[k]);
          }
          await this.plugin.runScript("create_inventory_asset.py", args);
          new Notice("\u8BBE\u5907\u521B\u5EFA\u6210\u529F");
          this.plugin.invalidateCache();
          await this.plugin.refreshViews();
        });
      }
      _selectType(value) {
        this.selectedType = value;
        this.isConsumable = value === "\u8017\u6750";
        this.values.type = value;
        for (const c of this._typeCards) {
          c.el.toggleClass("is-selected", c.value === value);
        }
        this._dynamicSection.empty();
        this._renderDynamicFields();
      }
      _renderTypeSelector() {
        const row = this.contentEl.createDiv({ cls: "iv-field" });
        row.createDiv({ cls: "iv-field-label" }).createEl("span", { text: "\u8BBE\u5907\u7C7B\u578B *" });
        const grid = row.createDiv({ cls: "iv-type-grid" });
        for (const opt of ASSET_TYPE_OPTIONS) {
          const card = grid.createDiv({ cls: "iv-type-card" });
          card.createDiv({ cls: "iv-type-card-label", text: opt.label });
          this.registerDomEvent(card, "click", () => this._selectType(opt.value));
          this._typeCards.push({ el: card, value: opt.value });
        }
      }
      /** 动态表单项写入 _dynamicSection，并同步 this.values */
      _renderDynamicFields() {
        const config = this._config || { consumableCategories: [] };
        if (!this.isConsumable) {
          new Setting(this._dynamicSection).setName("\u54C1\u7C7B *").addDropdown((dd) => {
            for (const c of ASSET_CATEGORY_OPTIONS) dd.addOption(c, c);
            dd.setValue(this.values.category || ASSET_CATEGORY_OPTIONS[0]);
            dd.onChange((v) => {
              this.values.category = v;
            });
          });
          this.values.category = this.values.category || ASSET_CATEGORY_OPTIONS[0];
          new Setting(this._dynamicSection).setName("\u72B6\u6001 *").addDropdown((dd) => {
            for (const s of ASSET_STATUS_OPTIONS.slice(0, 3)) dd.addOption(s, s);
            dd.setValue(this.values.status || "\u5728\u5E93");
            dd.onChange((v) => {
              this.values.status = v;
            });
          });
          this.values.status = this.values.status || "\u5728\u5E93";
          new Setting(this._dynamicSection).setName("\u4F4D\u7F6E *").addText((t) => {
            t.setPlaceholder("\u5982 16-001\u3001\u4ED3\u5E93A").setValue(this.values.location || "");
            t.onChange((v) => {
              this.values.location = v.trim();
            });
          });
          this.values.location = this.values.location || "";
          new Setting(this._dynamicSection).setName("\u4F7F\u7528\u4EBA").setDesc("\u901A\u8FC7\u300C\u9886\u7528\u300D\u6D41\u7A0B\u5206\u914D\uFF0C\u6B64\u5904\u53EF\u7559\u7A7A").addText((t) => {
            t.setPlaceholder("\u7559\u7A7A").setValue(this.values.user || "");
            t.onChange((v) => {
              this.values.user = v.trim();
            });
          });
          this._renderOptionalFieldsInSection();
        } else {
          const consumableCats = config.consumableCategories && config.consumableCategories.length ? config.consumableCategories : ["\u9F20\u6807\u57AB", "\u952E\u76D8\u819C", "\u5176\u4ED6\u8017\u6750"];
          new Setting(this._dynamicSection).setName("\u8017\u6750\u54C1\u7C7B *").addDropdown((dd) => {
            for (const c of consumableCats) dd.addOption(c, c);
            dd.setValue(this.values.category || consumableCats[0]);
            dd.onChange((v) => {
              this.values.category = v;
            });
          });
          this.values.category = this.values.category || consumableCats[0];
          new Setting(this._dynamicSection).setName("\u5B58\u653E\u4F4D\u7F6E *").addText((t) => {
            t.setPlaceholder("\u5982 \u4ED3\u5E93A\u300116-017").setValue(this.values.location || "");
            t.onChange((v) => {
              this.values.location = v.trim();
            });
          });
          this.values.location = this.values.location || "";
          new Setting(this._dynamicSection).setName("\u521D\u59CB\u5B58\u91CF *").addText((t) => {
            t.setPlaceholder("\u6574\u6570\uFF0C\u9ED8\u8BA4 10").setValue(this.values.quantity || "10");
            t.onChange((v) => {
              this.values.quantity = v.trim();
            });
          });
          this.values.quantity = this.values.quantity || "10";
          new Setting(this._dynamicSection).setName("\u5B58\u91CF\u9884\u8B66\u9608\u503C").addText((t) => {
            t.setPlaceholder("\u9ED8\u8BA4 2").setValue(this.values.minQuantity || "2");
            t.onChange((v) => {
              this.values.minQuantity = v.trim();
            });
          });
          this.values.minQuantity = this.values.minQuantity || "2";
          this._addTextSettingInSection("\u91C7\u8D2D\u65E5\u671F", "purchaseDate", "YYYY-MM-DD");
          this._addTextSettingInSection("\u4F9B\u5E94\u5546", "vendor", "\u53EF\u9009");
          this._addTextSettingInSection("\u5907\u6CE8", "remark", "\u53EF\u9009");
        }
      }
      _addTextSettingInSection(name, key, placeholder) {
        new Setting(this._dynamicSection).setName(name).addText((t) => {
          t.setPlaceholder(placeholder).setValue(this.values[key] || "");
          t.onChange((v) => {
            this.values[key] = v.trim();
          });
        });
      }
      _renderOptionalFieldsInSection() {
        this._addTextSettingInSection("\u91C7\u8D2D\u65E5\u671F", "purchaseDate", "YYYY-MM-DD");
        this._addTextSettingInSection("\u5E8F\u5217\u53F7", "serialNo", "\u53EF\u9009");
        this._addTextSettingInSection("\u4FDD\u4FEE\u5230\u671F", "warrantyUntil", "YYYY-MM-DD");
        this._addTextSettingInSection("\u91C7\u8D2D\u4EF7\u683C", "price", "\u5982 8000");
        this._addTextSettingInSection("\u4F9B\u5E94\u5546", "vendor", "\u53EF\u9009");
        this._addTextSettingInSection("\u6240\u5C5E\u5957\u7CFB", "bundle", "\u53EF\u9009");
        this._addTextSettingInSection("\u5907\u6CE8", "remark", "\u53EF\u9009");
      }
    };
    module2.exports = CreateAssetModal;
  }
});

// src/modals/transaction.js
var require_transaction = __commonJS({
  "src/modals/transaction.js"(exports2, module2) {
    var InventoryBaseModal = require_base();
    var { ACTION_OPTIONS } = require_constants();
    var { todayString } = require_utils();
    var TransactionModal = class extends InventoryBaseModal {
      constructor(app, plugin) {
        super(app, plugin, "\u65B0\u589E\u5E93\u5B58\u6D41\u8F6C");
      }
      async onOpen() {
        super.onOpen();
        const [config, locations] = await Promise.all([
          this.plugin.loadConfig(),
          this.plugin.loadLocations()
        ]);
        this.addTextSetting({ name: "\u8BBE\u5907", desc: "\u8D44\u4EA7\u7F16\u53F7\u6216\u8BBE\u5907\u6587\u4EF6\u540D", key: "asset", placeholder: "(SZ)03NB2026008", required: true });
        this.addDropdownSetting({
          name: "\u52A8\u4F5C",
          desc: "\u9075\u5FAA\u72B6\u6001\u673A",
          key: "action",
          options: Object.fromEntries(ACTION_OPTIONS.map((i) => [i, i])),
          value: "\u9886\u7528"
        });
        this.addTextSetting({ name: "\u76F8\u5173\u4EBA\u5458", desc: "\u9886\u7528/\u501F\u7528/\u5F52\u8FD8\u5FC5\u586B", key: "user", placeholder: "\u4EBA\u4E8B\u884C\u653F\u90E8_\u4E8E\u5029\u5029" });
        this.addTextSetting({ name: "\u529E\u7406\u4EBA", key: "operator", value: this.plugin.settings.defaultOperator });
        this.addTextSetting({ name: "\u65E5\u671F", key: "date", value: todayString() });
        if (locations.length) {
          this.addDatalistSetting({
            name: "\u4F4D\u7F6E",
            desc: "\u8F93\u5165\u5EA7\u4F4D\u53F7\u3001\u90E8\u95E8\u6216\u5173\u952E\u8BCD\u7B5B\u9009",
            key: "location",
            items: locations,
            placeholder: "16-020"
          });
          this.addConfigLink("\u7F16\u8F91\u5EA7\u4F4D\u5217\u8868 \u2192", () => this.plugin.openConfigFile());
        } else {
          this.addTextSetting({ name: "\u4F4D\u7F6E", desc: "\u52A8\u4F5C\u540E\u8BBE\u5907\u4F4D\u7F6E", key: "location", placeholder: "\u6DF1\u5733IT\u5E93\u623F" });
        }
        this.addTextSetting({ name: "\u5907\u6CE8", key: "remark", placeholder: "\u6839\u636E\u4EA4\u63A5\u5355\u529E\u7406" });
        this.addTextSetting({ name: "\u7B7E\u5B57\u5355", key: "signFile" });
        this.addTextSetting({ name: "\u63CF\u8FF0", desc: "\u8BB0\u5F55\u6587\u4EF6\u540D\u5C3E\u90E8", key: "description" });
        this.contentEl.createDiv({
          cls: "iv-modal-note",
          text: "\u6B64\u64CD\u4F5C\u8C03\u7528 Scripts/apply_inventory_transaction.py \u521B\u5EFA\u6D41\u6C34\u5E76\u56DE\u5199\u8BBE\u5907\u72B6\u6001\u3002"
        });
        this.addFooter(async (values) => {
          if (!values.asset) throw new Error("\u8BBE\u5907\u4E0D\u80FD\u4E3A\u7A7A");
          await this.plugin.applyTransaction(values);
        });
      }
    };
    module2.exports = TransactionModal;
  }
});

// src/modals/create-person.js
var require_create_person = __commonJS({
  "src/modals/create-person.js"(exports2, module2) {
    var InventoryBaseModal = require_base();
    var { PERSON_STATUS_OPTIONS, OFFICE_OPTIONS } = require_constants();
    var CreatePersonModal = class extends InventoryBaseModal {
      constructor(app, plugin) {
        super(app, plugin, "\u65B0\u589E\u4EBA\u5458");
      }
      async onOpen() {
        super.onOpen();
        const config = await this.plugin.loadConfig();
        this.addTextSetting({ name: "\u59D3\u540D *", desc: "\u7528\u4E8E\u6587\u4EF6\u540D\uFF0C\u5982 \u5F20\u4E09", key: "name", placeholder: "\u5F20\u4E09", required: true });
        if (config.departments && config.departments.length) {
          this.addDropdownSetting({
            name: "\u90E8\u95E8 *",
            desc: "\u7528\u4E8E\u6587\u4EF6\u540D\u524D\u7F00\u548C frontmatter",
            key: "department",
            options: { "": "\u8BF7\u9009\u62E9\u2026", ...Object.fromEntries(config.departments.map((d) => [d, d])) },
            value: ""
          });
        } else {
          this.addTextSetting({ name: "\u90E8\u95E8 *", desc: "\u7528\u4E8E\u6587\u4EF6\u540D\u524D\u7F00\u548C frontmatter", key: "department", placeholder: "\u4FE1\u606F\u6280\u672F\u90E8", required: true });
        }
        this.addConfigLink("\u7F16\u8F91\u90E8\u95E8 / \u5408\u540C\u4E3B\u4F53\u5217\u8868 \u2192", () => this.plugin.openConfigFile());
        this.addTextSetting({ name: "\u5DE5\u53F7 *", desc: "\u5458\u5DE5\u5DE5\u53F7", key: "employeeId", placeholder: "GS10086", required: true });
        this.addDropdownSetting({
          name: "\u72B6\u6001 *",
          key: "status",
          options: Object.fromEntries(PERSON_STATUS_OPTIONS.map((i) => [i, i])),
          value: "\u5728\u804C"
        });
        this.addDropdownSetting({
          name: "\u529E\u516C\u5730 *",
          key: "office",
          options: { "": "\u8BF7\u9009\u62E9\u2026", ...Object.fromEntries(OFFICE_OPTIONS.map((i) => [i, i])) },
          value: ""
        });
        if (config.contractEntities && config.contractEntities.length) {
          this.addDropdownSetting({
            name: "\u5408\u540C\u4E3B\u4F53 *",
            desc: "\u7B7E\u7EA6\u6CD5\u4EBA\u5B9E\u4F53",
            key: "contractEntity",
            options: { "": "\u8BF7\u9009\u62E9\u2026", ...Object.fromEntries(config.contractEntities.map((e) => [e, e])) },
            value: ""
          });
        } else {
          this.addTextSetting({ name: "\u5408\u540C\u4E3B\u4F53 *", desc: "\u7B7E\u7EA6\u6CD5\u4EBA\u5B9E\u4F53", key: "contractEntity", placeholder: "\u56FD\u4FE1\u8BC1\u5238(\u9999\u6E2F)", required: true });
        }
        this.addTextSetting({ name: "\u804C\u4F4D", desc: "\u9009\u586B", key: "position", placeholder: "\u9AD8\u7EA7\u5DE5\u7A0B\u5E08\uFF08\u9009\u586B\uFF09" });
        this.contentEl.createDiv({
          cls: "iv-modal-note",
          text: "\u6B64\u64CD\u4F5C\u8C03\u7528 Scripts/create_inventory_person.py \u521B\u5EFA\u4EBA\u5458\u6863\u6848\u3002"
        });
        this.addFooter(async (values) => {
          const req = ["name", "department", "employeeId", "office", "contractEntity"];
          for (const k of req) {
            if (!values[k]) throw new Error(`${k} \u4E3A\u5FC5\u586B\u9879`);
          }
          await this.plugin.createPerson(values);
        });
      }
    };
    module2.exports = CreatePersonModal;
  }
});

// src/plugin.js
var require_plugin = __commonJS({
  "src/plugin.js"(exports2, module2) {
    var { Plugin, TFile, Notice: Notice2 } = require("obsidian");
    var { execFile } = require("node:child_process");
    var path = require("node:path");
    var { INVENTORY_VIEW_TYPE, DEFAULT_SETTINGS, CONFIG_FILE_PATH } = require_constants();
    var { todayString, normalizeFrontmatterValue, parseLinkTarget, parseFrontmatterFromText, debounce, applyFrontmatterUpdates } = require_utils();
    var InventoryWorkbenchView = require_workbench();
    var InventorySettingTab = require_settings();
    var CreateAssetModal = require_create_asset();
    var TransactionModal = require_transaction();
    var CreatePersonModal = require_create_person();
    var InventoryManagerPlugin = class extends Plugin {
      async onload() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
        this._cache = null;
        this._cacheTime = 0;
        this._configCache = null;
        this.addSettingTab(new InventorySettingTab(this.app, this));
        this.registerView(INVENTORY_VIEW_TYPE, (leaf) => new InventoryWorkbenchView(leaf, this));
        this.addCommand({ id: "inventory-manager-open-workbench", name: "\u5E93\u5B58\uFF1A\u6253\u5F00\u5DE5\u4F5C\u53F0", callback: () => void this.activateWorkbench() });
        this.addCommand({ id: "inventory-manager-create-asset", name: "\u5E93\u5B58\uFF1A\u65B0\u5EFA\u8BBE\u5907", callback: () => this.openCreateAssetModal() });
        this.addCommand({ id: "inventory-manager-apply-transaction", name: "\u5E93\u5B58\uFF1A\u65B0\u589E\u6D41\u8F6C", callback: () => this.openTransactionModal() });
        this.addCommand({ id: "inventory-manager-create-person", name: "\u5E93\u5B58\uFF1A\u65B0\u589E\u4EBA\u5458", callback: () => this.openCreatePersonModal() });
        this.addCommand({ id: "inventory-manager-run-audit", name: "\u5E93\u5B58\uFF1A\u8FD0\u884C\u5BA1\u8BA1", callback: () => void this.runAudit() });
        this.addCommand({ id: "inventory-manager-run-export", name: "\u5E93\u5B58\uFF1A\u5BFC\u51FA\u5E93\u5B58", callback: () => void this.runExport() });
        this.addCommand({ id: "inventory-manager-reload-self", name: "\u5E93\u5B58\uFF1A\u91CD\u8F7D\u63D2\u4EF6", callback: () => void this.reloadSelf() });
        const debouncedRefresh = debounce(() => void this.refreshViews(), 500);
        const onVaultChange = (file) => {
          if (file.path.startsWith(`${this.settings.inventoryRoot}/`)) debouncedRefresh();
        };
        this.registerEvent(this.app.vault.on("modify", onVaultChange));
        this.registerEvent(this.app.vault.on("create", onVaultChange));
        this.registerEvent(this.app.vault.on("delete", onVaultChange));
      }
      invalidateCache() {
        this._cache = null;
        this._cacheTime = 0;
        this._configCache = null;
        this._locationsCache = null;
      }
      async saveSettings() {
        await this.saveData(this.settings);
        this.invalidateCache();
        await this.refreshViews();
      }
      async activateWorkbench() {
        const existing = this.app.workspace.getLeavesOfType(INVENTORY_VIEW_TYPE);
        if (existing.length) {
          this.app.workspace.revealLeaf(existing[0]);
          return;
        }
        const leaf = this.app.workspace.getLeaf("tab");
        await leaf.setViewState({ type: INVENTORY_VIEW_TYPE, active: true });
        this.app.workspace.revealLeaf(leaf);
      }
      openCreateAssetModal() {
        new CreateAssetModal(this.app, this).open();
      }
      openTransactionModal() {
        new TransactionModal(this.app, this).open();
      }
      openCreatePersonModal() {
        new CreatePersonModal(this.app, this).open();
      }
      async refreshViews() {
        for (const leaf of this.app.workspace.getLeavesOfType(INVENTORY_VIEW_TYPE)) {
          if (leaf.view instanceof InventoryWorkbenchView) await leaf.view.refresh();
        }
      }
      // ─── Config ───────────────────────────────────────────────
      async loadConfig() {
        if (this._configCache) return this._configCache;
        const file = this.app.vault.getAbstractFileByPath(CONFIG_FILE_PATH);
        const fallback = { departments: [], contractEntities: [], consumableCategories: [] };
        if (!file) {
          this._configCache = fallback;
          return fallback;
        }
        const text = await this.app.vault.cachedRead(file);
        const sections = this._parseMarkdownLists(text);
        this._configCache = {
          departments: sections["\u90E8\u95E8\u5217\u8868"] || [],
          contractEntities: sections["\u5408\u540C\u4E3B\u4F53\u5217\u8868"] || [],
          consumableCategories: sections["\u8017\u6750\u54C1\u7C7B\u5217\u8868"] || []
        };
        return this._configCache;
      }
      _parseMarkdownLists(text) {
        const sections = {};
        let current = null;
        for (const line of text.split("\n")) {
          const heading = line.match(/^#{2,3}\s+(.+)/);
          if (heading) {
            current = heading[1].trim();
            sections[current] = [];
            continue;
          }
          if (current && /^\s*-\s+/.test(line)) {
            const value = line.replace(/^\s*-\s+/, "").trim();
            if (value) sections[current].push(value);
          }
        }
        return sections;
      }
      async loadLocations() {
        if (this._locationsCache) return this._locationsCache;
        const file = this.app.vault.getAbstractFileByPath(CONFIG_FILE_PATH);
        if (!file) {
          this._locationsCache = [];
          return [];
        }
        const text = await this.app.vault.cachedRead(file);
        const locations = [];
        for (const line of text.split("\n")) {
          const m = line.match(/^\|\s*([^|]+?)\s*\|\s*([^|]*?)\s*\|\s*([^|]*?)\s*\|\s*([^|]*?)\s*\|/);
          if (!m) continue;
          const seat = m[1].trim();
          if (!seat || seat === "\u5EA7\u4F4D\u7F16\u53F7" || seat.startsWith("--")) continue;
          const dept = m[2].trim();
          const pos = m[3].trim();
          const note = m[4].trim();
          let label = seat;
          if (dept) label += ` \xB7 ${dept}`;
          if (pos) label += ` \xB7 ${pos}`;
          if (note) label += ` (${note})`;
          locations.push({ value: seat, label });
        }
        this._locationsCache = locations;
        return locations;
      }
      openConfigFile() {
        void this.openVaultPath(CONFIG_FILE_PATH);
      }
      // ─── Script Runner ───────────────────────────────────────
      getVaultBasePath() {
        const adapter = this.app.vault.adapter;
        if (typeof adapter.getBasePath === "function") return adapter.getBasePath();
        throw new Error("\u5F53\u524D vault adapter \u4E0D\u652F\u6301\u672C\u5730\u811A\u672C\u8C03\u7528");
      }
      getScriptPath(name) {
        return path.join(this.getVaultBasePath(), this.settings.scriptsDir, name);
      }
      runScript(scriptName, args = []) {
        const python = this.settings.pythonCommand || DEFAULT_SETTINGS.pythonCommand;
        const scriptPath = this.getScriptPath(scriptName);
        const fullArgs = [scriptPath, "--vault", this.getVaultBasePath(), ...args];
        return new Promise((resolve, reject) => {
          execFile(python, fullArgs, { cwd: this.getVaultBasePath() }, (error, stdout, stderr) => {
            if (error) {
              reject(new Error((stderr || stdout || error.message).trim()));
              return;
            }
            resolve({ stdout: stdout.trim(), stderr: stderr.trim() });
          });
        });
      }
      // ─── Business Actions ────────────────────────────────────
      async previewNextId(type) {
        const result = await this.runScript("next_inventory_id.py", ["--type", type]);
        return result.stdout.trim();
      }
      async createAsset(values) {
        const isConsumable = values.type === "\u8017\u6750";
        const args = [
          "--type",
          values.type || (isConsumable ? "\u8017\u6750" : "NB"),
          "--title",
          values.title || values.category || "",
          "--category",
          values.category || "",
          "--status",
          isConsumable ? "\u5728\u5E93" : values.status || "\u5728\u5E93",
          "--location",
          values.location || "",
          "--purchase-date",
          values.purchaseDate || todayString()
        ];
        const optMap = {
          user: "--user",
          serialNo: "--serial-no",
          vendor: "--vendor",
          warrantyUntil: "--warranty-until",
          price: "--price",
          bundle: "--bundle",
          remark: "--remark"
        };
        for (const [k, f] of Object.entries(optMap)) {
          if (values[k]) args.push(f, values[k]);
        }
        if (isConsumable) {
          const qty = parseInt(String(values.quantity || "10"), 10);
          const minQty = parseInt(String(values.minQuantity || "2"), 10);
          args.push("--quantity", String(qty > 0 ? qty : 10));
          args.push("--min-quantity", String(minQty >= 0 ? minQty : 2));
          args.push("--is-consumable", "true");
        }
        const result = await this.runScript("create_inventory_asset.py", args);
        const createdPath = result.stdout.split("\n").filter(Boolean).at(-1);
        new Notice2("\u8BBE\u5907\u521B\u5EFA\u6210\u529F");
        this.invalidateCache();
        await this.refreshViews();
        if (createdPath) await this.openAbsolutePath(createdPath);
      }
      async applyTransaction(values) {
        const args = [
          "--asset",
          values.asset,
          "--action",
          values.action,
          "--operator",
          values.operator || this.settings.defaultOperator,
          "--date",
          values.date || todayString()
        ];
        const optMap = { user: "--user", location: "--location", remark: "--remark", signFile: "--sign-file", description: "--description" };
        for (const [k, f] of Object.entries(optMap)) {
          if (values[k]) args.push(f, values[k]);
        }
        const result = await this.runScript("apply_inventory_transaction.py", args);
        const lines = result.stdout.split("\n").filter(Boolean);
        new Notice2("\u5E93\u5B58\u6D41\u8F6C\u5DF2\u751F\u6210\u5E76\u56DE\u5199\u8BBE\u5907\u72B6\u6001");
        this.invalidateCache();
        await this.refreshViews();
        if (lines[0]) await this.openAbsolutePath(lines[0]);
      }
      async createPerson(values) {
        const args = ["--name", values.name, "--department", values.department, "--status", values.status];
        const optMap = { employeeId: "--employee-id", office: "--office", contractEntity: "--contract-entity", position: "--position" };
        for (const [k, f] of Object.entries(optMap)) {
          if (values[k]) args.push(f, values[k]);
        }
        const result = await this.runScript("create_inventory_person.py", args);
        const createdPath = result.stdout.split("\n").filter(Boolean).at(-1);
        new Notice2("\u4EBA\u5458\u521B\u5EFA\u6210\u529F");
        this.invalidateCache();
        await this.refreshViews();
        if (createdPath) await this.openAbsolutePath(createdPath);
      }
      /**
       * 更新人员 frontmatter 的 status / position；若与目录约定一致则同步移动到 在职/ 或 离职/。
       * @returns {Promise<string>} 最终 vault 路径（可能因移动而改变）
       */
      async updatePersonFields(vaultPath, { status, position }) {
        const file = this.app.vault.getAbstractFileByPath(vaultPath);
        if (!(file instanceof TFile)) throw new Error("\u627E\u4E0D\u5230\u4EBA\u5458\u6587\u4EF6");
        const updates = {};
        if (status != null && String(status).trim()) updates.status = String(status).trim();
        if (position != null) updates.position = String(position).trim();
        if (!Object.keys(updates).length) return vaultPath;
        let text = await this.app.vault.read(file);
        text = applyFrontmatterUpdates(text, updates);
        await this.app.vault.modify(file, text);
        let targetPath = vaultPath;
        const st = updates.status;
        if (st === "\u79BB\u804C" && vaultPath.includes("/\u4EBA\u5458/\u5728\u804C/")) {
          targetPath = vaultPath.replace("/\u4EBA\u5458/\u5728\u804C/", "/\u4EBA\u5458/\u79BB\u804C/");
        } else if (st === "\u5728\u804C" && vaultPath.includes("/\u4EBA\u5458/\u79BB\u804C/")) {
          targetPath = vaultPath.replace("/\u4EBA\u5458/\u79BB\u804C/", "/\u4EBA\u5458/\u5728\u804C/");
        }
        if (targetPath !== vaultPath) {
          const folder = targetPath.split("/").slice(0, -1).join("/");
          const folderAbs = this.app.vault.getAbstractFileByPath(folder);
          if (!folderAbs) await this.app.vault.createFolder(folder);
          try {
            await this.app.fileManager.renameFile(file, targetPath);
          } catch (e) {
            new Notice2(`frontmatter \u5DF2\u66F4\u65B0\uFF0C\u4F46\u79FB\u52A8\u76EE\u5F55\u5931\u8D25\uFF1A${e.message || e}`);
            this.invalidateCache();
            await this.refreshViews();
            return vaultPath;
          }
        }
        this.invalidateCache();
        await this.refreshViews();
        new Notice2("\u4EBA\u5458\u4FE1\u606F\u5DF2\u4FDD\u5B58");
        return targetPath;
      }
      /**
       * 获取某人员名下的流转记录（按 user 字段模糊匹配）。
       */
      async loadPersonTransactions(personPath) {
        const summary = await this.collectFullSummary();
        const personFile = this.app.vault.getAbstractFileByPath(personPath);
        if (!(personFile instanceof TFile)) return [];
        const personStem = personFile.basename.toLowerCase();
        const personName = normalizeFrontmatterValue(personFile.basename.split("_").slice(1).join("_")).toLowerCase();
        return summary.transactions.filter((tx) => {
          if (!tx.user) return false;
          const u = tx.user.toLowerCase();
          return u === personStem || u.includes(personStem) || u.includes(personName) || personStem.includes(u);
        });
      }
      /**
       * 设备领用：选择人员后分配设备，生成流转记录 + 更新设备 frontmatter。
       * @param {string} assetPath - 设备文件 vault 路径
       * @param {string} personPath - 人员文件 vault 路径
       * @returns {Promise<string>} 生成的流转记录文件路径
       */
      async applyDeviceClaim(assetPath, personPath) {
        const assetFile = this.app.vault.getAbstractFileByPath(assetPath);
        const personFile = this.app.vault.getAbstractFileByPath(personPath);
        if (!(assetFile instanceof TFile)) throw new Error("\u627E\u4E0D\u5230\u8BBE\u5907\u6587\u4EF6");
        if (!(personFile instanceof TFile)) throw new Error("\u627E\u4E0D\u5230\u4EBA\u5458\u6587\u4EF6");
        const personLink = `[[${personFile.basename}]]`;
        const assetLink = `[[${assetFile.basename}]]`;
        const date = todayString();
        const txPath = `${this.settings.inventoryRoot || "\u5E93\u5B58"}/\u8BB0\u5F55/\u8BB0\u5F55_${date}_\u9886\u7528_${personFile.basename}_${assetFile.basename}.md`;
        const txBody = [
          "---",
          "type: transaction",
          "action: \u9886\u7528",
          `user: ${personLink}`,
          `assets: [${assetLink}]`,
          `date: ${date}`,
          "---",
          "",
          "## \u57FA\u672C\u4FE1\u606F",
          `- **\u65E5\u671F**:: ${date}`,
          `- **\u52A8\u4F5C**:: \u9886\u7528`,
          `- **\u9886\u7528\u4EBA\u5458**:: ${personLink}`,
          "",
          "## \u8BBE\u5907\u660E\u7EC6",
          `- ${assetLink}`,
          ""
        ].join("\n");
        await this.app.vault.create(txPath, txBody);
        let assetText = await this.app.vault.read(assetFile);
        const isConsumable = /is_consumable:\s*true/i.test(assetText);
        const updates = {
          status: "\u5728\u7528",
          current_user: personLink,
          current_doc: `[[\u8BB0\u5F55_${date}_\u9886\u7528_${personFile.basename}_${assetFile.basename}]]`
        };
        if (isConsumable) {
          const qtyMatch = assetText.match(/quantity:\s*(\d+)/i) || assetText.match(/consumable_quantity:\s*(\d+)/i);
          if (qtyMatch) {
            const newQty = Math.max(0, parseInt(qtyMatch[1], 10) - 1);
            updates.quantity = String(newQty);
            updates.consumable_quantity = String(newQty);
          }
        }
        assetText = applyFrontmatterUpdates(assetText, updates);
        await this.app.vault.modify(assetFile, assetText);
        this.invalidateCache();
        await this.refreshViews();
        new Notice2(`\u300C${personFile.basename}\u300D\u9886\u7528\u6210\u529F`);
        return txPath;
      }
      /**
       * 设备归还：设备回到库存，生成流转记录 + 清空 current_user。
       * @param {string} assetPath - 设备文件 vault 路径
       */
      async applyDeviceReturn(assetPath) {
        const assetFile = this.app.vault.getAbstractFileByPath(assetPath);
        if (!(assetFile instanceof TFile)) throw new Error("\u627E\u4E0D\u5230\u8BBE\u5907\u6587\u4EF6");
        const date = todayString();
        const currentFm = await this.readFrontmatter(assetFile);
        const prevUser = parseLinkTarget(currentFm.current_user) || "\u672A\u77E5\u4EBA\u5458";
        const assetLink = `[[${assetFile.basename}]]`;
        const personLink = `[[${prevUser}]]`;
        const txPath = `${this.settings.inventoryRoot || "\u5E93\u5B58"}/\u8BB0\u5F55/\u8BB0\u5F55_${date}_\u5F52\u8FD8_${prevUser}_${assetFile.basename}.md`;
        const txBody = [
          "---",
          "type: transaction",
          "action: \u5F52\u8FD8",
          `user: ${personLink}`,
          `assets: [${assetLink}]`,
          `date: ${date}`,
          "---",
          "",
          "## \u57FA\u672C\u4FE1\u606F",
          `- **\u65E5\u671F**:: ${date}`,
          `- **\u52A8\u4F5C**:: \u5F52\u8FD8`,
          `- **\u5F52\u8FD8\u4EBA\u5458**:: ${personLink}`,
          "",
          "## \u8BBE\u5907\u660E\u7EC6",
          `- ${assetLink}`,
          ""
        ].join("\n");
        await this.app.vault.create(txPath, txBody);
        let assetText = await this.app.vault.read(assetFile);
        const updates = {
          status: "\u5728\u5E93",
          current_user: "",
          current_doc: `[[\u8BB0\u5F55_${date}_\u5F52\u8FD8_${prevUser}_${assetFile.basename}]]`
        };
        assetText = applyFrontmatterUpdates(assetText, updates);
        await this.app.vault.modify(assetFile, assetText);
        this.invalidateCache();
        await this.refreshViews();
        new Notice2("\u8BBE\u5907\u5DF2\u5F52\u8FD8\u5165\u5E93");
        return txPath;
      }
      /**
       * 离职前检查：返回该人员名下是否还有未归还的设备。
       */
      checkPersonDevices(personPath, assets) {
        const personFile = this.app.vault.getAbstractFileByPath(personPath);
        if (!(personFile instanceof TFile)) return [];
        const personStem = personFile.basename.toLowerCase();
        const personName = personFile.basename.split("_").slice(1).join("_").toLowerCase();
        return assets.filter((a) => {
          if (!a.currentUser) return false;
          const u = a.currentUser.toLowerCase();
          return u === personStem || u.includes(personStem) || u.includes(personName) || personStem.includes(u);
        });
      }
      async runAudit() {
        const result = await this.runScript("audit_inventory.py", ["--write-report"]);
        const reportLine = result.stdout.split("\n").find((l) => l.startsWith("REPORT	"));
        new Notice2("\u5E93\u5B58\u5BA1\u8BA1\u5B8C\u6210");
        this.invalidateCache();
        await this.refreshViews();
        if (reportLine) await this.openAbsolutePath(reportLine.split("	")[1]);
      }
      async runExport() {
        const result = await this.runScript("export_inventory.py");
        const assetsLine = result.stdout.split("\n").find((l) => l.includes("assets:"));
        new Notice2("\u5E93\u5B58\u5BFC\u51FA\u5B8C\u6210");
        if (assetsLine) await this.openAbsolutePath(assetsLine.split("assets:").pop().trim());
      }
      async reloadSelf() {
        const plugins = this.app.plugins;
        await Promise.resolve(plugins.disablePlugin(this.manifest.id));
        await Promise.resolve(plugins.enablePlugin(this.manifest.id));
        new Notice2("Inventory Manager \u5DF2\u91CD\u8F7D");
      }
      // ─── Data Collection ─────────────────────────────────────
      async collectFullSummary() {
        if (this._cache && Date.now() - this._cacheTime < 2e3) return this._cache;
        const inventoryRoot = this.settings.inventoryRoot || DEFAULT_SETTINGS.inventoryRoot;
        const files = this.app.vault.getMarkdownFiles();
        const assetFiles = files.filter((f) => f.path.startsWith(`${inventoryRoot}/\u8BBE\u5907/`) && f.basename.startsWith("\u8BBE\u5907_"));
        const assets = [];
        const statusCounts = {};
        const anomalies = [];
        for (const file of assetFiles) {
          const fm = await this.readFrontmatter(file);
          const status = normalizeFrontmatterValue(fm.status) || "\u672A\u5B9A\u4E49";
          const currentUser = parseLinkTarget(fm.current_user);
          const isConsumable = String(fm.is_consumable || "").toLowerCase() === "true";
          const quantity = parseInt(String(fm.quantity || fm.consumable_quantity || "1"), 10) || 1;
          const minQuantity = parseInt(String(fm.min_quantity || "1"), 10) || 1;
          const asset = {
            path: file.path,
            name: file.basename.replace(/^设备_/, ""),
            assetId: normalizeFrontmatterValue(fm.asset_id),
            category: normalizeFrontmatterValue(fm.category),
            status,
            currentUser,
            currentDoc: parseLinkTarget(fm.current_doc),
            location: normalizeFrontmatterValue(fm.location),
            isConsumable,
            quantity,
            minQuantity,
            // 设备专属字段
            serialNo: normalizeFrontmatterValue(fm.serial_no),
            vendor: normalizeFrontmatterValue(fm.vendor),
            purchaseDate: normalizeFrontmatterValue(fm.purchase_date),
            warrantyUntil: normalizeFrontmatterValue(fm.warranty_until),
            price: normalizeFrontmatterValue(fm.price),
            bundle: normalizeFrontmatterValue(fm.bundle)
          };
          assets.push(asset);
          statusCounts[status] = (statusCounts[status] || 0) + 1;
          if (!isConsumable) {
            if (status === "\u5728\u5E93" && currentUser)
              anomalies.push({ title: `${asset.assetId || file.basename} \u72B6\u6001\u77DB\u76FE`, detail: "\u72B6\u6001\u4E3A\u5728\u5E93\uFF0C\u4F46\u4ECD\u6709 current_user", path: file.path });
            if ((status === "\u5728\u7528" || status === "\u501F\u51FA") && !currentUser)
              anomalies.push({ title: `${asset.assetId || file.basename} \u7F3A\u4F7F\u7528\u4EBA`, detail: `\u72B6\u6001 ${status}\uFF0C\u4F46 current_user \u4E3A\u7A7A`, path: file.path });
          }
          if (isConsumable && quantity <= minQuantity)
            anomalies.push({ title: `${asset.assetId || file.basename} \u5B58\u91CF\u4E0D\u8DB3`, detail: `\u5F53\u524D\u5B58\u91CF ${quantity}\uFF0C\u4F4E\u4E8E\u9608\u503C ${minQuantity}`, path: file.path });
        }
        const txFiles = files.filter((f) => f.path.startsWith(`${inventoryRoot}/\u8BB0\u5F55/`) && f.basename.startsWith("\u8BB0\u5F55_"));
        const transactions = [];
        for (const file of txFiles) {
          const fm = await this.readFrontmatter(file);
          const rawAssets = Array.isArray(fm.assets) ? fm.assets : fm.assets ? [fm.assets] : [];
          transactions.push({
            path: file.path,
            date: normalizeFrontmatterValue(fm.date),
            action: normalizeFrontmatterValue(fm.action),
            user: parseLinkTarget(fm.user),
            operator: normalizeFrontmatterValue(fm.operator),
            remark: normalizeFrontmatterValue(fm.remark),
            assets: rawAssets.map((i) => parseLinkTarget(i)).filter(Boolean)
          });
        }
        transactions.sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
        assets.sort((a, b) => String(a.assetId || "").localeCompare(String(b.assetId || "")));
        const personFiles = files.filter(
          (f) => f.path.startsWith(`${inventoryRoot}/\u4EBA\u5458/`) && (f.path.includes("/\u5728\u804C/") || f.path.includes("/\u79BB\u804C/")) && f.basename.includes("_")
        );
        const persons = [];
        for (const file of personFiles) {
          const fm = await this.readFrontmatter(file);
          const parts = file.basename.split("_");
          const department = parts.length > 1 ? parts[0] : "";
          const name = parts.length > 1 ? parts.slice(1).join("_") : file.basename;
          const fmDept = normalizeFrontmatterValue(fm.department);
          persons.push({
            path: file.path,
            fileStem: file.basename,
            name,
            department: fmDept && fmDept !== "\u90E8\u95E8" ? fmDept : department,
            employeeId: normalizeFrontmatterValue(fm.employee_id),
            status: normalizeFrontmatterValue(fm.status) || "\u5728\u804C",
            office: normalizeFrontmatterValue(fm.office),
            contractEntity: normalizeFrontmatterValue(fm.contract_entity),
            position: normalizeFrontmatterValue(fm.position)
          });
        }
        persons.sort((a, b) => a.department.localeCompare(b.department) || a.name.localeCompare(b.name));
        const result = { assets, transactions, statusCounts, anomalies, persons };
        this._cache = result;
        this._cacheTime = Date.now();
        return result;
      }
      async readFrontmatter(file) {
        const cache = this.app.metadataCache.getFileCache(file);
        if (cache == null ? void 0 : cache.frontmatter) return cache.frontmatter;
        const text = await this.app.vault.cachedRead(file);
        return parseFrontmatterFromText(text);
      }
      async openVaultPath(vaultPath) {
        const file = this.app.vault.getAbstractFileByPath(vaultPath);
        if (file instanceof TFile) await this.app.workspace.getLeaf("tab").openFile(file);
      }
      async openAbsolutePath(absPath) {
        const basePath = this.getVaultBasePath();
        const vaultPath = path.relative(basePath, absPath).replaceAll(path.sep, "/");
        await this.openVaultPath(vaultPath);
      }
    };
    module2.exports = InventoryManagerPlugin;
  }
});

// src/main.js
module.exports = require_plugin();

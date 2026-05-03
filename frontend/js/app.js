// Anno 117 Mod Manager — pywebview frontend bootstrap.
// Defines the Alpine root component used by index.html.

window.annoApp = function () {
  return {
    // ── State ──────────────────────────────────────────────────────────────
    version: '',
    currentTab: 'activation',
    mods: [],
    selectedModId: null,
    search: '',
    profileName: 'Default',

    // Sidebar tab definitions (icons stay text-glyph for the POC; phase 2 will
    // swap them for the data/ui/4k icon set the Tk version already uses).
    tabs: [
      // Mod-management cluster (left side of the top row)
      { id: 'activation',   label: 'Activation',           img: 'icons/activation.png', group: 'mods' },
      { id: 'browser',      label: 'Mod Browser',          img: 'icons/browser.png',    group: 'mods', disabled: true },
      { id: 'collections',  label: 'Collections',          img: 'icons/collections.png', group: 'mods', disabled: true },
      { id: 'install',      label: 'Installation manuelle', img: 'icons/install.png',   group: 'mods' },
      // Tools / utilities cluster (right side of the top row)
      { id: 'news',         label: 'Actualités',           img: 'icons/news.png',       group: 'tools' },
      { id: 'log',          label: 'Journal du Modloader', img: 'icons/log.png',        group: 'tools' },
      { id: 'tweak',        label: 'Ajustement',           img: 'icons/tweak.png',      group: 'tools' },
      // Settings is intentionally NOT in the top row — it lives on the bottom
      // row as a circular utility button, mirroring annolayouts' gear-icon
      // placement to the left of the search field.
    ],

    // ── Lifecycle ──────────────────────────────────────────────────────────
    async init() {
      // pywebview injects window.pywebview.api asynchronously; wait for it.
      await this.waitForApi();
      const info = await window.pywebview.api.app_info();
      this.version = info.version;
      await this.refreshMods();
    },

    waitForApi() {
      return new Promise((resolve) => {
        if (window.pywebview && window.pywebview.api) return resolve();
        window.addEventListener('pywebviewready', resolve, { once: true });
      });
    },

    // ── Mods ───────────────────────────────────────────────────────────────
    async refreshMods() {
      try {
        this.mods = await window.pywebview.api.list_mods();
      } catch (e) {
        console.error('list_mods failed', e);
        this.mods = [];
      }
    },

    get filteredMods() {
      const q = this.search.trim().toLowerCase();
      if (!q) return this.mods;
      return this.mods.filter((m) =>
        (m.name || '').toLowerCase().includes(q) ||
        (m.category || '').toLowerCase().includes(q)
      );
    },

    get selectedMod() {
      return this.mods.find((m) => m.id === this.selectedModId) || null;
    },

    get activeCount() {
      return this.mods.filter((m) => m.active).length;
    },

    selectMod(id) {
      this.selectedModId = id;
    },

    toggleMod(id) {
      // POC stub — just flips the local flag; real wiring lands in phase 2
      // (writing to active-profile.txt via the Python side).
      const mod = this.mods.find((m) => m.id === id);
      if (mod) mod.active = !mod.active;
    },

    launchGame() {
      // Hooked up in phase 2 (re-uses the Steam URI logic from PR #4).
      console.warn('launchGame: not wired yet (phase 2)');
    },

    // ── Templates ──────────────────────────────────────────────────────────
    activationTemplate() {
      // Returned as a single HTML string and injected via x-html so the POC
      // stays in one file. Phase 2 will split this into Alpine components or
      // a small templating helper; for now it keeps the structure obvious.
      const rows = this.filteredMods.map((m) => {
        const active = m.active ? 'is-on' : '';
        const selected = m.id === this.selectedModId ? 'is-selected' : '';
        const category = m.category || '—';
        const initials = (category || '?').slice(0, 2).toUpperCase();
        return `
          <li class="mod-row ${selected}"
              onclick="annoRoot().selectMod('${m.id}')">
            <span class="mod-row__check ${active}"
                  onclick="event.stopPropagation(); annoRoot().toggleMod('${m.id}')"></span>
            <span class="mod-row__medallion">${initials}</span>
            <div>
              <div class="mod-row__name">${escapeHtml(m.name)}</div>
              <div class="mod-row__category">${escapeHtml(category)}</div>
            </div>
            <span class="mod-row__version">v${escapeHtml(m.version)}</span>
            <span class="pill ${m.active ? '' : 'pill--ghost'}">${m.active ? 'ACTIF' : 'OFF'}</span>
          </li>`;
      }).join('');

      const detail = this.selectedMod ? `
        <div class="mod-detail__header">
          <span class="mod-row__medallion">${escapeHtml((this.selectedMod.category || '?').slice(0,2).toUpperCase())}</span>
          <h3 class="mod-detail__title">${escapeHtml(this.selectedMod.name)}</h3>
          <div class="mod-detail__creator">par ${escapeHtml(this.selectedMod.creator || 'inconnu')}</div>
        </div>
        <div class="mod-detail__section">
          <h4>Description</h4>
          <p>${escapeHtml(this.selectedMod.description || 'Aucune description fournie.')}</p>
        </div>
        <div class="mod-detail__section">
          <h4>Détails</h4>
          <dl class="mod-detail__meta">
            <dt>Version</dt><dd>${escapeHtml(this.selectedMod.version)}</dd>
            <dt>Catégorie</dt><dd>${escapeHtml(this.selectedMod.category || '—')}</dd>
            <dt>Difficulté</dt><dd>${escapeHtml(this.selectedMod.difficulty)}</dd>
            <dt>Dossier</dt><dd>${escapeHtml(basename(this.selectedMod.path))}</dd>
          </dl>
        </div>` : `
        <div class="mod-detail__empty">
          Choisissez un mod dans la liste pour consulter sa fiche.
        </div>`;

      return `
        <div class="activation">
          <div class="activation__toolbar">
            <label>Profil</label>
            <select class="activation__profile">
              <option>${escapeHtml(this.profileName)}</option>
            </select>
            <span class="activation__count">${this.activeCount} / ${this.mods.length} actifs</span>
          </div>

          <ul class="activation__list">
            ${this.mods.length ? rows : '<li class="mod-detail__empty">Aucun mod détecté dans les dossiers configurés.</li>'}
          </ul>

          <aside class="mod-detail">
            ${detail}
          </aside>
        </div>`;
    },
  };
};

// ── helpers ────────────────────────────────────────────────────────────────
function escapeHtml(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function basename(p) {
  if (!p) return '';
  return p.split(/[\\/]/).pop();
}

// Returns the Alpine root scope so the inline event handlers in the injected
// template strings can call back into the component (Alpine's @click only sees
// scope on the originating element, but x-html breaks that chain).
function annoRoot() {
  return Alpine.$data(document.body);
}

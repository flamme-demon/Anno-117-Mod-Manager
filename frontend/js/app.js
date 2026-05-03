// Anno 117 Mod Manager — pywebview frontend bootstrap.
// Defines the Alpine root component used by index.html.

window.annoApp = function () {
  return {
    // ── State ──────────────────────────────────────────────────────────────
    version: '',
    currentTab: 'activation',
    mods: [],
    selectedModId: null,
    selectedBannerUrl: '',
    _bannerCache: new Map(),
    search: '',
    profileName: 'Default',
    presets: [],                // user-saved preset names (filled by refreshMods)
    sortBy: 'status',           // 'status' | 'category' | 'name'
    sortDir: 1,                 // 1 = asc, -1 = desc, 0 = unsorted (status only)
    mode: 'manage',             // 'manage' | 'order'
    profileOrder: [],           // mod ids in active-profile.txt order (Load Order view)
    _dragId: null,              // id of the row currently being dragged

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
      try {
        this.presets = await window.pywebview.api.list_presets();
      } catch (e) {
        console.error('list_presets failed', e);
        this.presets = [];
      }
    },

    async switchProfile(name) {
      if (!name) return;
      try {
        const res = await window.pywebview.api.load_preset(name);
        if (!res || !res.ok) {
          alert('Échec du chargement du preset : ' + ((res && res.error) || 'erreur'));
          return;
        }
        this.profileName = name;
        await this.refreshMods();
      } catch (e) {
        console.error('load_preset threw:', e);
      }
    },

    async createPreset() {
      const name = prompt('Nom du nouveau preset :');
      if (!name) return;
      const trimmed = name.trim();
      if (!trimmed) return;
      try {
        const res = await window.pywebview.api.save_preset(trimmed);
        if (!res || !res.ok) {
          alert('Échec de la sauvegarde : ' + ((res && res.error) || 'erreur'));
          return;
        }
        this.profileName = trimmed;
        await this.refreshMods();
      } catch (e) {
        console.error('save_preset threw:', e);
      }
    },

    async deletePreset() {
      const name = this.profileName;
      if (!name || name === 'Default' || name === 'Vanilla') {
        alert('Les profils "Default" et "Vanilla" ne peuvent pas être supprimés.');
        return;
      }
      if (!confirm(`Supprimer le preset "${name}" ?`)) return;
      try {
        const res = await window.pywebview.api.delete_preset(name);
        if (!res || !res.ok) {
          alert('Échec de la suppression : ' + ((res && res.error) || 'erreur'));
          return;
        }
        this.profileName = 'Default';
        await this.refreshMods();
      } catch (e) {
        console.error('delete_preset threw:', e);
      }
    },

    // The list excludes sub-mods from top-level rows; sub-mods will be shown
    // indented beneath their parent in renderModRows.
    get topLevelMods() {
      return this.mods.filter((m) => !m.parent_path);
    },

    get categories() {
      const set = new Set();
      this.topLevelMods.forEach((m) => { if (m.category) set.add(m.category); });
      return [...set].sort((a, b) => a.localeCompare(b));
    },

    get filteredMods() {
      const q = this.search.trim().toLowerCase();
      let out = this.topLevelMods;
      if (this.filterCategory) {
        out = out.filter((m) => m.category === this.filterCategory);
      }
      if (q) {
        out = out.filter((m) =>
          (m.name || '').toLowerCase().includes(q) ||
          (m.category || '').toLowerCase().includes(q)
        );
      }
      // Sort — copy first so we don't mutate the underlying mods array.
      const dir = this.sortDir;
      const key = this.sortBy;
      const sorted = [...out];
      if (key === 'status' && dir !== 0) {
        sorted.sort((a, b) => (Number(b.active) - Number(a.active)) * dir);
      } else if (key === 'name' && dir !== 0) {
        sorted.sort((a, b) => (a.name || '').localeCompare(b.name || '') * dir);
      } else if (key === 'category' && dir !== 0) {
        sorted.sort((a, b) => ((a.category || '').localeCompare(b.category || '') * dir)
                              || (a.name || '').localeCompare(b.name || ''));
      }
      return sorted;
    },

    subModsOf(parentPath) {
      return this.mods.filter((m) => m.parent_path === parentPath);
    },

    get selectedMod() {
      return this.mods.find((m) => m.id === this.selectedModId) || null;
    },

    get activeCount() {
      return this.topLevelMods.filter((m) => m.active).length;
    },

    get totalSizeBytes() {
      return this.topLevelMods.reduce((s, m) => s + (m.size_bytes || 0), 0);
    },

    get activeSizeBytes() {
      return this.topLevelMods.filter((m) => m.active).reduce((s, m) => s + (m.size_bytes || 0), 0);
    },

    /** 'all' if every top-level mod is active, 'none' if none are, otherwise
     *  'partial' — used to drive the tri-state header checkbox. */
    get headerSelectionState() {
      const top = this.topLevelMods;
      if (!top.length) return 'none';
      const active = top.filter((m) => m.active).length;
      if (active === 0) return 'none';
      if (active === top.length) return 'all';
      return 'partial';
    },

    async toggleAllFromHeader() {
      // 'all' → deactivate everything, otherwise activate everything (common
      // sense: if some are off, the user usually wants them all on).
      const next = this.headerSelectionState !== 'all';
      await this.setAllActive(next);
    },

    formatSize(bytes) {
      if (!bytes) return '0 KB';
      const mb = bytes / (1024 * 1024);
      if (mb >= 1) return `${mb.toFixed(1)} MB`;
      return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    },

    async toggleMod(id) {
      const mod = this.mods.find((m) => m.id === id);
      if (!mod) return;
      const next = !mod.active;
      // Optimistic UI update — flip immediately, then call Python. If the
      // backend reports failure we roll back so the checkbox stays in sync
      // with the file on disk.
      mod.active = next;
      try {
        const res = await window.pywebview.api.toggle_mod(id, next);
        if (!res || !res.ok) {
          mod.active = !next;
          console.error('toggle_mod failed:', res && res.error);
        }
      } catch (e) {
        mod.active = !next;
        console.error('toggle_mod threw:', e);
      }
    },

    async setAllActive(active) {
      try {
        const res = await window.pywebview.api.set_all_active(active);
        if (!res || !res.ok) {
          console.error('set_all_active failed:', res && res.error);
          return;
        }
        await this.refreshMods();
      } catch (e) {
        console.error('set_all_active threw:', e);
      }
    },

    async openModFolder(path) {
      if (!path) return;
      try {
        await window.pywebview.api.open_path(path);
      } catch (e) {
        console.error('open_path threw:', e);
      }
    },

    async openModsFolder() {
      try {
        const res = await window.pywebview.api.open_mods_folder();
        if (!res || !res.ok) {
          console.error('open_mods_folder failed:', res && res.error);
        }
      } catch (e) {
        console.error('open_mods_folder threw:', e);
      }
    },

    setSort(col) {
      // Status cycles between active-first / inactive-first; the other columns
      // cycle asc → desc → off so users can disable a sort to fall back to
      // the previous one.
      if (this.sortBy === col) {
        if (col === 'status') {
          this.sortDir = this.sortDir === 1 ? -1 : 1;
        } else {
          this.sortDir = this.sortDir === 1 ? -1 : (this.sortDir === -1 ? 0 : 1);
          if (this.sortDir === 0) this.sortBy = 'status';
        }
      } else {
        this.sortBy = col;
        this.sortDir = 1;
      }
    },

    sortIndicator(col) {
      if (this.sortBy !== col) return '';
      if (this.sortDir === 1) return '▲';
      if (this.sortDir === -1) return '▼';
      return '';
    },

    async setMode(m) {
      this.mode = m;
      if (m === 'order') {
        await this.refreshProfileOrder();
      }
    },

    async refreshProfileOrder() {
      try {
        this.profileOrder = await window.pywebview.api.get_profile_order();
      } catch (e) {
        console.error('get_profile_order failed:', e);
        this.profileOrder = [];
      }
    },

    /** In 'order' mode, list mods following the profile's actual line order.
     *  Mods that aren't yet recorded in the file are appended at the end
     *  (sorted by name) so newly-installed mods don't disappear from view. */
    get orderedTopLevelMods() {
      const top = this.topLevelMods;
      const idToMod = new Map(top.map((m) => [m.id, m]));
      const out = [];
      const seen = new Set();
      for (const id of this.profileOrder) {
        if (idToMod.has(id) && !seen.has(id)) {
          out.push(idToMod.get(id));
          seen.add(id);
        }
      }
      const remaining = top.filter((m) => !seen.has(m.id))
        .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      return out.concat(remaining);
    },

    onDragStart(id, ev) {
      this._dragId = id;
      ev.dataTransfer.effectAllowed = 'move';
      // Some browsers require dataTransfer.setData to actually start the drag
      try { ev.dataTransfer.setData('text/plain', id); } catch (_) {}
    },

    onDragOver(ev) {
      ev.preventDefault();
      ev.dataTransfer.dropEffect = 'move';
    },

    async onDrop(targetId, ev) {
      ev.preventDefault();
      const draggedId = this._dragId;
      this._dragId = null;
      if (!draggedId || draggedId === targetId) return;
      // Reorder profileOrder locally
      const order = this.orderedTopLevelMods.map((m) => m.id);
      const fromIdx = order.indexOf(draggedId);
      const toIdx = order.indexOf(targetId);
      if (fromIdx < 0 || toIdx < 0) return;
      order.splice(fromIdx, 1);
      order.splice(toIdx, 0, draggedId);
      this.profileOrder = order;
      // Persist
      try {
        const res = await window.pywebview.api.reorder_mods(order);
        if (!res || !res.ok) {
          console.error('reorder_mods failed:', res && res.error);
          await this.refreshProfileOrder();
        }
      } catch (e) {
        console.error('reorder_mods threw:', e);
      }
    },

    onDragEnd() {
      this._dragId = null;
    },

    async uninstallMod(folder, name) {
      if (!folder) return;
      if (!confirm(`Désinstaller le mod "${name}" ?\n\nLe dossier sera supprimé du disque.`)) return;
      try {
        const res = await window.pywebview.api.uninstall_mod(folder);
        if (!res || !res.ok) {
          alert('Échec de la désinstallation : ' + ((res && res.error) || 'erreur inconnue'));
          return;
        }
        if (this.selectedMod && this.selectedMod.folder === folder) {
          this.selectedModId = null;
        }
        await this.refreshMods();
      } catch (e) {
        console.error('uninstall_mod threw:', e);
      }
    },

    async fetchBannerForSelected() {
      const mod = this.selectedMod;
      if (!mod) { this.selectedBannerUrl = ''; return; }
      if (this._bannerCache.has(mod.id)) {
        this.selectedBannerUrl = this._bannerCache.get(mod.id);
        return;
      }
      this.selectedBannerUrl = '';
      if (!mod.banner) return;
      try {
        const res = await window.pywebview.api.get_mod_banner(mod.id);
        const url = (res && res.ok && res.data_url) || '';
        this._bannerCache.set(mod.id, url);
        if (this.selectedMod && this.selectedMod.id === mod.id) {
          this.selectedBannerUrl = url;
        }
      } catch (e) {
        console.error('get_mod_banner threw:', e);
      }
    },

    selectMod(id) {
      this.selectedModId = id;
      this.fetchBannerForSelected();
    },

    async launchGame() {
      try {
        const res = await window.pywebview.api.launch_game();
        if (!res || !res.ok) {
          console.error('launch_game failed:', res && res.error);
          alert('Impossible de lancer le jeu : ' + ((res && res.error) || 'erreur inconnue'));
        }
      } catch (e) {
        console.error('launch_game threw:', e);
      }
    },

    // ── Templates ──────────────────────────────────────────────────────────
    activationTemplate() {
      // Returned as a single HTML string and injected via x-html so the POC
      // stays in one file. Phase 2 will split this into Alpine components or
      // a small templating helper; for now it keeps the structure obvious.
      const orderMode = this.mode === 'order';
      const renderRow = (m, isSubMod = false) => {
        const active = m.active ? 'is-on' : '';
        const selected = m.id === this.selectedModId ? 'is-selected' : '';
        const subClass = isSubMod ? 'mod-row--sub' : '';
        const dragClass = orderMode && !isSubMod ? 'mod-row--draggable' : '';
        const category = m.category || '—';
        const initials = (category || '?').slice(0, 2).toUpperCase();
        const dragAttrs = (orderMode && !isSubMod) ? `
              draggable="true"
              ondragstart="annoRoot().onDragStart('${escapeAttr(m.id)}', event)"
              ondragover="annoRoot().onDragOver(event)"
              ondrop="annoRoot().onDrop('${escapeAttr(m.id)}', event)"
              ondragend="annoRoot().onDragEnd()"` : '';
        return `
          <li class="mod-row ${selected} ${subClass} ${dragClass}"
              onclick="annoRoot().selectMod('${m.id}')"
              ${dragAttrs}>
            <span class="mod-row__check ${active}"
                  onclick="event.stopPropagation(); annoRoot().toggleMod('${m.id}')"></span>
            <span class="mod-row__medallion">${orderMode && !isSubMod ? '⋮⋮' : initials}</span>
            <span class="mod-row__category-cell">${escapeHtml(category)}</span>
            <div class="mod-row__text">
              <div class="mod-row__name">${escapeHtml(m.name)}</div>
              <div class="mod-row__version">v${escapeHtml(m.version)}</div>
            </div>
            <span class="mod-row__size">${this.formatSize(m.size_bytes)}</span>
            <span class="pill ${m.active ? '' : 'pill--ghost'}">${m.active ? 'ACTIF' : 'OFF'}</span>
          </li>`;
      };

      const sourceMods = orderMode ? this.orderedTopLevelMods : this.filteredMods;
      const rows = sourceMods.flatMap((m) => {
        const own = renderRow(m, false);
        // In order mode we hide sub-mods to keep the drag-drop list flat;
        // they'll come along with their parent in the saved order.
        const subs = orderMode ? [] : this.subModsOf(m.path).map((s) => renderRow(s, true));
        return [own, ...subs];
      }).join('');

      const sel = this.selectedMod;
      const banner = sel && this.selectedBannerUrl
        ? `<img class="mod-detail__banner" src="${this.selectedBannerUrl}" alt="" />`
        : `<div class="mod-detail__banner mod-detail__banner--placeholder">
             <div class="ornament">───── ◆ ─────</div>
             ${sel ? 'Aucune bannière fournie pour ce mod.' : ''}
           </div>`;

      const detail = sel ? `
        ${banner}
        <div class="mod-detail__header">
          <h3 class="mod-detail__title">${escapeHtml(sel.name)}</h3>
          <div class="mod-detail__creator">par ${escapeHtml(sel.creator || 'inconnu')} · v${escapeHtml(sel.version)}</div>
        </div>
        ${sel.description ? `
        <div class="mod-detail__section">
          <h4>Description</h4>
          <p>${escapeHtml(sel.description)}</p>
        </div>` : ''}
        <div class="mod-detail__section">
          <h4>Détails</h4>
          <dl class="mod-detail__meta">
            <dt>Catégorie</dt><dd>${escapeHtml(sel.category || '—')}</dd>
            <dt>Difficulté</dt><dd>${escapeHtml(sel.difficulty)}</dd>
            <dt>Taille</dt><dd>${this.formatSize(sel.size_bytes)}</dd>
            <dt>Dossier</dt><dd>${escapeHtml(sel.folder || basename(sel.path))}</dd>
          </dl>
        </div>
        <div class="mod-detail__actions">
          <button class="mod-detail__btn"
                  onclick="annoRoot().openModFolder('${escapeAttr(sel.path)}')">
            Ouvrir le dossier
          </button>
          ${sel.parent_path ? '' : `
          <button class="mod-detail__btn mod-detail__btn--danger"
                  onclick="annoRoot().uninstallMod('${escapeAttr(sel.folder)}', '${escapeAttr(sel.name)}')">
            Désinstaller
          </button>`}
        </div>` : `
        <div class="mod-detail__empty">
          <div class="ornament">───── ◆ ─────</div>
          Choisissez un mod dans la liste pour consulter sa fiche.
        </div>`;

      const totalSize = this.formatSize(this.totalSizeBytes);
      const activeSize = this.formatSize(this.activeSizeBytes);

      const allProfiles = ['Default', 'Vanilla', ...this.presets];
      const profileOpts = allProfiles.map((p) => {
        const sel = p === this.profileName ? ' selected' : '';
        return `<option value="${escapeAttr(p)}"${sel}>${escapeHtml(p)}</option>`;
      }).join('');
      const isReserved = this.profileName === 'Default' || this.profileName === 'Vanilla';

      return `
        <div class="activation">
          <div class="activation__toolbar">
            <label>Profil</label>
            <select class="activation__profile"
                    onchange="annoRoot().switchProfile(this.value)">
              ${profileOpts}
            </select>
            <button class="activation__btn"
                    onclick="annoRoot().createPreset()"
                    title="Sauvegarder l'état actuel comme nouveau preset">＋ Nouveau</button>
            <button class="activation__btn activation__btn--danger"
                    onclick="annoRoot().deletePreset()"
                    ${isReserved ? 'disabled' : ''}
                    title="Supprimer ce preset">🗑 Supprimer</button>

            <div class="activation__mode">
              <button class="activation__mode-btn ${this.mode === 'manage' ? 'is-active' : ''}"
                      onclick="annoRoot().setMode('manage')"
                      title="Trier et activer/désactiver les mods">Gestion</button>
              <button class="activation__mode-btn ${this.mode === 'order' ? 'is-active' : ''}"
                      onclick="annoRoot().setMode('order')"
                      title="Réorganiser l'ordre de chargement par drag-and-drop">Ordre de chargement</button>
            </div>

            <span class="activation__count">${this.activeCount} / ${this.topLevelMods.length} actifs</span>
            <span class="activation__count activation__count--size">${activeSize} / ${totalSize}</span>
          </div>

          <div class="activation__list-wrap">
            <div class="mod-row mod-row--head">
              <span class="mod-row__check mod-row__check--head mod-row__check--${this.headerSelectionState}"
                    onclick="annoRoot().toggleAllFromHeader()"
                    title="Tout activer / désactiver"></span>
              <span></span>
              <span class="mod-row__head ${orderMode ? 'is-disabled' : ''}"
                    ${orderMode ? '' : `onclick="annoRoot().setSort('category')"`}>Catégorie ${orderMode ? '' : this.sortIndicator('category')}</span>
              <span class="mod-row__head ${orderMode ? 'is-disabled' : ''}"
                    ${orderMode ? '' : `onclick="annoRoot().setSort('name')"`}>Nom du mod ${orderMode ? '' : this.sortIndicator('name')}</span>
              <span class="mod-row__head">Taille</span>
              <span class="mod-row__head ${orderMode ? 'is-disabled' : ''}"
                    ${orderMode ? '' : `onclick="annoRoot().setSort('status')"`}>Statut ${orderMode ? '' : this.sortIndicator('status')}</span>
            </div>
            <ul class="activation__list">
              ${this.topLevelMods.length ? rows : '<li class="mod-detail__empty">Aucun mod détecté dans les dossiers configurés.</li>'}
            </ul>
          </div>

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

// For values interpolated INSIDE single-quoted attributes built in template
// strings (e.g. onclick="...('${val}')"). Escapes both ' and \ so a folder
// name with an apostrophe doesn't break the markup or the JS arg list.
function escapeAttr(s) {
  if (s == null) return '';
  return String(s)
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '&quot;');
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
